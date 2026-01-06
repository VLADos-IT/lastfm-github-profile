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

/**
 * Dispatcher for selecting the card template based on theme.
 * @param {object} params - Parameters for the card, including 'theme'.
 * @returns {string} SVG string
 */
function cardDispatcher(params) {
	let theme = params.theme;

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

	return template(params);
}

module.exports = cardDispatcher;
