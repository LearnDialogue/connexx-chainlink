const GraphQLError = require('graphql').GraphQLError;
const Event = require('../../models/Event');
const Route = require('../../models/Route');
const { generateJWT, readUrlJwt } = require('../../util/jwtHandler');

module.exports = {
    Query: {
        async getPreview(_, __, context) {

            try {
                // Expected context.payload output
                // {
                //     eventID: '67e2ffe13e26e842e9156e9b',
                //     iat: 1743046244,
                //     exp: 1743651044
                // }
                const payload = context.payload;
                if (!payload.eventID)
                    throw new GraphQLError(`Payload does not contain eventID`);

                eventID = payload.eventID;
                const event = await Event.findById(eventID);
                if (!event) {
                    throw new GraphQLError(`Event with ID ${eventID} not found`);
                }

                if (!event.route) {
                    throw new GraphQLError(`Event with ID ${eventID} does not have a route associated with it.`);
                }

                const route = await Route.findById(event.route);
                if (!route) {
                    throw new GraphQLError(`Route with ID ${routeID} not found.`);
                }

                return {
                    event,
                    route,
                };
            } catch (error) {
                console.error('Error in getPreview:', error);
                throw new GraphQLError('Failed to retrieve preview data.');
            }
        }
    },

    Mutations: {
        generatePreviewToken: (_, { eventID }) => {
            try {
                const payload = { eventID };
                const token = generateJWT(payload, '7d');
                return token;    
            } catch (error) {
                console.error('Error generating token:', error);
                throw new Error('Failed to generate token.');
            }   
        },
    },
}
