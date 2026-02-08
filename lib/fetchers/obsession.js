const { client, isValidUsername } = require('../utils');
const { parseObsessionPage } = require('../parsers/index');

/**
 * Fetches obsession directly from the obsessions page.
 * @param {string} user 
 */
async function fetchObsessionOnly(user) {
	if (!isValidUsername(user)) {
		console.error('Invalid username:', user);
		return null;
	}
	try {
		const { data: html } = await client.get(`https://www.last.fm/user/${encodeURIComponent(user)}/obsessions`);
		return parseObsessionPage(html, `https://www.last.fm/user/${encodeURIComponent(user)}/obsessions`);
	} catch (e) {
		console.error('Error fetching obsession page:', e.message);
		return null;
	}
}

module.exports = { fetchObsessionOnly };
