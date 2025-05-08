import { ApolloClient, InMemoryCache, ApolloProvider, gql } from '@apollo/client';


let client; 
async function getGraphClient() {
    if(!client){
        client = new ApolloClient({
            uri: 'https://flyby-router-demo.herokuapp.com/',
            cache: new InMemoryCache(),
        });
    }
    return client;
}

export default getGraphClient;