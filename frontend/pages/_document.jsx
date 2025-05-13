import Document, { Html, Head, Main, NextScript } from 'next/document';
import { DocumentHeadTags, documentGetInitialProps} from '@mui/material-nextjs/v15-pagesRouter';
export default class MyDocument extends Document {
  static async getInitialProps(ctx) {
    return documentGetInitialProps(ctx);
  }
  render() {
    return (
      <Html lang="en">
        <Head>
          <DocumentHeadTags {...this.props} />
        </Head>
        <body>
          <Main/>
          <NextScript/>
        </body>
      </Html>
    );
  }
}