const { model, Schema } = require("mongoose");

// Auxilary gear schema
const gearSchema = new Schema({
    type: {
        type: String,
        required: true,
    },
    subtype: {
        type: String,
        default: '',
    },
    make: {
        type: String,
        required: true,
    },
    model: {
        type: String,
        required: true,
    },
    weight: {
        type: Number,
        required: true,
    },
    distance: {
        type: Number,
        required: true,
    }
});

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
    sex: {
        type: String,
        required: true,
    },
    birthday: {
        type: String,
        required: true,
    },
    weight: {
        type: Number,
        required: true,
    },
    locationName: {
        type: String,
    },
    locationCoords: {
        type: [Number],
    },
    radius: {
        type: Number,
    },
    metric: {
        type: Boolean,
        required: true,
        default: true,
    },
    experience: {
        type: String,
        required: true,
        default: '',
    },
    FTP: {
        type: Number,
        required: true,
        default: 0,
    },
    FTPdate: {
        type: String,
        default: '',
    },
    stravaAPIToken: {
        type: String,
        default: '',
    },
    stravaRefreshToken: {
        type: String,
        default: '',
    },
    stravaTokenExpiration: {
        type: String,
        default: ''
    },
    createdAt: {
        type: String,
        required: true,
    },
    lastLogin: {
        type: String,
        required: true,
    },
    emailAuthenticated: {
        type: Boolean,
        default: false,
    },
    permission: {
        type: String,
        default: "member",
    },
    equipment: [gearSchema],
    eventsHosted: [String],
    eventsJoined: [String],
});

module.exports = model('User', userSchema);
