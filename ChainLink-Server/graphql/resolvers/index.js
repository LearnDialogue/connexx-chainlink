const usersResolver = require("./users");
const eventsResolver = require("./events");
const dateScalar = require("./date")
module.exports = {
    Query: {
        ...usersResolver.Query,
        ...eventsResolver.Query,
    },

    Mutation: {
        ...usersResolver.Mutation,
        ...eventsResolver.Mutation,
    },

    Date: {
        ...dateScalar.Date
    }
};