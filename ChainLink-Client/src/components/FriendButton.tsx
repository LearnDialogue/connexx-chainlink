import React, { useState, useContext, useEffect } from "react";
import { Reference, StoreObject, useMutation } from "@apollo/client";
import { GET_FRIEND_STATUSES } from "../graphql/queries/friendshipQueries";
import { REQUEST_FRIEND } from "../graphql/mutations/friendshipMutations";
import { AuthContext } from "../context/auth";
import "../styles/components/friend-button.css"; // Import the CSS file

interface Props {
  username: string;
  friendStatus: string;
}

const FriendButton: React.FC<Props> = ({ username, friendStatus }) => {
  const { user } = useContext(AuthContext);

  // Local state to manage friend status for immediate UI feedback
  const [localFriendStatus, setLocalFriendStatus] = useState(friendStatus);

  // Sync local state with prop when prop updates
  useEffect(() => {
    setLocalFriendStatus(friendStatus);
  }, [friendStatus]);

  const [addFriend] = useMutation(REQUEST_FRIEND, {
    variables: { sender: user?.username, receiver: username },
    update(cache, { data: { addFriend } }) {
      // Update the getFriendStatuses cache entry for this username
      cache.modify({
        fields: {
          getFriendStatuses(existingFriendStatuses = [], { readField }) {
            return existingFriendStatuses.map((status: Reference | StoreObject | undefined) =>
              readField("otherUser", status) === username
                ? { ...status, status: "pending" }
                : status
            );
          },
        },
      });
      setLocalFriendStatus("pending"); // Optimistically update local state
    },
  });

  const handleAddFriend = () => {
    setLocalFriendStatus("pending"); // Optimistically set status to pending
    addFriend();
  };

  if (!localFriendStatus || user?.username === username) {
    return null;
  }

  return (
    <button
      className={`friend-button ${
        localFriendStatus === "pending"
          ? "friend-button-pending"
          : localFriendStatus === "accepted"
          ? "friend-button-friend"
          : "friend-button-primary add-friend-button"
      }`}
      onClick={localFriendStatus === "none" ? handleAddFriend : undefined}
    >
      {localFriendStatus === "pending"
        ? "Pending"
        : localFriendStatus === "accepted"
        ? "Friend"
        : "Add Friend"}
    </button>
  );
};

export default FriendButton;
