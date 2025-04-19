import { gql } from "@apollo/client";

export const CREATE_CLUB = gql`
  mutation createClub($clubInput: ClubInput!) {
    createClub(clubInput: $clubInput) {
      id
      name
      description
      locationName
      locationCoords
      radius
      metric
      createdAt
      isPrivate
    }
  }
`;

export const UPDATE_CLUB = gql`
  mutation updateClub($id: ID!, $clubInput: ClubInput!) {
    updateClub(id: $id, clubInput: $clubInput) {
      id
      name
      description
      locationName
      locationCoords
      radius
      metric
      isPrivate
      owners { id username }
      admins { id username }
      members { id username }
    }
  }
`;

export const DELETE_CLUB = gql`
  mutation deleteClub($id: ID!) {
    deleteClub(id: $id)
  }
`;

export const JOIN_CLUB = gql`
  mutation joinClub($clubId: ID!, $userId: ID!) {
    joinClub(clubId: $clubId, userId: $userId) {
      id
      name
    }
  }
`;

export const LEAVE_CLUB = gql`
  mutation leaveClub($clubId: ID!, $userId: ID!) {
    leaveClub(clubId: $clubId, userId: $userId) {
      id
      name
    }
  }
`;

export const DECLINE_TO_JOIN = gql`
  mutation declineToJoin($clubId: ID!, $userId: ID!) {
    declineToJoin(clubId: $clubId, userId: $userId) {
      id
    }
  }
`;

export const ADD_OWNER = gql`
  mutation addOwner($clubId: ID!, $userId: ID!) {
    addOwner(clubId: $clubId, userId: $userId) {
      id
      owners { id username }
    }
  }
`;

export const REMOVE_OWNER = gql`
  mutation removeOwner($clubId: ID!, $userId: ID!) {
    removeOwner(clubId: $clubId, userId: $userId) {
      id
      owners { id username }
    }
  }
`;
