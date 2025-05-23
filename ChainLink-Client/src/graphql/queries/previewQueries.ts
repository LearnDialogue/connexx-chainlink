import { gql } from '@apollo/client'

export const GET_EVENT_PREVIEW = gql`
    query GetPreview($jwtToken: String!) {
        getPreview(jwtToken: $jwtToken) {
            event {
                bikeType
                description
                difficulty
                host
                intensity
                name
                participants
                startTime
                wattsPerKilo
                _id
                invited
                locationCoords
                locationName
                match
                private
                privateNonBinary
                privateWomen
                route
            }
            route {
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
                _id
            }
            isUser
        }
    }
    `;