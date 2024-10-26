import React, { useState, useEffect, useContext } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { GET_FRIENDSHIP_STATUS } from "../graphql/queries/userQueries";
import { ADD_FRIEND } from "../graphql/mutations/userMutations";
import { AuthContext } from "../context/auth";
import "../styles/components/friend-button.css"; // Import the CSS file

interface Props {
  username: string;
}

const FriendButton: React.FC<Props> = ({ username }) => {
  const { user } = useContext(AuthContext);
  const [friendStatus, setFriendStatus] = useState<string | null>(null);
  const { loading, error, data } = useQuery(GET_FRIENDSHIP_STATUS, {
    variables: { sender: user?.username, receiver: username },
  });

  const [ addFriend ] = useMutation(ADD_FRIEND, {
    update(cache, { data: { addFriend } }) {
      cache.modify({
        fields: {
          getFriendshipStatus(existingFriendshipStatus = {}) {
            return addFriend;
          },
        },
      });
    }, 
  });

  useEffect(() => {
    if (data && data.getFriendshipStatus) {
      setFriendStatus(data.getFriendshipStatus.status);
    } else {
      setFriendStatus("none");
    }
  }, [data]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error! {error.message}</p>;

  if (user?.username === username) {
    return null;
  }

  if (friendStatus === "pending") {
    return <button className="friend-button friend-button-pending">Pending</button>;
  }

  if (friendStatus === "accepted") {
    return <button className="friend-button friend-button-friend">Friend</button>;
  }

  const handleAddFriend = () => {
    console.log("addFriend: " + user?.username + " " + username);

    addFriend({
      variables: { sender: user?.username, receiver: username },
    });
  };

  return (
    <button
      className="friend-button friend-button-primary add-friend-button"
      onClick={handleAddFriend}
    >
      Add Friend
    </button>
  );
};

export default FriendButton;