const GraphQLError = require('graphql').GraphQLError;
const User = require("../../models/User.js");
const Event = require("../../models/Event.js");
const Route = require("../../models/Route.js");
const { fetchLocation } = require('../../util/geocoder.js');
const { generateEventMatches } = require('../../util/matchmaking/match-gen.js');


module.exports = {

    Query: {
        async getEvent(_, { eventID }) {
            const event = await Event.findOne({ _id: eventID });
            return event;
        },

        async getAllEvents() {
            const events = await Event.find();
            return events;
        },

        async getEvents(_, {
            getEventsInput: {
                page,
                pageSize,
                startDate,
                endDate,
                bikeType,
                wkg,
                location,
                radius,
                match,
            },
        }, contextValue) {

            const user = await User.findOne({ username: contextValue.user.username }).select('sex locationCoords radius');

            //check if location and/or radius is null
            let locationCoords = null;
            if(!location | !radius) {
                geoParam = await User.findOne({ username: contextValue.user.username }).select('locationCoords radius');
                if (!location)
                    locationCoords = geoParam.locationCoords;
                if (!radius)
                    radius = geoParam.radius;
            }
            //if location string provided, find corresponding coords
            else if (location){
                const fetchResult = await fetchLocation(location, null);
                locationCoords = [parseFloat(fetchResult.lon), parseFloat(fetchResult.lat)];
            }
            if (locationCoords.length === 0) {
                throw new GraphQLError('Location not provided nor found in user document.', {
                    extensions: {
                        code: 'BAD_USER_INPUT'
                    }
                });
            }

            page = page || 0;
            pageSize = pageSize || 50;
            bikeType = bikeType || [];
            wkg = wkg || [];

            // filter gender restrictions
            const userGender = user.sex;
            let genderFilter = {};

            if (userGender === 'gender-man' || userGender === 'gender-prefer-not-to-say') {
                genderFilter = {
                    $and: [
                        { privateNonBinary: false },
                        { privateWomen: false }
                    ]
                };
            } else if (userGender === 'gender-woman') {
                genderFilter = {
                    $or: [
                        { privateWomen: true },
                        { $and: [{privateWomen: false}, { privateNonBinary: false }] }
                    ]
                };
            } else if (userGender === 'gender-non-binary') {
                genderFilter = {
                    $or: [
                        { privateNonBinary: true },
                        { $and: [{ privateNonBinary: false }, { privateWomen: false } ] },
                    ]
                };
            }

            const events = await Event.aggregate([
                {
                    $match: {
                        ...genderFilter, // apply gender filter
                        locationCoords: {
                            $geoWithin: {
                                $centerSphere: [locationCoords, radius / 6378.1],
                            },
                        },
                        startTime: endDate
                            ? { $gte: startDate, $lte: endDate }
                            : { $gte: startDate },
                        bikeType: bikeType.length ? { $in: bikeType } : { $nin: [] },
                        difficulty: wkg.length ? { $in: wkg } : { $nin: [] },
                    },
                },
                {
                    $facet: {
                        metadata: [{ $count: 'totalCount' }],
                        data: [{ $skip: page * pageSize }, { $limit: pageSize }],
                    },
                },
            ]);

            return generateEventMatches(contextValue.user.id, events[0].data);
        },

        async getJoinedEvents(_, {}, contextValue) {
            const eventIDList = await User.findOne({ username: contextValue.user.username }).select('eventsJoined');

            var eventList = [];
            for (const eventJoined of Object.values(eventIDList.eventsJoined)) {
                const eventInfo = await Event.findOne({ _id: eventJoined });
                if (eventInfo) eventList.push(eventInfo);
            }
            return eventList;
        },

        async getHostedEvents(_, {}, contextValue) {

            const eventIDList = await User.findOne({ username: contextValue.user.username }).select('eventsHosted');

            var eventList = [];
            for (const eventHosted of Object.values(eventIDList.eventsHosted)) {
                const eventInfo = await Event.findOne({ _id: eventHosted });
                if (eventInfo) eventList.push(eventInfo);
            }
            return eventList;
        },

        async getRoute(_, { routeID }) {
            const route = await Route.findOne({ _id: routeID });
            return route;
        }
    },

    Mutation: {
        async createEvent(_, {
            createEventInput: {
                host,
                name,
                startTime,
                description,
                bikeType,
                difficulty,
                wattsPerKilo,
                intensity,
                points,
                elevation,
                grade,
                terrain,
                distance,
                maxElevation,
                minElevation,
                totalElevationGain,
                startCoordinates,
                endCoordinates,
                privateWomen,
                privateNonBinary
            },
        }) {
            host = host.toLowerCase();

            const newRoute = new Route({
                points: points,
                elevation: elevation,
                grade: grade,
                terrain: terrain,
                distance: distance,
                maxElevation: maxElevation,
                minElevation: minElevation,
                totalElevationGain: totalElevationGain,
                startCoordinates: startCoordinates,
                endCoordinates: endCoordinates,
            });
            const resRoute = await newRoute.save();

            const locFetched = await fetchLocation(null, startCoordinates);
            const locCoords = [startCoordinates[1],startCoordinates[0]];

            const newEvent = new Event({
                host: host,
                name: name,
                locationName: locFetched.display_name,
                locationCoords: locCoords,
                startTime: startTime,
                description: description,
                bikeType: bikeType,
                difficulty: difficulty,
                wattsPerKilo: wattsPerKilo,
                intensity: intensity,
                route: resRoute.id,
                privateWomen: privateWomen,
                privateNonBinary: privateNonBinary
            });
            const resEvent = await newEvent.save();

            await User.findOneAndUpdate(
                { username: host },
                { $push: { eventsHosted: resEvent.id } },
            );
            return resEvent;
        },

        async deleteEvent(_, {
            eventID
        }, contextValue) {
            const event = await Event.findOne({ _id: eventID });
            const participants = event.participants;
            for (const participant of participants) {
                await User.findOneAndUpdate(
                    { username: participant },
                    { $pull: { eventsJoined: eventID }},
                )
            }

            const resEvent = await User.findOneAndUpdate(
                { username: contextValue.user.username },
                { $pull: { eventsHosted: eventID }},
                { returnDocument: 'after'},
            );
            const delEvent = await Event.findOneAndDelete({ _id: eventID });
            await Route.deleteOne({ _id: delEvent.route });
            return resEvent;
        },

        async joinEvent(_, { eventID }, contextValue) {
            const username = contextValue.user.username;
            const resEvent = await Event.findOneAndUpdate(
                { _id: eventID },
                { $push: { participants: username }},
                { returnDocument: 'after' },
            );
            await User.findOneAndUpdate(
                { username },
                { $push: { eventsJoined: eventID }},
            );
            return resEvent;
        },

        async leaveEvent(_, { eventID }, contextValue) {
            const username = contextValue.user.username;
            const resEvent = await Event.findOneAndUpdate(
                { _id: eventID },
                { $pull: { participants: username }},
                { returnDocument: 'after' },
            );
            await User.findOneAndUpdate(
                { username },
                { $pull: { eventsJoined: eventID }},
            );
            return resEvent;
        },

        async editEvent(_, {
            editEventInput: {
                eventID,
                name,
                startTime,
                description,
                bikeType,
                difficulty,
                wattsPerKilo,
                intensity,
                points,
                elevation,
                grade,
                terrain,
                distance,
                maxElevation,
                minElevation,
                totalElevationGain,
                startCoordinates,
                endCoordinates,
            }
        }, contextValue) {
            const event = await Event.findOne({ _id: eventID });
            if (!event) handleGeneralError({}, "Event not found.");

            if (event.host !== contextValue.user.username) {
                handleGeneralError({}, "User unauthorized to edit this event.");
            }

            const route = await Route.findOne({ _id: event.route });
            if (!route) handleGeneralError({}, "Event not found.");

            const updatedRoute = await Route.findOneAndUpdate(
                { _id: event.route },
                {
                    points,
                    elevation,
                    grade,
                    terrain,
                    distance,
                    maxElevation,
                    minElevation,
                    totalElevationGain,
                    startCoordinates,
                    endCoordinates,
                },
                { returnDocument: 'after'}
            );
            if (!updatedRoute) handleGeneralError({}, "Route not saved.");

            const locFetched = await fetchLocation(null, startCoordinates);
            const locCoords = [startCoordinates[1],startCoordinates[0]];

            const updatedEvent = await Event.findOneAndUpdate(
                { _id: eventID },
                {
                    name,
                    startTime,
                    description,
                    bikeType,
                    difficulty,
                    wattsPerKilo,
                    intensity,
                    locationName: locFetched.display_name,
                    locationCoords: locCoords,
                },
                { returnDocument: 'after'}
            );
            
            return updatedEvent;
        },
        async inviteToEvent(_, { eventID, invitees }) {
            const event = await Event.findOne({ _id: eventID });
            if (!event) handleGeneralError({}, "Event not found.");

            // Check if all invitees exist
            const inviteeUsers = await User.find({ username: { $in: invitees } });
            if (inviteeUsers.length !== invitees.length) {
                handleGeneralError({}, "One or more invitees not found.");
            }

            // Update the event with all invitees
            const resEvent = await Event.findOneAndUpdate(
                { _id: eventID },
                { $push: { invited: { $each: invitees } } },
                { returnDocument: 'after' }
            );

            return resEvent;
        },
    },
};
