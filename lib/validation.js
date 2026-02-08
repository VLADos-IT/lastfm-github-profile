const DEFAULT_WIDTH = 400;
const DEFAULT_BG = '181818';
const DEFAULT_MODE = 'smart';
const DEFAULT_RANGE = 'all';
const DEFAULT_THEME = 'default';

function validateParams(query) {
	const {
		user,
		bg = DEFAULT_BG,
		width = DEFAULT_WIDTH,
		mode = DEFAULT_MODE,
		range = DEFAULT_RANGE,
		theme = DEFAULT_THEME
	} = query;

	const safeWidth = Math.max(120, Math.min(1000, parseInt(width) || DEFAULT_WIDTH));
	const safeBg = (bg !== 'transparent' && bg !== 'none' && !/^[0-9a-fA-F]{3,6}$/.test(bg)) ? DEFAULT_BG : bg;
	const safeMode = ['smart', 'obsession', 'top', 'recent'].includes(mode) ? mode : DEFAULT_MODE;
	const safeRange = ['all', '7day', '1month', '3month', '6month', '12month'].includes(range) ? range : DEFAULT_RANGE;
	const safeTheme = theme || DEFAULT_THEME;

	return {
		user,
		safeWidth,
		safeBg,
		safeMode,
		safeRange,
		safeTheme
	};
}

function checkWhitelist(user, range, safeRange) {
	if (safeRange !== 'all') {
		const whitelist = process.env.WHITELIST_USERS ? process.env.WHITELIST_USERS.split(',').map(u => u.trim().toLowerCase()) : null;

		if (whitelist && !whitelist.includes(user.toLowerCase())) {
			return false;
		}
	}
	return true;
}

module.exports = {
	DEFAULT_WIDTH,
	DEFAULT_BG,
	validateParams,
	checkWhitelist
};
