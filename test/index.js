/**
 * This traverses all json files located on the examples folder, then iterates
 * over each file and opens a puppeteer page to a screenshot of all frames
 * combined in a single page.
 */

const puppeteer = require('puppeteer');
const express = require('express');
const fs = require('fs');
const { promises: { readFile } } = require('fs');
const commandLineArgs = require('command-line-args');
const PNG = require('pngjs').PNG;
const pixelmatch = require('pixelmatch');

const examplesDirectory = '/test/animations/';
const createDirectory = 'screenshots/create';
const compareDirectory = 'screenshots/compare';

function createDirectoryPath(path) {
    const directories = path.split('/');
    directories.reduce((acc, current) => {
        let dir = acc + '/' + current
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir);
        }
        return dir
    }, '.')
}

const animations = [
  {
    fileName: 'pigeon.json',
    renderer: 'svg',
  },
  {
    fileName: 'banner.json',
    renderer: 'svg',
  },
  {
    fileName: 'adrock.json',
    renderer: 'canvas',
  },
  {
    fileName: 'bm_ronda.json',
    renderer: 'svg',
  },
  {
    fileName: 'bodymovin.json',
    renderer: 'svg',
  },
  {
    fileName: 'bodymovin.json',
    renderer: 'canvas',
  },
  {
    fileName: 'dalek.json',
    renderer: 'svg',
  },
  {
    fileName: 'navidad.json',
    renderer: 'svg',
  },
  {
    fileName: 'monster.json',
    renderer: 'svg',
  },
  {
    fileName: 'bacon.json',
    renderer: 'svg',
  },
  {
    fileName: 'lights.json',
    renderer: 'svg',
  },
  {
    fileName: 'ripple.json',
    renderer: 'svg',
  },
  {
    fileName: 'starfish.json',
    renderer: 'svg',
  },
  {
    directory: 'footage',
    fileName: 'data.json',
    renderer: 'svg',
  },
]

const getSettings = async () => {
    const defaultValues = {
        step: 'create',
    }
    const opts = [
        {
          name: 'step',
          alias: 's',
          type: (val) => {
            
            return val === 'compare' ? 'compare' : 'create';
          },
          description: 'Whether it is the create or the compare step',
        }
    ];
  const settings = {
    ...defaultValues,
    ...commandLineArgs(opts),
  };
  return settings;
};

const wait = (time) => new Promise((resolve) => setTimeout(resolve, time));

const filesData = [
  {
    path: '/test/index.html',
    filePath: './test/index.html',
    type: 'html',
  },
  {
    path: '/lottie.min.js',
    filePath: './build/player/lottie.min.js',
    type: 'js',
  },
];

const getEncoding = (() => {
  const encodingMap = {
    js: 'utf8',
    json: 'utf8',
    html: 'utf8',
  };
  return (fileType) => encodingMap[fileType];
})();

const getContentTypeHeader = (() => {
  const contentTypeMap = {
    js: { 'Content-Type': 'application/javascript' },
    json: { 'Content-Type': 'application/json' },
    html: { 'Content-Type': 'text/html; charset=utf-8' },
    wasm: { 'Content-Type': 'application/wasm' },
  };
  return (fileType) => contentTypeMap[fileType];
})();

const startServer = async () => {
  const app = express();
  await Promise.all(filesData.map(async (file) => {
    const fileData = await readFile(file.filePath, getEncoding(file.type));
    app.get(file.path, async (req, res) => {
      res.writeHead(200, getContentTypeHeader(file.type));
      // TODO: comment line. Only for live updates.
      const fileData = await readFile(file.filePath, getEncoding(file.type));
      res.end(fileData);
    });
    return file;
  }));

  app.get('/*', async (req, res) => {
    try {
      if (req.originalUrl.indexOf('.json') !== -1) {
        const file = await readFile(`.${req.originalUrl}`, 'utf8');
        res.send(file);
      } else {
        const data = await readFile(`.${req.originalUrl}`);
        res.writeHead(200, { 'Content-Type': 'image/jpeg' });
        res.end(data);
      }
    } catch (err) {
      res.send('');
    }
  });
  app.listen('9999');
};

const getBrowser = async () => puppeteer.launch({ defaultViewport: null });

const startPage = async (browser, path, renderer) => {
  const targetURL = `http://localhost:9999/test/index.html\
?path=${encodeURIComponent(path)}&renderer=${renderer}`;
  const page = await browser.newPage();
  page.on('console', (msg) => console.log('PAGE LOG:', msg.text())); // eslint-disable-line no-console
  await page.setViewport({
    width: 1024,
    height: 768,
  });
  await page.goto(targetURL);
  return page;
};

