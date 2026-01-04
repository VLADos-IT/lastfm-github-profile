const { upgradeImage } = require('../utils');

/**
 * Parses Top Track (Recent Track) data from Last.fm Library HTML.
 * @param {string} html 
 * @param {string} defaultUrl 
 * @returns {object|null}
 */
function parseTopTrack(html, defaultUrl) {
	// We expect Library page HTML, so we look for the first chartlist-row
	const rowStartIndex = html.indexOf('chartlist-row');
	if (rowStartIndex === -1) return null;

	const rowEndIndex = html.indexOf('</tr>', rowStartIndex);
	if (rowEndIndex === -1) return null;

	const rowHtml = html.substring(rowStartIndex, rowEndIndex);

	const getAttr = (name) => {
		const match = rowHtml.match(new RegExp(`data-${name}=["']([^"']+)["']`));
		return match ? match[1] : null;
	};

	let trackName = getAttr('track-name');
	let artistName = getAttr('artist-name');

	// Text fallback if data attributes are missing
	if (!trackName) {
		const m = rowHtml.match(/class="chartlist-name"[\s\S]*?<a[^>]*>([\s\S]*?)<\/a>/);
		if (m) trackName = m[1].trim();
	}

	if (!artistName) {
		const m = rowHtml.match(/class="chartlist-artist"[\s\S]*?<a[^>]*>([\s\S]*?)<\/a>/);
		if (m) artistName = m[1].trim();
	}

	trackName = trackName || 'Unknown Track';
	artistName = artistName || 'Unknown Artist';

	// Prefer href from the anchor tag as it's the most reliable URL
	let trackUrl = defaultUrl;
	const hrefMatch = rowHtml.match(/class="chartlist-name"[\s\S]*?<a href="([^"]*)"/);
	if (hrefMatch) {
		trackUrl = `https://www.last.fm${hrefMatch[1]}`;
	} else {
		// Fallback to data attribute
		const dataUrl = getAttr('track-url');
		if (dataUrl) trackUrl = `https://www.last.fm${dataUrl}`;
	}

	let imageUrl = '';
	const imgMatch = rowHtml.match(/<img[^>]*src="([^"]+)"/);
	if (imgMatch) imageUrl = imgMatch[1];
	else {
		const dataSrc = rowHtml.match(/<img[^>]*data-src="([^"]+)"/);
		if (dataSrc) imageUrl = dataSrc[1];
	}

	return {
		track: trackName,
		artist: artistName,
		image: upgradeImage(imageUrl),
		url: trackUrl,
		type: 'top_track'
	};
}

module.exports = {
	parseTopTrack
};
