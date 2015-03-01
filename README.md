# bodymovin
After Effects to html library

## Setting up After Effects
- Close After Effects
- Look for the ScriptUI Panels in your Adobe AE install folder. In my case it's C:\Program Files\Adobe\Adobe After Effects CS6\Support Files\Scripts\ScriptUI Panels
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
- include the .js file on your html
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
<div style="width:1067px;height:600px" class="bodymovin" data-animation-path="animation/" data-anim-loop="true" data-name="ninja">
```

## Disclaimer! Alerts! Warnings!
### Undos
The script is **very** invasive. It will perform a lot of actions in your project that will go to the undo stack. So you'll probably won't be able to undo after exporting. I haven't figured out how to prevent this.

### Files
If you have any images or AI layers that you haven't converted to shapes (I recommend that you convert them, so they get exported as vectors), they will be added to the render queue and exported.
So expect a lot of "chimes" coming out from your speakers that will scare your cats and wake your neighbours.

## Support
- The script supports precomps, shapes, solids, images.
- Text, image sequences, videos and audio are not supported (maybe some of them coming soon)
- It supports masks and inverted masks but only in "Add" mode. Maybe other modes will come but it has a huge performance hit.
- It supports time remapping (yeah!)
- The script supports shapes, rectangles and ellipses. It doesn't support stars yet.
- Trim paths are supported.
- No effects whatsoever. (stroke is on it's way)
- **No layer stretching**! No idea why, but stretching a layer messes with all the data.