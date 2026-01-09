const { fetchLastFmData } = require('../lib/fetcher');
const { generateSvg } = require('../lib/svg');
const { fetchImageAsBase64, isValidUsername } = require('../lib/utils');
const errorCard = require('../lib/templates/error');

const DEFAULT_WIDTH = 400;
const DEFAULT_BG = '181818';
const DEFAULT_MODE = 'smart';
const DEFAULT_RANGE = 'all';
const DEFAULT_THEME = 'default';

/**
 * Last.fm Obsession Readme API
 * @author VLADos-IT <https://github.com/VLADos-IT>
 */
module.exports = async (req, res) => {
	const {
		user,
		bg = DEFAULT_BG,
		width = DEFAULT_WIDTH,
		mode = DEFAULT_MODE,
		range = DEFAULT_RANGE,
		theme = DEFAULT_THEME
	} = req.query;

	const safeWidth = Math.max(100, Math.min(1000, parseInt(width) || DEFAULT_WIDTH));
	const safeBg = (bg !== 'transparent' && !/^[0-9a-fA-F]{3,6}$/.test(bg)) ? DEFAULT_BG : bg;
	const safeMode = ['smart', 'obsession', 'top'].includes(mode) ? mode : DEFAULT_MODE;
	const safeRange = ['all', '7day', '1month', '3month', '6month', '12month'].includes(range) ? range : DEFAULT_RANGE;
	const safeTheme = theme || DEFAULT_THEME;

	// Common headers
	res.setHeader('Content-Type', 'image/svg+xml');
	res.setHeader('Cache-Control', 'public, max-age=240, s-maxage=240, stale-while-revalidate=120');
	// Set filename
	res.setHeader('Content-Disposition', 'inline; filename="lastfm-profile.svg"');

	const sendError = (message, status) => {
		if (status) res.status(status);
		res.send(errorCard({ width: safeWidth, height: 120, bgFill: safeBg, message }));
	};

	if (!user) {
		return sendError('Missing user parameter', 400);
	}

	if (!isValidUsername(user)) {
		return sendError('Invalid username', 400);
	}

	try {
		const data = await fetchLastFmData(user, safeMode, safeRange);

		if (!data) {
			if (safeMode === 'obsession') {
				return sendError(`No current obsession for ${user}`);
			}
			throw { response: { status: 404 } };
		}

		if (safeMode === 'top') {
			data.type = 'top_track';
		}

		// Fetch Image
		const imageBase64 = await fetchImageAsBase64(data.image);

		const svg = generateSvg({ ...data, imageBase64 }, { width: safeWidth, bg: safeBg, mode: safeMode, theme: safeTheme });
		res.send(svg);

	} catch (error) {
		console.error(error);
		if (error.response && error.response.status === 404) {
			sendError(`No data for ${user}`);
		} else {
			sendError('Internal Server Error', 500);
		}
	}
};
