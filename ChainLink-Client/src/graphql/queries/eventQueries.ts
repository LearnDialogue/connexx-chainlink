import { gql } from "@apollo/client";
// RidesFeed.tsx

export const FETCH_RIDES = gql`
  query getEvents(
    $page: Int
    $pageSize: Int
    $startDate: Date!
    $endDate: Date
    $bikeType: [String!]
    $wkg: [String!]
    $location: String
    $radius: Int
    $match: [String]
    $privacy: [String]
  ) {
    getEvents(
      getEventsInput: {
        page: $page
        pageSize: $pageSize
        startDate: $startDate
        endDate: $endDate
        bikeType: $bikeType
        wkg: $wkg
        location: $location
        radius: $radius
        match: $match
        privacy: $privacy
      }
    ) {
      _id
      host
      name
      locationName
      locationCoords
      startTime
      description
      bikeType
      difficulty
      wattsPerKilo
      intensity
      route
      participants
      privateWomen
      privateNonBinary
      match
      private
      invited
    }
  }
`;

export const FETCH_ROUTE = gql`
  query getRoute($routeID: String!) {
    getRoute(routeID: $routeID) {
      points
      elevation
      grade
      terrain
      distance
      maxElevation
      minElevation
      totalElevationGain
      startCoordinates
      endCoordinates
    }
  }
`;

export const GET_HOSTED_EVENTS = gql`
  query getHostedEvents($userId: ID) {
    getHostedEvents(userId: $userId) {
      _id
      host
      name
      locationName
      locationCoords
      startTime
      description
      bikeType
      difficulty
      wattsPerKilo
      intensity
      route
      participants
    }
  }
`;

export const GET_JOINED_EVENTS = gql`
  query getJoinedEvents($userId: ID) {
    getJoinedEvents(userId: $userId) {
      _id
      host
      name
      locationName
      locationCoords
      startTime
      description
      bikeType
      difficulty
      wattsPerKilo
      intensity
      route
      participants
    }
  }
`;

export const GET_INVITED_EVENTS = gql`
  query getInvitedEvents($userId: ID) {
    getInvitedEvents(userId: $userId) {
      _id
      host
      name
      locationName
      locationCoords
      startTime
      description
      bikeType
      difficulty
      wattsPerKilo
      intensity
      route
      participants
    }
  }
`;