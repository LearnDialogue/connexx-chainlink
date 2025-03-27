const { ApolloServer } = require("@apollo/server");
const { startStandaloneServer } = require("@apollo/server/standalone");
const mongoose = require("mongoose");
require("dotenv").config();
const { readBearerJWT, readUrlJwt } = require("./util/jwtHandler.js")

const typeDefs = require("./graphql/typeDefs.js");
const resolvers = require("./graphql/resolvers");
const { GraphQLError } = require("graphql");

// TODO:
// 1. Have the client send a generatePreviewToken request to server and return it back to client
// 2. Have the client send a jwt to verify it

const server = new ApolloServer({
    typeDefs,
    resolvers
});

const anonymousOperations = [
  // we disable expolorer in prod, but we still need to whitelist
  // the introspection query to use the dashboard on dev/local.
  // dev/local will still require a valid JWT to perform any actions.
  "IntrospectionQuery", 
  "login",
  "register",
  "requestPasswordReset",
  "resetPassword",
  "validUsername",
  "validEmail",
];

const protectedOperations = [
  "GetPreview",
]

async function startApolloServer() {
    const port = process.env.PORT || 5000;  
    const { url } = await startStandaloneServer((server), {
        listen: { port },
        context: async ({ req, res }) => {
          const authHeader = req.headers.authorization || '';
          const operationName = req.body.operationName;
          
          if (anonymousOperations.includes(operationName)) {
            return {};
          }

          if (protectedOperations.includes(operationName)) {
            try {
              // Front end will send url based jwt encoded token
              const token = req.body.variables?.jwtToken;
              if (!token)
                throw new GraphQLError('Request body does not contain necessary token variable');
              
              const payload = readUrlJwt(token);
              return { payload };
            } catch (error) {
              throw new GraphQLError('You must be have a valid invitation url to perform this action.', {
              extensions: {
                code: 'UNAUTHENTICATED',
                http: {
                  status: 401,
                }
              }
            });
            }
          }

          const user = readBearerJWT(authHeader);
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
