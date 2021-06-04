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
- FIX: original asset names for audios

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
- FIX: text alognment in text boxes

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
- FIX: expressions targetting keys fix
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
- bodymovin renamed to lottie
- gradients performance improved
- cleaned up code
- new expressions

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

## V 4.11.2
- new line text fix
- expression fromComp support
- rounding to decimals shapes to prevent exponential values

## V 4.11.1
- 3d and 2d layers html renderer fix
- text new lines fix
- text tracking with alignment fix

## V 4.11.0
- bodymovin.setLocationHref method to set base url for svg fragments
- optional viewBox only settings on renderConfig
- sourceRectAtTime support for text on svg renderer
- text fixes and performance improvements

## V 4.10.3
- fix for AE CC2014 when reopening App
- line cap - projecting cap support
- AVD fix for AE CC2014

## V 4.10.2
- AVD fixes

## V 4.10.1
- Expression fix

## V 4.10.0
- Lots of new expressions
- Ouroboros 2.0 support! (in beta just in case)
- AVD Format export!

## V 4.9.0
- Full repeaters support
- Keyframes interpolation fix for stretched layers
- inBrowser method added 

## V 4.8.0
- Fonts fix for Lottie compatibility
- fonts reduced exported filesize
- fonts fix for non-zero width character
- expressions transform separate dimensions fix
- expression shape rectangle size support

## V 4.7.1
- still images validation fix
- expression for transform on separate dimensions fix

## V 4.7.0
- hiding elements when opacity is at 0
- colinear points fix
- anchor point expression fix
- server side rendering window object validation (thanks @zephinzer)

## V 4.6.11
- Non spatial interpolation fix
- new expressions supported
- fonts fix

## V 4.6.10
- AE language export fix
- nearestKey expression fix

## V 4.6.9
- new expressions. More Rubberhose support
- expression fixes
- expression sandboxing window and document
- pointInLine 3d fix

## V 4.6.8
- 3d camera fix
- fix for tests

## V 4.6.7
- Trim path with Rectangle fix

## V 4.6.6
- Text baseline supported (from After Effects 13.6 (CC 2015))
- text animator fixes

## V 4.6.5
- trim path full fix

## V 4.6.4
- velocityAtTime expression fix

## V 4.6.3
- bodymovin_light fix
- rubberhose autoflop patch for inactive admin property

## V 4.6.2
- repeaters! (partially but should cover many cases)
- new expressions
- render improvements
- reduced garbage collection

## V 4.6.1
- 3D orientation fix
- render improvements

## V 4.6.0
- New UI!
- Drop shadow effect support
- performance improvement on animations with offsetted layers
- big performance improvement on expressions
- expressions expressions expressions

## V 4.5.9
- expressions variable declaration fix
- effect control type fix

## V 4.5.8
- fill-rule for fills and gradient fills on shapes
- rounding colors values with an extra decimal
- property expressions that return strings are evaluated as numbers

## V 4.5.7
- standalone autoplay fix

## V 4.5.6
- expression instance fix for CEP
- new variables declarations in expression conditional statements
- reduced filesize on exported shapes with different vertex count
- setting parents context when calling destroy (fixes webpack issue)

## V 4.5.5
- Text selector Triangle fix
- Expressions support for "active" property on effects
- Rearranged exporting properties
- Included "a" property for animated props
- Docs updated

## V 4.5.4
- Trim path individually supported
- bug fix that messed with webpack build

## V 4.5.3
- Skipping non breaking space on characters
- levels effect optimizations
- shape expressions transform properties added (Needed to fix a Rubberhose 2 issue)
- transform properties in expression through transformInterface

## V 4.5.2
- Comp expression interface default return
- HTML renderer validation fix

## V 4.5.1
- Trim path fix
- Html renderer fixes

## V 4.5.0
- Tritone effect supported
- Levels effect supported. The one called "Levels (Individual Controls)"

## V 4.4.30
- Gradient Fill default value breaking render fix
- Demo file fix when json is renamed

## V 4.4.29
- Trim path fix
- html renderer fixes

## V 4.4.28
- expressions: better seeded random, properties by matchName, normalize support
- single shape text with keyframes fix
- masked track matted comps fix
- trim path 0% to 100% fix

## V 4.4.27
- playSegments fix
- inverting alphas with color matrices

## V 4.4.26
- expressions Math.abs fix
- Layer Index expression support
- Nested group effects fix

## V 4.4.25
- text properties matched by matchName
- destroy anims fix for animation count
- checking callbacks array before dispatching event

