const gql = require('graphql-tag');

module.exports = gql`
  scalar Date

  ##  MAIN MODELS

  type Friendship {
    _id: ID!
    sender: String!
    receiver: String!
    status: String!
    createdAt: String!
  }

  type Friendship {
    _id: ID!
    sender: String!
    receiver: String!
    status: String!
    createdAt: String!
  }

  ## User Model
  type User {
    id: ID!
    username: String!
    email: String!
    password: String!
    firstName: String!
    lastName: String!
    sex: String!
    birthday: Date!
    weight: Int!
    experience: String!
    isPrivate: Boolean
    bikeTypes: [String]
    FTP: Float!
    locationName: String
    locationCoords: [Float]
    radius: Float
    metric: Boolean!
    FTPdate: String
    equipment: [Gear]
    loginToken: String
    stravaAPIToken: String
    stravaRefreshToken: String
    stravaTokenExpiration: String
    eventsHosted: [String]
    eventsJoined: [String]
    createdAt: String!
    lastLogin: String!
    emailAuthenticated: String
    permission: String!
    hasProfileImage: Boolean
  }

  ## User/Gear Aux Model
  type Gear {
    id: ID!
    type: String!
    subtype: String
    make: String!
    model: String!
    weight: Int!
    distance: Float!
  }

  ## Event Model
  type Event {
    _id: ID!
    host: String!
    name: String!
    locationName: String!
    locationCoords: [Float]!
    startTime: Date!
    description: String
    bikeType: [String!]
    difficulty: [Float!]
    wattsPerKilo: [Float!]
    intensity: String!
    route: String!
    participants: [String]
    invited: [String!]
    match: Int
    privateWomen: Boolean
    privateNonBinary: Boolean
    private: Boolean
  }

  ## Event/Route Aux Model
  type Route {
    _id: ID!
    points: [[Float]]!
    elevation: [Float]!
    grade: [Float]!
    terrain: [String]!
    distance: Float!
    maxElevation: Float
    minElevation: Float
    totalElevationGain: Float
    startCoordinates: [Float]!
    endCoordinates: [Float]!
  }

  ## INPUT MODELS
  input RegisterInput {
    username: String!
    email: String!
    password: String!
    confirmPassword: String!
    firstName: String!
    lastName: String!
    sex: String!
    birthday: String!
    weight: Int!
    experience: String!
    bikeTypes: [String]
    FTP: Float!
    isPrivate: Boolean
    metric: Boolean!
  }

  input LoginInput {
    username: String!
    password: String!
    remember: String!
  }

  input UpdateProfileImageInput {
    username: String!
    hasProfileImage: Boolean!
  }

  input AddGearInput {
    username: String!
    type: String!
    subtype: String
    make: String!
    model: String!
    weight: Int!
    distance: Float!
  }

  input CreateEventInput {
    # Event Input
    host: String!
    name: String!
    startTime: Date!
    description: String
    bikeType: [String!]
    difficulty: [Float!]
    wattsPerKilo: [Float!]
    intensity: String!
    privateWomen: Boolean
    privateNonBinary: Boolean
    private: Boolean

    # Route Input
    points: [[Float]]!
    elevation: [Float]!
    grade: [Float]!
    terrain: [String]!
    distance: Float!
    maxElevation: Float
    minElevation: Float
    totalElevationGain: Float
    startCoordinates: [Float]!
    endCoordinates: [Float]!
  }

  input SetRegionInput {
    username: String!
    locationName: String
    locationCoords: [Float]
    radius: Float
  }

  input GetEventsInput {
    page: Int
    pageSize: Int
    startDate: Date!
    endDate: Date
    bikeType: [String!]
    wkg: [Float!]
    location: String
    radius: Int
    match: [String]
    userSex: Boolean
    privacy: [String]
  }

  input EditProfileInput {
    username: String!
    email: String!
    firstName: String!
    lastName: String!
    sex: String!
    birthday: String!
    weight: Int!
    experience: String!
    bikeTypes: [String]
    FTP: Float!
    isPrivate: Boolean
    metric: Boolean!
    location: String!
    radius: Int!
  }

  input EditEventInput {
    # Event Input
    eventID: String!
    name: String!
    startTime: Date!
    description: String
    bikeType: [String!]
    difficulty: [Float!]
    wattsPerKilo: [Float!]
    intensity: String!

    # Route Input
    points: [[Float]]!
    elevation: [Float]!
    grade: [Float]!
    terrain: [String]!
    distance: Float!
    maxElevation: Float
    minElevation: Float
    totalElevationGain: Float
    startCoordinates: [Float]!
    endCoordinates: [Float]!
  }

  type Preview {
    event: Event
    route: Route
    isUser: Boolean
  }

  ## QUERY LIST
  type Query {
    # Users
    getUser(username: String!): User!
    getUserByID(userID: ID!): User!
    getUsers: [User]!
    validUsername(username: String!): Boolean!
    validEmail(email: String!): Boolean!
    requestStravaAuthorization: String!
    # Events
    getEvent(eventID: String!): Event!
    getAllEvents: [Event]!
    getEvents(getEventsInput: GetEventsInput!): [Event!]!
    getJoinedEvents: [Event!]
    getHostedEvents: [Event!]
    getInvitedEvents: [Event!]
    # Routes
    getRoute(routeID: String!): Route!
    # Friendships
    getFriendshipStatus(sender: String!, receiver: String!): Friendship
    getFriendRequests(username: String!): [Friendship]
    getFriends(username: String!): [String]
    getFriendships(username: String!): [Friendship]
    getFriendStatuses( currentUsername: String!, usernameList: [String]!): [FriendStatus]
    getInvitableFriends(username: String!, eventID: String!): [String]
    # Preview
    getPreview(jwtToken: String!): Preview!
  }

  type FriendStatus {
    otherUser: String!
    status: String!
    }

  ## MUTATION LIST
  type Mutation {
    # Users
    register(registerInput: RegisterInput!): User!
    login(loginInput: LoginInput!): User!
    updateProfileImage(updateProfileImageInput: UpdateProfileImageInput!): User!
    addGear(addGearInput: AddGearInput!): [Gear]!
    removeGear(username: String!, gearID: String!): [Gear]!
    setRegion(setRegionInput: SetRegionInput!): User!
    exchangeStravaAuthorizationCode(code: String!, scope: String!): User!
    editProfile(editProfileInput: EditProfileInput!): User!
    deleteUser: User!
    # Events
    createEvent(createEventInput: CreateEventInput!): Event!
    deleteEvent(eventID: String!): User!
    joinEvent(eventID: String!): Event!
    leaveEvent(eventID: String!): Event!
    editEvent(editEventInput: EditEventInput!): Event!
    requestPasswordReset(userNameOrEmail: String!): SuccessMessage!
    resetPassword(resetToken: String!, newPassword: String!): SuccessMessage!
    inviteToEvent(eventID: String!, invitees: [String]!): Event!
    # Friendships
    sendFriendRequest(sender: String!, receiver: String!): Friendship!
    acceptFriendRequest(sender: String!, receiver: String!): Friendship!
    declineFriendRequest(sender: String!, receiver: String!): Friendship!
    removeFriend(sender: String!, receiver: String!): Friendship!
    # Previews
    generatePreviewToken(eventID: String!): String!
  }
    
  type SuccessMessage {
    success: Boolean!
    message: String!
  }
`;
