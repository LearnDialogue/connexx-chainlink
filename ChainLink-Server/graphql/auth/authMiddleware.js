const { GraphQLError } = require("graphql");
const { readUrlJwt, readBearerJWT } = require("../../util/jwtHandler");

const anonymousOperations = [
  // we disable expolorer in prod, but we still need to whitelist
  // the introspection query to use the dashboard on dev/local.
  // dev/local will still require a valid JWT to perform any actions.
  "IntrospectionQuery", 
  "login",
  "register",
  "requestPasswordReset",
  "resetPassword",
  "validUsername",
  "validEmail",
];

const protectedOperations = [
  "GetPreview",
]

function handleProtectedOperation(req) {
    
    // Add boolean to show that user is account authorized
    const authHeader = req.headers.authorization || '';
    const user = readBearerJWT(authHeader);
    let isUser = false;
    if (user)
        isUser = true;

    try {
        const token = req.body.variables?.jwtToken;
        if (!token)
            throw new GraphQLError('Request body does not contain necessary jwtToken variable.');

        const payload = readUrlJwt(token);
        return {payload, isUser};
    } catch (error) {
        throw new GraphQLError('You must be have a valid invitation url to perform this action.', {
            extensions: {
            code: 'UNAUTHENTICATED',
            http: {
                status: 401,
                }
            }
        });
    }
}

function handlePrivateOperation(req) {
    const authHeader = req.headers.authorization || '';
    const user = readBearerJWT(authHeader);
    if (!user) {
        throw new GraphQLError('You must be logged in to perform this action.', {
            extensions: {
            code: 'UNAUTHENTICATED',
            http: {
                status: 401,
                }
            }
        });
    }

    return user;
}

module.exports.context = async ({ req, res }) => {
    const operationName = req.body.operationName;

    if (anonymousOperations.includes(operationName))
        return {};

    // Front end will send url based jwt encoded token
    if (protectedOperations.includes(operationName))
        return { user: handleProtectedOperation(req) };

    return { user: handlePrivateOperation(req) };
}