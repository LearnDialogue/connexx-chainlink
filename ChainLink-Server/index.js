const { ApolloServer } = require("@apollo/server");
const { startStandaloneServer } = require("@apollo/server/standalone");
const mongoose = require("mongoose");
require("dotenv").config();
const { readJWT } = require("./util/readJWT")

const typeDefs = require("./graphql/typeDefs.js");
const resolvers = require("./graphql/resolvers");

const server = new ApolloServer({
    typeDefs,
    resolvers
});

async function startApolloServer() {
    const port = process.env.PORT || 5000;  
    const { url } = await startStandaloneServer((server), {
        listen: { port },
        context: async ({ req, res }) => {
          const authHeader = req.headers.authorization || '';
          const user = readJWT(authHeader);
          return { user };
        },
    });
    console.log(`
      🚀  Server is running!
      📭  Query at ${url}
    `);
}

mongoose
  .connect(process.env.MONGODB, {})
  .then(() => {
    console.log("\nSUCCESS: CONNECTED TO DATABASE");
    startApolloServer();
  })
  .catch((err) => {
    console.error(err);
  });
