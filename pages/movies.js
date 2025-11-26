/**
 * MOVIES LIST PAGE (movies.js)
 * 
 * Purpose: This page displays a complete list of all movies from the WordPress 'movie' 
 * custom post type. It provides a dedicated URL at /movies for browsing the movie catalog.
 * 
 * Key Features:
 * - Fetches all movies from WordPress REST API at build time
 * - Displays movies in an alphabetically sorted list with titles and metadata
 * - Uses ISR (revalidates every 60 seconds) for automatic content updates
 * - Each title links to the detailed movie page
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

// Import the data fetching function for movies
import { getSortedMoviesData } from '../lib/movies';

/**
 * getStaticProps - Static Site Generation with ISR
 * 
 * Fetches all movies data at build time and enables automatic regeneration
 * every 60 seconds to keep content fresh.
 * 
 * @returns {object} Props containing all movies data and revalidation time
 */
export async function getStaticProps() {
  const allMoviesData = await getSortedMoviesData();
  
  return {
    props: {
      allMoviesData,
    },
    revalidate: 60, // ISR: Regenerate page every 60 seconds
  };
}

/**
 * MoviesPage - Main movies list page component
 * 
 * Displays all movies in a list format with links to individual movie pages.
 * Shows movie title, director, and release year for each entry.
 * 
 * @param {object} props - Component props
 * @param {Array} props.allMoviesData - Array of movie objects from getStaticProps
 * @returns {JSX.Element} The rendered movies list page
 */
export default function MoviesPage({ allMoviesData }) {
  return (
    <Layout>
      <Head>
        <title>All Movies</title>
      </Head>
      
      <section className={utilStyles.headingMd}>
        <h1 className={utilStyles.headingXl}>All Movies</h1>
        <p>My Favorite Movies!</p>
        
        {/* List of all movies */}
        <ul className={utilStyles.list}>
          {allMoviesData.map(({ id, date, title, director }) => (
            <li className={utilStyles.listItem} key={id}>
              {/* Link to individual movie detail page */}
              <Link href={`/movies/${id}`}>{title}</Link>
              <br />
              
              {/* Display director name if available */}
              {director && (
                <>
                  <small className={utilStyles.lightText}>
                    <strong>Director:</strong> {director}
                  </small>
                  <br />
                </>
              )}
              
              {/* Display release year if available */}
              {date && (
                <small className={utilStyles.lightText}>
                  <strong>Release Year:</strong> {date}
                </small>
              )}
            </li>
          ))}
        </ul>
      </section>
    </Layout>
  );
}

