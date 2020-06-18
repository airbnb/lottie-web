const fs = require('fs');
const cheerio = require('cheerio');
const UglifyJS = require("uglify-js");

const rootFolder = 'player/';
const bm_version = '5.6.10';
const buildReducedVersion = process.argv[2] === 'reduced'
const defaultBuilds = ['full','svg_light','svg','canvas','html', 'canvas_light', 'html_light', 'canvas_worker']

const scripts = [
	{
		src: 'js/main.js',
		builds: defaultBuilds
	},
	{
		src: 'js/utils/common.js',
		builds: defaultBuilds
	},
	{
		src: 'js/utils/BaseEvent.js',
		builds: defaultBuilds
	},
	{
		src: 'js/utils/helpers/arrays.js',
		builds: defaultBuilds
	},
	{
		src: 'js/utils/helpers/svg_elements.js',
		builds: ['full','svg','svg_light','html','html_light']
	},
	{
		src: 'js/utils/helpers/html_elements.js',
		builds: defaultBuilds
	},
	{
		src: 'js/utils/helpers/dynamicProperties.js',
		builds: defaultBuilds
	},
	{
		src: 'js/utils/helpers/blendModes.js',
		builds: defaultBuilds
	},
	{
		src: 'js/3rd_party/transformation-matrix.js',
		builds: defaultBuilds
	},
	{
		src: 'js/3rd_party/seedrandom.js',
		builds: defaultBuilds
	},
	{
		src: 'js/3rd_party/BezierEaser.js',
		builds: defaultBuilds
	},
	{
		src: 'js/utils/animationFramePolyFill.js',
		builds: defaultBuilds
	},
	{
		src: 'js/utils/functionExtensions.js',
		builds: defaultBuilds
	},
	{
		src: 'js/utils/bez.js',
		builds: defaultBuilds
	},
	{
		src: 'js/utils/DataManager.js',
		builds: defaultBuilds
	},
	{
		src: 'js/utils/DataManagerWorkerOverrides.js',
		builds: ['canvas_worker']
	},
	{
		src: 'js/utils/FontManager.js',
		builds: defaultBuilds
	},
	{
		src: 'js/utils/FontManagerWorkerOverride.js',
		builds: ['canvas_worker']
	},
	{
		src: 'js/utils/PropertyFactory.js',
		builds: defaultBuilds
	},
	{
		src: 'js/utils/TransformProperty.js',
		builds: defaultBuilds
	},
	{
		src: 'js/utils/shapes/ShapePath.js',
		builds: defaultBuilds
	},
	{
		src: 'js/utils/shapes/ShapeProperty.js',
		builds: defaultBuilds
	},
	{
		src: 'js/utils/shapes/ShapeModifiers.js',
		builds: defaultBuilds
	},
	{
		src: 'js/utils/shapes/TrimModifier.js',
		builds: defaultBuilds
	},
	{
		src: 'js/utils/shapes/RoundCornersModifier.js',
		builds: defaultBuilds
	},
	{
		src: 'js/utils/shapes/RepeaterModifier.js',
		builds: defaultBuilds
	},
	{
		src: 'js/utils/shapes/ShapeCollection.js',
		builds: defaultBuilds
	},
	{
		src: 'js/utils/shapes/DashProperty.js',
		builds: defaultBuilds
	},
	{
		src: 'js/utils/shapes/GradientProperty.js',
		builds: defaultBuilds
	},
	{
		src: 'js/utils/shapes/shapePathBuilder.js',
		builds: defaultBuilds
	},
	{
		src: 'js/utils/imagePreloader.js',
		builds: ['full','canvas','canvas_light','html','html_light','svg','svg_light']
	},
	{
		src: 'js/utils/imagePreloaderWorkerOverride.js',
		builds: ['canvas_worker']
	},
	{
		src: 'js/utils/featureSupport.js',
		builds: defaultBuilds
	},
	{
		src: 'js/utils/filters.js',
		builds: defaultBuilds
	},
	{
		src: 'js/utils/asset_loader.js',
		builds: defaultBuilds
	},
	{
		src: 'js/utils/asset_loader_worker_override.js',
		builds: ['canvas_worker']
	},
	{
		src: 'js/utils/text/TextAnimatorProperty.js',
		builds: defaultBuilds
	},
	{
		src: 'js/utils/text/TextAnimatorDataProperty.js',
		builds: defaultBuilds
	},
	{
		src: 'js/utils/text/LetterProps.js',
		builds: defaultBuilds
	},
	{
		src: 'js/utils/text/TextProperty.js',
		builds: defaultBuilds
	},
	{
		src: 'js/utils/text/TextSelectorProperty.js',
		builds: defaultBuilds
	},
	{
		src: 'js/utils/pooling/pool_factory.js',
		builds: defaultBuilds
	},
	{
		src: 'js/utils/pooling/pooling.js',
		builds: defaultBuilds
	},
	{
		src: 'js/utils/pooling/point_pool.js',
		builds: defaultBuilds
	},
	{
		src: 'js/utils/pooling/shape_pool.js',
		builds: defaultBuilds
	},
	{
		src: 'js/utils/pooling/shapeCollection_pool.js',
		builds: defaultBuilds
	},
	{
		src: 'js/utils/pooling/segments_length_pool.js',
		builds: defaultBuilds
	},
	{
		src: 'js/utils/pooling/bezier_length_pool.js',
		builds: defaultBuilds
	},
	{
		src: 'js/renderers/BaseRenderer.js',
		builds: defaultBuilds
	},
	{
		src: 'js/renderers/SVGRenderer.js',
		builds: defaultBuilds
	},
	{
		src: 'js/renderers/CanvasRenderer.js',
		builds: ['full','canvas','canvas_light','canvas_worker']
	},
	{
		src: 'js/renderers/CanvasRendererWorkerOverride.js',
		builds: ['canvas_worker']
	},
	{
		src: 'js/renderers/HybridRenderer.js',
		builds: ['full','html','html_light']
	},
	{
		src: 'js/mask.js',
		builds: defaultBuilds
	},
	{
		src: 'js/elements/helpers/HierarchyElement.js',
		builds: defaultBuilds
	},
	{
		src: 'js/elements/helpers/FrameElement.js',
		builds: defaultBuilds
	},
	{
		src: 'js/elements/helpers/TransformElement.js',
		builds: defaultBuilds
	},
	{
		src: 'js/elements/helpers/RenderableElement.js',
		builds: defaultBuilds
	},
	{
		src: 'js/elements/helpers/RenderableDOMElement.js',
		builds: defaultBuilds
	},
	{
		src: 'js/elements/helpers/shapes/ProcessedElement.js',
		builds: defaultBuilds
	},
	{
		src: 'js/elements/helpers/shapes/SVGStyleData.js',
		builds: ['full','svg','svg_light','html','html_light']
	},
	{
		src: 'js/elements/helpers/shapes/SVGShapeData.js',
		builds: defaultBuilds
	},
	{
		src: 'js/elements/helpers/shapes/SVGTransformData.js',
		builds: ['full','svg','svg_light','html','html_light']
	},
	{
		src: 'js/elements/helpers/shapes/SVGStrokeStyleData.js',
		builds: ['full','svg','svg_light','html','html_light']
	},
	{
		src: 'js/elements/helpers/shapes/SVGFillStyleData.js',
		builds: ['full','svg','svg_light','html','html_light']
	},
	{
		src: 'js/elements/helpers/shapes/SVGGradientFillStyleData.js',
		builds: ['full','svg','svg_light','html','html_light']
	},
	{
		src: 'js/elements/helpers/shapes/SVGGradientStrokeStyleData.js',
		builds: ['full','svg','svg_light','html','html_light']
	},
	{
		src: 'js/elements/helpers/shapes/ShapeGroupData.js',
		builds: defaultBuilds
	},
	{
		src: 'js/elements/helpers/shapes/SVGElementsRenderer.js',
		builds: ['full','svg','svg_light','html','html_light']
	},
	{
		src: 'js/elements/helpers/shapes/ShapeTransformManager.js',
		builds: defaultBuilds
	},
	{
		src: 'js/elements/helpers/shapes/CVShapeData.js',
		builds: ['full','canvas','canvas_light','canvas_worker']
	},
	{
		src: 'js/elements/BaseElement.js',
		builds: defaultBuilds
	},
	{
		src: 'js/elements/NullElement.js',
		builds: defaultBuilds
	},
	{
		src: 'js/elements/svgElements/SVGBaseElement.js',
		builds: defaultBuilds
	},
	{
		src: 'js/elements/ShapeElement.js',
		builds: defaultBuilds
	},
	{
		src: 'js/elements/TextElement.js',
		builds: defaultBuilds
	},
	{
		src: 'js/elements/CompElement.js',
		builds: defaultBuilds
	},
	{
		src: 'js/elements/ImageElement.js',
		builds: defaultBuilds
	},
	{
		src: 'js/elements/SolidElement.js',
		builds: defaultBuilds
	},
	{
		src: 'js/elements/svgElements/SVGCompElement.js',
		builds: ['full','svg','svg_light','html','html_light']
	},
	{
		src: 'js/elements/svgElements/SVGTextElement.js',
		builds: ['full','svg','svg_light','html','html_light']
	},
	{
		src: 'js/elements/svgElements/SVGShapeElement.js',
		builds: defaultBuilds
	},
	{
		src: 'js/elements/svgElements/effects/SVGTintEffect.js',
		builds: ['full','svg','svg_light','html','html_light']
	},
	{
		src: 'js/elements/svgElements/effects/SVGFillFilter.js',
		builds: ['full','svg','svg_light','html','html_light']
	},
	{
		src: 'js/elements/svgElements/effects/SVGGaussianBlurEffect.js',
		builds: ['full','svg','svg_light','html','html_light']
	},
	{
		src: 'js/elements/svgElements/effects/SVGStrokeEffect.js',
		builds: ['full','svg','svg_light','html','html_light']
	},
	{
		src: 'js/elements/svgElements/effects/SVGTritoneFilter.js',
		builds: ['full','svg','svg_light','html','html_light']
	},
	{
		src: 'js/elements/svgElements/effects/SVGProLevelsFilter.js',
		builds: ['full','svg','svg_light','html','html_light']
	},
	{
		src: 'js/elements/svgElements/effects/SVGDropShadowEffect.js',
		builds: ['full','svg','svg_light','html','html_light']
	},
	{
		src: 'js/elements/svgElements/effects/SVGMatte3Effect.js',
		builds: ['full','svg','svg_light','html','html_light']
	},
	{
		src: 'js/elements/svgElements/SVGEffects.js',
		builds: ['full','svg','svg_light','html','html_light']
	},
	{
		src: 'js/elements/canvasElements/CVContextData.js',
		builds: ['full','canvas','canvas_light','canvas_worker']
	},
	{
		src: 'js/elements/canvasElements/CVBaseElement.js',
		builds: ['full','canvas','canvas_light','canvas_worker']
	},
	{
		src: 'js/elements/canvasElements/CVImageElement.js',
		builds: ['full','canvas','canvas_light']
	},
	{
		src: 'js/elements/canvasElements/CVCompElement.js',
		builds: ['full','canvas','canvas_light','canvas_worker']
	},
	{
		src: 'js/elements/canvasElements/CVMaskElement.js',
		builds: ['full','canvas','canvas_light','canvas_worker']
	},
	{
		src: 'js/elements/canvasElements/CVShapeElement.js',
		builds: ['full','canvas','canvas_light','canvas_worker']
	},
	{
		src: 'js/elements/canvasElements/CVSolidElement.js',
		builds: ['full','canvas','canvas_light','canvas_worker']
	},
	{
		src: 'js/elements/canvasElements/CVTextElement.js',
		builds: ['full','canvas','canvas_light']
	},
	{
		src: 'js/elements/canvasElements/CVEffects.js',
		builds: ['full','canvas','canvas_light','html','html_light','canvas_worker']
	},
	{
		src: 'js/elements/htmlElements/HBaseElement.js',
		builds: ['full','html','html_light']
	},
	{
		src: 'js/elements/htmlElements/HSolidElement.js',
		builds: ['full','html','html_light']
	},
	{
		src: 'js/elements/htmlElements/HCompElement.js',
		builds: ['full','html','html_light']
	},
	{
		src: 'js/elements/htmlElements/HShapeElement.js',
		builds: ['full','html','html_light']
	},
	{
		src: 'js/elements/htmlElements/HTextElement.js',
		builds: ['full','html','html_light']
	},
	{
		src: 'js/elements/htmlElements/HImageElement.js',
		builds: ['full','html','html_light']
	},
	{
		src: 'js/elements/htmlElements/HCameraElement.js',
		builds: ['full','html','html_light']
	},
	{
		src: 'js/elements/htmlElements/HEffects.js',
		builds: ['full','html','html_light']
	},
	{
		src: 'js/animation/AnimationManager.js',
		builds: defaultBuilds
	},
	{
		src: 'js/animation/AnimationManagerWorkerOverride.js',
		builds: ['canvas_worker']
	},
	{
		src: 'js/animation/AnimationItem.js',
		builds: defaultBuilds
	},
	{
		src: 'js/animation/AnimationItemWorkerOverride.js',
		builds: ['canvas_worker']
	},
	{
		src: 'js/utils/expressions/Expressions.js',
		builds: ['full','svg','canvas','html','canvas_worker']
	},
	{
		src: 'js/utils/expressions/ExpressionManager.js',
		builds: ['full','svg','canvas','html','canvas_worker']
	},
	{
		src: 'js/utils/expressions/expressionHelpers.js',
		builds: ['full','svg','canvas','html','canvas_worker']
	},
	{
		src: 'js/utils/expressions/ExpressionPropertyDecorator.js',
		builds: ['full','svg','canvas','html','canvas_worker']
	},
	{
		src: 'js/utils/expressions/ExpressionTextPropertyDecorator.js',
		builds: ['full','svg','canvas','html','canvas_worker']
	},
	{
		src: 'js/utils/expressions/ShapeInterface.js',
		builds: ['full','svg','canvas','html','canvas_worker']
	},
	{
		src: 'js/utils/expressions/TextInterface.js',
		builds: ['full','svg','canvas','html','canvas_worker']
	},
	{
		src: 'js/utils/expressions/LayerInterface.js',
		builds: ['full','svg','canvas','html','canvas_worker']
	},
	{
		src: 'js/utils/expressions/CompInterface.js',
		builds: ['full','svg','canvas','html','canvas_worker']
	},
	{
		src: 'js/utils/expressions/TransformInterface.js',
		builds: ['full','svg','canvas','html','canvas_worker']
	},
	{
		src: 'js/utils/expressions/ProjectInterface.js',
		builds: ['full','svg','canvas','html','canvas_worker']
	},
	{
		src: 'js/utils/expressions/EffectInterface.js',
		builds: ['full','svg','canvas','html','canvas_worker']
	},
	{
		src: 'js/utils/expressions/MaskInterface.js',
		builds: ['full','svg','canvas','html','canvas_worker']
	},
	{
		src: 'js/utils/expressions/ExpressionValueFactory.js',
		builds: ['full','svg','canvas','html','canvas_worker']
	},
	{
		src: 'js/utils/expressions/TextSelectorPropertyDecorator.js',
		builds: ['full','svg','canvas','html','canvas_worker']
	},
	{
		src: 'js/effects/SliderEffect.js',
		builds: ['full','svg','canvas','html','canvas_worker']
	},
	{
		src: 'js/effects/EffectsManagerPlaceholder.js',
		builds: defaultBuilds
	},
	{
		src: 'js/EffectsManager.js',
		builds: ['full','svg','canvas','html','canvas_worker']
	}
]

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
					builds: builds,
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

function wrapScriptWithModule(code, build) {
	return new Promise((resolve, reject)=>{
		try {
			// Wrapping with module
			let moduleFileName = (build =='canvas_worker') ? 'module_worker' : 'module';
			let wrappedCode = fs.readFileSync(`${rootFolder}js/${moduleFileName}.js`, "utf8");
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

async function modularizeCode(code) {
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
}((window || {}), function(window) {
	${code}
return lottie;
}));`
}

async function buildVersion(scripts, version) {
	const code = await concatScripts(scripts, version.build)
	const wrappedCode = await wrapScriptWithModule(code, version.build)
	const processedCode = await version.process(wrappedCode)
	const modularizedCode = await modularizeCode(processedCode)
	const saved = await save(modularizedCode, version.fileName)
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
		let versions = [
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

		if (buildReducedVersion) {
			versions = versions.splice(0,1);
		}

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
		// const scripts = await getScripts(parsedData);
		const result = await buildVersions(scripts);
		console.log(result);

	} catch(err) {
		handleError(err);
	}
}

build()
