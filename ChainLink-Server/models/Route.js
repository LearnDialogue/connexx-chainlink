const { model, Schema } = require('mongoose');

const routeSchema = new Schema({
  points: {
    type: [[Number]],
    default: [],
    required: true,
  },
  elevation: {
    type: [Number],
    default: [],
    required: false,
    default: null,
  },
  grade: {
    type: [Number],
    default: [],
  },
  terrain: {
    type: [String],
    default: [],
  },
  distance: {
    type: Number,
    required: true,
  },
  maxElevation: {
    type: Number,
    required: false,
    default: null,
  },
  minElevation: {
    type: Number,
    required: false,
    default: null,
  },
  totalElevationGain: {
    type: Number,
    required: false,
    default: null,
  },
  startCoordinates: {
    type: [Number],
    required: true,
  },
  endCoordinates: {
    type: [Number],
    required: true,
  },
});

module.exports = model('Route', routeSchema);
