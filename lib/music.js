/**
 * WORDPRESS MUSIC API DATA FETCHING LIBRARY (music.js)
 * 
 * Purpose: This module handles all data fetching operations from the WordPress REST API
 * for the 'music' custom post type. It provides three main functions to retrieve and 
 * transform WordPress music data for use in the Next.js application.
 * 
 * Key Features:
 * - Fetches data from WordPress REST API using 'got' library
 * - Transforms WordPress data format to match Next.js requirements
 * - Sorts items alphabetically by title
 * - Provides error handling with fallback data
 * 
 * API Endpoint: https://dev-cs-55-week-11.pantheonsite.io/wp-json/wp/v2/music
 * 
 * Exported Functions:
 * - getSortedMusicData() - Returns array of all music with id, title, date, and optional fields
 * - getAllMusicIds() - Returns array of slugs in Next.js path format
 * - getMusicData(id) - Returns full data for a specific music item by slug
 */

import got from 'got';

// WordPress REST API endpoint URL that returns music data with ACF custom fields in JSON format
// ?_embed parameter includes featured image data in the response
const dataURL = "https://dev-cs-55-week-11.pantheonsite.io/wp-json/wp/v2/music?_embed";

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
 * getSortedMusicData - Fetch and return all music sorted alphabetically
 * 
 * This function retrieves all music from the WordPress REST API,
 * sorts them alphabetically by title, and transforms the data into a
 * format suitable for the home page music list.
 * 
 * @returns {Promise<Array>} Array of music objects with id, title, genre, and favorite_album
 *                           Returns empty array if API call fails
 */
export async function getSortedMusicData() {
  let jsonObj;
  try {
    const response = await got(dataURL);
    jsonObj = JSON.parse(response.body);
    console.log('Fetched music data:', jsonObj);
  } catch(error) {
    console.log('Error fetching music:', error);
    return [];
  }

  // Sort music alphabetically by title (A to Z)
  jsonObj.sort(function (a, b) {
      return a.title.rendered.localeCompare(b.title.rendered);
  });

  // Transform WordPress data format to our application's expected format
  return jsonObj.map(item => {
    return {
      id: item.slug,
      title: decodeHtmlEntities(item.title.rendered),
      genre: item.acf?.genre,
      favoriteAlbum: item.acf?.favorite_album
    }
  });
}

/**
 * getAllMusicIds - Fetch all music IDs in Next.js dynamic route format
 * 
 * This function retrieves all music IDs from the WordPress REST API
 * and formats them for use with Next.js getStaticPaths().
 * 
 * @returns {Promise<Array>} Array of path objects with params.id
 *                           Returns empty array if API call fails
 */
export async function getAllMusicIds() {
  let jsonObj;
  try {
    const response = await got(dataURL);
    jsonObj = JSON.parse(response.body);
    console.log('Fetched music IDs:', jsonObj);
  } catch(error) {
    console.log('Error fetching music IDs:', error);
    return [];
  }

  // Transform WordPress music data into Next.js path format
  return jsonObj.map(item => {
    return {
      params: {
        id: item.slug
      }
    }
  });
}

/**
 * getMusicData - Fetch complete data for a single music item
 * 
 * This function retrieves all music from WordPress, finds the one
 * matching the requested ID, and returns its complete data transformed
 * for display.
 * 
 * @param {string} idRequested - The music slug to fetch (from URL parameter)
 * 
 * @returns {Promise<object>} Music object containing id, title, and contentHtml
 */
export async function getMusicData(idRequested) {
  let jsonObj;
  try {
    const response = await got(dataURL);
    jsonObj = JSON.parse(response.body);
    console.log('Fetched music data:', jsonObj);
  } catch(error) {
    console.log('Error fetching music data:', error);
    return {
      id: idRequested,
      title: 'Error loading music',
      contentHtml: '<p>Unable to load music content.</p>'
    };
  }

  // Find the specific music matching the requested slug
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
      <div class="music-details">
        <p><strong>Favorite Album:</strong> ${objReturned.acf.favorite_album || 'Not specified'}</p>
        <p><strong>Genre:</strong> ${objReturned.acf.genre || 'Not specified'}</p>
        <p><strong>Label:</strong> ${objReturned.acf.label || 'Unknown'}</p>
      </div>
    `;
    // Add post content if it exists
    if (objReturned.content?.rendered) {
      contentHtml += objReturned.content.rendered;
    }
  } else if (objReturned.content?.rendered) {
    contentHtml = objReturned.content.rendered;
  }

  return {
    id: objReturned.slug || idRequested,
    title: decodeHtmlEntities(objReturned.title?.rendered || ''),
    contentHtml: contentHtml,
    imageUrl: imageUrl
  };
}

