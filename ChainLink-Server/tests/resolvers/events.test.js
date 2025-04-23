import mongoose from 'mongoose';
if (mongoose.models.Event) {
  delete mongoose.models.Event;
}
if (mongoose.models.User) {
  delete mongoose.models.User;
}
if (mongoose.models.Route) {
  delete mongoose.models.Route;
}

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const eventsResolvers = require('../../graphql/resolvers/events.js');
const { Query, Mutation } = eventsResolvers;
import Event from '../../models/Event.js';
import User from '../../models/User.js';
import Route from '../../models/Route.js';

vi.mock('../../util/geocoder.js', () => ({
  fetchLocation: async (location, coords) => ({
    display_name: 'Test Location',
    lon: 0,
    lat: 0
  })
}));

describe('Event Resolvers Robust Edge Cases', () => {
  beforeEach(async () => {
    await mongoose.connect('mongodb://127.0.0.1:27017/chainlinkDB');
  });

  afterEach(async () => {
    await Event.deleteMany({ host: 'hostuser' } );
    await User.deleteMany({ email: 'hostuser@example.com' });
    await Route.deleteMany({ distance: '9999' })
    await mongoose.connection.close();
  });

  // Nominal creation test
  it('should create a new event successfully', async () => {
    const hostUserData = {
      username: 'hostuser',
      email: 'hostuser@example.com',
      password: 'password123',
      firstName: 'Host',
      lastName: 'User',
      sex: 'gender-man',
      birthday: '2000-01-01',
      weight: 70,
      metric: true,
      experience: 'Intermediate',
      FTP: 200,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
    };
    const user = new User(hostUserData);
    await user.save();

    const args = {
      createEventInput: {
        host: 'hostuser',
        name: 'Event Name',
        startTime: new Date().toISOString(),
        description: 'Event Description',
        bikeType: ['road'],
        difficulty: 'Medium',
        wattsPerKilo: 3.5,
        intensity: 'Moderate',
        points: [[0, 0], [1, 1]],
        elevation: [10, 20],
        grade: [1, 2],
        terrain: ['asphalt'],
        distance: 9999,
        maxElevation: 100,
        minElevation: 0,
        totalElevationGain: 50,
        startCoordinates: [0, 0],
        endCoordinates: [1, 1],
        privateWomen: false,
        privateNonBinary: false,
        private: false,
      },
    };

    const result = await Mutation.createEvent(null, args);
    expect(result.name).toBe(args.createEventInput.name);
  });

  // Edge Case: Omit bikeType entirely – expect event created with empty array
  it('should create an event with an empty bikeType array if not provided', async () => {
    const hostUserData = {
      username: 'hostuser',
      email: 'hostuser@example.com',
      password: 'password123',
      firstName: 'Host',
      lastName: 'User',
      sex: 'gender-man',
      birthday: '2000-01-01',
      weight: 70,
      metric: true,
      experience: 'Intermediate',
      FTP: 200,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
    };
    const user = new User(hostUserData);
    await user.save();

    const args = {
      createEventInput: {
        host: 'hostuser',
        name: 'Event Without BikeType',
        startTime: new Date().toISOString(),
        description: 'Missing bikeType field',
        difficulty: 'Medium',
        wattsPerKilo: 3.5,
        intensity: 'Moderate',
        points: [[0, 0], [1, 1]],
        elevation: [10, 20],
        grade: [1, 2],
        terrain: ['asphalt'],
        distance: 9999,
        maxElevation: 100,
        minElevation: 0,
        totalElevationGain: 50,
        startCoordinates: [0, 0],
        endCoordinates: [1, 1],
        privateWomen: false,
        privateNonBinary: false,
        private: false,
      },
    };

    const result = await Mutation.createEvent(null, args);
    expect(result.bikeType).toEqual([]);
  });

  // Edge Case: Missing required field "startTime"
  it('should throw an error when startTime is missing', async () => {
    const hostUserData = {
      username: 'hostuser',
      email: 'hostuser@example.com',
      password: 'password123',
      firstName: 'Host',
      lastName: 'User',
      sex: 'gender-man',
      birthday: '2000-01-01',
      weight: 70,
      metric: true,
      experience: 'Intermediate',
      FTP: 200,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
    };
    const user = new User(hostUserData);
    await user.save();

    const args = {
      createEventInput: {
        host: 'hostuser',
        name: 'Event Without StartTime',
        description: 'Missing startTime field',
        bikeType: ['road'],
        difficulty: 'Medium',
        wattsPerKilo: 3.5,
        intensity: 'Moderate',
        points: [[0, 0], [1, 1]],
        elevation: [10, 20],
        grade: [1, 2],
        terrain: ['asphalt'],
        distance: 9999,
        maxElevation: 100,
        minElevation: 0,
        totalElevationGain: 50,
        startCoordinates: [0, 0],
        endCoordinates: [1, 1],
        privateWomen: false,
        privateNonBinary: false,
        private: false,
      },
    };

    await expect(Mutation.createEvent(null, args)).rejects.toThrow();
  });

  // Edge Case: Get event by non-existent ID (expect null)
  it('should return null when getEvent is called with a non-existent ID', async () => {
    const nonExistentId = new mongoose.Types.ObjectId();
    const result = await Query.getEvent(null, { eventID: nonExistentId });
    expect(result).toBeNull();
  });
});