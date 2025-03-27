import { gql } from "@apollo/client";

export const GENERATE_PREVIEW_TOKEN = gql`
    mutation GeneratePreviewToken($eventId: String!) {
        generatePreviewToken(eventID: $eventId)
    }
`;