const createBridgeHelper = async (page) => {
  let resolveScoped;
  let animationLoadedPromise;
  const messageHandler = (event) => {
    resolveScoped(event);
  };
  const onAnimationLoaded = () => {
    if (animationLoadedPromise) {
        animationLoadedPromise()
    }
  }
  await page.exposeFunction('onAnimationLoaded', onAnimationLoaded);
  await page.exposeFunction('onMessageReceivedEvent', messageHandler);
  const waitForMessage = () => new Promise((resolve) => {
    resolveScoped = resolve;
  });
  const waitForAnimationLoaded = () => new Promise((resolve) => {
    animationLoadedPromise = resolve;
  });
  const continueExecution = async () => {
    page.evaluate(() => {
      window.continueExecution();
    });
  };
  return {
    waitForAnimationLoaded,
    waitForMessage,
    continueExecution,
  };
};

const compareFiles = (folderName, fileName) => {
    const createPath = `${createDirectory}/${folderName}/${fileName}`;
    const comparePath = `${compareDirectory}/${folderName}/${fileName}`;
    const img1 = PNG.sync.read(fs.readFileSync(createPath));
    const img2 = PNG.sync.read(fs.readFileSync(comparePath));
    const {width, height} = img1;
    const diff = new PNG({width, height});

    const result = pixelmatch(img1.data, img2.data, diff.data, width, height, {threshold: 0.1});
    // Using 50 as threshold because it should be an acceptable difference
    // that doesn't raise false positives
    if (result > 200) {
        console.log('RESULT NOT ZERO: ', result);
        throw new Error(`Animation failed: ${folderName} at frame: ${fileName}`)
    }
}

const createIndividualAssets = async (page, folderName, settings) => {
  const filePath = `${settings.step === 'create' ? createDirectory : compareDirectory}/${folderName}`;
  createDirectoryPath(filePath);
  let isLastFrame = false;
  const bridgeHelper = await (createBridgeHelper(page));
  page.evaluate(() => {
    window.startProcess();
  });
  await bridgeHelper.waitForAnimationLoaded();
  while (!isLastFrame) {
    // Disabling rule because execution can't be parallelized
    /* eslint-disable no-await-in-loop */
    await wait(1);
    page.evaluate(() => {
        window.continueExecution();
    });
    const message = await bridgeHelper.waitForMessage();
    const fileNumber = message.currentFrame.toString().padStart(5, '0');
    const fileName = `image_${fileNumber}.png`;
    const localDestinationPath = `${filePath}/${fileName}`;
    await page.screenshot({
      path: localDestinationPath,
      fullPage: false,
    });
    if (settings.step === 'compare') {
      try {
        compareFiles(folderName, fileName);
      } catch (err) {
        console.log('FAILED AT FRAME: ', message.currentFrame);
        throw err;
      }
    }
    isLastFrame = message.isLast;
  }
};

const getDirFiles = async (directory) => (
  new Promise((resolve, reject) => {
    fs.readdir(directory, (err, files) => {
      if (err) {
        reject(err);
      } else {
        resolve(files);
      }
    });
  })
);

async function processPage(browser, settings, directory, animation) {
  let fullDirectory = `${directory}`;
  if (animation.directory) {
    fullDirectory += `${animation.directory}/`;
  }
  const fileName = animation.fileName;
  const page = await startPage(browser, fullDirectory + fileName, animation.renderer);
  const fileNameWithoutExtension = fileName.replace(/\.[^/.]+$/, '');
  let fullName = `${fileNameWithoutExtension}_${animation.renderer}`
  if (animation.directory) {
    fullName = `${animation.directory}_` + fullName;
  }
  await createIndividualAssets(page, fullName, settings);
}

const iteratePages = async (browser, settings) => {
  const failedAnimations = [];
  for (let i = 0; i < animations.length; i += 1) {
    const animation = animations[i];
    let fileName =  `${animation.renderer}_${animation.fileName}`;
    if (animation.directory) {
      fileName = `${animation.directory}_` + fileName;
    }
    try {
        // eslint-disable-next-line no-await-in-loop
        await processPage(browser, settings, examplesDirectory, animation);
        if (settings.step === 'create') {
          console.log(`Creating animation: ${fileName}`);
        }
        if (settings.step === 'compare') {
            console.log(`Animation passed: ${fileName}`);
        }
    } catch (error) {
        if (settings.step === 'compare') {
            failedAnimations.push({
              fileName: fileName
            })
        }
    }
  }
  if (failedAnimations.length) {
    failedAnimations.forEach(animation => {
        console.log(`Animation failed: ${animation.fileName}`);
    })
    throw new Error('Animations failed');
  }
};


const takeImageStrip = async () => {
  try {
    await startServer();
    const settings = await getSettings();
    await wait(1);
    const browser = await getBrowser();
    await iteratePages(browser, settings);
    process.exit(0);
  } catch (error) {
    console.log(error); // eslint-disable-line no-console
    process.exit(1);
  }
};

takeImageStrip();