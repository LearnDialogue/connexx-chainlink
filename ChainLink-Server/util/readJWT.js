const jwt = require('jsonwebtoken');
const { GraphQLError } = require('graphql');

module.exports.readJWT = (authHeader) => {
    if (authHeader) {
        const token = authHeader.split('Bearer ')[1];
        if (token) {
            try {
                const user = jwt.verify(token, process.env.SECRET);
                return user;
            } catch (err) {
                throw new GraphQLError('Invalid or expired token', {
                    extensions: {
                        code: 'BAD_REQUEST',
                    }
                });
            }
        }
        throw new GraphQLError('Authentication token must be in format \'Bearer [token]\'', {
            extensions: {
                code: 'BAD_REQUEST',
            }
        });
    }
    return null;
}