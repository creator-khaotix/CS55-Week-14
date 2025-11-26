/**
 * GAMES LIST PAGE (games.js)
 * 
 * Purpose: This page displays a complete list of all games from the WordPress 'game' 
 * custom post type. It provides a dedicated URL at /games for browsing the game catalog.
 * 
 * Key Features:
 * - Fetches all games from WordPress REST API at build time
 * - Displays games in an alphabetically sorted list with titles and metadata
 * - Uses ISR (revalidates every 60 seconds) for automatic content updates
 * - Each title links to the detailed game page
 * - Responsive layout
 */

// Import the Link component from Next.js for client-side navigation
import Link from 'next/link';

// Import the custom Date component for formatting dates
import Date from '../components/date';

// Import the Head component for managing page meta tags
import Head from 'next/head';

// Import the Layout component for consistent page structure
import Layout from '../components/layout';

// Import CSS module styles for utility classes
import utilStyles from '../styles/utils.module.css';

// Import the data fetching function for games
import { getSortedGamesData } from '../lib/games';

/**
 * getStaticProps - Static Site Generation with ISR
 * 
 * Fetches all games data at build time and enables automatic regeneration
 * every 60 seconds to keep content fresh.
 * 
 * @returns {object} Props containing all games data and revalidation time
 */
export async function getStaticProps() {
  const allGamesData = await getSortedGamesData();
  
  return {
    props: {
      allGamesData,
    },
    revalidate: 60, // ISR: Regenerate page every 60 seconds
  };
}

/**
 * GamesPage - Main games list page component
 * 
 * Displays all games in a list format with links to individual game pages.
 * Shows game title, developer, and release year for each entry.
 * 
 * @param {object} props - Component props
 * @param {Array} props.allGamesData - Array of game objects from getStaticProps
 * @returns {JSX.Element} The rendered games list page
 */
export default function GamesPage({ allGamesData }) {
  return (
    <Layout>
      <Head>
        <title>All Games</title>
      </Head>
      
      <section className={utilStyles.headingMd}>
        <h1 className={utilStyles.headingXl}>All Games</h1>
        <p>My Favorite Games!</p>
        
        {/* List of all games */}
        <ul className={utilStyles.list}>
          {allGamesData.map(({ id, date, title, developer }) => (
            <li className={utilStyles.listItem} key={id}>
              {/* Link to individual game detail page */}
              <Link href={`/games/${id}`}>{title}</Link>
              <br />
              
              {/* Display developer name if available */}
              {developer && (
                <>
                  <small className={utilStyles.lightText}>
                    <strong>Developer:</strong> {developer}
                  </small>
                  <br />
                </>
              )}
              
              {/* Display release year if available */}
              {date && (
                <small className={utilStyles.lightText}>
                  <strong>Release Year:</strong> <Date dateString={date} />
                </small>
              )}
            </li>
          ))}
        </ul>
      </section>
    </Layout>
  );
}

