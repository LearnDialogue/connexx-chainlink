import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import mongoose from 'mongoose';
import 'dotenv/config';

import Event from '../../models/Event.js';

if (mongoose.models.Event) {
  delete mongoose.models.Event;
}

const MONGODB = process.env.MONGODB || 'mongodb://127.0.0.1:27017/chainlinkDB';

describe('Event Model Robust Edge Cases', () => {
  beforeEach(async () => {
    console.log(MONGODB);
    await mongoose.connect(MONGODB);
  });

  afterEach(async () => {
    await Event.deleteMany({ host: "hostuser" });
    await mongoose.connection.close();
  });

  // Test 1: Nominal successful creation
  it('should create and save an event successfully', async () => {
    const eventData = {
      name: 'Test Event',
      description: 'This is a test event',
      startTime: new Date().toISOString(),
      host: 'hostuser',
      bikeType: ['road'],
      difficulty: [5],
      wattsPerKilo: [3.5],
      intensity: 'Moderate',
      route: 'Test Route',
      isTest: true
    };

    const event = new Event(eventData);
    const savedEvent = await event.save();

    expect(savedEvent._id).toBeDefined();
    expect(savedEvent.name).toBe(eventData.name);
    expect(savedEvent.description).toBe(eventData.description);
    expect(savedEvent.startTime).toBe(eventData.startTime);
    expect(savedEvent.host).toBe(eventData.host);
    expect(savedEvent.bikeType).toEqual(eventData.bikeType);
    expect(savedEvent.difficulty).toEqual(eventData.difficulty);
    expect(savedEvent.wattsPerKilo).toEqual(eventData.wattsPerKilo);
    expect(savedEvent.intensity).toBe(eventData.intensity);
    expect(savedEvent.route).toBe(eventData.route);
    //expect(savedEvent.isTest).toBe(eventData.isTest);
  });

  // Test 2: Missing required field "host"
  it('should throw a validation error when host is missing', async () => {
    const eventData = {
      name: 'Test Event',
      description: 'This is a test event',
      startTime: new Date().toISOString(),
      bikeType: ['road'],
      difficulty: [5],
      wattsPerKilo: [3.5],
      intensity: 'Moderate',
      route: 'Test Route',
      isTest: true
    };

    const event = new Event(eventData);
    await expect(event.save()).rejects.toThrow();
  });

  // Test 3: Missing required field "name"
  it('should throw a validation error when name is missing', async () => {
    const eventData = {
      description: 'This is a test event',
      startTime: new Date().toISOString(),
      host: 'hostuser',
      bikeType: ['road'],
      difficulty: [5],
      wattsPerKilo: [3.5],
      intensity: 'Moderate',
      route: 'Test Route',
      isTest: true
    };

    const event = new Event(eventData);
    await expect(event.save()).rejects.toThrow();
  });

  // Test 4: Invalid type for "wattsPerKilo" (should be a number)
  it('should throw a validation error when wattsPerKilo is not a number', async () => {
    const eventData = {
      name: 'Test Event',
      description: 'This is a test event',
      startTime: new Date().toISOString(),
      host: 'hostuser',
      bikeType: ['road'],
      difficulty: [5],
      wattsPerKilo: "not-a-number",
      intensity: 'Moderate',
      route: 'Test Route',
      isTest: true
    };

    const event = new Event(eventData);
    await expect(event.save()).rejects.toThrow();
  });

  // Test 5: Provide an empty array for required "bikeType" field
  it('should create an event with an empty bikeType array', async () => {
    const eventData = {
      name: 'Test Event',
      description: 'This event has an empty bikeType array',
      startTime: new Date().toISOString(),
      host: 'hostuser',
      bikeType: [],
      difficulty: [5],
      wattsPerKilo: [3.5],
      intensity: 'Moderate',
      route: 'Test Route',
      isTest: true
    };

    const event = new Event(eventData);
    const savedEvent = await event.save();
    expect(savedEvent.bikeType).toEqual([]);
  });

  // Test 6: Omit optional fields and verify defaults remain intact
  it('should create an event without optional fields and apply defaults', async () => {
    const eventData = {
      name: 'Test Event',
      startTime: new Date().toISOString(),
      host: 'hostuser',
      bikeType: ['road'],
      difficulty: [5],
      wattsPerKilo: [3.5],
      intensity: 'Moderate',
      route: 'Test Route',
      isTest: true
    };

    const event = new Event(eventData);
    const savedEvent = await event.save();

    expect(savedEvent.locationName).toBeUndefined();
    expect(savedEvent.locationCoords).toEqual([]);
    expect(savedEvent.privateWomen).toBe(false);
    expect(savedEvent.privateNonBinary).toBe(false);
    expect(savedEvent.private).toBe(false);
  });
});