import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import mongoose from 'mongoose';
import 'dotenv/config';

if (mongoose.models.friendship) {
  delete mongoose.models.friendship;
}


import Friendship from '../../models/Friendship.js';

const MONGODB = process.env.MONGODB || 'mongodb://127.0.0.1:27017/chainlinkDB';


describe('Friendship Model Robust Edge Cases', () => {
  beforeEach(async () => {
    await mongoose.connect(MONGODB);
  });

  afterEach(async () => {
    await Friendship.deleteMany({ sender: "testsender", receiver: "testreceiver" });
    await mongoose.connection.close();
  });

  // Nominal successful creation
  it('should create and save a friendship successfully', async () => {
    const friendshipData = {
      sender: "testsender",
      receiver: "testreceiver",
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    const friendship = new Friendship(friendshipData);
    const savedFriendship = await friendship.save();

    expect(savedFriendship._id).toBeDefined();
    expect(savedFriendship.sender).toBe(friendshipData.sender);
    expect(savedFriendship.receiver).toBe(friendshipData.receiver);
    expect(savedFriendship.status).toBe(friendshipData.status);
  });

  // Edge Case: Missing required field "sender"
  it('should throw a validation error when sender is missing', async () => {
    const friendshipData = {
      receiver: "testreceiver",
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    const friendship = new Friendship(friendshipData);
    await expect(friendship.save()).rejects.toThrow();
  });

  // Edge Case: Missing required field "receiver"
  it('should throw a validation error when receiver is missing', async () => {
    const friendshipData = {
      sender: "testsender",
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    const friendship = new Friendship(friendshipData);
    await expect(friendship.save()).rejects.toThrow();
  });

  // Edge Case: Missing required field "status"
  it('should throw a validation error when status is missing', async () => {
    const friendshipData = {
      sender: "testsender",
      receiver: "testreceiver",
      createdAt: new Date().toISOString(),
    };

    const friendship = new Friendship(friendshipData);
    await expect(friendship.save()).rejects.toThrow();
  });

  // Edge Case: Missing required field "createdAt"
  it('should throw a validation error when createdAt is missing', async () => {
    const friendshipData = {
      sender: "testsender",
      receiver: "testreceiver",
      status: "pending",
    };

    const friendship = new Friendship(friendshipData);
    await expect(friendship.save()).rejects.toThrow();
  });
});