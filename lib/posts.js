/**
 * WORDPRESS API DATA FETCHING LIBRARY (posts.js)
 * 
 * Purpose: This module handles all data fetching operations from a WordPress REST API endpoint.
 * It provides three main functions to retrieve and transform WordPress data for use in the Next.js
 * application. The module uses the 'got' library for HTTP requests and includes error handling
 * to gracefully handle API failures.
 * 
 * Universal Design:
 * - Works with standard WordPress posts, custom post types, and ACF custom fields
 * - Handles multiple date formats: full datetime, ISO dates, or just years
 * - Supports both post_date (standard posts) and acf.release_date (custom fields)
 * - Generates HTML from ACF fields or uses standard post_content
 * - Routes using slugs for human-readable URLs
 * 
 * Key Features:
 * - Fetches data from WordPress REST API using 'got' library
 * - Transforms WordPress data format to match Next.js requirements
 * - Sorts items alphabetically by title
 * - Provides error handling with fallback data
 * - Universal date handling for different content types
 * 
 * API Endpoint: https://dev-cs-55-week-11.pantheonsite.io/wp-json/wp/v2/game
 * 
 * Exported Functions:
 * - getSortedPostsData() - Returns array of all items with id, title, date, and optional fields
 * - getAllPostIds() - Returns array of slugs in Next.js path format
 * - getPostData(id) - Returns full data for a specific item by slug
 */

// Legacy imports (commented out - used when reading from local markdown files)
// import { remark } from 'remark';
// import html from 'remark-html';
// import fs from 'fs';
// import path from 'path';
// import matter from 'gray-matter';

// Import 'got' library for making HTTP requests to WordPress REST API
import got from 'got';

// WordPress REST API endpoint URL that returns game data with ACF custom fields in JSON format
const dataURL = "https://dev-cs-55-week-11.pantheonsite.io/wp-json/wp/v2/game";
 
/* 
 * ============================================================================
 * LEGACY CODE - Original functions for reading from local markdown files
 * These functions are commented out but preserved for reference
 * ============================================================================
 */

// export function getSortedPostsData() {
//   // Get file names under /posts
//   const fileNames = fs.readdirSync(postsDirectory);
//   const allPostsData = fileNames.map((fileName) => {
//     // Remove ".md" from file name to get id
//     const id = fileName.replace(/\.md$/, '');
 
//     // Read markdown file as string
//     const fullPath = path.join(postsDirectory, fileName);
//     const fileContents = fs.readFileSync(fullPath, 'utf8');
 
//     // Use gray-matter to parse the post metadata section
//     const matterResult = matter(fileContents);
 
//     // Combine the data with the id
//     return {
//       id,
//       ...matterResult.data,
//     };
//   });
//   // Sort posts by date
//   return allPostsData.sort((a, b) => {
//     if (a.date < b.date) {
//       return 1;
//     } else {
//       return -1;
//     }
//   });
// }

// export function getAllPostIds() {
//   const fileNames = fs.readdirSync(postsDirectory);
 
//   // Returns an array that looks like this:
//   // [
//   //   {
//   //     params: {
//   //       id: 'ssg-ssr'
//   //     }
//   //   },
//   //   {
//   //     params: {
//   //       id: 'pre-rendering'
//   //     }
//   //   }
//   // ]
//   return fileNames.map((fileName) => {
//     return {
//       params: {
//         id: fileName.replace(/\.md$/, ''),
//       },
//     };
//   });
// }

// export async function getPostData(id) {
//   const fullPath = path.join(postsDirectory, `${id}.md`);
//   const fileContents = fs.readFileSync(fullPath, 'utf8');
 
//   // Use gray-matter to parse the post metadata section
//   const matterResult = matter(fileContents);
 
//   // Use remark to convert markdown into HTML string
//   const processedContent = await remark()
//     .use(html, { sanitize: false })
//     .process(matterResult.content);
//   const contentHtml = processedContent.toString();
 
//   // Combine the data with the id and contentHtml
//   return {
//     id,
//     contentHtml,
//     ...matterResult.data,
//   };
// }

/* 
 * ============================================================================
 * ACTIVE CODE - Functions for fetching data from WordPress REST API
 * ============================================================================
 */

/**
 * getSortedPostsData - Fetch and return all blog posts sorted alphabetically
 * 
 * This function retrieves all blog posts from the WordPress REST API,
 * sorts them alphabetically by title, and transforms the data into a
 * format suitable for the home page post list.
 * 
 * WordPress API Returns:
 * - ID: Post ID number
 * - post_title: Post title string
 * - post_date: Publication date in format "YYYY-MM-DD HH:MM:SS"
 * - post_content: Full HTML content
 * - plus many other WordPress fields
 * 
 * This Function Returns:
 * - id: Post ID as string
 * - title: Post title
 * - date: Publication date (WordPress format)
 * 
 * @returns {Promise<Array>} Array of post objects with id, title, and date
 *                           Returns empty array if API call fails
 */