## V 4.4.24
- text mask path fixes
- text tracking fix on texts without animators
- transform yPosition and xPosition expression interface
- rounded corners expression interface
- shape hold keyframes last frame fix
- mask with single vertex fix
- reversed shapes on hold keyframes fix
- shape interfaces fixes
- fromWorld and toWorld expression support
- function invoked from function expression support
- inner grouped shapes transformation fix
- opacity on masks supported for svg renderer
- duplicate ellipse export fix
- rounded corners on rectangle shapes fix
- rounded corners multiple shapes fix
- time remapped stretched layers fix
- shapes with no vertices fix
- more stroke effect types support
- luminance mask fix
- alpha mask support IE and Edge

## V 4.4.23
- expressions transform opacity interface
- removing rAF when idle (thanks to @mpeterson2 for the suggestion and PR)

## V 4.4.22
- text layer defaulting line height value when first char is new line

## V 4.4.21
- stroke effect improvement

## V 4.4.20
- previous versions masks fix

## V 4.4.19
- getValueAtTime expression fix
- shape and mask expression support
- open and close shapes support per keyframe
- html renderer cyclic fix

## V 4.4.18
- standalone export fix

## V 4.4.17
- expression support for effect and effect group match name

## V 4.4.16
- support for text source keyframes
- fix parented masked layers
- new expressions
- rect shape expressions interface

## V 4.4.15
- new expressions
- blend mode fix

## V 4.4.14
- fixed bodymovin_light
- fixed translations with same origin and destination

## V 4.4.13
- preserveAspectRatio all values for canvas
- Different vertices between keyframes supported
- New expressions
- First effects: Stroke, Fill, Tint.
- Orient along path

## V 4.4.12
- Trim path fix on offsetted shapes

## V 4.4.11
- html and canvas renderer fixes
- more expressions supported
- better subtracted mask support on the svg renderer
- trim paths memory management corrected. If you're using Trim paths with animated strokes please update to this build!

## V 4.4.10
- fix on canvas nested compositions if only element animated was a mask

## V 4.4.9
- included preserveAspectRatio for canvas 'xMidYMid' and 'none' supported for now

## V 4.4.8
- animation new method "setSubframe" to enable subframe rendering (true by default).
- hidden guided layers and parenting restore
- split animations export resetting segments

## V 4.4.7
- Performance improvement
- Stroke gradient support

## V 4.4.6
- Nested gradient fix

## V 4.4.5
- Alpha masks fix

## V 4.4.4
- performance improvement on redrawing svg

## V 4.4.3
- gradient fixes
- transparency fixes
- more fixes
- assetsPath param to set where to look for assets

## V 4.4.2
- shape color interpolation fix

## V 4.4.1
- hold keyframes fix

## V 4.4.0
- Gradients! for svg and html renderer
- hidden track matte layers fix
- shape stroke performance and fix improvements

## V 4.3.3
- Hidden layer and Guided layers are now exportable if configured (could be needed for expressions)
- Config is remembered
- Filter for Comps
- Trim path fix
- Canvas images fix

## V 4.3.2
- preserveAspectRatio editable

## V 4.3.1
- Expression frameDuration property added
- shape last hold keyframe fix

