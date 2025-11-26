/**
 * MUSIC LIST PAGE (music.js)
 * 
 * Purpose: This page displays a complete list of all music/artists from the WordPress 'music' 
 * custom post type. It provides a dedicated URL at /music for browsing the music catalog.
 * 
 * Key Features:
 * - Fetches all music from WordPress REST API at build time
 * - Displays music in an alphabetically sorted list with titles and metadata
 * - Uses ISR (revalidates every 60 seconds) for automatic content updates
 * - Each title links to the detailed music page
 * - Responsive layout
 */

// Import the Link component from Next.js for client-side navigation
import Link from 'next/link';

// Import the Head component for managing page meta tags
import Head from 'next/head';

// Import the Layout component for consistent page structure
import Layout from '../components/layout';

// Import CSS module styles for utility classes
import utilStyles from '../styles/utils.module.css';

// Import the data fetching function for music
import { getSortedMusicData } from '../lib/music';

/**
 * getStaticProps - Static Site Generation with ISR
 * 
 * Fetches all music data at build time and enables automatic regeneration
 * every 60 seconds to keep content fresh.
 * 
 * @returns {object} Props containing all music data and revalidation time
 */
export async function getStaticProps() {
  const allMusicData = await getSortedMusicData();
  
  return {
    props: {
      allMusicData,
    },
    revalidate: 60, // ISR: Regenerate page every 60 seconds
  };
}

/**
 * MusicPage - Main music list page component
 * 
 * Displays all music/artists in a list format with links to individual music pages.
 * Shows artist/title, genre, and favorite album for each entry.
 * 
 * @param {object} props - Component props
 * @param {Array} props.allMusicData - Array of music objects from getStaticProps
 * @returns {JSX.Element} The rendered music list page
 */
export default function MusicPage({ allMusicData }) {
  return (
    <Layout>
      <Head>
        <title>All Music</title>
      </Head>
      
      <section className={utilStyles.headingMd}>
        <h1 className={utilStyles.headingXl}>All Music</h1>
        <p>My Favorite Music!</p>
        
        {/* List of all music */}
        <ul className={utilStyles.list}>
          {allMusicData.map(({ id, title, genre, favoriteAlbum }) => (
            <li className={utilStyles.listItem} key={id}>
              {/* Link to individual music detail page */}
              <Link href={`/music/${id}`}>{title}</Link>
              <br />
              
              {/* Display genre if available */}
              {genre && (
                <>
                  <small className={utilStyles.lightText}>
                    <strong>Genre:</strong> {genre}
                  </small>
                  <br />
                </>
              )}
              
              {/* Display favorite album if available */}
              {favoriteAlbum && (
                <small className={utilStyles.lightText}>
                  <strong>Favorite Album:</strong> {favoriteAlbum}
                </small>
              )}
            </li>
          ))}
        </ul>
      </section>
    </Layout>
  );
}

