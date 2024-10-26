import { gql } from "@apollo/client";

export const FETCH_USER_BY_NAME = gql`
  query getUser($username: String!) {
    getUser(username: $username) {
      id
      username
      firstName
      lastName
      email
      isPrivate
      birthday
      weight
      locationName
      locationCoords
      radius
      sex
      bikeTypes
      FTP
      FTPdate
      experience
      eventsHosted
      eventsJoined
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

export const GET_FRIENDS = gql`
  query getFriends($username: String!) {
    getFriends(username: $username)
  }
`;

export const VALIDATE_USERNAME = gql`
  query validUsername($username: String!) {
    validUsername(username: $username)
  }
`;

export const VALIDATE_EMAIL = gql`
  query validEmail($email: String!) {
    validEmail(email: $email)
  }
`;