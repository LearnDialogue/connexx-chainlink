import mongoose from 'mongoose';
import 'dotenv/config';

if (mongoose.models.User) {
  delete mongoose.models.User;
}

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const usersResolvers = require('../../graphql/resolvers/users.js');
const { Query, Mutation } = usersResolvers;
import User from '../../models/User.js';

const MONGODB = process.env.MONGODB || 'mongodb://127.0.0.1:27017/chainlinkDB';

describe('User Resolvers Robust Edge Cases', () => {
  beforeEach(async () => {
    process.env.SECRET = 'testsecret';
    await mongoose.connect(MONGODB);
  });

  afterEach(async () => {
    await User.deleteMany({ email: /@example\.com$/ });
    await mongoose.connection.close();
  });

  // Nominal test for getUser
  it('should get user by username', async () => {
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
    await user.save();

    const result = await Query.getUser(null, { username: 'testuser' });
    expect(result.username).toBe('testuser');
  });

  // Edge Case: getUser for non-existent username should throw an error
  it('should throw an error when getUser is called with a non-existent username', async () => {
    await expect(Query.getUser(null, { username: 'nonexistent' })).rejects.toThrow();
  });

  // Nominal test for register
  it('should register a new user successfully', async () => {
    const args = {
      registerInput: {
        username: 'newuser',
        email: 'new@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        firstName: 'New',
        lastName: 'User',
        sex: 'gender-man',
        birthday: '2000-01-01',
        weight: 70,
        experience: 'Beginner',
        FTP: 200,
        metric: true,
        isPrivate: false,
        bikeTypes: ['road'],
      },
    };

    const result = await Mutation.register(null, args);
    expect(result.username).toBe(args.registerInput.username);
  });

  // Edge Case: Register with invalid email format
  it('should throw a validation error when registering with invalid email', async () => {
    const args = {
      registerInput: {
        username: 'invalidemail',
        email: 'invalid-email',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        firstName: 'Invalid',
        lastName: 'Email',
        sex: 'gender-man',
        birthday: '2000-01-01',
        weight: 70,
        experience: 'Beginner',
        FTP: 200,
        metric: true,
        isPrivate: false,
        bikeTypes: ['road'],
      },
    };

    await expect(Mutation.register(null, args)).rejects.toThrow();
  });

  // Edge Case: Register with mismatched passwords
  it('should throw a validation error when passwords do not match during registration', async () => {
    const args = {
      registerInput: {
        username: 'mismatchuser',
        email: 'mismatch@example.com',
        password: 'Password123!',
        confirmPassword: 'DifferentPassword!',
        firstName: 'Mismatch',
        lastName: 'User',
        sex: 'gender-man',
        birthday: '2000-01-01',
        weight: 70,
        experience: 'Beginner',
        FTP: 200,
        metric: true,
        isPrivate: false,
        bikeTypes: ['road'],
      },
    };

    await expect(Mutation.register(null, args)).rejects.toThrow();
  });

  // Edge Case: Duplicate email registration should throw error
  it('should throw an error when attempting to register a user with duplicate email', async () => {
    const args = {
      registerInput: {
        username: 'uniqueuser',
        email: 'duplicate@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        firstName: 'Unique',
        lastName: 'User',
        sex: 'gender-man',
        birthday: '2000-01-01',
        weight: 70,
        experience: 'Beginner',
        FTP: 200,
        metric: true,
        isPrivate: false,
        bikeTypes: ['road'],
      },
    };

    await Mutation.register(null, args);
    await expect(Mutation.register(null, args)).rejects.toThrow();
  });
});