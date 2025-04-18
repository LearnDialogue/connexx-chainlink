const usersResolver = require("./users");
const eventsResolver = require("./events");
const dateScalar = require("./date")
const friendshipResolver = require("./friendship");
const clubResolver = require("./clubs");


module.exports = {
    Query: {
        ...usersResolver.Query,
        ...eventsResolver.Query,
        ...friendshipResolver.Query,
        ...clubResolver.Query,
    },

    Mutation: {
        ...usersResolver.Mutation,
        ...eventsResolver.Mutation,
        ...friendshipResolver.Mutation,
        ...clubResolver.Mutation,
    },

    Club: {
        ...clubResolver.Club
      },

    Date: {
        ...dateScalar.Date
    }
};