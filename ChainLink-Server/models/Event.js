const { model, Schema } = require("mongoose");

const replySchema = new Schema({
  userName: { type: String, required: true },
  imageURL: { type: String },
  comment: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },

  likes: [{ type: String }],     // list of usernames
  dislikes: [{ type: String }],  // list of usernames

  replies: [this] // recursive subdocument
});

const commentSchema = new Schema({
  userName: { type: String, required: true },
  imageURL: { type: String },
  comment: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },

  likes: [{ type: String }],
  dislikes: [{ type: String }],

  replies: [replySchema],
});


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
        // required: true,
        default: [],
    },
    wattsPerKilo: {
        type: [Number],
        // required: true,
        default: [0.5, 7],
    },
    rideAverageSpeed: {
        type: [Number],
        // required: false,
        default: [0, 40],
    },
    intensity: {
        type: String,
        // required: true,
        default: 'n/a',
    },
    route: {
        type: String,
        // required: true,
        default: null,
    },
    participants: [String],
    invited: [String],
    privateWomen: {
        type: Boolean,
        default: false,
    },
    privateNonBinary: {
        type: Boolean,
        default: false,
    },
    private: {
        type: Boolean,
        default: false,
    },
    comments: [commentSchema],
});

module.exports = model('Event', eventSchema);