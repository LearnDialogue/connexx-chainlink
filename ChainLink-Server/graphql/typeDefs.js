const gql = require('graphql-tag');

// kthomas: added getClubMembers and leaveClub to fix backend issue

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

  type Club {
    id: ID!
    name: String!
    description: String
    locationName: String
    locationCoords: [Float]
    radius: Float
    metric: Boolean!
    createdAt: String!
    owners: [User!]!
    admins: [User]
    members: [User!]
    requestedMembers: [User!]
    eventsHosted: [Event]
    eventsJoined: [Event!]
    eventsInvited: [Event!]
    isPrivate: Boolean!
    clubUser: User!
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
    clubsOwned: [Club]      
    clubsJoined: [Club]
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
    locationName: String
    locationCoords: [Float]
    startTime: Date!
    description: String
    bikeType: [String!]
    wattsPerKilo: [Float!]
    rideAverageSpeed: [Float]
    intensity: String
    route: String
    participants: [String]
    invited: [String!]
    match: Int
    privateWomen: Boolean
    privateNonBinary: Boolean
    private: Boolean
    expectedMph: [Float!] 
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
    wattsPerKilo: [Float!]
    rideAverageSpeed: [Float]
    intensity: String
    privateWomen: Boolean
    privateNonBinary: Boolean
    private: Boolean

    # Route Input
    points: [[Float]]
    elevation: [Float]
    grade: [Float]
    terrain: [String]
    distance: Float
    maxElevation: Float
    minElevation: Float
    totalElevationGain: Float
    startCoordinates: [Float]
    endCoordinates: [Float]
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
    avgSpeed: [Float!]
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
    wattsPerKilo: [Float!]
    intensity: String!
    rideAverageSpeed: [Float!]
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

  input ClubInput {
    name: String!
    description: String
    locationName: String
    locationCoords: [Float]
    radius: Float
    metric: Boolean!
    createdAt: String!
    owners: [ID!]!
    admins: [ID!]
    members: [ID!]
    requestedMembers: [ID!]
    eventsHosted: [String]
    eventsJoined: [String]
    eventsInvited: [String]
    isPrivate: Boolean!
  } 

  type Preview {
    event: Event
    route: Route
    isUser: Boolean
  }

  ## QUERY LIST
  type Query {
    # Users
    getUser(username: String, email: String): User!
    getUserByID(userID: ID!): User!
    getUsers: [User]!
    validUsername(username: String!): Boolean!
    validEmail(email: String!): Boolean!
    requestStravaAuthorization: String!
    getPublicUsers: [User]!
    # Events
    getEvent(eventID: String!): Event!
    getAllEvents: [Event]!
    getEvents(getEventsInput: GetEventsInput!): [Event!]!
    getJoinedEvents(userId: ID): [Event!]
    getHostedEvents(userId: ID): [Event!]
    getInvitedEvents(userId: ID): [Event!]
    # Routes
    getRoute(routeID: String!): Route!
    # Friendships
    getFriendshipStatus(sender: String!, receiver: String!): Friendship
    getFriendRequests(username: String!): [Friendship]
    getFriends(username: String!): [String]
    getFriendships(username: String!): [Friendship]
    getFriendStatuses( currentUsername: String!, usernameList: [String]!): [FriendStatus]
    getInvitableFriends(username: String!, eventID: String!): [String]
    # Clubs
    getClubs: [Club]
    getClub(id: ID!): Club
    getClubField(id: ID!, field: String!): String
    getClubMembers(clubId: String!): [User!]!
    getClubMemberships(username: String!): [Club!]
    getPendingClubRequests(username: String!): [Club!]!
    # Preview
    getPreview(jwtToken: String!): Preview!
  }

  type FriendStatus {
    otherUser: String!
    status: String!
    sender: String!
    receiver: String!
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
    createEvent(createEventInput: CreateEventInput!, clubId: ID): Event!
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
    # Clubs
    createClub(clubInput: ClubInput!): Club
    updateClub(id: ID!, clubInput: ClubInput!): Club
    deleteClub(id: ID!): String
    joinClub(clubId: ID!, userId: ID!): Club!
    leaveClub(clubId: ID!, userId: ID!): Club
    addMember(clubId: ID!, userId: ID!): Club!
    removeMember(clubId: ID!, userId: ID!): Club!
    addAdmin(clubId: ID!, userId: ID!): Club!
    removeAdmin(clubId: ID!, userId: ID!): Club!
    addOwner(clubId: ID!, userId: ID!): Club!
    removeOwner(clubId: ID!, userId: ID!): Club!
    requestToJoin(clubId: ID!, userId: ID!): Club!
    declineToJoin(clubId: ID!, userId: ID!): Club!
    approveMember(clubId: ID!, userId: ID!): Club!
    rejectMember(clubId: ID!, userId: ID!): Club!
    # Previews
    generatePreviewToken(eventID: String!): String!
  }
    
  type SuccessMessage {
    success: Boolean!
    message: String!
  }
`;