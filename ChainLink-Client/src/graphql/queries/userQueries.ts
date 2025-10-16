import { gql } from "@apollo/client";

export const FETCH_USER = gql`
  query getUser($username: String, $email: String) {
    getUser(username: $username, email: $email) {
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
      hasProfileImage
    }
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

export const GET_PUBLIC_USERS = gql`
  query getPublicUsers {
    getPublicUsers{
      username,
      
    }
  }
`;

// Backward compatibility for components importing FETCH_USER_BY_NAME
export const FETCH_USER_BY_NAME = FETCH_USER;