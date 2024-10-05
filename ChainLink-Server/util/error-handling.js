const { GraphQLError } = require("graphql");
const { ApolloServerErrorCode } = require("@apollo/server/errors");

module.exports.handleInputError = (errors) => {
  throw new GraphQLError(errors.general ? errors.general : "Errors", {
    extensions: {
      exception: {
        code: ApolloServerErrorCode.BAD_USER_INPUT,
        errors,
      },
    },
  });
};

module.exports.handleGeneralError = (errors, title) => {
  console.log(errors);
  throw new GraphQLError(title, {
    extensions: {
      exception: {
        code: ApolloServerErrorCode.INTERNAL_SERVER_ERROR,
        errors,
      },
    },
  });
};
