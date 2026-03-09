const fs = require('fs');
const path = require('path');
const defaultCard = require('./default');

const templates = new Map();
templates.set('default', defaultCard);

// Dynamically load all templates from directory
try {
	const files = fs.readdirSync(__dirname);
	files.forEach(file => {
		if (file.endsWith('.js') && file !== 'card.js' && file !== 'error.js' && file !== 'default.js') {
			const themeName = file.replace('.js', '');
			try {
				templates.set(themeName, require(`./${file}`));
			} catch (err) {
				console.error(`Failed to load template ${themeName}:`, err);
			}
		}
	});
} catch (e) {
	console.error('Error loading templates:', e);
}

function renderTinyCard({ width, height, bgFill, borderRadius, url, imageBase64 }) {
	const numericWidth = parseInt(width, 10);
	const inset = 10;
	const coverSize = Math.max(58, numericWidth - (inset * 2));
	const coverX = Math.floor((numericWidth - coverSize) / 2);
	const coverY = Math.floor((height - coverSize) / 2);

	return `
	<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
		<rect width="${width}" height="${height}" rx="${borderRadius}" fill="${bgFill}" />
		<a xlink:href="${url}" target="_blank">
			${imageBase64 ? `<image x="${coverX}" y="${coverY}" width="${coverSize}" height="${coverSize}" xlink:href="${imageBase64}" rx="10" />` : ''}
		</a>
	</svg>`;
}

/**
 * Dispatcher for selecting the card template based on theme.
 * @param {object} params - Parameters for the card, including 'theme'.
 * @returns {string} SVG string
 */
function cardDispatcher(params) {
	let theme = params.theme;
	const numericWidth = parseInt(params.width, 10);

	// Security: Validate theme name to allow only alphanumeric characters, dashes and underscores
	if (!theme || typeof theme !== 'string' || !/^[a-zA-Z0-9_-]+$/.test(theme)) {
		theme = 'default';
	}

	if (!templates.has(theme)) {
		theme = 'default';
	}

	let template = templates.get(theme);

	if (typeof template !== 'function') {
		console.error(`Theme '${theme}' did not resolve to a function. Falling back. Template value: ${template}`);
		template = templates.get('default');
	}

	if (typeof template !== 'function') {
		throw new Error('Default template is not a function');
	}

	if (numericWidth === 120 && theme !== 'compact') {
		return renderTinyCard({
			width: params.width,
			height: params.height,
			bgFill: params.bgFill,
			borderRadius: params.borderRadius,
			url: params.url,
			imageBase64: params.imageBase64
		});
	}

	return template(params);
}

module.exports = cardDispatcher;
