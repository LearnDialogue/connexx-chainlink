const { model, Schema } = require("mongoose");

const friendshipSchema = new Schema({
    sender: {
        type: String,
        required: true,
    },
    receiver: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        required: true,
    },
    createdAt: {
        type: String,
        required: true,
    },
});

module.exports = model('friendship', friendshipSchema);