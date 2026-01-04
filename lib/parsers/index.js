/**
 * HTML Parsers for Last.fm
 * @author VLADos-IT <https://github.com/VLADos-IT>
 */

const { parseObsession, parseObsessionPage } = require('./obsession');
const { parseTopTrack } = require('./track');

module.exports = {
	parseObsession,
	parseObsessionPage,
	parseTopTrack
};
