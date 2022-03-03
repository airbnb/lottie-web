const fs = require('fs');
const UglifyJS = require("uglify-js");
const packageFile = require("../package.json");

const buildFolder = 'build/player/';
const rootFolder = 'player/';
const bm_version = packageFile.version;
const defaultBuilds = [ 'canvas_worker', 'lottie_worker']

const scripts = [
	
]

function wrapScriptWithModule(code, build) {
	return new Promise((resolve, reject)=>{
		try {
			// Wrapping with module
			let moduleFileName = 'worker_wrapper';
			let wrappedCode = fs.readFileSync(`${rootFolder}js/${moduleFileName}.js`, "utf8");
			wrappedCode = wrappedCode.replace('/* <%= contents %> */',code);
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
			const result = UglifyJS.minify(code, {
				output: 
					{
						ascii_only:true
					},
					toplevel:true,
					mangle: {
						reserved: ['lottie']
					}
				});
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

async function modularizeCode(code, build) {
	const globalScope = (build =='canvas_worker' || build =='lottie_worker') ? 'self' : 'window'
	return `(typeof navigator !== "undefined") && (function(root, factory) {
    if (typeof define === "function" && define.amd) {
        define(function() {
            return factory(root);
        });
    } else if (typeof module === "object" && module.exports) {
        module.exports = factory(root);
    } else {
        root.lottie = factory(root);
        root.bodymovin = root.lottie;
    }
}((${globalScope} || {}), function(window) {
	${code}
return lottie;
}));`
}

async function getCode() {
	try {
		let scriptsString = '';
		scriptsString += fs.readFileSync(`${buildFolder}lottie.js`, {encoding: 'utf8'});
		scriptsString += '\r\n';
		return scriptsString;
	} catch(err) {
		throw err;
	}
}

async function buildVersion(version) {
	try {
		const code = await getCode(version.build)
		const wrappedCode = await wrapScriptWithModule(code, version.build)
		const processedCode = await version.process(wrappedCode)
		const modularizedCode = await modularizeCode(processedCode, version.build)
		const saved = await save(modularizedCode, version.fileName)
		return saved
	} catch (error) {
		console.log(error);
		return null;
	}
}

function save(code, fileName) {
	return new Promise((resolve, reject)=> {
		fs.writeFile(`${buildFolder}${fileName}`, code, (err) => {
			if (err) {
				reject(err)
			} else {
				resolve(true)
			}
		});
	})
}

function noop(code) {
	return Promise.resolve(code)
}

function buildVersions() {
	return new Promise((resolve, reject) => {
		let versions = [
			{
				fileName: 'lottie_canvas_worker.js',
				build: 'canvas_worker',
				process: noop
			},
			{
				fileName: 'lottie_canvas_worker.min.js',
				build: 'canvas_worker',
				process: uglifyCode
			},
			{
				fileName: 'lottie_worker.js',
				build: 'lottie_worker',
				process: noop
			},
			{
				fileName: 'lottie_worker.min.js',
				build: 'lottie_worker',
				process: uglifyCode
			}
		];

		const buildProcesses = versions.map((version)=>{
			return buildVersion(version)
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
		const result = await buildVersions();

	} catch(err) {
		handleError(err);
	}
}

build()
