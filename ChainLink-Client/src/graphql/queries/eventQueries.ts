import { gql } from "@apollo/client";

export const FETCH_RIDES = gql`
  query getEvents(
    $page: Int
    $pageSize: Int
    $startDate: Date!
    $endDate: Date
    $bikeType: [String!]
    $wkg: [Float!]
    $avgSpeed: [Float!]
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
        avgSpeed: $avgSpeed
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
      wattsPerKilo
      rideAverageSpeed
      intensity
      route
      participants
      privateWomen
      privateNonBinary
      match
      private
      invited

      comments {
        userName
        comment
        imageURL
        createdAt
        likes
        dislikes
        replies {
          _id
          userName
          comment
          imageURL
          createdAt
          likes
          dislikes
        }
      }
      rideAverageSpeed 
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

export const FETCH_EVENT_PREVIEW = gql`
  query getEventPreview($eventId: String!) {
    getEvent(eventID: $eventId) {
      _id
      bikeType
      description
      host
      intensity
      name
      startTime
      wattsPerKilo
      participants
      comments {
        userName
        comment
        imageURL
        createdAt
        likes
        dislikes
        replies {
          _id
          userName
          comment
          imageURL
          createdAt
          likes
          dislikes
        }
      }
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
      wattsPerKilo
      intensity
      route
      participants
      private
      privateWomen
      privateNonBinary
      comments {
        userName
        comment
        imageURL
        createdAt
        likes
        dislikes
        replies {
          _id
          userName
          comment
          imageURL
          createdAt
          likes
          dislikes
        }
      }
      rideAverageSpeed 
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
      wattsPerKilo
      intensity
      route
      participants
      private
      privateWomen
      privateNonBinary
      comments {
        userName
        comment
        imageURL
        createdAt
        likes
        dislikes
        replies {
          _id
          userName
          comment
          imageURL
          createdAt
          likes
          dislikes
        }
      }
      rideAverageSpeed 
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
      wattsPerKilo
      intensity
      route
      participants
      private
      privateWomen
      privateNonBinary
      comments {
        userName
        comment
        imageURL
        createdAt
        likes
        dislikes
        replies {
          _id
          userName
          comment
          imageURL
          createdAt
          likes
          dislikes
        }
      }
    }
  }
`;

export const ADD_COMMENT = gql`
  mutation addComment($eventID: ID!, $comment: String!) {
    addComment(eventID: $eventID, comment: $comment) {
      _id
      comments {
        _id
        userName
        comment
        imageURL
        createdAt
        likes
        dislikes
        replies {
          _id
          userName
          comment
          imageURL
          createdAt
          likes
          dislikes
        }
      }
    }
  }
`;


export const ADD_REPLY = gql`
  mutation addReply($eventID: ID!, $commentID: ID!, $reply: String!) {
    addReply(eventID: $eventID, commentID: $commentID, reply: $reply) {
      _id
      comments {
        _id
        userName
        imageURL
        comment
        createdAt
        likes
        dislikes
        replies {
          _id
          userName
          imageURL
          comment
          createdAt
          likes
          dislikes
          replies {
            _id
          }
        }
      }
    }
  }
`;

export const LIKE_COMMENT = gql`
  mutation likeComment($eventID: ID!, $commentID: ID!) {
    likeComment(eventID: $eventID, commentID: $commentID) {
      _id
      comments {
        _id
        userName
        imageURL
        comment
        createdAt
        likes
        dislikes
        replies {
          _id
          userName
          imageURL
          comment
          createdAt
          likes
          dislikes
          replies {
            _id
          }
        }
      } 
    }
  }
`;

export const DISLIKE_COMMENT = gql`
  mutation dislikeComment($eventID: ID!, $commentID: ID!) {
    dislikeComment(eventID: $eventID, commentID: $commentID) {
      _id
      comments {
        _id
        userName
        imageURL
        comment
        createdAt
        likes
        dislikes
        replies {
          _id
          userName
          imageURL
          comment
          createdAt
          likes
          dislikes
          replies {
            _id
          }
        }
      }
    }
  }
`;

export const GET_EVENT = gql`
  query GetEvent($eventID: String!) {
    getEvent(eventID: $eventID) {
      _id
      bikeType
      description
      host
      intensity
      name
      startTime
      wattsPerKilo
      participants
      
      comments {
        _id
        userName
        comment
        imageURL
        createdAt
        likes
        dislikes

        replies {
          _id
          userName
          comment
          imageURL
          createdAt
          likes
          dislikes
          
          replies {
            _id
            userName
            comment
            imageURL
            createdAt
            likes
            dislikes
          }
        }
      }
    }
  }
`;