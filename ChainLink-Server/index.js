const path = require('path');
const dotenv = require('dotenv');
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { graphqlUploadExpress } = require('graphql-upload');
console.log("=============== BOOTSTRAP ===============");
console.log("PWD:", process.cwd());
console.log("process.env.MONGODB:", JSON.stringify(process.env.MONGODB));
console.log("==========================================");

const typeDefs = require('./graphql/typeDefs');
const resolvers = require('./graphql/resolvers');
const { context } = require('./graphql/auth/authMiddleware');
const routes = require('./routes'); // ✅ automatically loads index.js inside routes

// Load environment variables
const envFile =
  process.env.NODE_ENV === 'production'
    ? '.env.production'
    : '.env.development';

dotenv.config({ path: path.resolve(process.cwd(), envFile) });

const app = express();

// Middleware
app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(bodyParser.json());

// Serve static files
app.use('/uploads', express.static('uploads'));

// ✅ REST API routes (before GraphQL middleware)
app.use('/api', routes);

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

async function startApolloServer() {
  const port = process.env.PORT || 5000;

  await server.start();

  app.use(
    '/graphql',
    graphqlUploadExpress({ maxFileSize: 10_000_000, maxFiles: 1 }), // ✅ Keep file upload middleware
    expressMiddleware(server, {
      context: async ({ req }) => context({ req }),
    })
  );

  app.listen(port, () => {
    console.log(`
      🚀 Server running!
      📭 Query at http://localhost:${port}/graphql
      📁 API at http://localhost:${port}/api
    `);
  });
}


mongoose
  .connect(process.env.MONGODB, {})
  .then(() => {
    console.log('\n✅ SUCCESS: Connected to MongoDB');
    startApolloServer();
  })
  .catch((err) => console.error(err));
