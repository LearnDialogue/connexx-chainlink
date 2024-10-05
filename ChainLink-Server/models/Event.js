const { model, Schema } = require("mongoose");

const eventSchema = new Schema({
    host: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    locationName: {
        type: String,
    },
    locationCoords: {
        type: [Number],
    },
    startTime: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    bikeType: {
        type: [String],
        required: true,
    },
    difficulty: {
        type: String,
        required: true,
    },
    wattsPerKilo: {
        type: Number,
        required: true,
    },
    intensity: {
        type: String,
        required: true,
    },
    route: {
        type: String,
        required: true,
    },
    participants: [String],
    privateWomen: {
        type: Boolean,
        default: false,
    },
    privateNonBinary: {
        type: Boolean,
        default: false,
    }
});

module.exports = model('Event', eventSchema);
