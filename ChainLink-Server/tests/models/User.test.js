import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import mongoose from 'mongoose';
import 'dotenv/config';
if (mongoose.models.User) {
  delete mongoose.models.User;
}
import User from '../../models/User.js';

const MONGODB = process.env.MONGODB || 'mongodb://127.0.0.1:27017/chainlinkDB';


describe('User Model Robust Edge Cases', () => {
  beforeEach(async () => {
    await mongoose.connect(MONGODB);
    await User.init();
    await User.deleteMany({ email: /@example\.com$/ });
  });

  afterEach(async () => {
    await User.deleteMany({ email: /@example\.com$/ });
    await mongoose.connection.close();
  });

  // Test 1: Nominal successful creation
  it('should create and save a user successfully', async () => {
    const userData = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'Password123!',
      firstName: 'Test',
      lastName: 'User',
      sex: 'gender-man',
      birthday: '2000-01-01',
      weight: 70,
      metric: true,
      experience: 'Beginner',
      FTP: 200,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
    };

    const user = new User(userData);
    const savedUser = await user.save();

    expect(savedUser._id).toBeDefined();
    expect(savedUser.username).toBe(userData.username);
    expect(savedUser.email).toBe(userData.email);
  });

  // Test 2: Missing required field "username"
  it('should throw a validation error when username is missing', async () => {
    const userData = {
      email: 'missinguser@example.com',
      password: 'Password123!',
      firstName: 'Test',
      lastName: 'User',
      sex: 'gender-man',
      birthday: '2000-01-01',
      weight: 70,
      metric: true,
      experience: 'Beginner',
      FTP: 200,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
    };

    const user = new User(userData);
    await expect(user.save()).rejects.toThrow();
  });

  // Test 3: Missing required field "email"
  it('should throw a validation error when email is missing', async () => {
    const userData = {
      username: 'testuser2',
      password: 'Password123!',
      firstName: 'Test',
      lastName: 'User',
      sex: 'gender-man',
      birthday: '2000-01-01',
      weight: 70,
      metric: true,
      experience: 'Beginner',
      FTP: 200,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
    };

    const user = new User(userData);
    await expect(user.save()).rejects.toThrow();
  });

  // Test 4: Invalid type for "weight" (should be a number)
  it('should throw a validation error when weight is not a number', async () => {
    const userData = {
      username: 'testuser3',
      email: 'invalidweight@example.com',
      password: 'Password123!',
      firstName: 'Test',
      lastName: 'User',
      sex: 'gender-man',
      birthday: '2000-01-01',
      weight: "seventy",
      metric: true,
      experience: 'Beginner',
      FTP: 200,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
    };

    const user = new User(userData);
    await expect(user.save()).rejects.toThrow();
  });

  // Test 5: Omit optional fields and verify defaults remain intact
  it('should create a user without optional fields and apply defaults', async () => {
    const userData = {
      username: 'testuser4',
      email: 'default@example.com',
      password: 'Password123!',
      firstName: 'Test',
      lastName: 'User',
      sex: 'gender-man',
      birthday: '2000-01-01',
      weight: 70,
      metric: true,
      experience: 'Beginner',
      FTP: 200,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
    };

    const user = new User(userData);
    const savedUser = await user.save();

    expect(savedUser.locationName).toBeUndefined();
    expect(savedUser.locationCoords).toEqual([]);
    expect(savedUser.radius).toBeUndefined();
    expect(savedUser.FTPdate).toBe('');
    expect(savedUser.loginAttempts).toBe(0);
    expect(savedUser.loginLockout).toBeUndefined();
    expect(savedUser.emailAuthenticated).toBe(false);
    expect(savedUser.permission).toBe('member');
    expect(savedUser.hasProfileImage).toBe(false);
    expect(savedUser.equipment).toEqual([]);
    expect(savedUser.eventsHosted).toEqual([]);
    expect(savedUser.eventsJoined).toEqual([]);
  });

  // Test 6: Duplicate email should throw an error due to unique constraint
  it('should throw an error when attempting to create a user with duplicate email', async () => {
    const userData = {
      username: 'uniqueuser',
      email: 'duplicate@example.com',
      password: 'Password123!',
      firstName: 'Test',
      lastName: 'User',
      sex: 'gender-man',
      birthday: '2000-01-01',
      weight: 70,
      metric: true,
      experience: 'Beginner',
      FTP: 200,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
    };

    const user1 = new User(userData);
    await user1.save();

    const user2 = new User(userData);
    await expect(user2.save()).rejects.toThrow();
  });
});