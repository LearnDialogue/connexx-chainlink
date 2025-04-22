import { gql } from '@apollo/client';

export const GET_CLUBS = gql`
  query getClubs {
    getClubs {
      id
      name
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
