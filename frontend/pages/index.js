// Redirects any request to the root URL ("/") to "/login".
export async function getServerSideProps() {
  return {
    redirect: {
      destination: '/login',
      permanent: false,
    },
  };
}

// Default page, returns null because the user is redirected before this renders.
export default function Index() {
  return null;
}
