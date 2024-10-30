import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_FRIENDS, GET_FRIEND_REQUESTS } from '../graphql/queries/friendshipQueries';
import { ACCEPT_FRIEND, DECLINE_FRIEND, REMOVE_FRIEND } from '../graphql/mutations/friendshipMutations';
import UserAvatar from './UserAvatar';

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

  // Accept friend requests
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
    },
  });

  const handleAccept = (sender: string) => {
    acceptFriendRequest({
      variables: { sender, receiver: username },
    })
    .then(response => {
      console.log('Friend request accepted:', response);
      setPanelUpdate(true);
    })
    .catch(error => {
      console.error('Error accepting friend request:', error);
      setPanelUpdate(true);
    });
  };

  // Reject friend requests
  const [declineFriendRequest] = useMutation(DECLINE_FRIEND, {
    update(cache, { data: { declineFriendRequest } }) {
      cache.modify({
        fields: {
          getFriendRequests(existingFriendRequests = []) {
            return existingFriendRequests.filter((request: any) => request.sender !== declineFriendRequest.sender);
          },
        },
      });
    },
  });

  const handleReject = (sender: string) => {
    declineFriendRequest({
      variables: { sender, receiver: username },
    })
    .then(response => {
      console.log('Friend request rejected:', response);
      setPanelUpdate(true);
    })
    .catch(error => {
      console.error('Error rejecting friend request:', error);
      setPanelUpdate(true);
    });
  };

  // Remove Friend
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
    },
  });

  const handleRemoval = (sender: string) => {
    removeFriend({
      variables: { sender, receiver: username },
    })
    .then(response => {
      console.log('Friend Removed:', response);
      setPanelUpdate(true);
    })
    .catch(error => {
      console.error('Error removing friend:', error);
      setPanelUpdate(true);
    });
  };

  const handleListChange = (showRequestsFlag: boolean) => {
    setShowRequests(showRequestsFlag);
    setPanelUpdate(true);
  };

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

        <div className="profile-page-friend-list">
          {friendsLoading || friendRequestsLoading ? (
            <p>Loading...</p>
          ) : showRequests ? (
            friendRequestsData?.getFriendRequests.map((request: { sender: string }, index: number) => (
              <div key={index} onClick={() => setSelectedFriend(request.sender)} className="profile-page-friend-list-item">
                <span className="image">
                  <UserAvatar username={request.sender} hasProfileImage={true} />
                </span>
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
                <span className="image">
                  <UserAvatar username={friend} hasProfileImage={true} />
                </span>
                <span className="name"><b>{friend}</b></span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default FriendList;