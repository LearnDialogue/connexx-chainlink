const express = require('express');
const {
  GraphQLUpload,
  graphqlUploadExpress, // A Koa implementation is also exported.
} = require('graphql-upload');

const cors = require('cors'); // Import the cors package
const { ApolloServer } = require("@apollo/server");
const { expressMiddleware } = require('@apollo/server/express4');

const mongoose = require("mongoose");
require("dotenv").config();
const { readJWT } = require("./util/readJWT");

const typeDefs = require("./graphql/typeDefs.js");
const resolvers = require("./graphql/resolvers");
const { GraphQLError } = require("graphql");

const app = express();
app.use(cors()); // Use the cors middleware
app.use(express.json());
app.use(graphqlUploadExpress()); // Add this line to use the graphql-upload middleware

const server = new ApolloServer({
    typeDefs,
    resolvers
});

const anonymousOperations = [
  "IntrospectionQuery", 
  "login",
  "register",
  "requestPasswordReset",
  "resetPassword",
  "validUsername",
  "validEmail"
];

async function startApolloServer() {
    const port = process.env.PORT || 5000;  
    await server.start(); // Start the Apollo server
    app.use('/graphql', expressMiddleware(server, {
        context: async ({ req, res }) => {
          const authHeader = req.headers.authorization || '';
          const operationName = req.body.operationName;
          
          if (anonymousOperations.includes(operationName)) {
            return {};
          }

          const user = readJWT(authHeader);
          if (!user) {
            throw new GraphQLError('You must be logged in to perform this action.', {
              extensions: {
                code: 'UNAUTHENTICATED',
                http: {
                  status: 401,
                }
              }
            });
          }

          return { user };
        },
    }));

    app.listen(port, () => {
      console.log(`
        🚀  Server is running!
        📭  Query at http://localhost:${port}/graphql
      `);
    });
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