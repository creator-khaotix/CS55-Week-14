/**
 * DYNAMIC POST PAGE ([id].js)
 * 
 * Purpose: This page displays individual blog posts using Next.js dynamic routing.
 * The [id] in the filename creates a dynamic route that matches /posts/1, /posts/10, etc.
 * It fetches post data from WordPress REST API and uses ISR to keep content fresh.
 * 
 * Key Features:
 * - Dynamic routing based on post ID from WordPress
 * - Fetches individual post content from WordPress REST API
 * - Uses ISR (revalidates every 60 seconds) for automatic content updates
 * - Fallback blocking mode for posts not pre-generated at build time
 * - Displays post title, date, and HTML content
 * 
 * How it works:
 * 1. getStaticPaths() tells Next.js which post IDs exist
 * 2. getStaticProps() fetches data for each individual post
 * 3. Post component renders the content with proper formatting
 */

// Import CSS module styles for utility classes (typography, spacing, layout)
import utilStyles from '../../styles/utils.module.css';

// Import the custom Date component for formatting and displaying post dates
import Date from '../../components/date';

// Import the Head component from Next.js for managing document head elements (title, meta)
import Head from 'next/head';

// Import the Layout component for consistent page structure with header and navigation
import Layout from '../../components/layout';

// Import functions to get all post IDs and individual post data from WordPress API
import { getAllPostIds, getPostData } from '../../lib/posts';
 
/**
 * getStaticProps - Static Site Generation with ISR for individual posts
 * 
 * This function runs at build time (and during revalidation) to fetch data for a specific post.
 * It receives the post ID from the URL parameters and fetches the full post data.
 * 
 * @param {object} context - Next.js context object
 * @param {object} context.params - URL parameters
 * @param {string} context.params.id - The post ID from the URL
 * @returns {object} Props containing the post data and revalidation time
 */
export async function getStaticProps({ params }) {
    // Extract the post ID from the URL parameters and fetch full post data from WordPress
    const postData = await getPostData(params.id);
   
    // Return the post data as props to be passed to the Post component
    return {
      props: {
        postData, // Object with id, title, date, and contentHtml
      },
      revalidate: 60, // Regenerate page with fresh WordPress data every 60 seconds (ISR)
    };
  }
 
/**
 * getStaticPaths - Define which dynamic paths to pre-generate at build time
 * 
 * This function tells Next.js which post pages exist and should be pre-built.
 * At build time, it fetches all post IDs from WordPress and generates a static
 * page for each one. The fallback mode determines what happens for posts not
 * pre-generated (e.g., new posts added after deployment).
 * 
 * @returns {object} Object containing paths array and fallback mode
 */
export async function getStaticPaths() {
  // Get all available post IDs from the WordPress REST API
  const paths = await getAllPostIds();
  
  // Return the paths and fallback configuration
  return {
    paths, // Array of { params: { id: '1' } } objects
    fallback: 'blocking', // Server-render pages on-demand if not pre-generated at build time
  };
}

/**
 * Post - Individual blog post page component
 * 
 * This component renders a single blog post with its title, publication date,
 * and full HTML content. The HTML content from WordPress is rendered using
 * dangerouslySetInnerHTML (safe because it comes from a trusted WordPress API).
 * 
 * @param {object} props - Component props
 * @param {object} props.postData - Post data object from getStaticProps
 * @param {string} props.postData.title - Post title
 * @param {string} props.postData.date - Post publication date
 * @param {string} props.postData.contentHtml - Post HTML content
 * @returns {JSX.Element} The rendered post page
 */
export default function Post({ postData }) {
    return (
      <Layout>
        {/* Set the page title to the post title */}
        <Head>
          <title>{postData.title}</title>
        </Head>
        
        {/* Article element for semantic HTML */}
        <article className={utilStyles.articleContent}>
          {/* Display post title as main heading */}
          <h1 className={utilStyles.headingXl}>{postData.title}</h1>
          
          {/* Display formatted publication date */}
          <div className={utilStyles.lightText}>
            <Date dateString={postData.date} />
          </div>
          
          {/* Render post HTML content from WordPress (includes paragraph tags, formatting, etc.) */}
          <div className={utilStyles.blogContent} dangerouslySetInnerHTML={{ __html: postData.contentHtml }} />
        </article>
      </Layout>
    );
  }
