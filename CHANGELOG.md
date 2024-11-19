## V 5.13.0
- FIX: rollup config updated to prevent lottie-web from running in Server-Side Rendering contexts
- FIX: fixed renderGradient() cache invalidation issue so that both start and end points are checked for changes
- IMPROVEMENT: avoid recalculating static transform matrices, results in a significant performance improvement
- FIX: reloadShapes() no longer has the side effect of creating duplicate styles
- FEATURE: Web Worker supports resetSegments
- FIX: hidden styles were forcibly set as visible when using searchShapes()
- IMPROVEMENT: expressions can access unidimensional values by index
- IMPROVEMENT: expression support for thisProperty.name

## V 5.12.1
- FIX: Transform Effect opacity reset
- FEATURE: esm support
- FIX: Fix transform matrix precalc when adding effects
- IMPROVEMENT: canvas renderer signifcantly improved in performance
- IMPROVEMENT: improved text support for emojis
- IMPROVEMENT: text renderer performance improvement when rendering out of the work area
- FIX: canvas expressions render order

## V 5.12.0
- FEATURE: Transform Effect support
- FIX: play / pause behavior on worker
- IMPROVEMENT: move text rendering to render phase
- FEATURE: expose global object _lottieGlobal for expressions

## V 5.11.0
- FEATURE: Essential Graphics support
- FEATURE: slots support
- FIX: update data when updateDocumentData is called
- FIX: using unregistered renderer or missing path
- FIX: added destroy null check
- FEATURE: Implement setLoop in Web Worker

## V 5.10.2
- FEATURE: add setLoop method
- FEATURE: support for all matte masks in canvas
- FEATURE: support for alpha matte in canvas worker
- FEATURE: support for canvas renderer in Safari
- FEATURE: add DOM loaded event for canvas worker
- FIX: tint effect opacity

## V 5.10.1
- FIX: track matte masks transform fix

## V 5.10.0
- FIX: light versions referencing expressions interfaces
- FEATURE: Add support for new track masks by layer index
- FEATURE: Add support for zigzag (thanks @mbasaglia)
- FEATURE: Add support for offset path (thanks @mbasaglia)
- FEATURE: Customizable canvas renderer width and height
- FIX: Workaround for banner validation

## V 5.9.6
- FIX: Bodymovin export missing comps
- FIX: Disambiguate bevelEmboss properties (thanks @mbasaglia)
- FEATURE: Add support for image export individual settings via annotations

## V 5.9.5
- FIX: Expand the hybrid shape bounding box on stroke (thanks @mbasaglia)
- FEATURE: support filter size on drop shadow property
- FIX: canvas worker - handle destroying animation instance before data is loaded
- FIX: canvas worker = pass own canvas fix (thanks @knenkne)
- FIX: bodymovin extension out of storage
- FEATURE: integration with canilottie

## V 5.9.4
- FIX: support for all marker definitions
- FIX: improve composable filters
- FIX: strokes with correct width on fonts

## V 5.9.3
- FEATURE: Add support for isPaused property on lottie worker
- FEATURE: Adds support for changing volume based on the audio layer data
- FEATURE: add support for removeEventListener on worker
- FEATURE: add support for updateDocumentData on worker
- FEATURE: add text as font support on worker
- FIX: avoid crash when script does not have src

## V 5.9.2
- FEATURE: add support for playsegments and blend mode on lottie worker
- FIX: Fix ts typing for loadAnimation parameter
- FEATURE: allows to set width and height of svg from config
- FIX: Fix getMarkerData bug
- FEATURE: Add type for goToAndPlay & goToAndStop
- FIX: add time to list of code for preventing removal
- FIX: glyphs removed from DOM before reloading

## V 5.9.1
- FIX: navigator validation for SSR

## V 5.9.0
- FEATURE: Added support for using shapes as animated characters
- FIX: added methods used by expressions to an array to prevent treeshaking
- DEV: Migrated code to imports
- DEV: Use Rollup for build process

## V 5.8.1
- FEATURE: added more methods available for the lottie worker player

## V 5.8.0
- FEATURE: lottie player as a worker support
- FEATURE: added content-visibility prop support
- FEATURE: added header check for json type (improves initial parsing specially on large files)
- FEATURE: added lottie.useWebWorker method to support loading file on a separate web worker (different than the first feature)
- FEATURE: added frame rate to comp on export (not supported by payers yet)
- FIX: random seed expression fix

