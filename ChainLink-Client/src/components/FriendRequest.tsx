// FriendRequest.tsx
import React, { useState, useContext, useEffect } from "react";
import { AuthContext } from "../context/auth";
import { useMutation, useQuery } from "@apollo/client";
import { REQUEST_FRIEND } from "../graphql/mutations/friendshipMutations";
import { toast } from "react-toastify";
import "../styles/components/friend-request.css";
import { GET_FRIEND_STATUSES } from "../graphql/queries/friendshipQueries";
import { GET_PUBLIC_USERS } from "../graphql/queries/userQueries";
import { REMOVE_FRIEND } from "../graphql/mutations/friendshipMutations";
import { ACCEPT_FRIEND } from "../graphql/mutations/friendshipMutations";
import { DECLINE_FRIEND } from "../graphql/mutations/friendshipMutations";
import UserCard from './UserCard';


const FriendRequest = () => {
  const [receiver, setReceiver] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [usernameList, setUsernameList] = useState<string[]>([]);
  const { user } = useContext(AuthContext);
  const sender = user?.username || "";
  var [privateFriend, setPrivateFriend] = useState(false);

  const [sendFriendRequest] = useMutation(REQUEST_FRIEND);
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

  // Get all public users
  const { data: allPublicUsers } = useQuery(GET_PUBLIC_USERS);

  // Get friendship statuses for those users
  var { data: friendStatusesData, refetch } = useQuery(GET_FRIEND_STATUSES, {
    variables: {
      currentUsername: user?.username,
      usernameList: usernameList || [],
    },
    skip: !user?.username || !usernameList,
    fetchPolicy: "network-only",
  });

  const handleRemoveFriend = (sender: string, username: string, status: string) => {
    removeFriend({
      variables: { sender, receiver: username },
    }).then(() => {
      if(status === "accepted"){
        toast.success("Friend removed.");
      }else if(status === "pending"){
        toast.success("Friend request cancelled.");
      }
      
      refetch();
    })
    .catch(error => console.error('Error removing friend:', error));
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
      },
    });
  
    const handleAccept = (sender: string, receiver: string) => {
      acceptFriendRequest({ variables: { sender, receiver} })
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
        },
      });
    
      const handleReject = (sender: string, receiver: string) => {
        declineFriendRequest({ variables: { sender, receiver } })
          .catch(error => console.error('Error rejecting friend request:', error));
      };

  //filter usernames to search based on input
  useEffect(() => {
  if (receiver) {
    //check public matches first
    if (
      allPublicUsers?.getPublicUsers &&
      !allPublicUsers.getPublicUsers.some((u: any) =>
        u.username.toLowerCase().includes(receiver.toLowerCase())
      )
    ) {
      // If no public match, set usernameList to [receiver]
      setUsernameList([receiver]);
      setPrivateFriend(true);
    } else {
      setUsernameList(allPublicUsers?.getPublicUsers
    ? allPublicUsers.getPublicUsers.map((u: any) => u.username)
    : []);
      setPrivateFriend(false);
    }
  } else {
    setUsernameList(allPublicUsers?.getPublicUsers
    ? allPublicUsers.getPublicUsers.map((u: any) => u.username)
    : []);
    setPrivateFriend(false);
  }
}, [receiver, allPublicUsers]);

useEffect(() => {
  if (receiver && friendStatusesData?.getFriendStatuses) {
    const filtered = friendStatusesData.getFriendStatuses.filter((f: any) =>
      f.otherUser.toLowerCase().includes(receiver.toLowerCase())
    );
    if (filtered.length != 0) {
      setSuggestions(filtered);
    } else {
    setSuggestions([]);
    }
  }
}, [friendStatusesData, receiver]);

  const handleSendRequest = (sender: string, username: string) => {
    if (receiver.trim()) {
      sendFriendRequest({
        variables: { sender, receiver: username },
      })
        .then(() => {
          toast.success("Friend request sent!");
          refetch();
        })
        .catch((error) => {
          toast.error(error.message);
        });
    } else {
      toast.warn("Please enter a username.");
    }
  };

  return (
    <div className="friend-request-container">
      <div className="friend-request-form-container">
        <h2>Search for Friends</h2>
        <div className="relative">
          <input
            type="text"
            placeholder="Search username..."
            value={receiver}
            onChange={(e) => setReceiver(e.target.value)}
            className="friend-request-input"
          />
          {receiver && suggestions.length > 0 && (
            <div className="friend-request-suggestions">
              {suggestions.map((status: any) => (
                <div className="friend-request-card-button-container">
                  <UserCard
                    username={status.otherUser} 
                    hasProfileImage={true}
                    showImage={privateFriend && status.status !== "accepted" ? false : true}
                  />
                  {status.status ==="accepted" ? (
                    <button onClick={() => handleRemoveFriend(sender, status.otherUser, status.status)} className="friend-request-button remove">Remove Friend</button> 
                  ) : status.status === "pending" && status.receiver === sender ? (
                    <div>
                      <button className="profile-page-friend-request-reject-button" onClick={() => handleReject(status.sender, status.receiver)}>
                          <i className="fa-solid fa-xmark"></i>
                        </button>
                        <button className="profile-page-friend-request-accept-button" onClick={() => handleAccept(status.sender, status.receiver)}>
                          <i className="fa-solid fa-check"></i>
                        </button>
                    </div> 
                  ) : status.status === "pending" && status.sender === sender ? (
                    <button onClick={() => handleRemoveFriend(sender, status.otherUser, status.status)} className="friend-request-button pending">Pending</button> 
                  ) 
                  : (
                    <button onClick={() => handleSendRequest(sender, status.otherUser)} className="friend-request-button">Add Friend</button> 
                  )}
                  
                </div>
              ))}             
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
};

export default FriendRequest;
