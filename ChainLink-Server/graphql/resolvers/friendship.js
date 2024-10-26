const friendship = require('../../models/Friendship');
const { handleGeneralError } = require('../../util/error-handling');

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
                        { sender: sender, receiver: receiver },
                        { sender: receiver, receiver: sender },
                    ]
                });
        
                if (!friendshipRes) {
                    return null;
                }
        
                return friendshipRes;
            } catch (err) {
                handleGeneralError(err, 'Issue getting friendship status');
            }
        }
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
    }
}