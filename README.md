# bodymovin
After Effects plugin for exporting animations to svg + js or canvas + js

## V 2.1.3
- rounding path and mask coords. should give a perf boost and fixes sime glitches.
- fixed closing rects.
- new methods playSegments and resetSegments to play a part of the animation.
- fix for canvas shapes fill opacity

## V 2.1.1
- reverse paths
- mask fix
- line join and line cap support
- trim circles

## V 2.1
- for CC 2015 only
- destroy method to release animation resources
- minor improvements

## Installing extensions: Until I find a way to upload it to the Adobe Exchange store, there are two possible ways to install it.

### Option 1:

- Close After Effects
- Extract the zipped file on build/extension/bodymovin.zip to the adobe CEP folder:
WINDOWS:
C:\Program Files (x86)\Common Files\Adobe\CEP\extensions
C:\<username>\AppData\Roaming\Adobe\CEP\extensions
MAC:
/Library~/Library/Application Support/Adobe/CEP/extensions
/Application Support/Adobe/CEP/extensions

- Edit the registry key:
On Mac, open the file ~/Library/Preferences/com.adobe.CSXS.4.plist and add a row with key PlayerDebugMode, of type String, and value 1.  
On Windows, open the registry key HKEY_CURRENT_USER/Software/Adobe/CSXS.6 and add a key named PlayerDebugMode, of type String, and value 1.

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
bodymovin has 6 main methods:
**bodymovin.play()** -- with 1 optional parameter **name** to target a specific animation <br/>
**bodymovin.stop()** -- with 1 optional parameter **name** to target a specific animation <br/>
**bodymovin.setSpeed()** -- first param speed (1 is normal speed) -- with 1 optional parameter **name** to target a specific animation <br/>
**bodymovin.setDirection()** -- first param direction (1 is normal direction.) -- with 1 optional parameter **name** to target a specific animation <br/>
**bodymovin.searchAnimations()** -- looks for elements with class "bodymovin" <br/>
**bodymovin.loadAnimation()** -- Explained above. returns an animation instance to control individually. <br/>
**bodymovin.destroy()** -- you can register an element directly with registerAnimation. It must have the "data-animation-path" attribute pointing at the data.json url

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
- It supports masks and inverted masks but only in "Add" mode. Maybe other modes will come but it has a huge performance hit.
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
