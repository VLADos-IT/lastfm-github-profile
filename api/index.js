const { fetchLastFmData } = require('../lib/fetcher');
const { generateSvg } = require('../lib/svg');
const { fetchImageAsBase64 } = require('../lib/utils');
const errorCard = require('../lib/templates/error');

const DEFAULT_WIDTH = 400;
const DEFAULT_BG = '181818';
const DEFAULT_MODE = 'smart';
const DEFAULT_RANGE = 'all';

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
		range = DEFAULT_RANGE
	} = req.query;

	// Common headers
	res.setHeader('Content-Type', 'image/svg+xml');
	res.setHeader('Cache-Control', 'public, max-age=240, s-maxage=240, stale-while-revalidate=120');
	// Set filename
	res.setHeader('Content-Disposition', 'inline; filename="lastfm-profile.svg"');

	const bgFill = bg === 'transparent' ? 'none' : `#${bg}`;

	const sendError = (message, status) => {
		if (status) res.status(status);
		res.send(errorCard({ width, height: 120, bgFill, message }));
	};

	if (!user) {
		return sendError('Missing user parameter', 400);
	}

	try {
		const data = await fetchLastFmData(user, mode, range);

		if (!data) {
			if (mode === 'obsession') {
				return sendError(`No current obsession for ${user}`);
			}
			throw { response: { status: 404 } };
		}

		if (mode === 'top') {
			data.type = 'top_track';
		}

		// Fetch Image
		const imageBase64 = await fetchImageAsBase64(data.image);

		const svg = generateSvg({ ...data, imageBase64 }, { width, bg, mode });
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
