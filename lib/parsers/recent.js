const { parseChartlistRow } = require('./chartlist-row');

/**
 * Parses Recent Track data from Last.fm Library HTML.
 * @param {string} html 
 * @param {string} defaultUrl 
 * @returns {object|null}
 */
function parseRecentTrack(html, defaultUrl) {
	const rowStartIndex = html.indexOf('chartlist-row');
	if (rowStartIndex === -1) return null;

	const rowEndIndex = html.indexOf('</tr>', rowStartIndex);
	if (rowEndIndex === -1) return null;

	const rowHtml = html.substring(rowStartIndex, rowEndIndex);

	return parseChartlistRow(rowHtml, defaultUrl, 'recent_track');
}

module.exports = {
	parseRecentTrack
};
