const getStyles = require('../styles/index');

/**
 * Generates the main track card SVG.
 * @param {object} params
 * @returns {string}
 */
function mainCard({ width, height, bgFill, borderRadius, padding, imageSize, url, imageBase64, headerText, headerColor, textColor, artistColor, safeTrack, safeArtist }) {
	const gap = 15;
	const startX = padding + imageSize + gap;
	const availableWidth = width - startX - padding;
	const waveWidth = availableWidth + 20; // Buffer

	let d = 'M -20 5';
	for (let i = -20; i < waveWidth; i += 20) {
		d += ' q 5 -6 10 0 t 10 0';
	}

	return `
	<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
		<defs>
			<clipPath id="wave-clip">
				<rect x="${-gap}" y="-10" width="${availableWidth + gap}" height="30" />
			</clipPath>
		</defs>
		<style>
			${getStyles('default')}
			.bg { fill: ${bgFill}; }
			.header { fill: ${headerColor}; }
			.track { fill: ${textColor}; }
			.artist { fill: ${artistColor}; }
			.wave { stroke: ${headerColor}; }
		</style>
		<rect width="${width}" height="${height}" rx="${borderRadius}" class="bg" />
		
		<a xlink:href="${url}" target="_blank">
			${imageBase64 ? `<image x="${padding}" y="${padding}" width="${imageSize}" height="${imageSize}" xlink:href="${imageBase64}" rx="4" />` : ''}
			
			<g transform="translate(${startX}, ${padding + 15})">
				<text x="0" y="0" class="header">${headerText}</text>
				<text x="0" y="25" class="track">${safeTrack}</text>
				<text x="0" y="48" class="artist">${safeArtist}</text>
				
				<g transform="translate(0, 60)" clip-path="url(#wave-clip)">
					<path class="wave" d="${d}" />
				</g>
			</g>
		</a>
	</svg>`;
}

module.exports = mainCard;

module.exports = mainCard;
