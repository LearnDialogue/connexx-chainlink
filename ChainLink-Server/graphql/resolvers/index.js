const usersResolver = require("./users");
const eventsResolver = require("./events");
const dateScalar = require("./date")
const friendshipResolver = require("./friendship");
const clubResolver = require("./clubs");
const previewResolver = require("./preview");


module.exports = {
    Query: {
        ...usersResolver.Query,
        ...eventsResolver.Query,
        ...friendshipResolver.Query,
        ...clubResolver.Query,
        ...previewResolver.Query,
    },

    Mutation: {
        ...usersResolver.Mutation,
        ...eventsResolver.Mutation,
        ...friendshipResolver.Mutation,
        ...previewResolver.Mutations,
        ...clubResolver.Mutation,
    },

    Club: {
        ...clubResolver.Club
      },

    Date: {
        ...dateScalar.Date
    }
};