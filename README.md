# bodymovin
After Effects plugin for export animations to svg + js library or to canvas + js

## CC 2015
Unfortunately it doesn't work.
I'm on it.
And they've removed the "live" expression evaluation I used as a "hack" to get speed and influence graphs, so I'll need to find another solution.
I'm on it.

## V 2.0.6
- bug fix for exporter when project files were in case sensitive descending order.
- bug fix for exporter for layers with stroke effect
- new svg support for substract, intersect and adding masks!

## V 2.0.4
- huge bug related to layers with the same name acting as parents
- also ignoring text layers and effects on layers in case they have any

## V 2.0.3
- svg alpha and luma matte masks support
- canvas inverted masks support
- lots of canvas optimizations
- custom Path2d to avoid overriding native implementation
- json fixed to export on single line

##Version 2.0 is out!
- improved performace
- better AE features support

## Setting up After Effects
- Close After Effects
- Look for the ScriptUI Panels in your Adobe AE install folder.For example:
    <br/> C:\Program Files\Adobe\Adobe After Effects CS6\Support Files\Scripts\ScriptUI Panels
- Paste the 2 files "bodymovin_parser.jsx" and "helperProject.aep" located in the build/parser/ folder
- Open After Effects
- Go to Edit > Preferences > General > and check on "Allow Scripts to Write Files and Access Network"

## How it works
### After Effects
- Open your AE project and select the script (bodymovin_parser.jsx) on the Window menu.
- A Panel will open with a Compositions tab.
- On the Compositions tab, click Refresh to get a list of all you project Comps.
- Select the composition you want to export
- Select Add to Render Queue
- Select Destination Folder
- Click Render (render may take a while, depending on the complexity of the animation, and will block AE until it's done. be patient and understanding)
- look for the exported data.json file (if you had images or AI layers on your animation, there will be a files folder with the exported files)

### HTML
- get the bodymovin.js file from the build/player/ folder
- include the .js file on your html (remember to zip it for production)
```
<script src="js/bodymovin.js" type="text/javascript"></script>
```
You can call bodymovin.loadAnimation() to start an animation.
It takes an object as a unique param with:
- animationData: an Object with the exported animation data.
- path: the relative path to the animation object. (animationData and path are exclu
- loop: true / false / number
- autoplay: true / false it will start playing as soon as it is ready
- name: animation name for future reference
- animType: 'svg' / 'canvas' to set the renderer
- prerender: true / false to prerender all animation before starting (true recommended)
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
Another way to load animations is adding some attributes to a dom element.
You can include a div and set it's class to bodymovin.
If you do it before page load, it will automatically find it.
Or you can call bodymovin.searchAnimations() after page load and it will search all elements with the class "bodymovin"
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
bodymovin has 6 main methods:
**bodymovin.play()** -- with 1 optional parameter **name** to target a specific animation <br/>
**bodymovin.stop()** -- with 1 optional parameter **name** to target a specific animation <br/>
**bodymovin.setSpeed()** -- first param speed (1 is normal speed) -- with 1 optional parameter **name** to target a specific animation <br/>
**bodymovin.setDirection()** -- first param direction (1 is normal direction.) -- with 1 optional parameter **name** to target a specific animation <br/>
**bodymovin.searchAnimations()** -- looks for elements with class "bodymovin"
**bodymovin.registerAnimation()** -- you can register an element directly with registerAnimation. It must have the "data-animation-path" attribute pointing at the data.json url

See the demo folders for examples or go to http://codepen.io/airnan/ to see some cool animations

## Alerts!

### Undos
The script is **very** invasive to your AE project. It will perform a lot of actions in your project that will go to the undo stack. So you'll probably won't be able to undo your work after exporting. I haven't figured out how to prevent this.

### Files
If you have any images or AI layers that you haven't converted to shapes (I recommend that you convert them, so they get exported as vectors, right click each layer and do: "Create shapes from Vector Layers"), they will be added to the render queue and exported.
So expect a lot of "render chimes" coming out from your speakers that will scare your cats and wake your neighbours.

### Time
If you see AE is not responding, be patient, give it some minutes. There is a lot going on.

### Performance
This is real time rendering. Although it is pretty optimized, it always helps if you keep your AE project to what is necessary<br/>
More optimizations are on their way, but try not to use huge shapes in AE only to mask a small part of it.<br/>
Too many nodes will also affect performance.

### Help
If you have any animations that don't work or want me to export them, don't hesitate to write. <br/>
I'm really interested in seeing what kind of problems the plugin has. <br/>
my email is **hernantorrisi@gmail.com**

### Version
This is version 2. It is pretty stable but let me know if anything comes up.

## Examples
http://codepen.io/collection/nVYWZR/ <br/>

## Notes
- If you want to modify the parser or the player, there are some gulp commands that can simplify the task
- look at the great animations exported on the demo folder
- gzipping the animation jsons and the player have a huge impact on the filesize. I recommend doing it if you use it for a project.

## Support
- The script supports precomps, shapes, solids, images, null objects,
- Text, image sequences, videos and audio are not supported (maybe some of them coming soon)
- It supports masks and inverted masks but only in "Add" mode. Maybe other modes will come but it has a huge performance hit.
- It supports time remapping (yeah!)
- The script supports shapes, rectangles and ellipses. It doesn't support stars yet.
- No effects whatsoever. (stroke is on it's way)
- No expressions (maybe some coming)
- **No layer stretching**! No idea why, but stretching a layer messes with all the data.

## Coming up
- Exporting images in a sprite
- Stroke Effect support
- Experimenting with the webAnimationAPI export
- Exporting 3D animations (not vectors because there is no 3d svg support on browsers)