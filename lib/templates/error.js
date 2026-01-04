const getStyles = require('../styles/index');

/**
 * Generates an error or empty state SVG.
 * @param {object} params
 * @returns {string}
 */
function errorCard({ width, height, bgFill, message }) {
	return `
	<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
		<style>
			${getStyles('default')}
			.bg { fill: ${bgFill}; }
		</style>
		<rect width="100%" height="100%" class="bg" rx="12" />
		<text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" class="error-text">
			${message}
		</text>
	</svg>`;
}

module.exports = errorCard;
