const { model, Schema } = require("mongoose");

const clubSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    description: {
        type: String,
        default: '',
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
    createdAt: {
        type: String,
        required: true,
    },
    owners: [{
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    }],
    members: [{
        type: Schema.Types.ObjectId,
        ref: 'User',
    }],
    eventsHosted: [String],
    eventsJoined: [String],
});

module.exports = model('Club', clubSchema);