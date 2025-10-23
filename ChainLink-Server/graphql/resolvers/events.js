const GraphQLError = require('graphql').GraphQLError;
const User = require("../../models/User.js");
const Event = require("../../models/Event.js");
const Club = require("../../models/Club.js");
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
                avgSpeed,
                location,
                radius,
                match,
                privacy,
            },
        }, contextValue) {

            const user = await User.findOne({ username: contextValue.user.username }).select('sex locationCoords radius');

            //check if location and/or radius is null
            let locationCoords = null;
            if(!location || !radius) {
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
            if (!locationCoords || locationCoords.length === 0) {
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
            privacy = privacy || [];

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

            // Filter Privacy Considerations
            const privacyFilters = {
                $and: [
                    { ...genderFilter }, // apply gender filter
                    { $or: [
                        { $or: [ { private: false }, { private: null } ] }, // Public Ride
                        { host: contextValue.user.username }, // Hosting The Ride
                        { participants: { $elemMatch: { $eq: contextValue.user.username } } }, // Already RSVPed
                        { invited: { $elemMatch: { $eq: contextValue.user.username } } } // Invited To Ride
                    ]},
                    { $or: [
                        {
                            private: privacy.includes("public") ? { $eq: false } : { $in: [] }
                        },
                        {
                            private: privacy.includes("public") ? { $eq: null } : { $in: [] }
                        },
                        {
                            private: privacy.includes("private") ? { $eq: true } : { $in: [] }
                        },
                        {
                            invited: privacy.includes("invited") ? { $elemMatch: { $eq: contextValue.user.username } } : { $in: [] }// Invited To Ride
                        },
                        {
                            private: privacy.length ? { $in: [] } : { $nin: [] }
                        }
                    ]}
                ]
            }
            console.log("📡 DEBUG FILTERS:");
            console.log({
            startDate,
            endDate,
            bikeType,
            wkg,
            avgSpeed,
            location,
            radius,
            match,
            privacy,
            });


            const events = await Event.aggregate([
                {
                    $match: {
                        ...privacyFilters,
                        locationCoords: {
                            $geoWithin: {
                                $centerSphere: [locationCoords, radius / 6378.1],
                            },
                        },
                        startTime: endDate
                            ? { $gte: startDate, $lte: endDate }
                            : { $gte: startDate },
                        bikeType: bikeType.length ? { $in: bikeType } : { $nin: [] },
                        /*
                        wattsPerKilo:  {
                            $elemMatch:{
                                $gte: wkg[0],
                                $lte: wkg[1],
                            },
                        },
                        */
                       wattsPerKilo: Array.isArray(wkg) && wkg.length === 2
                        ? { $elemMatch: { $gte: wkg[0], $lte: wkg[1] } }
                        : { $exists: true },

                        /*
                        rideAverageSpeed: {
                            $elemMatch: {
                                $gte: avgSpeed[0],
                                $lte: avgSpeed[1],
                            },
                        },
                        */
                       rideAverageSpeed: Array.isArray(avgSpeed) && avgSpeed.length === 2
                        ? { $elemMatch: { $gte: avgSpeed[0], $lte: avgSpeed[1] } }
                        : { $exists: true },

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

        async getJoinedEvents(_, { userId }, contextValue) {
            // determine which user to lookup
            const lookup = userId
                ? { _id: userId }
                : { username: contextValue.user.username };
            const user = await User.findOne(lookup).select('eventsJoined');
            const eventList = [];
            for (const eventId of user.eventsJoined) {
                const eventInfo = await Event.findById(eventId);
                if (eventInfo) eventList.push(eventInfo);
            }
            return eventList;
        },

        async getHostedEvents(_, { userId }, contextValue) {
            const lookup = userId
                ? { _id: userId }
                : { username: contextValue.user.username };
            const user = await User.findOne(lookup).select('eventsHosted');
            const eventList = [];
            for (const eventId of user.eventsHosted) {
                const eventInfo = await Event.findById(eventId);
                if (eventInfo) eventList.push(eventInfo);
            }
            return eventList;
        },

        async getInvitedEvents(_, { userId }, contextValue) {
            // lookup username either by id or from context
            const username = userId
                ? (await User.findById(userId).select('username')).username
                : contextValue.user.username;
            return await Event.find({ invited: username });
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
                wattsPerKilo,
                rideAverageSpeed,
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
                privateNonBinary,
                private
            },
            clubId
        }, contextValue) {
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

            /*
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
                wattsPerKilo: wattsPerKilo,
                rideAverageSpeed: rideAverageSpeed,
                intensity: intensity,
                route: resRoute.id,
                privateWomen: privateWomen,
                privateNonBinary: privateNonBinary,
                private: private
            });
            */

            let locationNameResolved = '';
            let locationCoordsResolved = [];

            const hasValidStart =
            Array.isArray(startCoordinates) &&
            startCoordinates.length === 2 &&
            (startCoordinates[0] !== 0 || startCoordinates[1] !== 0);

            if (hasValidStart) {
            const locFetched = await fetchLocation(null, startCoordinates);
            locationNameResolved = locFetched?.display_name || '';
            locationCoordsResolved = [startCoordinates[1], startCoordinates[0]]; // [lng, lat]
            } else {
            const hostUser = await User.findOne({ username: host }).select('locationName locationCoords');
            locationNameResolved = hostUser?.locationName || '';
            locationCoordsResolved = hostUser?.locationCoords || [0, 0]; // [lng, lat] fallback
            }

            const newEvent = new Event({
            host: host,
            name: name,
            locationName: locationNameResolved,
            locationCoords: locationCoordsResolved,
            startTime: startTime,
            description: description,
            bikeType: bikeType,
            wattsPerKilo: wattsPerKilo,
            rideAverageSpeed: rideAverageSpeed,
            intensity: intensity,
            route: resRoute.id,
            privateWomen: privateWomen,
            privateNonBinary: privateNonBinary,
            private: private
            });

            const resEvent = await newEvent.save();

            await User.findOneAndUpdate(
                { username: host },
                { $push: { eventsHosted: resEvent.id } },
            );
            if (clubId) {
                const club = await Club.findById(clubId);
                if (!club) throw new Error("Club not found");
                // add this ride to the club’s backend user
                await User.findByIdAndUpdate(
                  club.clubUser,
                  { $push: { eventsJoined: resEvent.id } }
                );
            }
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
                wattsPerKilo,
                rideAverageSpeed,
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
            if (!event) {
                throw new Error("Event not found.");
            }

            // Check if all invitees exist
            const inviteeUsers = await User.find({ username: { $in: invitees } });
            if (inviteeUsers.length !== invitees.length) {
                throw new Error("One or more invitees not found.");
            }

            // Get usernames of invitees
            let inviteeUsernames = inviteeUsers.map(u => u.username);
            // If any invitee is a club backend user, also invite all that club's members
            const clubEntries = await Club.find({
                clubUser: { $in: inviteeUsers.map(u => u._id) }
            }).select('members');
            if (clubEntries.length > 0) {
                const memberIds = clubEntries.flatMap(c => c.members);
                const memberUsers = await User.find({ _id: { $in: memberIds } });
                const memberUsernames = memberUsers.map(u => u.username);
                // Merge and dedupe
                inviteeUsernames = Array.from(new Set(inviteeUsernames.concat(memberUsernames)));
            }

            // Filter out already invited users, host, and participants
            const newInvitees = inviteeUsernames.filter(username =>
                !event.invited.includes(username) &&
                username !== event.host &&
                !event.participants.includes(username)
            );

            // Update the event with new invitees
            const resEvent = await Event.findOneAndUpdate(
                { _id: eventID },
                { $push: { invited: { $each: newInvitees } } },
                { new: true }
            );

            return resEvent;
        },
    },
};