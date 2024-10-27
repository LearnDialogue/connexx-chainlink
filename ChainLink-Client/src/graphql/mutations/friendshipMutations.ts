import { gql } from "@apollo/client";

export const REQUEST_FRIEND = gql`
  mutation sendFriendRequest($sender: String!, $receiver: String!) {
    sendFriendRequest(sender: $sender, receiver: $receiver) {
      _id
      status
      receiver
      sender
      createdAt
    }
  }
`;

export const ACCEPT_FRIEND = gql`
    mutation acceptFriendRequest($sender: String!, $receiver: String!) {
        acceptFriendRequest(sender: $sender, receiver: $receiver) {
        _id
        status
        receiver
        sender
        createdAt
        }
    }
    `;

export const DECLINE_FRIEND = gql`
    mutation declineFriendRequest($sender: String!, $receiver: String!) {
        declineFriendRequest(sender: $sender, receiver: $receiver) {
        _id
        status
        receiver
        sender
        createdAt
        }
    }
    `;