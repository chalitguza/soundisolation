'use strict';
const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');
const downloadPath = path.resolve('./download');
const unzipper = require('unzipper');
const {base64decode} = require('nodejs-base64');
const de = base64decode('aHR0cHM6Ly9tZWxvZHkubWwv');
const G = base64decode('QGdtYWlsLmNvbQ==');

const { bold, green,bgRed,yellow, blue } = require('kleur');
const prompt = require('prompt-sync')({sigint: true});
const { extractZipFile, randomString,waitForDownload,CF,sleep,Checkchrome } = require('./component');


async function uploadSong(filePath) {

    // check chrome browser
    await Checkchrome();

    await sleep(1);
    console.clear();
    CF('Processing','block','center')
    const headless = false;
    // Launch a headless browser
    // const browser = await puppeteer.launch({ headless: false, defaultViewport: { width: 1920, height: 1080 } });
    try{
        var browser = await puppeteer.launch({
            headless: true,
            executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
            //executablePath: "chromedriver.exe",
            ignoreDefaultArgs: ["--enable-automation"],
            args: headless ? null : [
                `--app=${de}`,
                '--disable-infobars','--start-maximized',
                '--window-size=900,800',
                //`--disable-extensions-except=${pathToExtension}`,
                //`--load-extension=${pathToExtension}`,
                '--disable-web-security',
                '--sampling-heap-profiler',
                '--disable-features=site-per-process',
                '--disable-dev-shm-usage',
                //'--no-sandbox',
                '--sampling-heap-profiler'],

            // defaultViewport: {
            //     width: 1920,
            //     height: 1080
            // }
            defaultViewport : null
            
        });
        }catch(e){
            console.log('Please install chrome browser first.');
            var browser = await puppeteer.launch({
                headless: headless,
                executablePath: './chrome-win/chrome.exe',
                defaultViewport : null,
                ignoreDefaultArgs: ["--enable-automation"],
                args: headless ? null : [
                    '--disable-infobars','--start-maximized',
                    '--window-size=900,800',
                    //`--disable-extensions-except=${pathToExtension}`,
                    //`--load-extension=${pathToExtension}`,
                    '--disable-web-security',
                    '--sampling-heap-profiler',
                    '--disable-features=site-per-process',
                    '--disable-dev-shm-usage',
                    //'--no-sandbox',
                    '--sampling-heap-profiler',
                ]
            })
            process.exit(1);
            
        }
    // const page = await browser.newPage();
    const page = (await browser.pages())[0];
    const client = await page.target().createCDPSession();
    await client.send('Network.setCacheDisabled', {cacheDisabled: true});

    // Navigate to the target website and type email address
    await page.goto(de, { waitUntil: 'networkidle2' });

    // remove unnecessary elements
    let els = await page.$$("[style='display: flex; justify-content: center;']");
    for (let i of els) await i.evaluate(el => el.remove());
    await page.evaluate(() => document.querySelectorAll(".top-nav").forEach(el => el.remove()));

    console.log('(1/3) Starting the audio separation process....');
    await page.type('.upload-container input[type="email"]', randomString()+G);

    // Select file to upload
    const [fileChooser] = await Promise.all([
        page.waitForFileChooser(),
        page.click('.upload-button'),
    ]);
    await fileChooser.accept([filePath]);

    // Wait for text to change to "Download"
    while (true) {
        await sleep(3);
        try {
            const element = await page.$('.upload-item > div:nth-child(3)');
            const text = await (await element.getProperty('textContent')).jsonValue();
            if (text.replace(/\s/g, '') === 'Download') {
                console.log('Process successfully....');
                break;
            }
            console.clear();
            CF('Processing','block','center')
            console.log('(1/3) Starting the audio separation process....');
        } catch (e) {
            await sleep(3);
            console.clear();
            CF('Processing','block','center')
            console.log('(1/3) Starting the audio separation process....');
        }
    }

   
    fs.exists('download', function (exist) {
        if (exist === false) {
            fs.mkdirSync('download');
            console.log('Directory created');
        }
    })

    await sleep(1);
    console.clear();
    CF('Processing','block','center')
    console.log('(2/3) Downloading....');
    const element2 = await page.$x("//*[contains(@class, 'upload-item')]/div[3]");
    await client.send('Page.setDownloadBehavior', {behavior: 'allow', userDataDir: './', downloadPath: downloadPath});
    await element2[0].click();


    try {
        // Wait for the file to download before closing the browser
        const result = await waitForDownload(downloadPath);
        console.log('Successful download');
        await sleep(1);

        // Unzip the file
        console.clear();
        CF('Processing','block','center')
        console.log('(3/3) .zip extraction process');
        await extractZipFile(path.join(downloadPath, result),unzipper,sleep);
        console.clear();
        CF('Processing','block','center')
        console.log('Complete extraction');

    } catch (err) {
        console.log(err);
    } finally {
        await browser.close();
        console.log('Browser closed');
    }

console.clear();
CF('--Done--','block','center')
console.log('--------------\n');
console.log(green().bold().underline('OK Step (1/3) Starting the audio separation process....'));
console.log(green().bold().underline('OK Step (2/3) Downloading....'));
console.log(green().bold().underline('OK Step (3/3) .zip extraction process'));
console.log(green().bold().underline('-----Done-----'));
console.log('\n--------------');
await sleep(3);
process.exit(1);
}

console.clear();
CF('sound|isolation','block','center')
const filePath = prompt(bold().yellow().bgBlue().italic(('Please specify the file name. Example: hello.mp3 :')));
uploadSong(filePath);