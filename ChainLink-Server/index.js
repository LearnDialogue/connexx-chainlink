require("dotenv").config({ override: true });
console.log("=============== BOOTSTRAP ===============");
console.log("PWD:", process.cwd());
console.log("process.env.MONGODB:", JSON.stringify(process.env.MONGODB));
console.log("==========================================");

const { ApolloServer } = require("@apollo/server");
const { startStandaloneServer } = require("@apollo/server/standalone");
const mongoose = require("mongoose");
require("dotenv").config();

const typeDefs = require("./graphql/typeDefs.js");
const resolvers = require("./graphql/resolvers");
const { context } = require("./graphql/auth/authMiddleware.js");

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

async function startApolloServer() {
    const port = process.env.PORT || 5000;  
    const { url } = await startStandaloneServer((server), {
      listen: { port },
      context,
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
