const { escapeXml, isLightColor, truncate } = require('./utils');
const mainCard = require('./templates/card');

/**
 * SVG Generator
 * @author VLADos-IT <https://github.com/VLADos-IT>
 */

/**
 * Generates the SVG card.
 * @param {object} data - Track data
 * @param {object} options - Display options
 * @returns {string} SVG string
 */
function generateSvg(data, options) {
	const { track, artist, imageBase64, url, type } = data;
	const { width, bg } = options;

	const height = 120;
	const padding = 15;
	const imageSize = 90;
	const borderRadius = 12;

	// Determine Header Text and Color
	const isObsession = type === 'obsession';
	let headerText = isObsession ? 'LAST.FM OBSESSION' : 'LAST.FM TOP TRACK';
	const headerColor = '#d1170e';

	if (parseInt(width) < 280) {
		headerText = isObsession ? 'OBSESSION' : 'TOP TRACK';
	}

	// Handle background transparency and text contrast
	const bgFill = bg === 'transparent' ? 'none' : `#${bg}`;
	// Default to dark text for transparent background
	const isLight = bg === 'transparent' ? true : isLightColor(bg);

	const textColor = isLight ? '#000000' : '#ffffff';
	const artistColor = isLight ? '#4a4a4a' : '#b3b3b3';

	// Calculate available width for text
	const gap = 15;
	const startX = padding + imageSize + gap;
	const availableWidth = width - startX - padding;

	// Estimate max chars
	const maxTrackChars = Math.floor(availableWidth / 9.5);
	const maxArtistChars = Math.floor(availableWidth / 8.5);

	return mainCard({
		width,
		height,
		bgFill,
		borderRadius,
		padding,
		imageSize,
		url,
		imageBase64,
		headerText,
		headerColor,
		textColor,
		artistColor,
		safeTrack: escapeXml(truncate(track, maxTrackChars)),
		safeArtist: escapeXml(truncate(artist, maxArtistChars))
	});
}

module.exports = { generateSvg };
