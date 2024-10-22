import React, { useState, useContext, useEffect } from 'react';
import { gql, useQuery, useMutation } from '@apollo/client';
import { AuthContext } from '../context/auth';

interface AddFriendButtonProps {
    recipientId: string;
}

const CHECK_FRIEND_STATUS_QUERY = gql`
  query checkFriendStatus($senderId: ID!, $recipientId: ID!) {
    checkFriendStatus(senderId: $senderId, recipientId: $recipientId) {
      status
    }
  }
`;

const ADD_FRIEND_MUTATION = gql`
  mutation addFriend($senderId: ID!, $recipientId: ID!) {
    addFriend(senderId: $senderId, recipientId: $recipientId) {
      id
      status
      created_at
    }
  }
`;

const AddFriendButton: React.FC<AddFriendButtonProps> = ({ recipientId }) => {
    const { user: currentUser } = useContext(AuthContext);
    const [friendStatus, setFriendStatus] = useState<'add' | 'pending'>('add');

    // Query to check if a friend request is already pending
    const { loading: friendStatusLoading } = useQuery(CHECK_FRIEND_STATUS_QUERY, {
        variables: {
            senderId: currentUser?.id,
            recipientId: recipientId,
        },
        skip: !currentUser || !recipientId,
        onCompleted: (data) => {
            if (data.checkFriendStatus && data.checkFriendStatus.status === 'pending') {
                setFriendStatus('pending');
            }
        },
    });

    // Mutation to add a friend
    const [addFriend] = useMutation(ADD_FRIEND_MUTATION, {
        onCompleted: () => {
            setFriendStatus('pending');
        },
        onError: (err) => {
            console.error("Error adding friend:", err);
        }
    });

    const handleAddFriendClick = () => {
        if (!currentUser || !currentUser.id || !recipientId) {
            console.error("User IDs not available for friend request.");
            return;
        }

        // Send a friend request to the server
        addFriend({
            variables: {
                senderId: currentUser.id,
                recipientId: recipientId,
            }
        });
    };

    // Do not render the button if the recipient is the current user
    if (currentUser?.id === recipientId) {
        return null;
    }

    return (
        <button
            onClick={handleAddFriendClick}
            className="add-friend-button"
            disabled={friendStatus === 'pending' || friendStatusLoading}
        >
            {friendStatus === 'pending' ? 'Pending' : 'Add Friend'}
        </button>
    );
};

export default AddFriendButton;