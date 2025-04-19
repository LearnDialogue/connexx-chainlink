import { gql } from "@apollo/client";

export const GET_CLUBS = gql`
  query getClubs {
    getClubs {
      id
      name
      owners { username }
      admins { username }
      members { username }
      requestedMembers { username }
    }
  }
`;

export const GET_CLUB = gql`
  query getClub($id: ID!) {
    getClub(id: $id) {
      id
      name
      description
      locationName
      locationCoords
      radius
      metric
      isPrivate
      createdAt
      owners { id username }
      admins { id username }
      members { id username }
      eventsHosted { _id name startTime locationName }
      eventsJoined { _id name startTime locationName }
      eventsInvited { _id name startTime locationName }
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
      username
    }
  }
`;
