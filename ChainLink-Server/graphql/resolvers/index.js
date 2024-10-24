const usersResolver = require("./users");
const eventsResolver = require("./events");
const dateScalar = require("./date");
const friends = require('./friends');

module.exports = {
    Query: {
        ...usersResolver.Query,
        ...eventsResolver.Query,
        ...friends.Query,  // Include the queries from friends.js (checkFriendStatus)
    },

    Mutation: {
        ...usersResolver.Mutation,
        ...eventsResolver.Mutation,
        ...friends.Mutation, // Include the mutations from friends.js (addFriend)
    },

    Date: {
        ...dateScalar.Date
    }
};
