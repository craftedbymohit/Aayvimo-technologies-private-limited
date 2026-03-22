const puppeteer = require('puppeteer');

(async () => {
    const urls = [
        { url: 'https://gorapidsolutions.com', name: 'gorapid.png' },
        { url: 'https://vasudevchemopharma.com', name: 'vasudev.png' },
        { url: 'https://novatourney.online', name: 'nova.png' }
    ];

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    for (const item of urls) {
        console.log(`Capturing ${item.url}...`);
        try {
            await page.goto(item.url, { waitUntil: 'networkidle2', timeout: 60000 });
            await page.screenshot({ path: `Assets/${item.name}` });
            console.log(`Saved Assets/${item.name}`);
        } catch (e) {
            console.error(`Error capturing ${item.url}:`, e);
        }
    }

    await browser.close();
    console.log('Done!');
})();
