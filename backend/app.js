import {ApolloServer} from '@apollo/server';
import {startStandaloneServer} from '@apollo/server/standalone';
import { dbConnection } from './MongoConfig/mongoConnection.js';
import {typeDefs} from './typedefs.js';
import {resolvers} from './resolvers.js';

await dbConnection();
const server = new ApolloServer({typeDefs, resolvers});

const {url} = await startStandaloneServer(server, {
  listen: {port: 4000}
});


console.log(`Server ready at: ${url}`);
