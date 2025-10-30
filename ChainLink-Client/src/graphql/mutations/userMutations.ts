import { gql } from "@apollo/client";

export const LOGIN_USER = gql`
  mutation login($username: String!, $password: String!, $remember: String!) {
    login(
      loginInput: {
        password: $password
        username: $username
        remember: $remember
      }
    ) {
      username
      loginToken
    }
  }
`;

export const DELETE_USER = gql`
 mutation deleteUser {
    deleteUser {
        id
    }
 }
 `;

export const EDIT_USER = gql`
 mutation editProfile(
   $firstName: String!
   $lastName: String!
   $email: String!
   $metric: Boolean!
   $sex: String!
   $username: String!
   $weight: Int!
   $birthday: String!
   $location: String!
   $radius: Int!
   $FTP: Float!
   $experience: String!
   $isPrivate: Boolean
   $bikeTypes: [String]
 ) {
   editProfile(
     editProfileInput: {
       birthday: $birthday
       email: $email
       firstName: $firstName
       lastName: $lastName
       metric: $metric
       sex: $sex
       username: $username
       weight: $weight
       location: $location
       radius: $radius
       FTP: $FTP
       experience: $experience
       isPrivate: $isPrivate
       bikeTypes: $bikeTypes
     }
   ) {
     username
     loginToken
   }
 }
`;

export const REQUEST_PASSWORD_RESET = gql`
  mutation requestPasswordReset($userNameOrEmail: String!) {
    requestPasswordReset(userNameOrEmail: $userNameOrEmail) {
      success
      message
    }
  }
`;

export const RESET_PASSWORD = gql`
  mutation resetPassword($resetToken: String!, $newPassword: String!) {
    resetPassword(resetToken: $resetToken, newPassword: $newPassword) {
      success
      message
    }
  }
`;

export const REGISTER_USER = gql`
  mutation register(
    $firstName: String!
    $lastName: String!
    $email: String!
    $metric: Boolean!
    $sex: String!
    $username: String!
    $weight: Int!
    $password: String!
    $confirmPassword: String!
    $birthday: String!
    $FTP: Float!
    $experience: String!
    $isPrivate: Boolean
    $bikeTypes: [String]
  ) {
    register(
      registerInput: {
        birthday: $birthday
        password: $password
        confirmPassword: $confirmPassword
        email: $email
        firstName: $firstName
        lastName: $lastName
        metric: $metric
        sex: $sex
        username: $username
        weight: $weight
        FTP: $FTP
        experience: $experience
        isPrivate: $isPrivate
        bikeTypes: $bikeTypes
      }
    ) {
      username
      loginToken
    }
  }
`;

export const REQUEST_STRAVA = gql`
  query requestStravaAuthorization {
    requestStravaAuthorization
  }
`;

export const EXCHANGE_STRAVA = gql`
  mutation exchangeStravaAuthorizationCode($code: String!, $scope: String!) {
    exchangeStravaAuthorizationCode(code: $code, scope: $scope) {
      username
    }
  }
`
export const UPLOAD_PROFILE_IMAGE = gql`
  mutation uploadProfileImage($file: Upload!, $username: String!) {
    uploadProfileImage(file: $file, username: $username){
      url
    }
}
`
