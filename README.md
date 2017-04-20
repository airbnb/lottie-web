# bodymovin
After Effects plugin for exporting animations to svg/canvas/html + js

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

**Get it directly from the store!**
https://creative.adobe.com/addons/products/12557
CC 2014 and up.

If you need the latest latest version, you can still install it from here:

### Option 1 (Recommended):
- download the ZIP from the repo.
- Extract content and get the .zxp file from '/build/extension'
- Use the [ZXP installer](http://aescripts.com/learn/zxp-installer/) from aescripts.com.

### Option 2:

- Close After Effects
- Extract the zipped file on build/extension/bodymovin.zxp to the adobe CEP folder:

**WINDOWS:**
```
C:\Program Files (x86)\Common Files\Adobe\CEP\extensions 
// or
C:\<username>\AppData\Roaming\Adobe\CEP\extensions
```

**MAC:**
```
/Library/Application\ Support/Adobe/CEP/extensions/bodymovin
// (you can open the terminal and type:
cp -R YOURUNZIPEDFOLDERPATH/extension /Library/Application\ Support/Adobe/CEP/extensions/bodymovin
// then type:
ls /Library/Application\ Support/Adobe/CEP/extensions/bodymovin
to make sure it was copied correctly type)
```

- Edit the registry key:

**WINDOWS:**
 - open the registry key HKEY_CURRENT_USER/Software/Adobe/CSXS.6 and add a key named PlayerDebugMode, of type String, and value 1.

**MAC:**
 - open the file ~/Library/Preferences/com.adobe.CSXS.6.plist and add a row with key PlayerDebugMode, of type String, and value 1.

### Option 3:

Install the zxp manually following the instructions here:
```
https://helpx.adobe.com/x-productkb/global/installingextensionsandaddons.html  
```
Skip directly to "Install third-party extensions"


### For all of them
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
**segments:** export animation in segments. If you have a main comp with more than one layer you can export the animation in parts so you won't load all at once. The exporter will segment your main comp considering where a layer starts in time.

**snapshot:** take an svg snapshot of the animation to use as poster. After you render your animation, you can take a snapshot of any frame in the animation and save it to your disk. I recommend to pass the svg through an svg optimizer like https://jakearchibald.github.io/svgomg/ and play around with their settings.

### HTML
**Check the demos for different ways to load animations.**
- get the bodymovin.js file from the build/player/ folder for the latest build
- include the .js file on your html (remember to gzip it for production)

```html
<script src="js/bodymovin.js" type="text/javascript"></script>
```

You can call bodymovin.loadAnimation() to start an animation.
It takes an object as a unique param with:
- **animationData**: an Object with the exported animation data.
- **path**: the relative path to the animation object. (animationData and path are mutually exclusive)
- **loop**: true / false / number
- **autoplay**: true / false it will start playing as soon as it is ready
- **name**: animation name for future reference
- **renderer**: 'svg' / 'canvas' / 'html' to set the renderer
- **container**: the dom element on which to render the animation

Returns the animation object you can control with play, pause, setSpeed, etc.
```js
bodymovin.loadAnimation({
  container: element, // the dom element
  renderer: 'svg',
  loop: true,
  autoplay: true,
  animationData: JSON.parse(animationData) // the animation data
});
```

- if you want to use an existing canvas to draw, you can pass an extra object: 'renderer' with the following configuration:

```js
bodymovin.loadAnimation({
  container: element, // the dom element
  renderer: 'svg',
  loop: true,
  autoplay: true,
  animationData: animationData, // the animation data
  rendererSettings: {
    context: canvasContext, // the canvas context
    scaleMode: 'noScale',
    clearCanvas: false
  }
});
```
If you do this, you will have to handle the canvas clearing after each frame

Another way to load animations is adding specific attributes to a dom element.
You have to include a div and set it's class to bodymovin.
If you do it before page load, it will automatically search for all tags with the class "bodymovin".
Or you can call bodymovin.searchAnimations() after page load and it will search all elements with the class "bodymovin".

- add the data.json to a folder relative to the html
- create a div that will contain the animation.


 **Required**
 . a class called "bodymovin"
 . a "data-animation-path" attribute with relative path to the data.json

 **Optional**
 . a "data-anim-loop" attribute
 . a "data-name" attribute to specify a name to target play controls specifically

 **Example**

```html
 <div style="width:1067px;height:600px" class="bodymovin" data-animation-path="animation/" data-anim-loop="true" data-name="ninja"></div>
```

## Usage
animation instances have these main methods:
 - **anim.play()** 
 - **anim.stop()**
 - **anim.pause()** 
 - **anim.setSpeed(speed)** : one param speed (1 is normal speed)
 - **anim.goToAndStop(value, isFrame)** : first param is a numeric value. second param is a boolean that defines time or frames for first param
 - **anim.goToAndPlay(value, isFrame)** : first param is a numeric value. second param is a boolean that defines time or frames for first param 
 - **anim.setDirection(direction)** : one param direction (1 is normal direction.)
 - **anim.playSegments(segments, forceFlag)** : first param is a single array or multiple arrays of two values each(fromFrame,toFrame), second param is a boolean for forcing the new segment right away
 - **anim.destroy()**

bodymovin has 8 main methods:
 - **bodymovin.play()** : with 1 optional parameter **name** to target a specific animation
 - **bodymovin.stop()** : with 1 optional parameter **name** to target a specific animation
 - **bodymovin.setSpeed()** : first param speed (1 is normal speed) -- with 1 optional parameter **name** to target a specific animation
 - **bodymovin.setDirection()** : first param direction (1 is normal direction.) -- with 1 optional parameter **name** to target a specific animation
 - **bodymovin.searchAnimations()** : looks for elements with class "bodymovin"
 - **bodymovin.loadAnimation()** : Explained above. returns an animation instance to control individually.
 - **bodymovin.destroy()** : To destroy and release resources. The DOM element will be emptied.
 - **bodymovin.registerAnimation()** : you can register an element directly with registerAnimation. It must have the "data-animation-path" attribute pointing at the data.json url
 - **bodymovin.setQuality()** : default 'high', set 'high','medium','low', or a number > 1 to improve player performance. In some animations as low as 2 won't show any difference.

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

## Recommendations

### Files
If you have any images or AI layers that you haven't converted to shapes (I recommend that you convert them, so they get exported as vectors, right click each layer and do: "Create shapes from Vector Layers"), they will be saved to an images folder relative to the destination json folder.
Beware not to overwrite an exiting folder on that same location.


### Performance
This is real time rendering. Although it is pretty optimized, it always helps if you keep your AE project to what is necessary
More optimizations are on their way, but try not to use huge shapes in AE only to mask a small part of it.<br/>
Too many nodes will also affect performance.

### Help
If you have any animations that don't work or want me to export them, don't hesitate to write. <br/>
I'm really interested in seeing what kind of problems the plugin has. <br/>
my email is **hernantorrisi@gmail.com**

## Examples
[See examples on codepen.](http://codepen.io/collection/nVYWZR/)

## Support
- The script supports precomps, shapes, solids, images, null objects, texts
- It supports masks and inverted masks. Maybe other modes will come but it has a huge performance hit.
- It supports time remapping (yeah!)
- The script supports shapes, rectangles and ellipses and stars.
- Only slider effects are supported at the moment.
- Expressions. Check the wiki page for [more info.](https://github.com/bodymovin/bodymovin/wiki/Expressions)
- Not supported: image sequences, videos and audio are (maybe some of them coming soon)
- **No layer stretching**! No idea why, but stretching a layer messes with all the data.

## Notes
- If you want to modify the parser or the player, there are some gulp commands that can simplify the task
- look at the great animations exported on codepen [See examples on codepen.](http://codepen.io/collection/nVYWZR/)
- gzipping the animation jsons and the player have a huge reduction on the filesize. I recommend doing it if you use it for a project.

