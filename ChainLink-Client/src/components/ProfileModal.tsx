import { polygon } from 'leaflet';
import React from 'react';
import '../styles/components/profile-modal.css';
import { Tooltip } from 'react-tooltip'
import { useQuery } from '@apollo/client';
import { FETCH_USER_BY_NAME } from '../graphql/queries/userQueries';
import FriendButton from './FriendButton';
import "../styles/components/friend-button.css";
import UserAvatar from './UserAvatar';
import featureFlags from '../featureFlags';

const getUserAge = (dateStr: string): string => {
    const date = new Date(dateStr);

    return (new Date().getUTCFullYear() - date.getUTCFullYear()).toString();
};

interface ProfileModalProps {
    user: any | null;
    friendStatus: any | null;
}


export const ProfileModal: React.FC<ProfileModalProps> = ({ user, friendStatus }) => {
    const foreColor = window.getComputedStyle(document.documentElement).getPropertyValue('--primary-color');

    const {
        loading: userLoading,
        error,
        data: userData,
    } = useQuery(FETCH_USER_BY_NAME, {
        variables: {
            username: user,
        },
    });

    
    if (userLoading)
        {
            return (
                <Tooltip 
                anchorSelect={"#profile-modal-anchor-" + user} 
                place="right" openOnClick={true} 
                className = "popup" 
                opacity = {100} 
                border={"3px solid " + foreColor} 
                style={{backgroundColor: "white", color: foreColor, borderRadius: 10}}
                >
            <span>Loading User Profile</span>
            </Tooltip>
        )
    }

    if (error != undefined)
        {
            return <></>
        }

    const showProfileInfo = !featureFlags.privateProfilesEnabled || (!userData.getUser.isPrivate || friendStatus == "accepted")
        
    return(
        <Tooltip 
            anchorSelect={"#profile-modal-anchor-" + user} 
            clickable
            place="left" openOnClick={true} 
            className = "popup" 
            opacity = {100} 
            border={"3px solid " + foreColor} 
            style={{backgroundColor: "white", color: "black", borderRadius: 10}}
        >
            <div style={{width: 300}}>
                <div className="profile-modal-header">
                    <div className='profile-modal-image'>
                        <UserAvatar 
                            username={userData.getUser.username} 
                            hasProfileImage={userData.getUser.hasProfileImage} 
                        />
                    </div>
                    <div className="profile-modal-name-container">
                        <h3 className="profile-modal-name-big" style={{color: foreColor}}>
                            {showProfileInfo ? 
                                (<b>{userData.getUser.firstName + " " + userData.getUser.lastName}</b>)
                                : (<b>{userData.getUser.username}</b>)
                            }

                            {!showProfileInfo && (
                                <span className='private-profile-badge'>
                                    <i className='fa-solid fa-lock'></i>
                                </span>
                            )}
                        </h3>

                        

                        {showProfileInfo && 
                        (
                            userData.getUser.locationName != "" ? 
                                (<span className="profile-modal-name">{getUserAge(userData.getUser.birthday) + " year old in " + userData.getUser.locationName}</span>)
                                : (<span className="profile-modal-name">{getUserAge(userData.getUser.birthday) + " year old"}</span>)
                        )}
                        
                    </div>
                </div>

                {showProfileInfo ?
                (
                    <div className = "profile-modal-content">
                        <span className="profile-modal-descriptor-left">{userData.getUser.experience}</span>
                        <span className="profile-modal-descriptor-right">{userData.getUser.eventsHosted.length + " Rides Joined"}</span>
                    </div>
                ) : <div className = "profile-modal-content">
                        <span className="profile-modal-descriptor-left">Private Profile</span>
                    </div>
                }

                <div className='friend-button-container'>
                    {featureFlags.friendsFeatureEnabled && <FriendButton
                        username={user}
                        friendStatus={friendStatus}
                    ></FriendButton>}
                    
                </div>
            </div>
        </Tooltip>
    )
}



