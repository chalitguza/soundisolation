const fs = require('fs');

const waitForDownload = async (downloadPath) => {
    return new Promise(async (resolve, reject) => {
        let result = null;
        // Watch the download directory for changes
        const watcher = fs.watch(downloadPath, async (event, filename) => {
            result = filename.replace(/.crdownload/g, "");
            if (event === 'rename' && filename === result) {
                resolve(result);
                watcher.close();
            }
        });
    });
}
////////////////////////////////////////////////
const extractZipFile = async (filePath,unzipper,sleep) => {
    try {
        const data = await fs.promises.readFile(filePath)
        await unzipper.Extract({ path: './download' }).write(data);
    }catch (err) {
        console.log(err);
    }finally {
        await sleep(2);
        await fs.promises.unlink(filePath);
    }
}

////////////////////////////////////////////////
let cache = new Map();
const randomString = () => {
    let randomLength = Math.floor(Math.random() * (8 - 5 + 1)) + 5;
    if (cache.has(randomLength)) {
        return cache.get(randomLength);
    }

    let result = '';
    let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let charactersLength = characters.length;
    for (let i = 0; i < randomLength; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    cache.set(randomLength, result);
    return result;
}
////////////////////////////////////////////////

const CFonts = require('cfonts');
const CF = async (text,style,align_) => {
  
    CFonts.say(text, {
      font: style,              // define the font face
      align: align_,              // define text alignment
      colors: ['red','blue'],         // define all colors
      background: 'transparent',  // define the background color, you can also use `backgroundColor` here as key
      letterSpacing: 1,           // define letter spacing
      lineHeight: 1,              // define the line height
      space: true,                // define if the output text should have empty lines on top and on the bottom
      maxLength: '0',             // define how many character can be on one line
      gradient: ['green','red','yellow','blue'],           // define your two gradient colors
      independentGradient: true, // define if you want to recalculate the gradient for each new line
      transitionGradient: true,  // define if this is a transition between colors directly
      env: 'node'                 // define the environment CFonts is being executed in
    });
  }


  const sleep = async (ms) => {
    return new Promise(resolve => setTimeout(resolve, (ms*1000)));
  };
////////////////////////////////////////////////


const Checkchrome = async () => {
    console.log('Please install chrome browser first.');
    const child_process = require('child_process');
    const os = require('os');

    // Check if Chrome is installed
    let chromePath = '';
    if (os.platform() === 'win32') {
        chromePath = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
    } else {
        console.log('This script is for Windows only.');
        process.exit(1);
    }

    if (!require('fs').existsSync(chromePath)) {
        // Chrome is not installed, install it
        child_process.execSync('powershell -Command "Invoke-WebRequest -Uri https://dl.google.com/chrome/install/chrome_installer.exe -OutFile chrome.exe;./chrome.exe"', {
            cwd: 'C:/Program Files/Google/Chrome/Application/'
        });
        console.log('Chrome successfully installed.');
    } else {
        console.log('Chrome is already installed.');
    }
}

////////////////////////////////////////////////






module.exports = {
    extractZipFile,
    randomString,
    waitForDownload,
    CF,
    sleep,
    Checkchrome
};

