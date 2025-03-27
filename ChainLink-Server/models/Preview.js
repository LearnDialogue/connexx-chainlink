const { model, Schema } = require("mongoose");
const { Event } = require("./Event.js");
const { Route } = require("./Route.js");

const previewSchema = new Schema({
    event: {
        type: Event,
        required: true
    },
    route: {
        type: Route,
        required: true
    }
})

module.exports = model('Preview', previewSchema);