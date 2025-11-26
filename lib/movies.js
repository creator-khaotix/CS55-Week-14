/**
 * WORDPRESS MOVIES API DATA FETCHING LIBRARY (movies.js)
 * 
 * Purpose: This module handles all data fetching operations from the WordPress REST API
 * for the 'movie' custom post type. It provides three main functions to retrieve and 
 * transform WordPress movie data for use in the Next.js application.
 * 
 * Key Features:
 * - Fetches data from WordPress REST API using 'got' library
 * - Transforms WordPress data format to match Next.js requirements
 * - Sorts items alphabetically by title
 * - Provides error handling with fallback data
 * 
 * API Endpoint: https://dev-cs-55-week-11.pantheonsite.io/wp-json/wp/v2/movie
 * 
 * Exported Functions:
 * - getSortedMoviesData() - Returns array of all movies with id, title, date, and optional fields
 * - getAllMovieIds() - Returns array of slugs in Next.js path format
 * - getMovieData(id) - Returns full data for a specific movie by slug
 */

import got from 'got';

// WordPress REST API endpoint URL that returns movie data with ACF custom fields in JSON format
// ?_embed parameter includes featured image data in the response
const dataURL = "https://dev-cs-55-week-11.pantheonsite.io/wp-json/wp/v2/movie?_embed";

/**
 * decodeHtmlEntities - Decode HTML entities in strings
 * 
 * WordPress returns titles with HTML-encoded characters like &#039; for apostrophes.
 * This function decodes them back to normal characters.
 * 
 * @param {string} text - Text with HTML entities
 * @returns {string} Decoded text
 */
function decodeHtmlEntities(text) {
  const entities = {
    '&#039;': "'",
    '&apos;': "'",
    '&quot;': '"',
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&#8217;': "'", // Right single quotation mark
    '&#8216;': "'", // Left single quotation mark
  };
  
  let decoded = text;
  for (const [entity, char] of Object.entries(entities)) {
    decoded = decoded.replace(new RegExp(entity, 'g'), char);
  }
  return decoded;
}

/**
 * getSortedMoviesData - Fetch and return all movies sorted alphabetically
 * 
 * This function retrieves all movies from the WordPress REST API,
 * sorts them alphabetically by title, and transforms the data into a
 * format suitable for the home page movie list.
 * 
 * @returns {Promise<Array>} Array of movie objects with id, title, date, and director
 *                           Returns empty array if API call fails
 */
export async function getSortedMoviesData() {
  let jsonObj;
  try {
    const response = await got(dataURL);
    jsonObj = JSON.parse(response.body);
    console.log('Fetched movies data:', jsonObj);
  } catch(error) {
    console.log('Error fetching movies:', error);
    return [];
  }

  // Sort movies alphabetically by title (A to Z)
  jsonObj.sort(function (a, b) {
      return a.title.rendered.localeCompare(b.title.rendered);
  });

  // Transform WordPress data format to our application's expected format
  return jsonObj.map(item => {
    const dateValue = item.acf?.release_year || item.post_date || item.date || '';
    
    return {
      id: item.slug,
      title: decodeHtmlEntities(item.title.rendered),
      date: dateValue,
      director: item.acf?.director
    }
  });
}

/**
 * getAllMovieIds - Fetch all movie IDs in Next.js dynamic route format
 * 
 * This function retrieves all movie IDs from the WordPress REST API
 * and formats them for use with Next.js getStaticPaths().
 * 
 * @returns {Promise<Array>} Array of path objects with params.id
 *                           Returns empty array if API call fails
 */
export async function getAllMovieIds() {
  let jsonObj;
  try {
    const response = await got(dataURL);
    jsonObj = JSON.parse(response.body);
    console.log('Fetched movie IDs:', jsonObj);
  } catch(error) {
    console.log('Error fetching movie IDs:', error);
    return [];
  }

  // Transform WordPress movie data into Next.js path format
  return jsonObj.map(item => {
    return {
      params: {
        id: item.slug
      }
    }
  });
}

/**
 * getMovieData - Fetch complete data for a single movie
 * 
 * This function retrieves all movies from WordPress, finds the one
 * matching the requested ID, and returns its complete data transformed
 * for display.
 * 
 * @param {string} idRequested - The movie slug to fetch (from URL parameter)
 * 
 * @returns {Promise<object>} Movie object containing id, title, date, and contentHtml
 */
export async function getMovieData(idRequested) {
  let jsonObj;
  try {
    const response = await got(dataURL);
    jsonObj = JSON.parse(response.body);
    console.log('Fetched movie data:', jsonObj);
  } catch(error) {
    console.log('Error fetching movie data:', error);
    return {
      id: idRequested,
      title: 'Error loading movie',
      date: new Date().toISOString(),
      contentHtml: '<p>Unable to load movie content.</p>'
    };
  }

  // Find the specific movie matching the requested slug
  const objMatch = jsonObj.filter(obj => {
    return obj.slug === idRequested;
  });

  let objReturned;
  if (objMatch.length > 0) {
    objReturned = objMatch[0];
  } else {
    objReturned = {};
  }

  // Extract WordPress Featured Image URL from embedded media data
  let imageUrl = '';
  
  // WordPress REST API with ?_embed includes featured image in _embedded
  if (objReturned._embedded && objReturned._embedded['wp:featuredmedia']) {
    const featuredMedia = objReturned._embedded['wp:featuredmedia'][0];
    
    // Get the largest available image size
    if (featuredMedia.media_details?.sizes?.full) {
      imageUrl = featuredMedia.media_details.sizes.full.source_url;
    } else if (featuredMedia.media_details?.sizes?.large) {
      imageUrl = featuredMedia.media_details.sizes.large.source_url;
    } else if (featuredMedia.source_url) {
      imageUrl = featuredMedia.source_url;
    }
  }

  // Generate HTML content from ACF custom fields
  let contentHtml = '';
  if (objReturned.acf) {
    contentHtml = `
      <div class="movie-details">
        <p><strong>Director:</strong> ${objReturned.acf.director || 'Unknown'}</p>
        <p><strong>Genre:</strong> ${objReturned.acf.genre || 'Not specified'}</p>
        <p><strong>Release Year:</strong> ${objReturned.acf.release_year || 'TBA'}</p>
      </div>
    `;
    // Add post content if it exists
    if (objReturned.content?.rendered) {
      contentHtml += objReturned.content.rendered;
    }
  } else if (objReturned.content?.rendered) {
    contentHtml = objReturned.content.rendered;
  }

  const dateValue = objReturned.acf?.release_year || objReturned.post_date || objReturned.date || '';

  return {
    id: objReturned.slug || idRequested,
    title: decodeHtmlEntities(objReturned.title?.rendered || ''),
    date: dateValue,
    contentHtml: contentHtml,
    imageUrl: imageUrl
  };
}

