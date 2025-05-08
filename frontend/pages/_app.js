import "@/styles/globals.css";
import { ApolloProvider } from "@apollo/client";
import client from "../apollo/client"; // Adjust if your structure differs

export default function App({ Component, pageProps }) {
  return (
    <ApolloProvider client={client}>
      <Component {...pageProps} />
    </ApolloProvider>
  );
}
