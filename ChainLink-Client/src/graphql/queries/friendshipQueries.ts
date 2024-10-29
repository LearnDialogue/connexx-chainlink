import { gql } from "@apollo/client";

export const GET_FRIENDS = gql`
  query getFriends($username: String!) {
    getFriends(username: $username)
  }
`;

export const GET_FRIEND_REQUESTS = gql`
  query getFriendRequests($username: String!) {
    getFriendRequests(username: $username)
    {
      sender
      receiver
      status
      createdAt
    }
  }
`;

export const GET_FRIENDSHIP_STATUS = gql`
  query getFriendshipStatus($sender: String!, $receiver: String!) {
    getFriendshipStatus(sender: $sender, receiver: $receiver) {
      status
      }
  }
`;


export const GET_FRIEND_STATUSES = gql`
  query getFriendStatuses($currentUser: String!, $usernameList: [String!]!) {
    getFriendStatuses(currentUser: $currentUser, usernameList: $usernameList) {
      currentUser
      otherUser
      status
    }
  }
`;
