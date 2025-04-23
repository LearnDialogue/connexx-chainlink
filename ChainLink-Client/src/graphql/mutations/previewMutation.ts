import { gql } from "@apollo/client";

export const GENERATE_PREVIEW_TOKEN = gql`
    mutation GeneratePreviewToken($eventID: String!) {
        generatePreviewToken(eventID: $eventID)
    }
`;