import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import mongoose from 'mongoose';
if (mongoose.models.Route) {
  delete mongoose.models.Route;
}
import Route from '../../models/Route.js';

describe('Route Model Robust Edge Cases', () => {
  beforeEach(async () => {
    await mongoose.connect('mongodb://127.0.0.1:27017/chainlinkDB');
  });

  afterEach(async () => {
    await Route.deleteMany({ distance: 9999 });
    await mongoose.connection.close();
  });

  // Nominal successful creation
  it('should create and save a route successfully', async () => {
    const routeData = {
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
    };

    const route = new Route(routeData);
    const savedRoute = await route.save();

    expect(savedRoute._id).toBeDefined();
    expect(savedRoute.distance).toBe(routeData.distance);
    expect(savedRoute.startCoordinates).toEqual(routeData.startCoordinates);
  });

  // Edge Case: Missing required field "distance"
  it('should throw a validation error when distance is missing', async () => {
    const routeData = {
      points: [[0, 0], [1, 1]],
      elevation: [10, 20],
      grade: [1, 2],
      terrain: ['asphalt'],
      maxElevation: 100,
      minElevation: 0,
      totalElevationGain: 50,
      startCoordinates: [0, 0],
      endCoordinates: [1, 1],
    };

    const route = new Route(routeData);
    await expect(route.save()).rejects.toThrow();
  });

  // Edge Case: Omit startCoordinates, expect default to empty array
  it('should default startCoordinates to an empty array when missing', async () => {
    const routeData = {
      points: [[0, 0], [1, 1]],
      elevation: [10, 20],
      grade: [1, 2],
      terrain: ['asphalt'],
      distance: 9999,
      maxElevation: 100,
      minElevation: 0,
      totalElevationGain: 50,
      endCoordinates: [1, 1],
    };

    const route = new Route(routeData);
    const savedRoute = await route.save();
    expect(savedRoute.startCoordinates).toEqual([]);
  });

  // Edge Case: Omit optional fields and verify defaults for array fields and nulls
  it('should create a route without optional fields and apply defaults', async () => {
    const routeData = {
      points: [[0, 0], [1, 1]],
      distance: 9999,
      startCoordinates: [0, 0],
      endCoordinates: [1, 1],
    };

    const route = new Route(routeData);
    const savedRoute = await route.save();

    expect(savedRoute.elevation).toBeNull();
    expect(savedRoute.grade).toEqual([]);
    expect(savedRoute.terrain).toEqual([]);
    expect(savedRoute.maxElevation).toBeNull();
    expect(savedRoute.minElevation).toBeNull();
    expect(savedRoute.totalElevationGain).toBeNull();
  });

  // Edge Case: Provide invalid type for startCoordinates
  it('should throw a validation error when startCoordinates is not an array of numbers', async () => {
    const routeData = {
      points: [[0, 0], [1, 1]],
      elevation: [10, 20],
      grade: [1, 2],
      terrain: ['asphalt'],
      distance: 9999,
      maxElevation: 100,
      minElevation: 0,
      totalElevationGain: 50,
      startCoordinates: "not-an-array",
      endCoordinates: [1, 1],
    };

    const route = new Route(routeData);
    await expect(route.save()).rejects.toThrow();
  });
});