const express = require('express');
const handler = require('./api/index');
const app = express();
const port = process.env.PORT || 3000;

app.get('/api', handler);

app.get('/', (req, res) => {
	res.send('Last.fm Obsession API is running. Use /api?user=YOUR_USERNAME to get the SVG.');
});

app.listen(port, () => {
	console.log(`Server running at http://localhost:${port}`);
});
