const { buildSchema } = require('graphql');

module.exports = buildSchema(`
    type TestType {
        text : String!
        views : Int!
    }

    type RootQuery {
        hello : TestType
    }

    schema {
        query: RootQuery
    }
`);