export async function getSortedPostsData() {
  let jsonObj;
  try {
    // Use 'got' library to retrieve JSON data from WordPress REST API via HTTPS
    const response = await got(dataURL);
    
    // Parse the JSON response body into a JavaScript object
    jsonObj = JSON.parse(response.body);
    
    // Log the fetched data for debugging purposes
    console.log('Fetched posts data:', jsonObj);
  } catch(error) {
    // Log error if API call fails (network issue, API down, etc.)
    console.log('Error fetching posts:', error);
    
    // Return empty array so the site doesn't crash if WordPress API is unavailable
    return [];
  }

  // Sort games alphabetically by title (A to Z) using locale-aware comparison
  jsonObj.sort(function (a, b) {
      return a.title.rendered.localeCompare(b.title.rendered);
  });

  // Transform WordPress data format to our application's expected format
  // Map over each item and extract the fields we need
  return jsonObj.map(item => {
    // Universal date handling - works with full dates or just years
    const dateValue = item.acf?.release_date || item.post_date || item.date || '';
    
    return {
      id: item.slug,                        // Use slug for URL routing
      title: item.title.rendered,           // Title from WordPress
      date: dateValue,                      // Date (can be year, full date, or ISO date)
      developer: item.acf?.developer_name   // Developer name from ACF (if exists)
    }
  });
}

/**
 * getAllPostIds - Fetch all post IDs in Next.js dynamic route format
 * 
 * This function retrieves all blog post IDs from the WordPress REST API
 * and formats them for use with Next.js getStaticPaths(). The returned
 * format tells Next.js which dynamic routes to pre-generate at build time.
 * 
 * Next.js requires paths in this format:
 * [
 *   { params: { id: '1' } },
 *   { params: { id: '10' } },
 *   { params: { id: '8' } }
 * ]
 * 
 * This creates routes like:
 * - /posts/1
 * - /posts/10
 * - /posts/8
 * 
 * @returns {Promise<Array>} Array of path objects with params.id
 *                           Returns empty array if API call fails
 */
export async function getAllPostIds() {
  let jsonObj;
  try {
    // Use 'got' library to retrieve JSON data from WordPress REST API via HTTPS
    const response = await got(dataURL);
    
    // Parse the JSON response body into a JavaScript object
    jsonObj = JSON.parse(response.body);
    
    // Log the fetched post IDs for debugging purposes
    console.log('Fetched post IDs:', jsonObj);
  } catch(error) {
    // Log error if API call fails (network issue, API down, etc.)
    console.log('Error fetching post IDs:', error);
    
    // Return empty array so the build doesn't fail if WordPress API is unavailable
    // With fallback: 'blocking', pages can still be generated on-demand
    return [];
  }

  // Transform WordPress game data into Next.js path format
  // Extract the slug field and wrap it in the required structure
  return jsonObj.map(item => {
    return {
      params: {
        id: item.slug  // Use slug for URL parameter (e.g., "world-of-warcraft")
      }
    }
  });
}

/**
 * getPostData - Fetch complete data for a single blog post
 * 
 * This function retrieves all blog posts from WordPress, finds the one
 * matching the requested ID, and returns its complete data transformed
 * for display. This is used when rendering individual post pages.
 * 
 * @param {string} idRequested - The post ID to fetch (from URL parameter)
 * 
 * @returns {Promise<object>} Post object containing:
 *   - id: Post ID as string
 *   - title: Post title
 *   - date: Publication date
 *   - contentHtml: Full HTML content of the post
 * 
 * If API call fails, returns an error post object instead of crashing
 */
export async function getPostData(idRequested) {
  let jsonObj;
  try {
    // Use 'got' library to retrieve JSON data from WordPress REST API via HTTPS
    const response = await got(dataURL);
    
    // Parse the JSON response body into a JavaScript object
    jsonObj = JSON.parse(response.body);
    
    // Log the fetched post data for debugging purposes
    console.log('Fetched post data:', jsonObj);
  } catch(error) {
    // Log error if API call fails (network issue, API down, etc.)
    console.log('Error fetching post data:', error);
    
    // Return a fallback error post so the page doesn't crash
    // Uses current date/time in ISO format for consistency
    return {
      id: idRequested,
      title: 'Error loading post',
      date: new Date().toISOString(),
      contentHtml: '<p>Unable to load post content.</p>'
    };
  }

  // Find the specific game matching the requested slug
  // Filter returns an array, so we'll extract the first (and only) match
  const objMatch = jsonObj.filter(obj => {
    return obj.slug === idRequested;
  });

  // Extract the matched game object, or use empty object if no match found
  let objReturned;
  if (objMatch.length > 0) {
    objReturned = objMatch[0];  // Game was found
  } else {
    objReturned = {};            // Game slug doesn't exist
  }

  // Generate HTML content from ACF custom fields (if they exist) or use post content
  let contentHtml = '';
  if (objReturned.acf) {
    // Build HTML from ACF custom fields
    contentHtml = `
      <div class="game-details">
        <p><strong>Developer:</strong> ${objReturned.acf.developer_name || 'Unknown'}</p>
        <p><strong>Genre:</strong> ${objReturned.acf.genre || 'Not specified'}</p>
        <p><strong>Release Year:</strong> ${objReturned.acf.release_date || 'TBA'}</p>
      </div>
    `;
  } else if (objReturned.post_content || objReturned.content?.rendered) {
    // Fallback to standard WordPress post content if no ACF fields
    contentHtml = objReturned.post_content || objReturned.content?.rendered || '';
  }

  // Universal date handling - checks multiple possible date sources
  const dateValue = objReturned.acf?.release_date || objReturned.post_date || objReturned.date || '';

  // Transform WordPress data format to our application's expected format
  // Provide fallback empty strings if item wasn't found
  return {
    id: objReturned.slug || idRequested,              // Use slug for ID (fallback to requested)
    title: objReturned.title?.rendered || '',          // Title or empty string
    date: dateValue,                                   // Date (year, full date, or ISO date)
    contentHtml: contentHtml                           // Generated or retrieved HTML content
  };
}
