/**
 * LAYOUT COMPONENT (layout.js)
 * 
 * Purpose: This component provides a consistent page structure and layout wrapper
 * for all pages in the application. It includes the site header with profile image,
 * navigation, and SEO meta tags.
 * 
 * Key Features:
 * - Wraps all pages with consistent header and navigation
 * - Displays profile image (larger on home, smaller on other pages)
 * - Provides "Back to home" link on non-home pages
 * - Includes SEO meta tags (Open Graph, Twitter Card)
 * - Exports site title for reuse across pages
 * 
 * Props:
 * - children: Page content to render inside the layout
 * - home: Boolean flag indicating if this is the home page (affects header size)
 * 
 * Example Usage:
 * <Layout home>
 *   <YourPageContent />
 * </Layout>
 */

// Import Next.js Head component for managing document head (meta tags, title)
import Head from 'next/head';

// Import Next.js Image component for optimized image loading
import Image from 'next/image';

// Import layout-specific styles
import styles from './layout.module.css';

// Import utility styles for typography and spacing
import utilStyles from '../styles/utils.module.css';

// Import Link component for client-side navigation
import Link from 'next/link';
 
// Site owner's name displayed in header
const name = 'Philip Weyhe';

// Site title exported for use in page titles throughout the app
export const siteTitle = "Philip Weyhe's Favorite Videos";
 
/**
 * Layout - Main layout wrapper component
 * 
 * This component wraps all pages with a consistent structure including:
 * - Document head with SEO meta tags
 * - Header with profile image and name (size varies by page)
 * - Main content area for page-specific content
 * - Navigation footer (back to home link on non-home pages)
 * 
 * The 'home' prop controls the header appearance:
 * - home={true}: Large profile image (144x144px) with h1 heading
 * - home={false}: Small profile image (108x108px) with h2 heading and link
 * 
 * @param {object} props - Component props
 * @param {React.ReactNode} props.children - Child components/content to render in main area
 * @param {boolean} props.home - True if rendering the home page (affects header size)
 * @returns {JSX.Element} The layout wrapper with header, main content, and footer
 */
export default function Layout({ children, home }) {
  return (
    <div className={styles.container}>
      {/* Document head with meta tags for SEO and social sharing */}
      <Head>
        {/* Favicon link */}
        <link rel="icon" href="/favicon.ico" />
        
        {/* Meta description for search engines */}
        <meta
          name="description"
          content="Learn how to build a personal website using Next.js"
        />
        
        {/* Open Graph image for social media sharing */}
        <meta
          property="og:image"
          content={`https://og-image.vercel.app/${encodeURI(
            siteTitle,
          )}.png?theme=light&md=0&fontSize=75px&images=https%3A%2F%2Fassets.vercel.com%2Fimage%2Fupload%2Ffront%2Fassets%2Fdesign%2Fnextjs-black-logo.svg`}
        />
        
        {/* Open Graph title for social media sharing */}
        <meta name="og:title" content={siteTitle} />
        
        {/* Twitter Card type for Twitter sharing */}
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      
      {/* Header section with profile image and name */}
      <header className={styles.header}>
        {home ? (
          // Home page header: Large image with h1 heading (not clickable)
          <>
            <Image
              priority              // Load image immediately (above the fold)
              src="/images/profile.jpg"
              className={utilStyles.borderCircle}
              height={144}          // Larger size for home page
              width={144}
              alt=""                // Decorative image, screen readers can skip
            />
            <h1 className={utilStyles.heading2Xl}>{name}</h1>
          </>
        ) : (
          // Non-home page header: Smaller image with h2 heading (both clickable)
          <>
            {/* Clickable profile image links back to home */}
            <Link href="/">
              <Image
                priority            // Load image immediately (above the fold)
                src="/images/profile.jpg"
                className={utilStyles.borderCircle}
                height={108}        // Smaller size for non-home pages
                width={108}
                alt=""              // Decorative image, screen readers can skip
              />
            </Link>
            
            {/* Clickable name heading links back to home */}
            <h2 className={utilStyles.headingLg}>
              <Link href="/" className={utilStyles.colorInherit}>
                {name}
              </Link>
            </h2>
          </>
        )}
      </header>
      
      {/* Main content area where child components/pages are rendered */}
      <main>{children}</main>
      
      {/* Footer navigation - only show "Back to home" link on non-home pages */}
      {!home && (
        <div className={styles.backToHome}>
          <Link href="/">← Back to home</Link>
        </div>
      )}
    </div>
  );
}
