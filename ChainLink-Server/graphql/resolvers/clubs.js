const Club = require('../../models/Club.js');
const User = require('../../models/User.js');
const Event = require('../../models/Event.js');

const clubResolvers = {
    Query: {
        getClubs: async () => {
            return await Club.find().populate("owners").populate("admins").populate("members").populate("requestedMembers").populate('eventsHosted');
        },
        getClub: async (_, { id }) => {
            return await Club.findById(id).populate("owners").populate("admins").populate("members").populate("requestedMembers").populate('eventsHosted');
        },
        getClubField: async (_, { id, field }) => {
            const club = await Club.findById(id);
            if (!club) {
                throw new Error("Club not found");
            }
            return club[field]; 
        },
        getClubMembers: async (_, { clubId }) => {
            const club = await Club.findById(clubId).populate("members");
            if (!club) {
                throw new Error("Club not found");
            }
            return club.members;
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
            if (club.isPrivate) {
                if (!club.requestedMembers.includes(userId)) {
                  throw new Error('You do not have an invitation to join this club.');
                }
                // Remove the invite immediately
                club.requestedMembers = club.requestedMembers.filter(id => id.toString() !== userId);
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

            return await Club.findById(clubId)
                .populate('owners')
                .populate('admins')
                .populate('members')
                .populate('requestedMembers')
                .populate('eventsHosted');
        },
        leaveClub: async (_, { clubId, userId }) => {
            const club = await Club.findById(clubId);
            if (!club) throw new Error("Club not found");
            if (!club.members.includes(userId)) {
              throw new Error("User is not a member of this club.");
            }
            if (club.owners.length <= 1) {
              throw new Error("Last owner cannot leave until transfer to/add new owner.");
            }
            // Remove from members
            club.members = club.members.filter(id => id.toString() !== userId);
            // Also clear any lingering invites/admin/owner roles
            club.requestedMembers = club.requestedMembers.filter(id => id.toString() !== userId);
            club.admins = club.admins.filter(id => id.toString() !== userId);
            club.owners = club.owners.filter(id => id.toString() !== userId);
            await club.save();
      
            await User.findByIdAndUpdate(userId, { $pull: { clubsJoined: clubId }}, { new: true });
            return club;
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
            const club = await Club.findById(clubId);
            if (!club) throw new Error("Club not found");
            // Remove from members
            club.members = club.members.filter(id => id.toString() !== userId);
            // Also clear any pending invites/admin/owner roles
            club.requestedMembers = club.requestedMembers.filter(id => id.toString() !== userId);
            club.admins = club.admins.filter(id => id.toString() !== userId);
            club.owners = club.owners.filter(id => id.toString() !== userId);
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
        addOwner: async (_, { clubId, userId }) => {
            const club = await Club.findById(clubId);
            if (!club) {
                throw new Error('Club not found');
            }
            const user = await User.findById(userId);
            if (!user) {
                throw new Error('User not found');
            }
            if (!club.members.includes(userId)) {
                throw new Error('User is not a member of this club.');
            }

            if (!club.owners.includes(userId)) {
                club.owners.push(userId);
                await club.save();
            }
            
            return club;
        },
        removeOwner: async (_, { clubId, userId }) => {
            const club = await Club.findById(clubId);
            if (!club) {
                throw new Error('Club not found');
            }
            const user = await User.findById(userId);
            if (!user) {
                throw new Error('User not found');
            }
            if (!club.members.includes(userId)) {
                throw new Error('User is not a member of this club.');
            }
            if (club.owners.length <= 1) {
                throw new Error("Cannot remove last owner until new owner is appointed.");
            }
    
            club.owners = club.owners.filter(ownerId => ownerId.toString() !== userId);
            await club.save();
            return club;
        },
        requestToJoin: async (_, { clubId, userId }) => {
            const club = await Club.findById(clubId);
            if (!club) throw new Error("Club not found");
            // Only add if not already requested or member
            if (!club.requestedMembers.includes(userId) && !club.members.includes(userId)) {
              club.requestedMembers.push(userId);
              await club.save();
            }
            return club;
          },
        declineToJoin: async (_, { clubId, userId }) => {
            const club = await Club.findById(clubId);
            if (!club) throw new Error("Club not found");
    
            if (club.requestedMembers.includes(userId)) {
                club.requestedMembers.pull(userId);
                await club.save();
            }
    
            return club;
        },
        approveMember: async (_, { clubId, userId }) => {
            const club = await Club.findById(clubId);
            if (!club) throw new Error("Club not found");
            if (!club.requestedMembers.includes(userId)) {
              throw new Error("Invite no longer valid");
            }
            // Remove invite, add to members
            club.requestedMembers = club.requestedMembers.filter(id => id.toString() !== userId);
            if (!club.members.includes(userId)) {
              club.members.push(userId);
            }
            await club.save();
            await User.findByIdAndUpdate(userId, { $push: { clubsJoined: clubId }});
            return club;
          },
        rejectMember: async (_, { clubId, userId }) => {
            const club = await Club.findById(clubId);
            if (!club) throw new Error("Club not found");
            // Remove only if it exists
            club.requestedMembers = club.requestedMembers.filter(id => id.toString() !== userId);
            await club.save();
            return club;
          },
    },
    Club: {
        owners: async (club) => User.find({ _id: { $in: club.owners } }),
        admins: async (club) => User.find({ _id: { $in: club.admins } }),
        members: async (club) => User.find({ _id: { $in: club.members } }),
        requestedMembers: async (club) => User.find({ _id: { $in: club.requestedMembers } }),
        eventsHosted: async (club) => Event.find({ _id: { $in: club.eventsHosted } }),
        eventsJoined: async (club) => {
            const users = await User.find({ _id: { $in: club.members } });
            const names = users.map(u => u.username);
            return Event.find({ participants: { $in: names } });
        },
        eventsInvited: async (club) => {
            const users = await User.find({ _id: { $in: club.members } });
            const names = users.map(u => u.username);
            return Event.find({ invited: { $in: names } });
        }
    }
};

module.exports = clubResolvers;
