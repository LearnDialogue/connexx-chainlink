const { beforeEach, afterEach, vi } = require('vitest');
const mongoose = require('mongoose');

// Mock Mongoose connection
beforeEach(async () => {
  await mongoose.connect('mongodb://127.0.0.1:27017/chainlinkDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

afterEach(async () => {
  await mongoose.connection.close();
});