## V 4.2.3
- Expressions framesToTime and timeToFrames
- Layer stretching. Negative values not supported yet.
- Firefox canvas save/restore performance fix
- Blend Modes (read blend modes page for specifications here https://github.com/bodymovin/bodymovin/wiki/Blend-Modes)

## V 4.2.2
- Compatibility fix for colors

## V 4.2.1
- Expressions fix for AE 2015.3
- Added bodymovin_light.js

## V 4.2.0
- More expressions support
- Rounded corners supported on shapes
- added goToAndPlay
- Fixes

## V 4.1.8
- Fixed easing bezier values for dimensional properties

## V 4.1.7
- removing non ASCII chars from file that would break the extension in some languages.

## V 4.1.6
- module definition fix

## V 4.1.5
- stroke transform fix

## V 4.1.4
- last hold keyframe fix

## V 4.1.3
- Unary expressions
- svg compositions opacity fix
- data-bm-renderer tag fix
- evaluating expression slider values before returning

## V 4.1.1
- UMD fix

## V 4.1.0
- UMD compatible
- more expressions
- improved bezier interpolation
- fixes

## V 4.0.10
- miter join trim fix

## V 4.0.9
- html renderer shape fix

## V 4.0.7
- some expression fixes
- trimmed closed shapes fix

## V 4.0.5
- more expressions supported
- miter closed shapes fix
- demo.html can be exported from AE for local playback
- Snapshot button renamed to Preview

## V 4.0.1
- separate dimensions fix

## V 4.0.0
- 3d
- expressions
- text
- star shape

## V 3.1.7:
- Fix rounded rects

## V 3.1.5:
- Fix AE 13.6

## V 3.1.4:
- svg transform bug fix

## V 3.1.3: Naming convention
- if you name your AE layers with a '#' in front, they will get their id attribute set to that name on the svg renderer. You can use it to add interaction to specific shapes or add additional styles.

## V 3.1.2:
- shape hold keyframe fix
- snapshot feature fix

## V 3.1.1:
- translation bug fix

## V 3.1.0: the big refactor
- reduced filesize
- increased performance
- improved memory management
- fixed scaled strokes on canvas
- events

## V 3.0.8
- changed masks to clipping paths when only using AE additive masks. Performance improvement and fixes issue with strokes.

## V 3.0.7
- rounded rects fix
- stroke dash export fix

## V 3.0.5
- major memory management optimizations. and more to come.
- big performance improvements for svg animations
- segments fixes
- devicePixelRatio support. contribution from @snorpey

## V 3.0.3
- nested strokes and shapes fix
- reverse rectangles fix
- mask fix
- reversed non closed shapes fix

## V 3.0.2
- bug fix for rounded rectangles
- default quality settings modified

## V 3.0.0
- bodymovin.setQuality to optimize player performance. explained below.
- segments: export animation in segments. more below.
- snapshot: take an svg snapshot of the animation to use as poster. more below.

## Installing extensions: Until I find a way to upload it to the Adobe Exchange store, there are two possible ways to install it.

### Option 1:

- Close After Effects<br/>
- Extract the zipped file on build/extension/bodymovin.zip to the adobe CEP folder:<br/>
WINDOWS:<br/>
C:\Program Files (x86)\Common Files\Adobe\CEP\extensions or<br/>
C:\<username>\AppData\Roaming\Adobe\CEP\extensions<br/>
MAC:<br/>
/Library/Application\ Support/Adobe/CEP/extensions/bodymovin<br/>
(you can open the terminal and type:<br/>
cp -R YOURUNZIPEDFOLDERPATH/extension /Library/Application\ Support/Adobe/CEP/extensions/bodymovin<br/>
then type:<br/>
ls /Library/Application\ Support/Adobe/CEP/extensions/bodymovin<br/>
to make sure it was copied correctly type)<br/>

- Edit the registry key:<br/>
WINDOWS:<br/>
open the registry key HKEY_CURRENT_USER/Software/Adobe/CSXS.6 and add a key named PlayerDebugMode, of type String, and value 1.<br/>
MAC:<br/>
open the file ~/Library/Preferences/com.adobe.CSXS.6.plist and add a row with key PlayerDebugMode, of type String, and value 1.<br/>

### Option 2:

Install the zxp manually following the instructions here:
https://helpx.adobe.com/x-productkb/global/installingextensionsandaddons.html  
Jump directly to "Install third-party extensions"


### For both
- Go to Edit > Preferences > General > and check on "Allow Scripts to Write Files and Access Network"

## How it works
### After Effects
- Open your AE project and select the bodymovin extension on Window > Extensions > bodymovin
- A Panel will open with a Compositions tab.
- On the Compositions tab, click Refresh to get a list of all you project Comps.
- Select the composition you want to export
- Select Destination Folder
- Click Render
- look for the exported json file (if you had images or AI layers on your animation, there will be an images folder with the exported files)

#### Settings:
**segments:** export animation in segments. If you have a main comp with more than one layer you can export the animation in parts so you won't load all at once. The exporter will segment your main comp considering where a layer starts in time.<br/>
**snapshot:** take an svg snapshot of the animation to use as poster. After you render your animation, you can take a snapshot of any frame in the animation and save it to your disk. I recommend to pass the svg through an svg optimizer like https://jakearchibald.github.io/svgomg/ and play aroud with their settings.<br/>

### HTML
- get the bodymovin.js file from the build/player/ folder for the latest build
- include the .js file on your html (remember to gzip it for production)
```
<script src="js/bodymovin.js" type="text/javascript"></script>
```
You can call bodymovin.loadAnimation() to start an animation.
It takes an object as a unique param with:
- animationData: an Object with the exported animation data.
- path: the relative path to the animation object. (animationData and path are exclusive)
- loop: true / false / number
- autoplay: true / false it will start playing as soon as it is ready
- name: animation name for future reference
- animType: 'svg' / 'canvas' to set the renderer
- prerender: true / false to prerender all animation before starting (true recommended)
<br />
Returns the animation object you can control with play, pause, setSpeed, etc.
```
bodymovin.loadAnimation({
  wrapper: element, // the dom element
  animType: 'svg',
  loop: true,
  autoplay: true,
  animationData: JSON.parse(animationData) // the animation data
});
```
- if you want to use an existing canvas to draw, you can pass an extra object: 'renderer' with the following configuration:
```
bodymovin.loadAnimation({
  wrapper: element, // the dom element
  animType: 'svg',
  loop: true,
  autoplay: true,
  animationData: animationData, // the animation data
  renderer: {
    context: canvasContext, // the canvas context
    scaleMode: 'noScale',
    clearCanvas: false
  }
});
```
If you do this, you will have to handle the canvas clearing after each frame
<br/>
Another way to load animations is adding specific attributes to a dom element.
You have to include a div and set it's class to bodymovin.
If you do it before page load, it will automatically search for all tags with the class "bodymovin".
Or you can call bodymovin.searchAnimations() after page load and it will search all elements with the class "bodymovin".
<br/>
- add the data.json to a folder relative to the html
- create a div that will contain the animation.
<br/>
 **Required**
 <br/>
 . a class called "bodymovin"
 . a "data-animation-path" attribute with relative path to the data.json
 <br/>
**Optional**
<br/>
 . a "data-anim-loop" attribute
 . a "data-name" attribute to specify a name to target play controls specifically
 <br/>
 **Example**
 <br/>
 ```
<div style="width:1067px;height:600px" class="bodymovin" data-animation-path="animation/" data-anim-loop="true" data-name="ninja"></div>
```
<br/>

## Usage
bodymovin has 8 main methods:
**bodymovin.play()** -- with 1 optional parameter **name** to target a specific animation <br/>
**bodymovin.stop()** -- with 1 optional parameter **name** to target a specific animation <br/>
**bodymovin.setSpeed()** -- first param speed (1 is normal speed) -- with 1 optional parameter **name** to target a specific animation <br/>
**bodymovin.setDirection()** -- first param direction (1 is normal direction.) -- with 1 optional parameter **name** to target a specific animation <br/>
**bodymovin.searchAnimations()** -- looks for elements with class "bodymovin" <br/>
**bodymovin.loadAnimation()** -- Explained above. returns an animation instance to control individually. <br/>
**bodymovin.destroy()** -- you can register an element directly with registerAnimation. It must have the "data-animation-path" attribute pointing at the data.json url<br />
**bodymovin.setQuality()** -- default 'high', set 'high','medium','low', or a number > 1 to improve player performance. In some animations as low as 2 won't show any difference.<br />

## Events
- onComplete
- onLoopComplete
- onEnterFrame
- onSegmentStart

you can also use addEventListener with the following events:
- complete
- loopComplete
- enterFrame
- segmentStart


See the demo folders for examples or go to http://codepen.io/airnan/ to see some cool animations

## Alerts!

### Files
If you have any images or AI layers that you haven't converted to shapes (I recommend that you convert them, so they get exported as vectors, right click each layer and do: "Create shapes from Vector Layers"), they will be saved to an images folder relative to the destination json folder.
Beware not to overwrite an exiting folder on that same location.


### Performance
This is real time rendering. Although it is pretty optimized, it always helps if you keep your AE project to what is necessary<br/>
More optimizations are on their way, but try not to use huge shapes in AE only to mask a small part of it.<br/>
Too many nodes will also affect performance.

### Help
If you have any animations that don't work or want me to export them, don't hesitate to write. <br/>
I'm really interested in seeing what kind of problems the plugin has. <br/>
my email is **hernantorrisi@gmail.com**

### Version
This is version 2.1. It is even more stable but let me know if anything comes up.

## Examples
http://codepen.io/collection/nVYWZR/ <br/>

## Support
- The script supports precomps, shapes, solids, images, null objects,
- Text, image sequences, videos and audio are not supported (maybe some of them coming soon)
- It supports masks and inverted masks. Maybe other modes will come but it has a huge performance hit.
- It supports time remapping (yeah!)
- The script supports shapes, rectangles and ellipses. It doesn't support stars yet.
- No effects whatsoever. (stroke is on it's way)
- No expressions (maybe some coming)
- **No layer stretching**! No idea why, but stretching a layer messes with all the data.

## Notes
- If you want to modify the parser or the player, there are some gulp commands that can simplify the task
- look at the great animations exported on the demo folder
- gzipping the animation jsons and the player have a huge impact on the filesize. I recommend doing it if you use it for a project.

## Coming up
- Text
- Exporting images in a sprite
- Stroke Effect support
- Experimenting with the webAnimationAPI export
- Exporting 3D animations (not vectors because there is no 3d svg support on browsers)
