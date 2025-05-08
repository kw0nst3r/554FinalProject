import { ApolloClient, InMemoryCache } from "@apollo/client";

const client = new ApolloClient({
  uri: "http://localhost:4000/graphql", // Change this to your backend GraphQL URL if deployed
  cache: new InMemoryCache(),
});

export default client;
