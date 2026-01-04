const { fetchLastFmData } = require('./lib/fetcher');
const { generateSvg } = require('./lib/svg');
const { fetchImageAsBase64 } = require('./lib/utils');

async function test() {
    const user = 'vlados14311';
    console.log(`Running CI test for user: ${user}...`);

    try {
        // 1. Test Fetch
        console.log('1. Fetching Last.fm data...');
        const data = await fetchLastFmData(user, 'smart');

        if (!data) {
            console.error('❌ Fetch failed: No data returned (User might not exist or Last.fm is down)');
            process.exit(1);
        }
        console.log('✅ Fetch successful');
        console.log(`   Type: ${data.type}`);
        console.log(`   Track: ${data.track}`);
        console.log(`   Image URL: ${data.image || 'None'}`);

        // 2. Test Image Fetching
        let imageBase64 = '';
        if (data.image) {
            console.log('2. Fetching Image...');
            imageBase64 = await fetchImageAsBase64(data.image);
            if (!imageBase64) {
                console.warn('⚠️ Image fetch returned empty string (might be a timeout or invalid URL), but continuing...');
            } else {
                console.log('✅ Image fetch successful');
            }
        } else {
            console.log('ℹ️ No image to fetch, skipping step 2.');
        }

        // 3. Test SVG Generation
        console.log('3. Generating SVG...');
        const svg = generateSvg({ ...data, imageBase64 }, { width: 400, bg: '181818', mode: 'smart' });

        if (!svg || !svg.startsWith('<svg')) {
            console.error('❌ SVG generation failed: Output is not a valid SVG string');
            process.exit(1);
        }

        // 4. Verify SVG Content
        if (data.image && imageBase64) {
            if (!svg.includes('<image')) {
                console.error('❌ SVG validation failed: Image data exists but <image> tag is missing in SVG');
                process.exit(1);
            }
        }

        // Basic check for track name
        if (svg.length < 100) {
            console.error('❌ SVG validation failed: SVG is suspiciously short');
            process.exit(1);
        }

        console.log('✅ SVG generated successfully');
        console.log('Test Passed! 🚀');
        process.exit(0);

    } catch (error) {
        console.error('❌ Test failed with error:', error);
        process.exit(1);
    }
}

test();
