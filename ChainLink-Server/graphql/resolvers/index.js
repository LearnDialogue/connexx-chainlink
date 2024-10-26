const usersResolver = require("./users");
const eventsResolver = require("./events");
const dateScalar = require("./date")
const friendshipResolver = require("./friendship");


module.exports = {
    Query: {
        ...usersResolver.Query,
        ...eventsResolver.Query,
        ...friendshipResolver.Query,
    },

    Mutation: {
        ...usersResolver.Mutation,
        ...eventsResolver.Mutation,
        ...friendshipResolver.Mutation,
    },

    Date: {
        ...dateScalar.Date
    }
};