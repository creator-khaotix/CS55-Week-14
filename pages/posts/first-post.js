/**
 * FIRST POST PAGE (first-post.js)
 * 
 * Purpose: This is a special static page accessible via /posts/first-post.
 * It's separate from the dynamic WordPress posts and serves as an easter egg
 * or reference page in the application.
 * 
 * Key Features:
 * - Static page (not fetched from WordPress API)
 * - Accessible via /posts/first-post URL
 * - Contains a reference/joke with link back to home
 * - No layout wrapper (intentional minimal design)
 * 
 * Note: This page doesn't use the Layout component, giving it a unique appearance.
 */

// Import the Head component from Next.js for managing document head elements
import Head from 'next/head';

// Import the Link component from Next.js for client-side navigation
import Link from 'next/link';

/**
 * FirstPost - A special static page with minimal content
 * 
 * This page is a simple static component that doesn't fetch any data.
 * It displays a message and link back to the home page. The content
 * appears to be an inside joke or reference.
 * 
 * @returns {JSX.Element} The rendered first post page
 */
export default function FirstPost() {
    return (
      <>
        {/* Set the page title in the browser tab */}
        <Head>
          <title>First Post</title>
        </Head>
        
        {/* Main heading explaining the embedded video (presumably on another page) */}
        <h2>The imbed was in case you didn't get the reference.</h2>
        
        {/* Link back to home page with humorous message */}
        <h2>
          <Link href="/">← Forgive me if you are Mormon</Link>
        </h2>
      </>
    );
  }
