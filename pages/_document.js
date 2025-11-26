/**
 * CUSTOM DOCUMENT COMPONENT (_document.js)
 * 
 * Purpose: This component customizes the HTML document structure for the entire Next.js app.
 * Unlike _app.js which wraps page components, _document.js wraps the entire HTML structure
 * including <html>, <head>, and <body> tags.
 * 
 * Key Features:
 * - Only renders on the server (never in the browser)
 * - Used for adding meta tags, fonts, and other <head> elements
 * - Customizes the HTML document structure
 * 
 * This is where Google Fonts and other external stylesheets should be loaded,
 * not in _app.js or individual pages.
 */

import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Google Fonts - Preconnect for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Google Fonts Stylesheet - Montserrat and Open Sans */}
        <link 
          href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800&family=Open+Sans:wght@300;400;600&display=swap" 
          rel="stylesheet" 
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}

