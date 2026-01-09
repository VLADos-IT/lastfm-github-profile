const { client, isValidUsername, upgradeImage } = require('./utils');
const { parseObsession, parseTopTrack, parseObsessionPage } = require('./parsers/index');

const API_KEY = process.env.LASTFM_API_KEY;

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
 * @param {string} range - 'all' | '7day' | '1month' | '3month' | '6month' | '12month'
 * @returns {Promise<{track: string, artist: string, image: string, url: string, type: 'obsession'|'recent'}>}
 */
async function fetchLastFmData(user, mode = 'smart', range = 'all') {
	if (!isValidUsername(user)) {
		throw new Error('Invalid username');
	}

	// Range support (API)
	if (range && range !== 'all') {
		if (!API_KEY) {
			throw new Error('LASTFM_API_KEY_MISSING');
		}
		
		try {
			const response = await client.get(`https://ws.audioscrobbler.com/2.0/`, {
				params: {
					method: 'user.gettoptracks',
					user,
					period: range,
					api_key: API_KEY,
					format: 'json',
					limit: 1
				}
			});
	
			const track = response.data?.toptracks?.track?.[0];
			if (!track) return null;
	
			return {
				track: track.name,
				artist: track.artist.name,
				image: upgradeImage(track.image?.find(img => img.size === 'extralarge')?.['#text'] || ''),
				url: track.url,
				type: 'top_track'
			};
	
		} catch (e) {
			console.error('API Error:', e.message);
			throw e;
		}
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
