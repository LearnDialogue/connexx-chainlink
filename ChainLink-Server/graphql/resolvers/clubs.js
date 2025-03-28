const Club = require('../../models/Club.js');
const User = require('../../models/User.js');

const clubResolvers = {
    Query: {
        getClubs: async () => {
            return await Club.find().populate("owners").populate("members");
        },
        getClub: async (_, { id }) => {
            return await Club.findById(id).populate("owners").populate("members");
        },
    },
    Mutation: {
        createClub: async (_, { clubInput }, context) => {
            const userId = context.user.id;
            if (!userId) { //Check if Sign up and login in
                throw new Error('Authentication required.');
            }
            const newClub = new Club({
                ...clubInput,
                owners: [userId], // Assign user as owner
                members: [userId] // Assign user as member
            });

            await User.findByIdAndUpdate(
                userId, 
                { $push: { clubsOwned: newClub._id, clubsJoined: newClub._id }, }
            );

            await newClub.save();
            return newClub;
        },
        updateClub: async (_, { id, clubInput }) => {
            return await Club.findByIdAndUpdate(id, clubInput, { new: true });
        },
        deleteClub: async (_, { id }) => {
            await Club.findByIdAndDelete(id);
            return "Club deleted";
        },
        joinClub: async (_, { clubId, userId }, context) => {
            const club = await Club.findById(clubId);
            if (!club) {
                throw new Error('Club not found');
            }
            const user = await User.findById(userId);
            if (!user) {
                throw new Error('User not found');
            }
            if (club.members.includes(userId)) {
                throw new Error('User is already a member of this club.');
            }

            club.members.push(userId);
            await club.save();

            await User.findByIdAndUpdate(
                userId, 
                { $push: {clubsJoined: clubId } },
                { new: true }
            );

            const updatedClub = await Club.findById(clubId).populate("owners").populate("members");
            return updatedClub;
        },
    },
    Club: {
        owners: async (club) => {
            return await User.find({ _id: { $in: club.owners } });
        },
        members: async (club) => {
            return await User.find({ _id: { $in: club.members } });
        },
    },
};

module.exports = clubResolvers;