import { gql } from '@apollo/client';

export const GET_CLUBS = gql`
  query getClubs {
    getClubs {
      id
      name
      locationName
      description
      isPrivate
      clubUser {
        id
        username
      }
      owners {
        id
        username
      }
      admins {
        id
        username
      }
      members {
        id
        username
      }
      requestedMembers {
        id
        username
      }
    }
  }
`;

export const GET_CLUB = gql`
  query getClub($id: ID!) {
    getClub(id: $id) {
      id
      locationName
      clubUser {
        id
        username
      }
      name
      description
      createdAt
      isPrivate
      eventsHosted {
        _id
      }
      owners {
        id
        username
      }
      admins {
        id
        username
      }
      members {
        id
        username
      }
      requestedMembers {
        id
        username
      }
    }
  }
`;

export const GET_CLUB_FIELD = gql`
  query getClubField($id: ID!, $field: String!) {
    getClubField(id: $id, field: $field)
  }
`;

export const GET_CLUB_MEMBERS = gql`
  query getClubMembers($clubId: ID!) {
    getClubMembers(clubId: $clubId) {
      id
      username
    }
  }
`;

export const GET_CLUB_MEMBERSHIPS = gql`
  query getClubMemberships($username: String!) {
    getClubMemberships(username: $username) {
      id
      name
      isPrivate
    }
  }
`;

export const GET_PENDING_CLUB_REQUESTS = gql`
  query getPendingClubRequests($username: String!) {
    getPendingClubRequests(username: $username) {
      id
      name
      isPrivate
    }
  }
`;

export const GET_CLUB_USER = gql`
  query getClubUser($clubId: ID!) {
    getClubUser(clubId: $clubId) {
      id
      username
      hasProfileImage
    }
  }
`;