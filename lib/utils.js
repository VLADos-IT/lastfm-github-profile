const axios = require('axios');

const USER_AGENT = 'Mozilla/5.0 (compatible; LastFmObsession/1.0; +https://github.com/VLADos-IT/lastfm-github-profile)';

const client = axios.create({
	headers: {
		'User-Agent': USER_AGENT,
		'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8'
	}
});

/**
 * Escapes special characters for XML/SVG.
 * @param {string} unsafe 
 * @returns {string}
 */
function escapeXml(unsafe) {
	if (!unsafe) return '';
	return unsafe.replace(/[<>&'"]/g, (c) => {
		switch (c) {
			case '<': return '&lt;';
			case '>': return '&gt;';
			case '&': return '&amp;';
			case '\'': return '&apos;';
			case '"': return '&quot;';
		}
	});
}

/**
 * Truncates text with ellipsis if it exceeds a certain length.
 * @param {string} text 
 * @param {number} maxLength 
 * @returns {string}
 */
function truncate(text, maxLength) {
	if (!text) return '';
	if (text.length <= maxLength) return text;
	return text.substring(0, maxLength - 1) + '…';
}

/**
 * Fetches an image and converts it to a Base64 data URI.
 * @param {string} url 
 * @returns {Promise<string>}
 */
async function fetchImageAsBase64(url) {
	if (!url) return '';
	try {
		const response = await client.get(url, { responseType: 'arraybuffer' });
		const buffer = Buffer.from(response.data, 'binary');
		const contentType = response.headers['content-type'];
		return `data:${contentType};base64,${buffer.toString('base64')}`;
	} catch (e) {
		console.error('Failed to fetch image:', url, e.message);
		return '';
	}
}

/**
 * Helper to extract image URL from HTML content.
 * Searches for <img src="..."> in a given window or specific class.
 * @param {string} html 
 * @param {number} endIndex 
 * @returns {string}
 */
function findImageBeforeIndex(html, endIndex) {
	if (endIndex === -1) return '';
	const searchWindow = html.substring(Math.max(0, endIndex - 1500), endIndex);

	// Try src
	const imgMatches = [...searchWindow.matchAll(/<img[^>]+src="([^"]+)"/g)];
	if (imgMatches.length > 0) return imgMatches[imgMatches.length - 1][1];

	// Try data-src
	const dataSrcMatches = [...searchWindow.matchAll(/<img[^>]+data-src="([^"]+)"/g)];
	if (dataSrcMatches.length > 0) return dataSrcMatches[dataSrcMatches.length - 1][1];

	return '';
}

/**
 * Upgrades Last.fm image URL to higher resolution.
 * @param {string} url 
 * @returns {string}
 */
function upgradeImage(url) {
	if (!url) return '';
	if (url.includes('/u/')) {
		return url.replace(/\/u\/[a-zA-Z0-9]+\//, '/u/300x300/');
	}
	return url.replace('/64s/', '/300s/');
}

/**
 * Determines if a hex color is light or dark.
 * @param {string} hex 
 * @returns {boolean}
 */
function isLightColor(hex) {
	if (!hex || hex === 'transparent') return false;
	// Remove hash if present
	hex = hex.replace('#', '');

	// Parse RGB
	const r = parseInt(hex.substr(0, 2), 16);
	const g = parseInt(hex.substr(2, 2), 16);
	const b = parseInt(hex.substr(4, 2), 16);

	// Calculate brightness (YIQ formula)
	const brightness = ((r * 299) + (g * 587) + (b * 114)) / 1000;
	return brightness > 128;
}

/**
 * Validates Last.fm username.
 * @param {string} user
 * @returns {boolean}
 */
function isValidUsername(user) {
	return /^[a-zA-Z0-9_-]+$/.test(user);
}

module.exports = {
	client,
	escapeXml,
	fetchImageAsBase64,
	findImageBeforeIndex,
	upgradeImage,
	isLightColor,
	truncate,
	isValidUsername
};
