const fs = require('fs');
const path = require('path');
const defaultCard = require('./default');
const getStyles = require('../styles/index');

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

function toShortHeader(headerText) {
	if (headerText.includes('OBSESSION')) return 'OBS';
	if (headerText.includes('RECENT')) return 'REC';
	return 'TOP';
}

function renderNarrowCard(params, theme) {
	const width = parseInt(params.width, 10);
	const isRetro = theme === 'retro';
	const padding = 8;
	const coverSize = 76;
	const startX = padding + coverSize + 8;
	const textWidth = Math.max(18, width - startX - padding);
	const shortHeader = toShortHeader(params.headerText || '');
	let d = 'M -20 5';

	for (let i = -20; i < textWidth + 24; i += 20) {
		d += isRetro ? ' h 10 v -4 h 10 v 4' : ' q 5 -6 10 0 t 10 0';
	}

	return `
	<svg width="${params.width}" height="${params.height}" viewBox="0 0 ${params.width} ${params.height}" fill="none" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
		<defs>
			<clipPath id="narrow-card-clip">
				<rect width="${params.width}" height="${params.height}" rx="${params.borderRadius}" />
			</clipPath>
			<clipPath id="narrow-wave-clip">
				<rect x="-6" y="-10" width="${textWidth + 12}" height="24" />
			</clipPath>
			${isRetro ? `
			<pattern id="narrow-pixel-pattern" x="0" y="0" width="4" height="4" patternUnits="userSpaceOnUse">
				<rect x="0" y="0" width="2" height="2" fill="#000000" fill-opacity="0.05"/>
				<rect x="2" y="2" width="2" height="2" fill="#000000" fill-opacity="0.05"/>
			</pattern>` : ''}
		</defs>
		<style>
			${getStyles(theme)}
			.bg { fill: ${params.bgFill}; }
			.header { fill: ${params.headerColor}; }
			.wave { stroke: ${params.headerColor}; }
		</style>
		<g clip-path="url(#narrow-card-clip)">
			<rect width="${params.width}" height="${params.height}" rx="${params.borderRadius}" class="bg" />
			${isRetro ? `
			<rect width="${params.width}" height="${params.height}" fill="url(#narrow-pixel-pattern)" />
			<rect x="0" y="0" width="${params.width}" height="2" fill="#ffffff" />
			<rect x="0" y="0" width="2" height="${params.height}" fill="#ffffff" />
			<rect x="0" y="${params.height - 2}" width="${params.width}" height="2" fill="#808080" />
			<rect x="${params.width - 2}" y="0" width="2" height="${params.height}" fill="#808080" />` : ''}
			<a xlink:href="${params.url}" target="_blank">
				${isRetro && params.imageBase64 ? `<rect x="${padding - 2}" y="${padding - 2}" width="${coverSize + 4}" height="${coverSize + 4}" fill="none" stroke="#808080" stroke-width="2" />` : ''}
				${params.imageBase64 ? `<image x="${padding}" y="${padding}" width="${coverSize}" height="${coverSize}" xlink:href="${params.imageBase64}" ${isRetro ? 'style="image-rendering: pixelated;"' : 'rx="4"'} />` : ''}
				<g transform="translate(${startX}, 42)">
					<text x="0" y="0" class="header" style="font-size:14px; letter-spacing:0;">${shortHeader}</text>
					<g transform="translate(0, 44)" clip-path="url(#narrow-wave-clip)">
						<path d="${d}" class="${isRetro ? 'retro-wave' : 'wave'}" ${isRetro ? 'stroke-width="2"' : ''} />
					</g>
				</g>
			</a>
		</g>
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

	if (theme !== 'compact' && numericWidth < 160) {
		if (numericWidth === 120) {
			return renderTinyCard({
				width: params.width,
				height: params.height,
				bgFill: params.bgFill,
				borderRadius: params.borderRadius,
				url: params.url,
				imageBase64: params.imageBase64
			});
		}
		if (numericWidth > 120) {
			return renderNarrowCard(params, theme);
		}
	}

	return template(params);
}

module.exports = cardDispatcher;
