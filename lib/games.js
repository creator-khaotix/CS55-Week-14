/**
 * WORDPRESS GAMES API DATA FETCHING LIBRARY (games.js)
 * 
 * Purpose: This module handles all data fetching operations from the WordPress REST API
 * for the 'game' custom post type. It provides three main functions to retrieve and 
 * transform WordPress game data for use in the Next.js application.
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
 * - getSortedGamesData() - Returns array of all games with id, title, date, and optional fields
 * - getAllGameIds() - Returns array of slugs in Next.js path format
 * - getGameData(id) - Returns full data for a specific game by slug
 */

import got from 'got';

// WordPress REST API endpoint URL that returns game data with ACF custom fields in JSON format
// ?_embed parameter includes featured image data in the response
const dataURL = "https://dev-cs-55-week-11.pantheonsite.io/wp-json/wp/v2/game?_embed";

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
 * getSortedGamesData - Fetch and return all games sorted alphabetically
 * 
 * This function retrieves all games from the WordPress REST API,
 * sorts them alphabetically by title, and transforms the data into a
 * format suitable for the home page game list.
 * 
 * @returns {Promise<Array>} Array of game objects with id, title, date, and developer
 *                           Returns empty array if API call fails
 */
export async function getSortedGamesData() {
  let jsonObj;
  try {
    const response = await got(dataURL);
    jsonObj = JSON.parse(response.body);
    console.log('Fetched games data:', jsonObj);
  } catch(error) {
    console.log('Error fetching games:', error);
    return [];
  }

  // Sort games alphabetically by title (A to Z)
  jsonObj.sort(function (a, b) {
      return a.title.rendered.localeCompare(b.title.rendered);
  });

  // Transform WordPress data format to our application's expected format
  return jsonObj.map(item => {
    const dateValue = item.acf?.release_date || item.post_date || item.date || '';
    
    return {
      id: item.slug,
      title: decodeHtmlEntities(item.title.rendered),
      date: dateValue,
      developer: item.acf?.developer_name
    }
  });
}

/**
 * getAllGameIds - Fetch all game IDs in Next.js dynamic route format
 * 
 * This function retrieves all game IDs from the WordPress REST API
 * and formats them for use with Next.js getStaticPaths().
 * 
 * @returns {Promise<Array>} Array of path objects with params.id
 *                           Returns empty array if API call fails
 */
export async function getAllGameIds() {
  let jsonObj;
  try {
    const response = await got(dataURL);
    jsonObj = JSON.parse(response.body);
    console.log('Fetched game IDs:', jsonObj);
  } catch(error) {
    console.log('Error fetching game IDs:', error);
    return [];
  }

  // Transform WordPress game data into Next.js path format
  return jsonObj.map(item => {
    return {
      params: {
        id: item.slug
      }
    }
  });
}

/**
 * getGameData - Fetch complete data for a single game
 * 
 * This function retrieves all games from WordPress, finds the one
 * matching the requested ID, and returns its complete data transformed
 * for display.
 * 
 * @param {string} idRequested - The game slug to fetch (from URL parameter)
 * 
 * @returns {Promise<object>} Game object containing id, title, date, and contentHtml
 */
export async function getGameData(idRequested) {
  let jsonObj;
  try {
    const response = await got(dataURL);
    jsonObj = JSON.parse(response.body);
    console.log('Fetched game data:', jsonObj);
  } catch(error) {
    console.log('Error fetching game data:', error);
    return {
      id: idRequested,
      title: 'Error loading game',
      date: new Date().toISOString(),
      contentHtml: '<p>Unable to load game content.</p>'
    };
  }

  // Find the specific game matching the requested slug
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
      <div class="game-details">
        <p><strong>Developer:</strong> ${objReturned.acf.developer_name || 'Unknown'}</p>
        <p><strong>Genre:</strong> ${objReturned.acf.genre || 'Not specified'}</p>
        <p><strong>Release Year:</strong> ${objReturned.acf.release_date || 'TBA'}</p>
      </div>
    `;
    // Add post content if it exists
    if (objReturned.content?.rendered) {
      contentHtml += objReturned.content.rendered;
    }
  } else if (objReturned.content?.rendered) {
    contentHtml = objReturned.content.rendered;
  }

  const dateValue = objReturned.acf?.release_date || objReturned.post_date || objReturned.date || '';

  return {
    id: objReturned.slug || idRequested,
    title: decodeHtmlEntities(objReturned.title?.rendered || ''),
    date: dateValue,
    contentHtml: contentHtml,
    imageUrl: imageUrl
  };
}

