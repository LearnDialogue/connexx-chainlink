import { polygon } from 'leaflet';
import React, { useState, useContext, useEffect } from 'react';
import '../styles/components/profile-modal.css';
import { Tooltip } from 'react-tooltip';
import { gql, useQuery, useMutation } from '@apollo/client';
import { AuthContext } from '../context/auth';

interface ProfileModalProps {
    user: any | null;
}

const getUserAge = (dateStr: string): string => {
    const date = new Date(dateStr);
    return (new Date().getUTCFullYear() - date.getUTCFullYear()).toString();
};

// Fetch user details
const FETCH_USER_QUERY = gql`
  query getUser($username: String!) {
    getUser(username: $username) {
      id
      birthday
      firstName
      lastName
      experience
      locationName
      eventsHosted
      eventsJoined
    }
  }
`;

// Check if a friend request is already pending
const CHECK_FRIEND_STATUS_QUERY = gql`
  query checkFriendStatus($senderId: ID!, $recipientId: ID!) {
    checkFriendStatus(senderId: $senderId, recipientId: $recipientId) {
      status
    }
  }
`;

// Mutation to send a friend request
const ADD_FRIEND_MUTATION = gql`
  mutation addFriend($senderId: ID!, $recipientId: ID!) {
    addFriend(senderId: $senderId, recipientId: $recipientId) {
      id
      status
      created_at
    }
  }
`;

export const ProfileModal: React.FC<ProfileModalProps> = ({ user }) => {
    const { user: currentUser } = useContext(AuthContext);
    const [friendStatus, setFriendStatus] = useState<'add' | 'pending'>('add');
    const foreColor = window.getComputedStyle(document.documentElement).getPropertyValue('--primary-color');

    const { loading: userLoading, error, data: userData } = useQuery(FETCH_USER_QUERY, {
        variables: {
            username: user,
        },
    });

    // Query to check the friend request status
    const { loading: friendStatusLoading, data: friendStatusData } = useQuery(CHECK_FRIEND_STATUS_QUERY, {
        variables: {
            senderId: currentUser?.id,
            recipientId: userData?.getUser?.id,
        },
        skip: !currentUser || !userData?.getUser?.id, // Skip if IDs are not available
        onCompleted: (data) => {
            if (data.checkFriendStatus && data.checkFriendStatus.status === 'pending') {
                setFriendStatus('pending');
            }
        }
    });

    const [addFriend] = useMutation(ADD_FRIEND_MUTATION, {
        onCompleted: () => {
            setFriendStatus('pending');
        },
        onError: (err) => {
            console.error("Error adding friend:", err);
        }
    });

    const handleAddFriendClick = () => {
        if (!currentUser || !currentUser.id || !userData || !userData.getUser.id) {
            console.error("User IDs not available for friend request.");
            return;
        }

        // Send a friend request to the server
        addFriend({
            variables: {
                senderId: currentUser.id,
                recipientId: userData.getUser.id,
            }
        });
    };

    if (userLoading || friendStatusLoading) {
        return (
            <Tooltip 
                anchorSelect={"#profile-modal-anchor-" + user} 
                place="right" openOnClick={true} 
                className="popup" 
                opacity={100} 
                border={"3px solid " + foreColor} 
                style={{ backgroundColor: "white", color: foreColor, borderRadius: 10 }}
            >
                <span>Loading User Profile</span>
            </Tooltip>
        );
    }

    if (error != undefined) {
        return <></>;
    }

    return (
        <Tooltip 
            anchorSelect={"#profile-modal-anchor-" + user} 
            place="left" openOnClick={true} 
            className="popup" 
            opacity={100} 
            border={"3px solid " + foreColor} 
            style={{ backgroundColor: "white", color: "black", borderRadius: 10 }}
        >
            <div style={{ width: 300 }}>
                <div className="profile-modal-header">
                    <div className='profile-modal-image'>
                        {user.slice(0, 1).toLocaleUpperCase()}
                    </div>
                    <div className="profile-modal-name-container">
                        <h3 className="profile-modal-name-big" style={{ color: foreColor }}>
                            <b>{userData.getUser.firstName + " " + userData.getUser.lastName}</b>
                        </h3>
                        {userData.getUser.locationName !== "" ? 
                            (<span className="profile-modal-name">
                                {getUserAge(userData.getUser.birthday) + " year old in " + userData.getUser.locationName}
                            </span>)
                        : (<span className="profile-modal-name">
                                {getUserAge(userData.getUser.birthday) + " year old"}
                            </span>)
                        }
                    </div>
                </div>
                <div className="profile-modal-content">
                    <span className="profile-modal-descriptor-left">{userData.getUser.experience}</span>
                    <span className="profile-modal-descriptor-right">{userData.getUser.eventsHosted.length + " Rides Joined"}</span>
                </div>
                <div className="profile-modal-actions">
                    <button
                        onClick={handleAddFriendClick}
                        className="add-friend-button"
                        disabled={friendStatus === 'pending'}
                    >
                        {friendStatus === 'pending' ? 'Pending' : 'Add Friend'}
                    </button>
                </div>
            </div>
        </Tooltip>
    );
};
