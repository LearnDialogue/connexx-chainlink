const jwt = require('jsonwebtoken');
const { GraphQLError } = require('graphql');

module.exports.generateJWT = (payload, expiresIn = '1h') => {
    return jwt.sign(payload, process.env.SECRET, { expiresIn });
}

module.exports.readBearerJWT = (authHeader) => {
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

module.exports.readUrlJwt = (token) => {
    if (!token)
        return null;

    try {
        // verify will return this on success, be sure to check if it contains what you think it contains
        const payload = jwt.verify(token, process.env.SECRET);
        return payload;
    } catch (err) {
        throw new GraphQLError('Invalid or expired token', {
            extensions: {
                code: 'BAD_REQUEST',
            }
        });
    }
}