import React, { useState, useContext } from "react";
import { AuthContext } from "../context/auth";
import { useMutation } from "@apollo/client";
import { REQUEST_FRIEND } from "../graphql/mutations/friendshipMutations";
import { toast } from "react-toastify";

const FriendRequest = () => {
  const [receiver, setReceiver] = useState("");
  const { user } = useContext(AuthContext);
  const sender = user?.username || "";
  const [sendFriendRequest] = useMutation(REQUEST_FRIEND);

  const handleSendRequest = () => {
    if (receiver.trim()) {
      sendFriendRequest({
        variables: { sender, receiver },
      })
        .then(response => {
          toast.success("Friend request sent!");
          setReceiver(""); // Clear the input after the request is sent
        })
        .catch(error => {
          toast.error(`${error.message}`);
        });
    } else {
      toast.warn("Please enter a username.");
    }
  };

  return (
    <div style={{ display: "flex", gap: "10px", padding: "20px" }}>
      <input
        type="text"
        placeholder="Enter username..."
        value={receiver}
        onChange={(e) => setReceiver(e.target.value)}
      />
      <button onClick={handleSendRequest}>Add Friend</button>
    </div>
  );
};

export default FriendRequest;
