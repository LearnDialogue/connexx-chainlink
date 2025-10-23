// FriendList.tsx
import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_FRIENDS, GET_FRIEND_REQUESTS } from '../graphql/queries/friendshipQueries';
import { ACCEPT_FRIEND, DECLINE_FRIEND, REMOVE_FRIEND } from '../graphql/mutations/friendshipMutations';
import { FETCH_USER_BY_NAME } from '../graphql/queries/userQueries';
import { useNavigate } from 'react-router-dom';
import { toast } from "react-toastify";
import UserAvatar from './UserAvatar';
import UserCard from './UserCard';
import '../styles/components/friend-list.css';
import featureFlags from '../featureFlags';import Button from './Button';
interface FriendListProps {
  username: string | null;
}

const FriendList: React.FC<FriendListProps> = ({ username }) => {
  const navigate = useNavigate();
  const [showRequests, setShowRequests] = useState(false);
  const [friendSelected, setSelectedFriend] = useState<string | null>(null);
  const [removeFriendFlag, setRemoveFriend] = useState(false);

  const { loading: friendsLoading, data: friendsData } = useQuery(GET_FRIENDS, { variables: { username } });
  const { loading: friendRequestsLoading, data: friendRequestsData } = useQuery(GET_FRIEND_REQUESTS, { variables: { username } });
  const { loading: userLoading, error, data: userData } = useQuery(FETCH_USER_BY_NAME, { variables: { username: friendSelected }, skip: !friendSelected });

  const foreColor = window.getComputedStyle(document.documentElement).getPropertyValue('--primary-color');

  const getUserAge = (dateStr: string): string => {
    const date = new Date(dateStr);
    return (new Date().getUTCFullYear() - date.getUTCFullYear()).toString();
  };

  const [removeFriend] = useMutation(REMOVE_FRIEND, {
    update(cache, { data: { removeFriend } }) {
      cache.modify({
        fields: {
          getFriends(existingFriends = []) {
            return existingFriends.filter((friend: any) => (
              friend !== removeFriend.sender && friend !== removeFriend.receiver
            ));
          },
        },
      });
      setSelectedFriend(null);
    },
  });

  const handleRemoveFriend = (sender: string, username: string) => {
    removeFriend({
      variables: { sender, receiver: username },
    }).then(() => {
            toast.success("Friend removed.");
        }).catch(error => console.error('Error removing friend:', error));
    setRemoveFriend(false);
  };

  const [acceptFriendRequest] = useMutation(ACCEPT_FRIEND, {
    update(cache, { data: { acceptFriendRequest } }) {
      cache.modify({
        fields: {
          getFriendRequests(existingFriendRequests = []) {
            return existingFriendRequests.filter((request: any) => request.sender !== acceptFriendRequest.sender);
          },
          getFriends(existingFriends = []) {
            return [...existingFriends, acceptFriendRequest.sender];
          },
        },
      });
      setSelectedFriend(null);
    },
  });

  const handleAccept = (sender: string) => {
    acceptFriendRequest({ variables: { sender, receiver: username } })
      .catch(error => console.error('Error accepting friend request:', error));
  };

  const [declineFriendRequest] = useMutation(DECLINE_FRIEND, {
    update(cache, { data: { declineFriendRequest } }) {
      cache.modify({
        fields: {
          getFriendRequests(existingFriendRequests = []) {
            return existingFriendRequests.filter((request: any) => request.sender !== declineFriendRequest.sender);
          },
        },
      });
      setSelectedFriend(null);
    },
  });

  const handleReject = (sender: string) => {
    declineFriendRequest({ variables: { sender, receiver: username } })
      .catch(error => console.error('Error rejecting friend request:', error));
  };

  

  const handleListChange = (showRequestsFlag: boolean) => {
    setShowRequests(showRequestsFlag);
    setSelectedFriend(null);
  };

  const showProfileInfo = (friendSelected != "") && (!featureFlags.privateProfilesEnabled || (!userData?.getUser.isPrivate || !showRequests));

  return (
<div className="profile-page-friends-container">
  <div className="w-100 justify-items-right">
      <button onClick={() => navigate('/app/addfriend')} className="club-button">
        Add Friends + 
      </button>
  </div>

  <div className="profile-page-friends-tabs">
    <button
      className="profile-page-friend-list-tab"
      onClick={() => handleListChange(false)}
      style={{
        backgroundColor: showRequests ? 'white' : 'var(--primary-color)',
        color: showRequests ? 'black' : 'white',
      }}
    >
      Friends
    </button>
    <button
      className="profile-page-friend-list-tab"
      onClick={() => handleListChange(true)}
      style={{
        backgroundColor: showRequests ? 'var(--primary-color)' : 'white',
        color: showRequests ? 'white' : 'black',
      }}  
    >
      
      Friend Requests
      {(friendRequestsData?.getFriendRequests.length > 0) ? 
      <span className='buttonBadge'>
        <i className='fas fa-circle-exclamation'></i>
      </span>
      : null}   
    </button>
  </div>

  {/* Flex Container for Friend List and Friend Panel */}
  <div className="profile-page-flex-container">
    {/* Friend List */}
    <div className="profile-page-friend-list">
      {friendsLoading || friendRequestsLoading ? (
        <p>Loading...</p>
      ) : showRequests ? (
        friendRequestsData?.getFriendRequests.length > 0 ? (
          friendRequestsData.getFriendRequests.map((request: { sender: string }, index: number) => (
            <div key={index} className="profile-page-friend-list-user">
              <UserCard username={request.sender} hasProfileImage={true} />
              
              <div className="profile-page-friend-request-button-container">
                <button
                  className="profile-page-friend-request-reject-button"
                  onClick={() => handleReject(request.sender)}
                >
                  <i className="fa-solid fa-xmark"></i>
                </button>
                <button
                  className="profile-page-friend-request-accept-button"
                  onClick={() => handleAccept(request.sender)}
                >
                  <i className="fa-solid fa-check"></i>
                </button>
              </div>
            </div>
          ))
        ) : (
          <p>No friend requests at this time.</p>
        )
      ) : (
        friendsData?.getFriends.length > 0 ? (
          friendsData.getFriends.map((friend: string, index: number) => (
            <div key={index} onClick={() => setSelectedFriend(friend)} className="profile-page-friend-list-item">
                <UserCard username={friend} hasProfileImage={true} />               
                <button onClick={() => handleRemoveFriend(username ? username : "", friend)} className="friend-request-button remove">Remove Friend</button>                          
            </div>
          ))
        ) : (
          <p>No friends at this time.</p>
        )
      )}
    </div>

    {/* this is for reference when recreating this functionality later - do not delete */}
    {/* Friend Panel */}
    {/* <div className="profile-page-friend-panel-display">
      {friendSelected ? (
        userLoading ? (
          <p>Loading profile...</p>
        ) : error ? (
          <p>Couldn't load {friendSelected}'s profile.</p>
        ) : userData ? (
          <div className="profile-page-panel">
            <div className="profile-page-panel-header">
              <div className="profile-page-panel-image">
                <UserAvatar 
                  username={userData.getUser.username} 
                  hasProfileImage={userData.getUser.hasProfileImage}
                  useLarge={true}
                />
              </div>
              <div className="profile-page-panel-name-container">
                <h3 className="profile-page-panel-name-big" style={{ color: foreColor }}>
                    {showProfileInfo ? 
                        (<b>{userData.getUser.firstName} {userData.getUser.lastName}</b>)
                     :  (<b>{userData.getUser.username}</b>)
                    }

                  {featureFlags.privateProfilesEnabled && userData?.getUser.isPrivate && (
                      <span className='private-profile-badge'>
                          <i className='fa-solid fa-lock'></i>
                      </span>
                  )}

                </h3>

                {showProfileInfo ? 
                (
                <span className="profile-page-panel-name">
                  {`${getUserAge(userData.getUser.birthday)} years old in ${userData.getUser.locationName}`}
                </span>
                ) : (<></>)}

              </div>
            </div>

            {!featureFlags.privateProfilesEnabled || (!userData.getUser.isPrivate || !showRequests) ? 
            (
            <div className="profile-page-panel-content">
              <span className="profile-page-panel-descriptor-left">{userData.getUser.experience}</span>
              <span className="profile-page-panel-descriptor-right">{`${userData.getUser.eventsHosted.length} Rides Joined`}</span>
            </div>
            ) : (<></>)}

            <div className="profile-page-panel-buttons">
              {!showRequests && (
                <button className="profile-page-panel-reject-button" onClick={() => setRemoveFriend(true)}>
                  <span>Remove Friend</span>
                </button>
              )}
            </div>
          </div>
        ) : null
      ) : (
        (friendRequestsData?.getFriendRequests.length > 0) && <p>Select a user to view details</p>
      )}
    </div> */}
  </div>
</div>

  );
};

export default FriendList;
