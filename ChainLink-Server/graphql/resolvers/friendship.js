const friendship = require('../../models/friendship');

module.exports = {
    Query: {
        async getFriendships(_, { username }, context) {
            try {
                const friendships = await friendship.find({
                    $or: [
                        { sender: username },
                        { receiver: username },
                    ]
                });
                return friendships;
            } catch (err) {
                throw new Error(err);
            }
        },
        async getFriends(_, { username }, context) {
            try {
                const friendships = await friendship.find({
                    $or: [
                        { sender: username, status: 'accepted' },
                        { receiver: username, status: 'accepted' },
                    ]
                });
                return friendships;
            } catch (err) {
                throw new Error(err);
            }
        },
        async getFriendRequests(_, { username }, context) {
            try {
                const friendships = await friendship.find({
                    receiver: username,
                    status: 'pending',
                });
                return friendships;
            } catch (err) {
                throw new Error(err);
            }
        },
        async getFriendshipStatus(_, { sender, receiver }, context) {
            try {
                const friendshipRes = await friendship.findOne({
                    $or: [
                        { sender, receiver },
                        { sender: receiver, receiver: sender },
                    ]
                });
                return friendshipRes;
            } catch (err) {
                throw new Error(err);
            }
        },
    },
    Mutation: {
        async sendFriendRequest(_, { sender, receiver }, context) {
            try {
                const newFriendship = new friendship({
                    sender,
                    receiver,
                    status: 'pending',
                });
                const friendshipRes = await newFriendship.save();
                return friendshipRes;
            } catch (err) {
                throw new Error(err);
            }
        },
        async acceptFriendRequest(_, { friendshipId }, context) {
            try {
                const friendshipRes = await friendship.findByIdAndUpdate(friendshipId, {
                    status: 'accepted',
                }, { new: true });
                return friendshipRes;
            } catch (err) {
                throw new Error(err);
            }
        },
        async declineFriendRequest(_, { friendshipId }, context) {
            try {
                const friendshipRes = await friendship.findByIdAndUpdate(friendshipId, {
                    status: 'declined',
                }, { new: true });
                return friendshipRes;
            } catch (err) {
                throw new Error(err);
            }
        },
        async cancelFriendRequest(_, { friendshipId }, context) {
            try {
                const friendshipRes = await friendship.findByIdAndDelete(friendshipId);
                return friendshipRes;
            } catch (err) {
                throw new Error(err);
            }
        }
    }
}