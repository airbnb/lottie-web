const fs = require('fs');
const cheerio = require('cheerio');
const UglifyJS = require("uglify-js");

const rootFolder = 'player/';
const bm_version = '5.4.4';

function loadIndex() {
	return new Promise((resolve, reject)=>{

		function onLoad(err, result) {
			if(err) {
				reject(err);
			} else {
				resolve(result);
			}
		}
		fs.readFile(`${rootFolder}index.html`, 'utf8', onLoad);
	})
}

function parseHTML(html) {
	return new Promise((resolve, reject)=> {
		try {
			const $ = cheerio.load(html);
			resolve($);
		} catch(err) {
			reject(err);
		}
	})
}

function getScripts($) {
	return new Promise((resolve, reject)=> {
		try {
			const defaultBuilds = ['full','svg_light','svg','canvas','html', 'canvas_light', 'html_light']
			const scriptNodes = []
			let shouldAddToScripts = false;
			$("head").contents().each((index, node) => {
				if(node.nodeType === 8 && node.data.indexOf('build:js') !== -1) {
					shouldAddToScripts = true;
				} else if(shouldAddToScripts) {
					if(node.type === 'script') {
						scriptNodes.push(node)
					} else if(node.nodeType === 8 && node.data.indexOf('endbuild') !== -1) {
						shouldAddToScripts = false;
					}
				}
			})
			const scripts = scriptNodes.map((node)=>{
				const builds = node.attribs['data-builds'] ? node.attribs['data-builds'].split(',') : defaultBuilds
				return {
					src: node.attribs.src,
					builds: builds
				}
			})
			resolve(scripts);
		} catch(err) {
			reject(err);
		}

	})
}

function concatScripts(scripts, build) {
	return new Promise((resolve, reject)=>{
		// Concatenating scripts
		try {
			let scriptsString = ''
			scripts.forEach((script)=> {
				if(script.builds.indexOf(build) !== -1) {
					scriptsString += fs.readFileSync(`${rootFolder}${script.src}`, {encoding: 'utf8'});
					scriptsString += '\r\n';
				}
			})
			resolve(scriptsString);
		} catch(err) {
			reject(err);
		}
	});
}

function wrapScriptWithModule(code) {
	return new Promise((resolve, reject)=>{
		try {
			// Wrapping with module
			let wrappedCode = fs.readFileSync(`${rootFolder}js/module.js`, "utf8");
			wrappedCode = wrappedCode.replace('/*<%= contents %>*/',code);
			wrappedCode = wrappedCode.replace('[[BM_VERSION]]',bm_version);
			resolve(wrappedCode);
		} catch(err) {
			reject(err);
		}
	});
}

function uglifyCode(code) {
	return new Promise((resolve, reject)=>{
		try {
			const result = UglifyJS.minify(code, {output: {ascii_only:true},toplevel:true});
			if (result.error) {
				reject(result.error)
			} else {
				resolve(result.code)
			}
		} catch(err) {
			reject(err)
		}
	})
}

async function buildVersion(scripts, version) {
	const code = await concatScripts(scripts, version.build)
	const wrappedCode = await wrapScriptWithModule(code)
	const processedCode = await version.process(wrappedCode)
	const saved = await save(processedCode, version.fileName)
	return true
}

function save(code, fileName) {
	return new Promise((resolve, reject)=> {
		fs.writeFile(`build/player/${fileName}`, code, (err) => {
			if (err) {
				reject(err)
			} else {
				resolve('File Saved')
			}
		});
	})
}

function noop(code) {
	return Promise.resolve(code)
}

function buildVersions(scripts) {
	return new Promise((resolve, reject) => {
		const versions = [
		{
			fileName: 'lottie.js',
			build: 'full',
			process: noop
		},
		{
			fileName: 'lottie.min.js',
			build: 'full',
			process: uglifyCode
		},
		{
			fileName: 'lottie_light.js',
			build: 'svg_light',
			process: noop
		},
		{
			fileName: 'lottie_light.min.js',
			build: 'svg_light',
			process: uglifyCode
		},
		{
			fileName: 'lottie_svg.js',
			build: 'svg',
			process: noop
		},
		{
			fileName: 'lottie_svg.min.js',
			build: 'svg',
			process: uglifyCode
		},
		{
			fileName: 'lottie_light_canvas.js',
			build: 'canvas_light',
			process: noop
		},
		{
			fileName: 'lottie_light_canvas.min.js',
			build: 'canvas_light',
			process: uglifyCode
		},
		{
			fileName: 'lottie_canvas.js',
			build: 'canvas',
			process: noop
		},
		{
			fileName: 'lottie_canvas.min.js',
			build: 'canvas',
			process: uglifyCode
		},
		{
			fileName: 'lottie_html.js',
			build: 'html',
			process: noop
		},
		{
			fileName: 'lottie_html.min.js',
			build: 'html',
			process: uglifyCode
		},
		{
			fileName: 'lottie_light_html.js',
			build: 'html_light',
			process: noop
		},
		{
			fileName: 'lottie_light_html.min.js',
			build: 'html_light',
			process: uglifyCode
		}];

		const buildProcesses = versions.map((version)=>{
			return buildVersion(scripts, version)
		})
		Promise.all(buildProcesses)
		.then(() => {
			resolve('Build Process Ended')
		})
		.catch((err)=>{
			reject(err)
		})
	})
}

function handleError(err) {
	console.log(err);
}

async function build() {
	try {
		const htmlData = await loadIndex();
		const parsedData = await parseHTML(htmlData);
		const scripts = await getScripts(parsedData);
		const result = await buildVersions(scripts);
		console.log(result);

	} catch(err) {
		handleError(err);
	}
}

build()