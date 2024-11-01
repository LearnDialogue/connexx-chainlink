import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_FRIENDS, GET_FRIEND_REQUESTS } from '../graphql/queries/friendshipQueries';
import { ACCEPT_FRIEND, DECLINE_FRIEND } from '../graphql/mutations/friendshipMutations';
import UserAvatar from './UserAvatar';

interface FriendListProps {
  username: string | null;
}

const FriendList: React.FC<FriendListProps> = ({ username }) => {
  const [showRequests, setShowRequests] = useState(false);
  const { loading: friendsLoading, data: friendsData } = useQuery(GET_FRIENDS, {
    variables: { username },
  });
  const { loading: friendRequestsLoading, data: friendRequestsData } = useQuery(GET_FRIEND_REQUESTS, {
    variables: { username },
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
      })
      .catch(error => {
        // Handle error (e.g., show error message)
        console.error('Error accepting friend request:', error);
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
        })
        .catch(error => {
            // Handle error (e.g., show error message)
            console.error('Error rejecting friend request:', error);
        });
    };

  return (
    <>
      <h3>Your friends</h3><div className="profile-page-friends-container">
        <div className="profile-page-list-display">
          <button
            className="profile-page-friend-list-tab"
            onClick={() => setShowRequests(false)}
            style={{ backgroundColor: showRequests ? 'white' : 'var(--primary-color-light)', color: showRequests ? 'black' : 'white' }}
          >
            Friends
          </button>
          <button
            className="profile-page-friend-list-tab"
            onClick={() => setShowRequests(true)}
            style={{ backgroundColor: showRequests ? 'var(--primary-color-light)' : 'white', color: showRequests ? 'white' : 'black' }}
          >
            Friend Requests
          </button>

          <div className="profile-page-friend-list">
            {friendsLoading || friendRequestsLoading ? (
              <p>Loading...</p>
            ) : showRequests ? (
              friendRequestsData?.getFriendRequests.map((request: { sender: string; }, index: number) => (
                <div key={index} className="profile-page-friend-list-item">
                  <span className="image">
                    {/* TODO: STILL NEED TO DERIVE FLAG */}
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
                <div key={index} className="profile-page-friend-list-item">
                  <span className="image">
                    {/* TODO: STILL NEED TO DERIVE FLAG */}
                    <UserAvatar username={friend} hasProfileImage={true} />
                  </span>
                  <span className="name"><b>{friend}</b></span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default FriendList;
