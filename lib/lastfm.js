const { client, isValidUsername } = require('./utils');
const { parseObsession } = require('./parsers/index');
const { fetchObsessionOnly } = require('./fetchers/obsession');
const { fetchTopTrackOnly } = require('./fetchers/top');
const { fetchRecentTrack } = require('./fetchers/recent');
const { fetchTopTracksApi } = require('./fetchers/top-range');

/**
 * Data fetcher for Last.fm
 * @author VLADos-IT <https://github.com/VLADos-IT>
 */

/**
 * Fetches and parses Last.fm data.
 * @param {string} user - Last.fm username
 * @param {string} mode - 'smart' | 'obsession' | 'top' | 'recent'
 * @param {string} range - 'all' | '7day' | '1month' | '3month' | '6month' | '12month'
 * @returns {Promise<{track: string, artist: string, image: string, url: string, type: 'obsession'|'recent'}>}
 */
async function fetchLastFmData(user, mode = 'smart', range = 'all') {
	if (!isValidUsername(user)) {
		throw new Error('Invalid username');
	}

	// Range support (API)
	if (range && range !== 'all') {
		return fetchTopTracksApi(user, range);
	}

	if (mode === 'top') {
		return fetchTopTrackOnly(user);
	}

	if (mode === 'recent') {
		return fetchRecentTrack(user);
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
