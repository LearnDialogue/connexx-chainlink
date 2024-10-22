const gql = require('graphql-tag');

module.exports = gql`
  scalar Date

  ## MAIN MODELS
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
    difficulty: String!
    wattsPerKilo: Float!
    intensity: String!
    route: String!
    participants: [String]
    match: Int
    privateWomen: Boolean
    privateNonBinary: Boolean
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

  ## Friend Model
  type Friend {
    id: ID!
    sender: ID!
    recipient: ID!
    status: String!
    created_at: String!
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
    FTP: Float!
    metric: Boolean!
  }

  input LoginInput {
    username: String!
    password: String!
    remember: String!
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
    difficulty: String!
    wattsPerKilo: Float!
    intensity: String!
    privateWomen: Boolean
    privateNonBinary: Boolean

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
    wkg: [String!]
    location: String
    radius: Int
    match: [String]
    userSex: Boolean
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
    FTP: Float!
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
    difficulty: String!
    wattsPerKilo: Float!
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

  ## QUERY LIST
  type Query {
    # Users
    getUser(username: String!): User!
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
    # Routes
    getRoute(routeID: String!): Route!
    # Friends
    checkFriendStatus(senderId: ID!, recipientId: ID!): FriendStatusResponse
    getFriends(userId: ID!): [Friend]
    getFriendRequests(userId: ID!): [Friend]
  }

  ## MUTATION LIST
  type Mutation {
    # Users
    register(registerInput: RegisterInput!): User!
    login(loginInput: LoginInput!): User!
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
    sendFriendRequest(senderId: ID!, recipientId: ID!): FriendResponse!
    addFriend(senderId: ID!, recipientId: ID!): FriendResponse!
  }

  ## RESPONSE TYPES
  type SuccessMessage {
    success: Boolean!
    message: String!
  }

  type FriendResponse {
    success: Boolean!
    message: String!
    id: ID
    status: String
    created_at: String
  }

  type FriendStatusResponse {
    status: String
  }
`;