## V 5.7.14
- FEATURE: added support for Smoothness property on animated texts
- FEATURE: added support for animated text path properties
- FEATURE: added support for exporting source names as ids
- FEATURE: added clear cache button
- FIX: fixed importer with last keyframe

## V 5.7.13
- FEATURE: added support for emoji modifiers and sequences
- FEATURE: added support for metadata export on json files

## V 5.7.12
- FEATURE: added support for masked strokes line cap and line join
- FIX: callbacks list executing beyond index list
- FIX: missing TextExpressionSelectorPropFactor
- FEATURE: exporter improvements

## V 5.7.11
- FIX: another exporter fix

## V 5.7.10
- FIX: exporter fix

## V 5.7.9
- FEATURE: added support for prefixig ids
- FEATURE: security updates
- FIX: fix image sequencing preloading
- FEATURE: added support for gradient fill expressions

## V 5.7.8
- FIX: disable screen reader visibility of created font-nodes (thanks @)
- FEATURE: added FootageElement that supports json data layer types with expressions

## V 5.7.7
- FIX: xhr open order
- FEATURE: added markers support
- FIX: repeaters with reduced copies
- FIX: unintentional stroke clipping on shapes with large stroke-width (thanks Manan Jadhav)
- FIX: ie11 append missing
- FIX: repeater calling trim twice

## V 5.7.6
- FIX: es6 support on export
- IMPROVEMENT: added linting rules
- FIX: seedrandom and main fix
- FIX: image export fix

## V 5.7.5
- FIX: Enable HImageElement to use preloaded images thanks @dbettini
- FIX: lottie-light effects breaking on destroy
- FIX: loaded_images event fired in safari

## V 5.7.4
- FIX: `addEventListener` method returns function except `void`
- EXPRESSIONS:  added support for toWorldVec, fromWorldVec and getValueAtTime for transforms
- EXPRESSIONS: fixed propertyGroup expression
- FIX: added svg effects placeholder
- FIX: added check for wrapper on destroy canvas
- EXPORTER: missing layer styles
- EXPORTER: export only work area

## V 5.7.3
- EXPRESSIONS: Added more expressions support

## V 5.7.2
- FIX: Trusted Types compliance by removing calls to .innerHTML
- FIX: make callback parameter of removeEventListener optional
- FEATURE: Audio Support

## V 5.7.1
- REPORT: Improved animation report
- FIX: Expressions separate dimensions
- FIX: propertyGroup for expressions (Duik bones are supported)
- FEATURE: supported Pucked and Bloat

## V 5.7.0
- FEATURE: Extension: reports for not supported features
- FEATURE: Extension: baking keyframes for unsupported expressions
- FEATURE: Extension: improved preview and added Skottie preview

## V 5.6.10
- FIX: default loop to true
- FIX: removing sans-serif and monospace from font preloader to calculate correctly when font is loaded
- FIX: improved image caching when preloading svg image tags
- updated definitions

## V 5.6.9
- fix compression options
- initialization improvement

