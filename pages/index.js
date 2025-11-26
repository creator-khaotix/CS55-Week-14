/**
 * HOME PAGE (index.js)
 * 
 * Purpose: This is the main landing page displaying lists of all three custom post types:
 * Games, Movies, and Music. Each list fetches data from separate WordPress REST API endpoints.
 * The page uses Incremental Static Regeneration (ISR) to automatically refresh content 
 * every 60 seconds without requiring a full rebuild/redeploy.
 * 
 * Key Features:
 * - Fetches three different post types from WordPress REST API at build time
 * - Displays each post type in a separate section with linked titles
 * - Uses ISR to keep content fresh (revalidates every 60 seconds)
 * - Includes embedded YouTube video
 * - Responsive layout with custom styling
 */

// Import the Link component from Next.js for client-side navigation between pages
import Link from 'next/link';

// Import the custom Date component for formatting and displaying dates
import Date from '../components/date';

// Import the Head component from Next.js for managing document head elements (title, meta tags)
import Head from 'next/head';

// Import the Layout component and siteTitle constant from the layout component
import Layout, { siteTitle } from '../components/layout';

// Import CSS module styles for utility classes (typography, spacing, etc.)
import utilStyles from '../styles/utils.module.css';

// Import the data fetching functions for all three post types
import { getSortedGamesData } from '../lib/games';
import { getSortedMoviesData } from '../lib/movies';
import { getSortedMusicData } from '../lib/music';
 
/**
 * getStaticProps - Static Site Generation (SSG) with Incremental Static Regeneration (ISR)
 * 
 * This function runs at build time on the server to fetch data for all three post types.
 * With ISR enabled (revalidate: 60), Next.js will:
 * 1. Serve the cached static page for fast performance
 * 2. After 60 seconds, regenerate the page in the background with fresh WordPress data
 * 3. Serve the updated page to subsequent visitors
 * 
 * @returns {object} Props containing all posts data for three post types and revalidation time
 */
export async function getStaticProps() {
  // Fetch data from all three WordPress REST API endpoints
  const allGamesData = await getSortedGamesData();
  const allMoviesData = await getSortedMoviesData();
  const allMusicData = await getSortedMusicData();
  
  // Return the data as props to be passed to the Home component
  return {
    props: {
      allGamesData,
      allMoviesData,
      allMusicData,
    },
    revalidate: 60, // Regenerate page with fresh WordPress data every 60 seconds (ISR)
  };
}

/**
 * Home - The main home page component
 * 
 * This component renders the home page layout including a YouTube video embed
 * and three separate lists of post types (games, movies, music). Each post is 
 * displayed as a link with its relevant metadata.
 * 
 * @param {object} props - Component props
 * @param {Array} props.allGamesData - Array of game objects from getStaticProps
 * @param {Array} props.allMoviesData - Array of movie objects from getStaticProps
 * @param {Array} props.allMusicData - Array of music objects from getStaticProps
 * @returns {JSX.Element} The rendered home page
 */
export default function Home({ allGamesData, allMoviesData, allMusicData }) {
  return (
    <Layout home>
      {/* Set the page title in the document head */}
      <Head>
        <title>{siteTitle}</title>
      </Head>
      
      {/* Main content section with centered styling */}
      <section className={utilStyles.centeredContent}>
        {/* Link to a special first post page */}
        <p><Link href="/posts/first-post">[These are just a few of my favorite things...]</Link></p>
        
        {/* Embedded YouTube video player */}
        <iframe 
          width="560" 
          height="315" 
          src="https://www.youtube.com/embed/621LzO0qWnU" 
          title="YouTube video player" 
          frameBorder="0" 
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
          referrerPolicy="strict-origin-when-cross-origin" 
          allowFullScreen
          style={{ marginBottom: '10px' }}
        />
      </section>

      {/* Games section - displays all games from WordPress */}
      <section className={`${utilStyles.headingMd} ${utilStyles.padding1px}`}>
        <h2 className={utilStyles.headingLg}>
          <Link href="/games">Games</Link>
        </h2>
        
        {/* Unordered list of all games */}
        <ul className={utilStyles.list}>
          {/* Map through each game and render a list item with link and metadata */}
          {allGamesData.map(({ id, date, title, developer }) => (
            <li className={utilStyles.listItem} key={id}>
              {/* Link to individual game page using dynamic routing */}
              <Link href={`/games/${id}`}>{title}</Link>
              <br />
              {/* Display developer name if it exists */}
              {developer && (
                <>
                  <small className={utilStyles.lightText}>
                    <strong>Developer:</strong> {developer}
                  </small>
                  <br />
                </>
              )}
              {/* Display release date */}
              {date && (
                <small className={utilStyles.lightText}>
                  <strong>Release Year:</strong> <Date dateString={date} />
                </small>
              )}
            </li>
          ))}
        </ul>
      </section>

      {/* Movies section - displays all movies from WordPress */}
      <section className={`${utilStyles.headingMd} ${utilStyles.padding1px}`}>
        <h2 className={utilStyles.headingLg}>
          <Link href="/movies">Movies</Link>
        </h2>
        
        {/* Unordered list of all movies */}
        <ul className={utilStyles.list}>
          {/* Map through each movie and render a list item with link and metadata */}
          {allMoviesData.map(({ id, date, title, director }) => (
            <li className={utilStyles.listItem} key={id}>
              {/* Link to individual movie page using dynamic routing */}
              <Link href={`/movies/${id}`}>{title}</Link>
              <br />
              {/* Display director name if it exists */}
              {director && (
                <>
                  <small className={utilStyles.lightText}>
                    <strong>Director:</strong> {director}
                  </small>
                  <br />
                </>
              )}
              {/* Display release year */}
              {date && (
                <small className={utilStyles.lightText}>
                  <strong>Release Year:</strong> {date}
                </small>
              )}
            </li>
          ))}
        </ul>
      </section>

      {/* Music section - displays all music from WordPress */}
      <section className={`${utilStyles.headingMd} ${utilStyles.padding1px}`}>
        <h2 className={utilStyles.headingLg}>
          <Link href="/music">Music</Link>
        </h2>
        
        {/* Unordered list of all music */}
        <ul className={utilStyles.list}>
          {/* Map through each music item and render a list item with link and metadata */}
          {allMusicData.map(({ id, title, genre, favoriteAlbum }) => (
            <li className={utilStyles.listItem} key={id}>
              {/* Link to individual music page using dynamic routing */}
              <Link href={`/music/${id}`}>{title}</Link>
              <br />
              {/* Display genre if it exists */}
              {genre && (
                <>
                  <small className={utilStyles.lightText}>
                    <strong>Genre:</strong> {genre}
                  </small>
                  <br />
                </>
              )}
              {/* Display favorite album if it exists */}
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
