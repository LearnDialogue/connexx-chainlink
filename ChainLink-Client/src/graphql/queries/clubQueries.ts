import { gql } from "@apollo/client";

export const GET_CLUBS = gql`
  query getClubs {
    getClubs
    {
      id
      name
      owners {
        username
      }
      admins {
        username
      }
      members {
        username
      }
      requestedMembers {
        username
      }
    }
  }
`;

export const GET_CLUB = gql`
  query getClub($id: String!) {
    getClub(id: $id)
    {
      name
      owners {
        username
      }
      admins {
        username
      }
      members {
        username
      }
    }
  }
`;

export const GET_CLUB_FIELD = gql`
  query getClubField($id: String!, $field: String!) {
    getClubField(id: $id, field: $field)
  }
`;

export const GET_CLUB_MEMBERS = gql`
  query getClubMembers($clubId: String!) {
    getClubMembers(clubId: $clubId) {
      username
    }
  }
`;
