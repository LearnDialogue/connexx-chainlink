import { polygon } from 'leaflet';
import React from 'react';
import '../styles/components/profile-modal.css';
import { Tooltip } from 'react-tooltip'
import { gql, useQuery } from '@apollo/client';

interface ProfileModalProps {
    user: any | null;
}

const getUserAge = (dateStr: string): string => {
    const date = new Date(dateStr);

    return (new Date().getUTCFullYear() - date.getUTCFullYear()).toString();
};

export const ProfileModal: React.FC<ProfileModalProps> = ({ user }) => {

    const foreColor = window.getComputedStyle(document.documentElement).getPropertyValue('--primary-color');

    const {
        loading: userLoading,
        error,
        data: userData,
    } = useQuery(FETCH_USER_QUERY, {
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
    
    return(
        <Tooltip 
            anchorSelect={"#profile-modal-anchor-" + user} 
            place="left" openOnClick={true} 
            className = "popup" 
            opacity = {100} 
            border={"3px solid " + foreColor} 
            style={{backgroundColor: "white", color: "black", borderRadius: 10}}
        >
            <div style={{width: 300}}>
                <div className="profile-modal-header">
                    <div className='profile-modal-image'>
                        {user.slice(0, 1).toLocaleUpperCase()}
                    </div>
                    <div className="profile-modal-name-container">
                        <h3 className="profile-modal-name-big" style={{color: foreColor}}><b>{userData.getUser.firstName + " " + userData.getUser.lastName}</b></h3>
                        {userData.getUser.locationName != "" ? 
                            (<span className="profile-modal-name">{getUserAge(userData.getUser.birthday) + " year old in " + userData.getUser.locationName}</span>)
                        : (<span className="profile-modal-name">{getUserAge(userData.getUser.birthday) + " year old"}</span>)
                        }
                        
                    </div>
                </div>
                <div className = "profile-modal-content">
                    <span className="profile-modal-descriptor-left">{userData.getUser.experience}</span>
                    <span className="profile-modal-descriptor-right">{userData.getUser.eventsHosted.length + " Rides Joined"}</span>
                </div>
            </div>

        </Tooltip>

    )
}

const FETCH_USER_QUERY = gql`
  query getUser($username: String!) {
    getUser(username: $username) {
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


