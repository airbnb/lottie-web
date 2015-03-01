# bodymovin
after effects to html library

## Setting up After Effects
- Close After effects
- Look for the ScriptUI Panels in your Adobe AE install folder. In my case it's C:\Program Files\Adobe\Adobe After Effects CS6\Support Files\Scripts\ScriptUI Panels
- Paste the 2 files "bodymovin_parser.jsx" and "helperProject.aep" located in the build/parser/ folder
- Open After Effects
- Go to Edit > Preferences > General > and check on "Allow Scripts to Write Files and Access Network"

## How it works
### After Effects
- Open your AE project and select the script (bodymovin_parser.jsx) on the Window menu file.
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
 **Required**
 . a class called "bodymovin"
 . a "data-animation-path" attribute with relative path to the data.json
**Optional**
 . a "data-anim-loop" attribute
 . a "data-name" attribute to specify a name to target play controls specifically
 **Example**
<div style="width:1067px;height:600px" class="bodymovin" data-animation-path="animation/" data-anim-loop="true" data-name="ninja"></div>