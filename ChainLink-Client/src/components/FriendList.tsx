import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_FRIENDS, GET_FRIEND_REQUESTS } from '../graphql/queries/friendshipQueries';
import { ACCEPT_FRIEND, DECLINE_FRIEND, REMOVE_FRIEND } from '../graphql/mutations/friendshipMutations';
import { FETCH_USER_BY_NAME } from '../graphql/queries/userQueries';

interface FriendListProps {
  username: string | null;
}

const FriendList: React.FC<FriendListProps> = ({ username }) => {
  const [showRequests, setShowRequests] = useState(false);
  const [updatePanel, setPanelUpdate] = useState(true);
  const [friendSelected, setSelectedFriend] = useState("");
  const { loading: friendsLoading, data: friendsData } = useQuery(GET_FRIENDS, {
    variables: { username },
  });
  const { loading: friendRequestsLoading, data: friendRequestsData } = useQuery(GET_FRIEND_REQUESTS, {
    variables: { username },
  });

  const foreColor = window.getComputedStyle(document.documentElement).getPropertyValue('--primary-color');

  const getUserAge = (dateStr: string): string => {
    const date = new Date(dateStr);

    return (new Date().getUTCFullYear() - date.getUTCFullYear()).toString();
  };

  const {
    loading: userLoading,
    error,
    data: userData,
  } = useQuery(FETCH_USER_BY_NAME, {
        variables: {
            username: friendSelected,
        },
  });

   // Accept friend requests
  const [ acceptFriendRequest ] = useMutation(ACCEPT_FRIEND, {
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
    }
  }
  );

  const handleAccept = (sender: string) => {
    acceptFriendRequest({
      variables: { sender, receiver: username },
    }).then(response => {
        // Handle successful acceptance (e.g., update state, show notification)
        console.log('Friend request accepted:', response);
        setPanelUpdate(true);
      })
      .catch(error => {
        // Handle error (e.g., show error message)
        console.error('Error accepting friend request:', error);
        setPanelUpdate(true);
      });
  };

  // Reject friend requests
    const [ declineFriendRequest ] = useMutation(DECLINE_FRIEND, {
        update(cache, { data: { declineFriendRequest } }) {
        cache.modify({
            fields: {
            getFriendRequests(existingFriendRequests = []) {
                return existingFriendRequests.filter((request: any) => request.sender !== declineFriendRequest.sender);
            },
            },
        });
        }
    }
    );

    const handleReject = (sender: string) => {
        declineFriendRequest({
        variables: { sender, receiver: username },
        }).then(response => {
            // Handle successful rejection (e.g., update state, show notification)
            console.log('Friend request rejected:', response);
            setPanelUpdate(true);
        })
        .catch(error => {
            // Handle error (e.g., show error message)
            console.error('Error rejecting friend request:', error);
            setPanelUpdate(true);
        });
    };

    // Remove Friend
    const [ removeFriend ] = useMutation(REMOVE_FRIEND, {
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
        }
    });

    const handleRemoval = (sender: string) => {
        removeFriend({
        variables: { sender, receiver: username },
        }).then(response => {
            // Handle successful rejection (e.g., update state, show notification)
            console.log('Friend Removed:', response);
            setPanelUpdate(true);
        })
        .catch(error => {
            // Handle error (e.g., show error message)
            console.error('Error removing friend:', error);
            setPanelUpdate(true);
        });
    };

    const handleListChange = (showRequestsFlag: boolean) => {
        setShowRequests(showRequestsFlag)
        setPanelUpdate(true)
    }

    if (updatePanel && !showRequests && !friendsLoading && friendsData.getFriends.length > 0)
    {
        setSelectedFriend(friendsData.getFriends[0])
        setPanelUpdate(false)
    }

    if (updatePanel && showRequests && !friendRequestsLoading && friendRequestsData.getFriendRequests.length > 0)
    {
        setSelectedFriend(friendRequestsData.getFriendRequests[0].sender)
        setPanelUpdate(false)
    }

    if (updatePanel && (
        (showRequests && !friendRequestsLoading && friendRequestsData.getFriendRequests.length == 0)
     || (!showRequests && !friendsLoading && friendsData.getFriends.length == 0)))
    {
        setSelectedFriend("")
        setPanelUpdate(false)
    }

  return (
    <div className="profile-page-friends-container">
      <div className="profile-page-list-display">
        <button
          className="profile-page-friend-list-tab"
          onClick={() => handleListChange(false)}
          style={{ backgroundColor: showRequests ? 'white' : 'var(--primary-color-light)', color: showRequests ? 'black' : 'white' }}
        >
          Friends
        </button>
        <button
          className="profile-page-friend-list-tab"
          onClick={() => handleListChange(true)}
          style={{ backgroundColor: showRequests ? 'var(--primary-color-light)' : 'white', color: showRequests ? 'white' : 'black' }}
        >
          Friend Requests
        </button>
        <div className="profile-page-list-panel-display">
            <div className="profile-page-friend-list">
            {friendsLoading || friendRequestsLoading ? (
                <p>Loading...</p>
            ) : showRequests ? (
                friendRequestsData?.getFriendRequests.map((request: { sender: string }, index: number) => (
                <div key={index} onClick={() => setSelectedFriend(request.sender)} className="profile-page-friend-list-item">
                    <span className="image">{request.sender.slice(0, 1).toLocaleUpperCase()}</span>
                    <span className="name"><b>{request.sender}</b></span>
                    <div className="profile-page-friend-request-button-container">
                    <button className="profile-page-friend-request-reject-button" onClick={() => handleReject(request.sender)}>
                        <i className="fa-solid fa-xmark"></i>
                    </button>
                    <button className="profile-page-friend-request-accept-button" onClick={() => handleAccept(request.sender)}>
                        <i className="fa-solid fa-check"></i>
                    </button>
                    </div>
                </div>
                ))
            ) : (
                friendsData?.getFriends.map((friend: string, index: number) => (
                <div key={index} onClick={() => setSelectedFriend(friend)} className="profile-page-friend-list-item">
                    <span className="image">{friend.slice(0, 1).toLocaleUpperCase()}</span>
                    <span className="name"><b>{friend}</b></span>
                </div>
                ))
            )}
            </div>
            <div className="profile-page-friend-panel-display"> 
                { friendSelected == "" ? (
                    <p>Select A Profile To View</p>
                ) : userLoading ? (
                    <p>Loading...</p>
                ) : (error) ? (
                    <p>Couldn't Load {friendSelected}'s profile.</p>
                ) : 
                    <div className="profile-page-panel">
                        <div className="profile-page-panel-header">
                            <div className='profile-page-panel-image'>
                                {userData.getUser.username.slice(0, 1).toLocaleUpperCase()}
                            </div>
                            <div className="profile-page-panel-name-container">
                                <h3 className="profile-page-panel-name-big" style={{color: foreColor}}><b>{userData.getUser.firstName + " " + userData.getUser.lastName}</b></h3>
                                {userData.getUser.locationName != "" ? 
                                    (<span className="profile-page-panel-name">{getUserAge(userData.getUser.birthday) + " year old in " + userData.getUser.locationName}</span>)
                                : (<span className="profile-page-panel-name">{getUserAge(userData.getUser.birthday) + " year old"}</span>)
                                }
                            </div>
                        </div>
                        <div className = "profile-page-panel-content">
                            <span className="profile-page-panel-descriptor-left">{userData.getUser.experience}</span>
                            <span className="profile-page-panel-descriptor-right">{userData.getUser.eventsHosted.length + " Rides Joined"}</span>
                        </div>

                        {/* Remaining Content On Panel */}

                        <div className = "profile-page-panel-buttons">
                            { showRequests ? (
                                <div>
                                    <button className="profile-page-panel-reject-button" onClick={() => handleReject(friendSelected)}>
                                        <span>Reject Request</span>
                                    </button>
                                    <button className="profile-page-panel-accept-button" onClick={() => handleAccept(friendSelected)}>
                                        <span>Accept Request</span>
                                    </button>
                                </div>
                            ) : (
                                <button className="profile-page-panel-reject-button" onClick={() => handleRemoval(friendSelected)}>
                                <span>Remove Friend</span>
                            </button>
                            )}
                        </div>

                    </div>

                    
                
                }
            </div>
        </div>
      </div>
    </div>
  );
};

export default FriendList;
