const fs = require('fs');
const path = require('path');

const animationsCss = fs.readFileSync(path.join(__dirname, 'animations.css'), 'utf8');
const styles = {};

// Load all css files in directory
try {
	const files = fs.readdirSync(__dirname);
	files.forEach(file => {
		if (file.endsWith('.css') && file !== 'animations.css') {
			const themeName = file.replace('.css', '');
			styles[themeName] = fs.readFileSync(path.join(__dirname, file), 'utf8') + animationsCss;
		}
	});
} catch (e) {
	console.error('Error loading styles:', e);
}

module.exports = (theme = 'default') => {
	return styles[theme] || styles.default;
};
