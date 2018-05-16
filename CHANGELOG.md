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