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
        getClubField: async (_, { id, field }) => {
            const club = await Club.findById(id);
            if (!club) {
                throw new Error("Club not found");
            }
            return club[field]; 
        }
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
                admins: [userId], // Assign user as admin
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
        addMember: async (_, { clubId, userId }) => {
            // Check if club exists
            const club = await Club.findById(clubId);
            if (!club) throw new Error("Club not found");
            // Check if user exists and isn't existing member
            const user = await User.findById(userId);
            if (!user) throw new Error("User not found");
            if (club.members.includes(userId)) throw new Error("User is already a member");
    
            club.members.push(userId);
            await club.save();
    
            await User.findByIdAndUpdate(userId, { $push: { clubsJoined: clubId }}, { new: true });
    
            return club;
        },
        removeMember: async (_, { clubId, userId }) => {
            // Check if club exists
            const club = await Club.findById(clubId);
            if (!club) throw new Error("Club not found");
    
            club.members = club.members.filter(memberId => memberId.toString() !== userId);
            await club.save();
    
            await User.findByIdAndUpdate(userId, { $pull: { clubsJoined: clubId }}, { new: true });
    
            return club;
        },
        addAdmin: async (_, { clubId, userId }) => {
            // Check if club exists
            const club = await Club.findById(clubId);
            if (!club) throw new Error("Club not found");
    
            if (!club.admins.includes(userId)) {
                club.admins.push(userId);
                await club.save();
            }
            return club;
        },
        removeAdmin: async (_, { clubId, userId }) => {
            // Check if club exists
            const club = await Club.findById(clubId);
            if (!club) throw new Error("Club not found");
    
            club.admins = club.admins.filter(adminId => adminId.toString() !== userId);
            await club.save();
            return club;
        },
        requestToJoin: async (_, { clubId, userId }) => {
            const club = await Club.findById(clubId);
            if (!club) throw new Error("Club not found");
    
            if (!club.requestedMembers.includes(userId)) {
                club.requestedMembers.push(userId);
                await club.save();
            }
    
            return club;
        },
        approveMember: async (_, { clubId, userId }) => {
            const club = await Club.findById(clubId);
            if (!club) throw new Error("Club not found");
    
            if (club.requestedMembers.includes(userId)) {
                club.requestedMembers = club.requestedMembers.filter(id => id.toString() !== userId);
                club.members.push(userId);
                await club.save();
    
                await User.findByIdAndUpdate(userId, { $push: { clubsJoined: clubId } });
            }
    
            return club;
        },
        rejectMember: async (_, { clubId, userId }) => {
            const club = await Club.findById(clubId);
            if (!club) throw new Error("Club not found");
    
            club.requestedMembers = club.requestedMembers.filter(id => id.toString() !== userId);
            await club.save();
            return club;
        }
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