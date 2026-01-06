const getStyles = require('../styles/index');

/**
 * Generates the retro track card SVG.
 * @param {object} params
 * @returns {string}
 */
function retroCard({ width, height, bgFill, imageSize, url, imageBase64, headerText, headerColor, textColor, artistColor, safeTrack, safeArtist }) {
	const padding = 10;
	const gap = 10;
	const startX = padding + imageSize + gap;

	const availableWidth = width - startX - padding;
	const waveWidth = availableWidth + 20;

	let d = 'M -20 0';
	for (let i = -20; i < waveWidth; i += 20) {
		d += ' h 10 v -4 h 10 v 4';
	}

	return `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
        <defs>
            <clipPath id="retro-clip">
                <rect x="0" y="-10" width="${availableWidth}" height="20" />
            </clipPath>
            <pattern id="pixel-pattern" x="0" y="0" width="4" height="4" patternUnits="userSpaceOnUse">
                <rect x="0" y="0" width="2" height="2" fill="#000000" fill-opacity="0.05"/>
                <rect x="2" y="2" width="2" height="2" fill="#000000" fill-opacity="0.05"/>
            </pattern>
        </defs>
        <style>
            ${getStyles('retro')}
            .bg { fill: ${bgFill}; }
            .header { fill: ${headerColor}; }
            .track { fill: ${textColor}; }
            .artist { fill: ${artistColor}; }
        </style>

        <rect width="${width}" height="${height}" class="bg" />
        <rect width="${width}" height="${height}" fill="url(#pixel-pattern)" />

        <rect x="0" y="0" width="${width}" height="2" fill="#ffffff" />
        <rect x="0" y="0" width="2" height="${height}" fill="#ffffff" />
        <rect x="0" y="${height - 2}" width="${width}" height="2" fill="#808080" />
        <rect x="${width - 2}" y="0" width="2" height="${height}" fill="#808080" />
        
        <rect x="2" y="2" width="${width - 4}" height="${height - 4}" fill="none" stroke="#dfdfdf" stroke-width="0" />

        <a xlink:href="${url}" target="_blank">
            ${imageBase64 ? `
            <g transform="translate(${padding}, ${padding})">
                <rect x="-2" y="-2" width="${imageSize + 4}" height="${imageSize + 4}" fill="none" stroke="#808080" stroke-width="2" />
                <image width="${imageSize}" height="${imageSize}" xlink:href="${imageBase64}" style="image-rendering: pixelated;" />
            </g>` : ''}
            
            <g transform="translate(${startX}, ${padding + 15})">
                <text x="0" y="0" class="header">${headerText}</text>
                <text x="0" y="25" class="track">${safeTrack}</text>
                <text x="0" y="48" class="artist">${safeArtist}</text>
                
                <g transform="translate(0, 65)" clip-path="url(#retro-clip)">
                    <path d="${d}" stroke="${headerColor}" stroke-width="2" class="retro-wave" />
                </g>
            </g>
        </a>
    </svg>`;
}

module.exports = retroCard;
