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
    admins: [{
        type: Schema.Types.ObjectId,
        ref: 'User',
    }],
    members: [{
        type: Schema.Types.ObjectId,
        ref: 'User',
    }],
    requestedMembers: [{
        type: Schema.Types.ObjectId,
        ref: 'User',
    }],
    eventsHosted: [{
        type: Schema.Types.ObjectId,
        ref: 'Event',
    }],
});

module.exports = model('Club', clubSchema);