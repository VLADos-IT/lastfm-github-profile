const { client, isValidUsername } = require('./utils');
const { parseObsession, parseTopTrack, parseObsessionPage } = require('./parsers/index');

/**
 * Data fetcher for Last.fm
 * @author VLADos-IT <https://github.com/VLADos-IT>
 */

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

/**
 * Fetches Top Track from the library page.
 * @param {string} user 
 */
async function fetchTopTrackOnly(user) {
	if (!isValidUsername(user)) {
		console.error('Invalid username:', user);
		return null;
	}
	try {
		// Fetching top tracks from library
		const url = `https://www.last.fm/user/${encodeURIComponent(user)}/library/tracks`;
		const { data: html } = await client.get(url);
		return parseTopTrack(html, url);
	} catch (e) {
		console.error('Error fetching library page:', e.message);
		return null;
	}
}

/**
 * Fetches and parses Last.fm data.
 * @param {string} user - Last.fm username
 * @param {string} mode - 'smart' | 'obsession' | 'top'
 * @returns {Promise<{track: string, artist: string, image: string, url: string, type: 'obsession'|'recent'}>}
 */
async function fetchLastFmData(user, mode = 'smart') {
	if (!isValidUsername(user)) {
		throw new Error('Invalid username');
	}

	if (mode === 'top') {
		return fetchTopTrackOnly(user);
	}

	const url = `https://www.last.fm/user/${encodeURIComponent(user)}`;

	try {
		const { data: html } = await client.get(url);

		// Try to find Obsession on the main profile page
		let obsession = parseObsession(html, url);

		if (obsession && !obsession.image) {
			const obsData = await fetchObsessionOnly(user);
			if (obsData) obsession.image = obsData.image;
		}

		if (mode === 'obsession') {
			return obsession;
		}

		// Smart mode
		if (obsession) return obsession;

		return fetchTopTrackOnly(user);

	} catch (error) {
		console.error('Error fetching Last.fm data:', error.message);
		throw error;
	}
}

module.exports = { fetchLastFmData };
