// clubMutations.ts
import { gql } from "@apollo/client";

export const CREATE_CLUB = gql`
  mutation createClub($clubInput: ClubInput!) {
    createClub(clubInput: $clubInput) {
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

// export const UPDATE_CLUB = gql`

// `;

// export const DELETE_CLUB = gql`

// `;

export const JOIN_CLUB = gql`
  mutation joinClub($clubId: String!, $userId: String!) {
    joinClub(clubId: $clubId, userId: $userId) {
      name
    }
  }
`;

export const LEAVE_CLUB = gql`
  mutation leaveClub($clubId: String!, $userId: String!) {
    leaveClub(clubId: $clubId, userId: $userId) {
      name
    }
  }
`;

// export const ADD_MEMBER = gql`

// `;

// export const REMOVE_MEMBER = gql`

// `;

// export const ADD_ADMIN = gql`

// `;

// export const REMOVE_ADMIN = gql`

// `;

// export const REQUEST_TO_JOIN = gql`

// `;

export const DECLINE_TO_JOIN = gql`
  mutation declineToJoin($cludId: String!, $userId: String!) {
    declineToJoin(clubId: $clubId, userId: $userId) {
      id
    }
  }
`;

// export const APPROVE_MEMBER = gql`

// `;

// export const REJECT_MEMBER = gql`

// `;