## V 5.6.8
- not using non breaking spaces for text spaces
- added support for exporting video layers (only export, players don't support them)
- fix for path properties open without nodes

## V 5.6.7
- use original comp name as export name
- added default filter values for banner template
- added option to load local file as lottie player
- initialSegment set before animation configuration

## V 5.6.6
- reading file extension correctly when copying original assets
- fixed inlined json objects with carriage returns
- added loop support for banners
- exporting adjustment layers as null layers
- added checkbox to select comp names as default
- added filter size configuration and defaulting to 100%
- Add missing animation event name definitions

## V 5.6.5
- added initialSegment property
- fix for zip file without root folder
- support for including json in banner html template
- Export 'blur' text animator property

## V 5.6.4
- added support for using original images as assets
- Improved log error fix
- Fixed missing assets during export

## V 5.6.3
- Fix saving json files with special characters
- Improved lottie import

## V 5.6.2
- Fix lottie importer gradient data without keyframes
- Added hidden layers and hidden properties support for importer
- Improved error messaging
- Added assetsPath configuration for typescript
- fixed mangled lottie declaration

## V 5.6.1
- Fix on the exporter for older AE versions when a new project didn't have a saved destination yet

## V 5.6.0
- Support new export mode: Rive
- Support new export mode: Banner
- Improved existing export modes
- Improved image compression solution (now PNGs get well compressed as jpegs)
- Support for importing Lottie Animations!
- fixed build to prevent polluting global scope
- text animator multiplier fix
- fixes #1883 text offset
- fixes #1878 supports id attribute for container

## V 5.5.10
- Improvement: validating if transform is linear to remove spatial interpolation
- Fix: subtract mask transformed fix
- Expressions: added posterize time support
- Fix: incorrect easing function calculation in TextSelectorProperty
- Fix: auto oriented properties with not keyframes
- New: Implement a new Canvas renderer that can run on worker threads

## V 5.5.9
- Typing: added resize to type definitions
- Feature: added image sequence support
- FIX: clipping compositions in canvas renderer
- FIX: added precision to auto orient

## V 5.5.8
- FIX: Setting assets data before loading extra compositions
- FIX: Removed appending json at end of url
- FIX: Camera separate position properties
- Typing: Added animation event name to Lottie definitions
- Feature: Add focusable renderer setting for SVGs
- Feature: Added error handling for config and frame rendering

## V 5.5.7
- EXPRESSIONS: added support for propertyIndex on shapes
- PERFORMANCE: big performance improvement on trim paths (and other modifiers) for paths that don't change over time
- NEW: improved support for astral plane characters (like emojis)

## V 5.5.6
- FIX: surrogate pairs character support in animated text
- FIX: new expressions supported

## V 5.5.5
- changed failed image bg to transparent
- FIX: fix for old json expressions in key function

## V 5.5.4
- FIX: Updates to TypeScript definitions
- FEATURE: support for new expressions

## V 5.5.3
- FEATURE: Add SVG support for Gaussian Blur effects (thanks fmalita)
- FEATURE: Add TypeScript type definitions (thanks D34THWINGS)
- FIX: removed warning of text when created by text formatted
- FIX: fixed merged characters in fonts
- FEATURE: added mutiple settings functionality to extension
- FEATURE: added support for mask opacity in expressions
- FIX: fixes #1552 html renderer wrong font measurement
- FIX: Fix masksProperties key name in JSON docs (thanks john-preston)

## V 5.5.2
- FIX: Fix loader issue on pre-kitkat Android webview
- FIX: eroded masks in svg renderer
- FIX: text alignment in text boxes

## V 5.5.1
- FIX: key expression for new json format
- IMPROVEMENT: forcing a rerender when resize is called in canvas
- ACCESSIBILITY: added title, description and aria label for text layers for svg renderer

## V 5.5.0
- IMPROVEMENT: JSON filesize reduction. Around 25 to 33% filesize reduction with this new version.
- FEATURE: Bodymovin panel with new advanced settings to reduce filesize.
- FIX: honor `forceFlag` when calling `playSegments` (thanks @mrmos)
- FIX: added source-over as default blending mode for canvas renderer resetting
- FIX: fixed bezier easing property validation
- FIX: fixed property caching by index instead of bezier data
- FIX: added thisProperty expression value

## V 5.4.4
- FIX: viewport meta tag on android with mask fix
- FIX: fixed enterFrame direction property
- FIX: explicitly iterating math methods
- FIX: added missing expression properties
- FIX: setting class attribute via setAttribute
- FIX: added value property in key method expression
- FIX: text animator expression fix
- FIX: added smooth expression support
- FIX: hcamera expression fix
- FIX: fix animated dash property canvas
- NEW: sourceRectAtTime for images fix
- NEW: Advanced option in Bodymovin extension to skip expression properties
- NEW: removed some unused json properties

## V 5.4.3
- NEW: added blend mode support for shapes in svg renderer
- NEW: removed random ids in favour of incremental ids
- NEW: added new players
- NEW: updated build process. Removed vulnerable dependencies.
- FIX: canvas repeater fix
- FIX: Replaced typekit with Adobe Fonts support
- FIX: subtracting offsetTime for valueAtTime calculation on shapes
- FIX: expressions targeting keys fix
- FIX: multidimensional easing using first dimension value when set to 0

## V 5.4.2
- FIX: added enabled property on effect interfaces for expression
- FIX: font measuring fix for white spaces
- FIX: supporting Effects property on layers in expressions
- FIX: canvas sibling shapes with same style fix
- FIX: caching valueAtTime correctly
- FIX: AVD exporter fix on clip paths
- FIX: AVD exporter fix on initial and end values
- FIX: formatResponse if responseText - thanks @ansmonjol
- NEW: renders class name for nested group elements - thanks @russellgoldenberg

## V 5.4.1
- FIX: missing variable declaration

## V 5.4.0
- EXPRESSIONS: easing functions refactored
- FIX: stroke effect fix with multiple children elements
- FIX: adding max and min values to trim path start and end
- EXPRESSIONS: added velocity property
- FIX(text): Fix charCode assignment and optimize FontManager (thanks @kwilliams-curago)
- FIX: fix for small trim paths
- EXPRESSIONS: added valueAtTime property to expression thisProperty variable
- FIX:  added locationHref to gradient data
- EXPRESSIONS: big performance improvement for all expressions that use Expression Values heavily

## V 5.3.4
- FIX: font load fix
- TEXT: End of Text character support

## V 5.3.3
- FIX: light version fix

## V 5.3.2
- FIX: .playSegments when forcing a new segment correctly removes the previous list
- FIX: loading external assets before rendering the first frame of the animation on canvas renderer
- FIX: clearing caching spatial bezier data when previous frame is reached
- FIX: promoting text property to dynamic properties when using text update methods
- FIX: extra comps width and height properties supported
- FIX: multiple trims fixed

## V 5.3.1
- FIX: expressions with non computed memberExpressions
- FIX: animated gradient in svgs 

## V 5.3.0
- REFACTOR: canvas shape renderer had an important refactor. Should support new render cases and have a performance improvement.
- EXPRESSIONS: preprocessing expressions allows to prevent getting values if not needed on expressions
- EXPRESSIONS: support for position, scale and anchorPoint variables
- EXPRESSIONS: added numLayer property support to comp interfaces
- REPEATERS: support for start and end opacity
- FIX: Rendering effects before masks fixes some small render cases
- FIX: added orientation support for 3d cameras
- FIX: dashed lines were not resetted in some scenarios

## V 5.2.1
- FIX: text animators based on words and percentages
- EXPRESSIONS: Latest Duik version support

## V 5.2.0
- FEATURE: gradient support in canvas renderer (some cases are not supported)
- EXPRESSIONS: layer name support for expressions
- FIX: reverse play on non loops
- SUPPORT: Orient along path with separate dimensions
- FIX: trim cache issue fixed

## V 5.1.20
- FIX: instaceof Array on expressions fixed
- FIX: text value on expressions fix
- FEATURE: new expressions supported

## V 5.1.19
- FIX: Trim Paths with empty paths fix
- FIX: linear method fix for inverted values
- FEATURE: Ignoring merge path's last path if square
- FIX: Camera zoom
- FIX: Validating if text data is complete on first render
- FIX: Loop counting when playing backwards
- FEATURE: Added inPoint and outPoint to layer's expressions

## V 5.1.18
- FIX: Moved defs to top to avoid Safari issues 
- FEATURE: Added crossOrigin attribute to images to avoid tainted canvases
- FEATURE: Added imagePreserveAspectRatio to rendererSettings for image layers
- FIX: splitting animations in multiple files

## V 5.1.17
- FIX: asset error handling
- FEATURE: Rove across time support
- FIX: bevel line support

## V 5.1.16
- FIX: exporting images for older version of AE.
- FEATURE: if needed can skip images export once exported a first time.

## V 5.1.15
- FEATURE: Added freeze/unfreeze methods to stop prevent any animation from playing
- FEATURE: Added getRegisterdAnimations method to get all current animations handled by lottie
- FEATURE: Exporting PNGs with render queue in order to fix black pixels around images
- FEATURE: Support for compressed jpgs when image is not transparent
- FEATURE: Support for exporting base 64 encoded images inlined in the json file
- FIX: Some small expression fixes

## V 5.1.14
- FIX: Dash property animated
- FIX: Canvas renderer skips hidden layers
- FIX: When clearCanvas is set to true on the canvas renderer, every frame is rendered
- FIX: calculation error on masks

## V 5.1.13
- EXPRESSIONS: fix for global variables used in functions
- EXPRESSIONS: operations supported for arrays

## V 5.1.12
- EXPRESSIONS: improved memory management for declared functions
- EXPRESSIONS: speedAtTime support
- FIX: trimmed paths fix
- FIX: destroy method fix
- SSR: checking for navigator to create library

## V 5.1.11
- PERFORMANCE: significant improvement on the svg and canvas renderers
- FIX: floating points fix

## V 5.1.10
- TEXT LAYERS: font measuring and some text fixes
- FIX: 2d and 3d layers stack fix
- FEATURE: added support for assetsPath when using animationData (@kwilliams-curago)
- FEATURE: added getDuration method. In frames and in seconds.
- FIX: fixed breaking change from AE 15.1 with text layers

## V 5.1.9
- EXPRESSIONS: adding name property to shape property group
- FIX: adding timeout before checking loaded fonts
- IMPROVEMENT: html elements now hide their base container when off render time bounds
- FIX: undeclared variable in reverse method
- FIX: text font issues

## V 5.1.8
- FIX: centered tracking
- FIX: augmenting linearity threshold
- FIX: using quaternions to calculate 3d orientation
- FIX: undeclared variables
- FIX: CW CCW ellipse fix
- EXPRESSIONS: added xRotation and yRotation support
- FEATURE: added skew to transform calculations
- FIX: Time remap on html renderer
- FEATURE: calculating shape bounds for html shape elements without depending on getBBox
- FEATURE: Supporting custom tags on html renderer
- FIX: dash array fix


## V 5.1.7
- FIX: looping and non looping animations end frame fix

## V 5.1.6
- FIX: HTMLRenderer image fix
- FIX: HTMLRenderer masked comp fix
- FIX: Text fWeight precedence over fStyle (thanks @nick-vincent)

## V 5.1.5
- FIX: text selector fix
- FIX: text expression fix
- FEATURE: more expressions supported

## V 5.1.4
- FIX: hidden parented layer with mask
- FIX: gradient property animated
- FIX: hindi combined characters support with text as font

## V 5.1.3
- FIX: Color interpolation fix
- FIX: id and classes fix for images and solids
- FIX: canvas nested groups transform fix
- FIX: lottie_light.js fix 

## V 5.1.2
- FIX: Expressions switch statements adding variable declaration when missing

## V 5.1.1
- Text Layer keyframed fix

## V 5.1.0
- FEATURE: support for all text document property updates usign TextLayer.updateDocumentData (check Wiki for more information)
- FEATURE: text layers with text boxes have two new methods: TextLayer.canResizeFont and TextLayer.setMinimumFontSize (check Wiki for more information)
- PERFORMANCE: Significant performance improvement on all renderers
- PERFORMANCE: repeaters significant performance improvement
- PERFORMANCE: gradients with opacity significant performance improvement
- REFACTOR: reduced and organized main element classes
- TEXT: text align fix for font based text layers

## V 5.0.6
- FIX: totalFrames and resetFrames
- FIX: canvas destroy method
- FIX: expressions rect size support
- FIX: multiple requestAnimationFrame fix
- FIX: variable not being declared
- FEATURE: support for custom viewBox

## V 5.0.5
- FIX: totalFrames now ends at previous frame to respect AE's last frame
- FIX: duplicate requestAnimationFrame call
- CHANGE: removed M0,0 added to every path. Should fix chrome issues.
- REFACTOR: small changes on AnimationItem

## V 5.0.4
- FIX: if initial value for multidimensional properties was 0 and not in start point, it wasn't getting rendered
- EXPRESSIONS: support for "anchor_point"
- PERFORMANCE: separated opacity from transform properties
- FIX: effects properties offset
- FIX: 3d orientation for negative values

## V 5.0.3
- FIX: IE Arrays support
- FIX: destroy method wasn't releasing all memory if a single animation was loaded.
- FIX: IE masks fix when used as Alpha Masks with gradients.

## V 5.0.2
- IE 10 fix
- loopIn and loopOut fix

## V 5.0.1
- expression fixes
- text box fix
- performance improvements

## V 5.0.0
- bodymovin renamed to lottie!
- gradients performance improved
- cleaned up code

## V 4.13.0
- text expression support
- text update support with updateDocumentData (check wiki)
- tangentOnPath, normalOnPath and more expressions
- loaded_images event
- fixed global calls
- fixed ie9 error

## V 4.12.3
- valueAtTime fix

## V 4.12.2
- caching fix

## V 4.12.1
- velocityAtTime fix

## V 4.12.0
- pointOnLine support
- createPath support
- points, inTangents, outTangents support
- expressions fixes
- className for  container via loading config
- 3d orientation fix
