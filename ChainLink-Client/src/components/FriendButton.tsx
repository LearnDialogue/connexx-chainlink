// Apollo GraphQL React component
// get username from parent component
// authContext provides current user
// use Apollo Graphql query getFriendshipStatus to maintain the state of the button
// if user is current user, do not display button
// if user and current user are not friends, render add friend button
    // button uses query addFriend
// if user and current user are pending friends, display pending button
// if user and current user are friends, button says 'friend'


import React, { useState, useEffect, useContext } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { GET_FRIENDSHIP_STATUS } from "../graphql/queries/userQueries";
import { ADD_FRIEND } from "../graphql/mutations/userMutations";
import { AuthContext } from "../context/auth";

interface Props {
  username: string;
}

const FriendButton: React.FC<Props> = ({ username }) => {
  const { user } = useContext(AuthContext);
  const [friendStatus, setFriendStatus] = useState("");
  const { loading, error, data } = useQuery(GET_FRIENDSHIP_STATUS, {
    variables: { sender: user?.username, receiver: username },
  });

  if (loading) return <p>Loading...</p>;
  if (error) return `Error! ${error.message}`;
  
  useEffect(() => {
    if (data) {
      setFriendStatus(data.getFriendshipStatus.status);
    }
  }, [data]);

  if (user?.username === username) {
    return null;
  }

  if (friendStatus === "pending") {
    return <button>Pending</button>;
  }

  if (friendStatus === "friends") {
    return <button>Friend</button>;
  }

  const [addFriend] = useMutation(ADD_FRIEND);

  const handleAddFriend = () => {
    addFriend({
      variables: { sender: user?.username, receiver: username },
    });
  };

  return <button onClick={handleAddFriend}>Add Friend</button>;
};

export default FriendButton;