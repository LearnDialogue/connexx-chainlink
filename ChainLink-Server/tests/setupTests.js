import { beforeEach, afterEach, vi } from 'vitest';
import mongoose from 'mongoose';

const MONGODB = process.env.MONGODB || 'mongodb://127.0.0.1:27017/chainlinkDB';


// Mock Mongoose connection
beforeEach(async () => {
  await mongoose.connect(MONGODB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

afterEach(async () => {
  await mongoose.connection.close();
});