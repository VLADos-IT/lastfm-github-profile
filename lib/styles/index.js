const fs = require('fs');
const path = require('path');

const animationsCss = fs.readFileSync(path.join(__dirname, 'animations.css'), 'utf8');

const themes = {
	default: fs.readFileSync(path.join(__dirname, 'default.css'), 'utf8') + animationsCss
};

module.exports = (theme = 'default') => {
	return themes[theme] || themes.default;
};
