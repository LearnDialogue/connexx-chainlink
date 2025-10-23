import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import mongoose from 'mongoose';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { graphqlUploadExpress } from 'graphql-upload';

import typeDefs from './graphql/typeDefs.js';
import resolvers from './graphql/resolvers/index.js';
import { context } from './graphql/auth/authMiddleware.js';
import routes from './routes/index.js'; // ✅ Import routes

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envFile = process.env.NODE_ENV === 'production'
  ? '.env.production'
  : '.env.development';

dotenv.config({ path: path.resolve(process.cwd(), envFile) });

const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(bodyParser.json());

// Serve static files
app.use('/uploads', express.static('uploads'));

// ✅ REST API routes (before GraphQL middleware)
app.use('/api', routes);

const server = new ApolloServer({ typeDefs, resolvers });

async function startApolloServer() {
  const port = process.env.PORT || 5000;

  await server.start();

  app.use(
    '/graphql',
    graphqlUploadExpress({ maxFileSize: 10_000_000, maxFiles: 1 }), // ✅ Keep it here
    expressMiddleware(server, {
      context: async ({ req }) => context({ req }),
    })
  );

  app.listen(port, () => {
    console.log(`
      🚀  Server running!
      📭  Query at http://localhost:${port}/graphql
      📁  API at http://localhost:${port}/api
    `);
  });
}


mongoose
  .connect(process.env.MONGODB, {})
  .then(() => {
    console.log('\nSUCCESS: Connected to MongoDB');
    startApolloServer();
  })
  .catch((err) => console.error(err));