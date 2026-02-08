const { upgradeImage } = require('../utils');

function parseChartlistRow(rowHtml, defaultUrl, type) {
	const getAttr = (name) => {
		const match = rowHtml.match(new RegExp(`data-${name}=["']([^"']+)["']`));
		return match ? match[1] : null;
	};

	let trackName = getAttr('track-name');
	let artistName = getAttr('artist-name');

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

	let trackUrl = defaultUrl;
	const hrefMatch = rowHtml.match(/class="chartlist-name"[\s\S]*?<a href="([^"]*)"/);
	if (hrefMatch) {
		trackUrl = `https://www.last.fm${hrefMatch[1]}`;
	} else {
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
		type
	};
}

module.exports = { parseChartlistRow };
