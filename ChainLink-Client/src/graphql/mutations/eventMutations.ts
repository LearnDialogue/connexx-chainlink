import { gql } from "@apollo/client";

export const JOIN_RIDE = gql`
    mutation joinEvent($eventID: String!) {
        joinEvent(eventID: $eventID) {
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
`

export const LEAVE_RIDE = gql`
    mutation leaveEvent($eventID: String!) {
        leaveEvent(eventID: $eventID) {
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
`

export const JOIN_RIDE_MINIMAL = gql`
  mutation joinEvent($eventID: String!) {
    joinEvent(eventID: $eventID) {
      _id
    }
  }
`;

export const CREATE_EVENT_MUTATION = gql`
  mutation createEvent(
    $host: String!
    $name: String!
    $startTime: Date!
    $description: String!
    $bikeType: [String!]
    $difficulty: String!
    $wattsPerKilo: Float!
    $intensity: String!
    $points: [[Float]]!
    $elevation: [Float]!
    $grade: [Float]!
    $terrain: [String]!
    $distance: Float!
    $maxElevation: Float
    $minElevation: Float
    $totalElevationGain: Float
    $startCoordinates: [Float]!
    $endCoordinates: [Float]!
    $privateWomen: Boolean
    $privateNonBinary: Boolean
  ) {
    createEvent(
      createEventInput: {
        host: $host
        name: $name
        startTime: $startTime
        description: $description
        bikeType: $bikeType
        difficulty: $difficulty
        wattsPerKilo: $wattsPerKilo
        intensity: $intensity
        points: $points
        elevation: $elevation
        grade: $grade
        terrain: $terrain
        distance: $distance
        maxElevation: $maxElevation
        minElevation: $minElevation
        totalElevationGain: $totalElevationGain
        startCoordinates: $startCoordinates
        endCoordinates: $endCoordinates
        privateWomen: $privateWomen
        privateNonBinary: $privateNonBinary
      }
    ) {
      _id
    }
  }
`;

export const EDIT_EVENT = gql`
  mutation editEvent(
    $name: String!
    $startTime: Date!
    $description: String!
    $bikeType: [String!]
    $difficulty: String!
    $wattsPerKilo: Float!
    $intensity: String!
    $points: [[Float]]!
    $elevation: [Float]!
    $grade: [Float]!
    $terrain: [String]!
    $distance: Float!
    $maxElevation: Float!
    $minElevation: Float!
    $totalElevationGain: Float!
    $startCoordinates: [Float]!
    $endCoordinates: [Float]!
    $eventID: String!
  ) {
    editEvent(
      editEventInput: {
        name: $name
        startTime: $startTime
        description: $description
        bikeType: $bikeType
        difficulty: $difficulty
        wattsPerKilo: $wattsPerKilo
        intensity: $intensity
        points: $points
        elevation: $elevation
        grade: $grade
        terrain: $terrain
        distance: $distance
        maxElevation: $maxElevation
        minElevation: $minElevation
        totalElevationGain: $totalElevationGain
        startCoordinates: $startCoordinates
        endCoordinates: $endCoordinates
        eventID: $eventID
      }
    ) {
      _id
      name
      bikeType
      route
    }
  }
`;

export const DELETE_EVENT = gql`
  mutation deleteEvent($eventID: String!) {
    deleteEvent(eventID: $eventID) {
      username
    }
  }
`;

export const INVITE_TO_EVENT = gql`
  mutation inviteToEvent($eventID: String!, $invitees: [String!]!) {
    inviteToEvent(eventID: $eventID, invitees: $invitees) {
      _id
      name
      invited
    }
  }
`;