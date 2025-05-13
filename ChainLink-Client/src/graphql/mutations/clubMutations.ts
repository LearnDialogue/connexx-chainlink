// src/graphql/mutations/clubMutations.ts
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
  mutation leaveClub($clubId: ID!) {
    leaveClub(clubId: $clubId) {
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

export const REQUEST_TO_JOIN = gql`
  mutation requestToJoin($clubId: ID!, $userId: ID!) {
    requestToJoin(clubId: $clubId, userId: $userId) {
      id
      requestedMembers { id username }
    }
  }
`;

export const APPROVE_MEMBER = gql`
  mutation approveMember($clubId: ID!, $userId: ID!) {
    approveMember(clubId: $clubId, userId: $userId) {
      id
      members { id username }
      requestedMembers { id username }
    }
  }
`;

export const REJECT_MEMBER = gql`
  mutation rejectMember($clubId: ID!, $userId: ID!) {
    rejectMember(clubId: $clubId, userId: $userId) {
      id
      requestedMembers { id username }
    }
  }
`;

export const ADD_ADMIN = gql`
  mutation addAdmin($clubId: ID!, $userId: ID!) {
    addAdmin(clubId: $clubId, userId: $userId) {
      id
      admins { id username }
    }
  }
`;

export const REMOVE_MEMBER = gql`
  mutation removeMember($clubId: ID!, $userId: ID!) {
    removeMember(clubId: $clubId, userId: $userId) {
      id
      members { id username }
    }
  }
`;

export const REMOVE_ADMIN = gql`
  mutation removeAdmin($clubId: ID!, $userId: ID!) {
    removeAdmin(clubId: $clubId, userId: $userId) {
      id
      admins { id username }
    }
  }
`;
