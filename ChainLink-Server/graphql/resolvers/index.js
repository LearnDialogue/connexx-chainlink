const usersResolver = require("./users");
const eventsResolver = require("./events");
const dateScalar = require("./date");
const friends = require('./friends');

module.exports = {
    Query: {
        ...usersResolver.Query,
        ...eventsResolver.Query,
    },

    Mutation: {
        ...usersResolver.Mutation,
        ...eventsResolver.Mutation,
        ...friends.Mutation,
    },

    Date: {
        ...dateScalar.Date
    }
};