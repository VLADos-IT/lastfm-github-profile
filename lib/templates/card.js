const fs = require('fs');
const path = require('path');
const defaultTemplate = require('./default');

const templates = new Map();
templates.set('default', defaultTemplate);

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

function normalizeTemplate(template) {
	return (typeof template === 'function') ? { render: template } : template;
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

	let templateObj = normalizeTemplate(templates.get(theme));
	const defaultObj = normalizeTemplate(templates.get('default'));
	if (!templateObj || !templateObj.render) templateObj = defaultObj;
	if (!templateObj || !templateObj.render) throw new Error('Default template is not a function');

	if (theme !== 'compact' && numericWidth < 190) {
		if (numericWidth === 120) {
			const tiny = templateObj.renderTiny || (defaultObj && defaultObj.renderTiny);
			if (tiny) return tiny(params);
		}
		if (numericWidth > 120) {
			const narrow = templateObj.renderNarrow || (defaultObj && defaultObj.renderNarrow);
			if (narrow) return narrow(params);
		}
	}

	return templateObj.render(params);
}

module.exports = cardDispatcher;
