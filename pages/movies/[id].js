/**
 * DYNAMIC MOVIE PAGE ([id].js)
 * 
 * Purpose: This page displays individual movies using Next.js dynamic routing.
 * The [id] in the filename creates a dynamic route that matches /movies/the-matrix, etc.
 * It fetches movie data from WordPress REST API and uses ISR to keep content fresh.
 * 
 * Key Features:
 * - Dynamic routing based on movie slug from WordPress
 * - Fetches individual movie content from WordPress REST API
 * - Uses ISR (revalidates every 60 seconds) for automatic content updates
 * - Fallback blocking mode for movies not pre-generated at build time
 * - Displays movie title, release year, and ACF custom fields
 */

import utilStyles from '../../styles/utils.module.css';
import Date from '../../components/date';
import Head from 'next/head';
import Layout from '../../components/layout';
import { getAllMovieIds, getMovieData } from '../../lib/movies';

/**
 * getStaticProps - Static Site Generation with ISR for individual movies
 * 
 * @param {object} context - Next.js context object
 * @param {object} context.params - URL parameters
 * @param {string} context.params.id - The movie slug from the URL
 * @returns {object} Props containing the movie data and revalidation time
 */
export async function getStaticProps({ params }) {
    const postData = await getMovieData(params.id);
   
    return {
      props: {
        postData,
      },
      revalidate: 60, // ISR: Regenerate page every 60 seconds
    };
  }

/**
 * getStaticPaths - Define which dynamic paths to pre-generate at build time
 * 
 * @returns {object} Object containing paths array and fallback mode
 */
export async function getStaticPaths() {
  const paths = await getAllMovieIds();
  
  return {
    paths,
    fallback: 'blocking', // Server-render pages on-demand if not pre-generated
  };
}

/**
 * Post - Individual movie page component
 * 
 * @param {object} props - Component props
 * @param {object} props.postData - Movie data object from getStaticProps
 * @returns {JSX.Element} The rendered movie page
 */
export default function Post({ postData }) {
    return (
      <Layout>
        <Head>
          <title>{postData.title}</title>
        </Head>
        
        <article className={utilStyles.articleContent}>
          <h1 className={utilStyles.headingXl}>{postData.title}</h1>
          
          {/* Display movie poster if available */}
          {postData.imageUrl && (
            <div style={{ display: 'flex', justifyContent: 'center', margin: '2rem 0' }}>
              <img 
                src={postData.imageUrl} 
                alt={postData.title}
                style={{ 
                  maxWidth: '100%', 
                  height: 'auto', 
                  borderRadius: '8px',
                  display: 'block',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                }}
              />
            </div>
          )}
          
          {/* Display release year with label */}
          {postData.date && (
            <div className={utilStyles.lightText}>
              <strong>Release Year:</strong> {postData.date}
            </div>
          )}
          
          {/* Render movie HTML content from WordPress (includes ACF fields and post content) */}
          <div className={utilStyles.blogContent} dangerouslySetInnerHTML={{ __html: postData.contentHtml }} />
        </article>
      </Layout>
    );
  }

