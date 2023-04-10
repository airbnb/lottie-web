# Lottie for Web

Lottie is a library that parses [Adobe After Effects](https://www.adobe.com/products/aftereffects.html)
animations exported as json with [Bodymovin](https://github.com/airbnb/lottie-web) and renders them natively on mobile, web, and other platforms!


# View documentation, FAQ, help, examples, and more at the [lottie-web wiki](https://github.com/airbnb/lottie-web/wiki)

For the first time, designers can create **and ship** beautiful animations without an engineer painstakingly recreating it by hand. They say a picture is worth 1,000 words so here are 13,000:

![Example1](gifs/Example1.gif)


![Example2](gifs/Example2.gif)


![Example3](gifs/Example3.gif)


![Community](gifs/Community%202_3.gif)


![Example4](gifs/Example4.gif)


# Installation

```bash
# with npm
npm install lottie-web

# with bower
bower install bodymovin
```
Or you can use the script file from here:
https://cdnjs.com/libraries/bodymovin
Or get it directly from the AE plugin clicking on Get Player

If you want to install the AE plugin, see the [wiki](https://github.com/airbnb/lottie-web/wiki/AfterEffects-Plugin-Information).

## Getting Started

[Here's](https://www.youtube.com/watch?v=5XMUJdjI0L8) a video tutorial explaining how to export a basic animation and load it in an html page


- get the lottie.js file from the build/player/ folder for the latest build
- include the .js file on your html (remember to gzip it for production)
```html
<script src="js/lottie.js" type="text/javascript"></script>
```
You can call lottie.loadAnimation() to start an animation.
It takes an object as a unique param with:
- animationData: an Object with the exported animation data. **Note:** If your animation contains repeaters and you plan to call loadAnimation multiple times with the same animation, please deep clone the object before passing it (see [#1159](https://github.com/airbnb/lottie-web/issues/1159) and [#2151](https://github.com/airbnb/lottie-web/issues/2151).)
- path: the relative path to the animation object. (animationData and path are mutually exclusive)
- loop: true / false / number
- autoplay: true / false it will start playing as soon as it is ready
- name: animation name for future reference
- renderer: 'svg' / 'canvas' / 'html' to set the renderer
- container: the dom element on which to render the animation


It returns the animation instance you can control with play, pause, setSpeed, etc.

```js
lottie.loadAnimation({
  container: element, // the dom element that will contain the animation
  renderer: 'svg',
  loop: true,
  autoplay: true,
  path: 'data.json' // the path to the animation json
});
```

For advanced usage, more options, and available methods check the [documentation](https://github.com/airbnb/lottie-web/wiki/Usage).

# Demo
[See a basic implementation here.](https://codepen.io/airnan/project/editor/ZeNONO/)

# Examples
[See examples on codepen.](https://codepen.io/collection/nVYWZR/)


## Preview
You can preview or take an svg snapshot of the animation to use as poster. After you render your animation, you can take a snapshot of any frame in the animation and save it to your disk. I recommend to pass the svg through an svg optimizer like https://jakearchibald.github.io/svgomg/ and play around with their settings.<br/>

## Recommendations

### Files
If you have any images or AI layers that you haven't converted to shapes (I recommend that you convert them, so they get exported as vectors, right click each layer and do: "Create shapes from Vector Layers"), they will be saved to an images folder relative to the destination json folder.
Beware not to overwrite an existing folder on that same location.


### Performance
This is real time rendering. Although it is pretty optimized, it always helps if you keep your AE project to what is necessary<br/>
More optimizations are on their way, but try not to use huge shapes in AE only to mask a small part of it.<br/>
Too many nodes will also affect performance.

### Help
If you have any animations that don't work or want me to export them, don't hesitate to write. <br/>
I'm really interested in seeing what kind of problems the plugin has. <br/>
my email is **hernantorrisi@gmail.com**


## AE Feature Support
- The script supports precomps, shapes, solids, images, null objects, texts
- It supports masks and inverted masks. Maybe other modes will come but it has a huge performance hit.
- It supports time remapping
- The script supports shapes, rectangles, ellipses and stars.
- Expressions. Check the wiki page for [more info.](https://github.com/bodymovin/bodymovin/wiki/Expressions)
- Not supported: image sequences, videos and audio are not supported
- **No  negative layer stretching**! No idea why, but stretching a layer messes with all the data.

For more detailed information on which features are supported across players, check [Can I Lottie](https://canilottie.com/).

## Development
`npm install` or `bower install` first
`npm run build`

## Notes
- If you want to modify the parser or the player, there are some gulp commands that can simplify the task
- look at the great animations exported on codepen [See examples on codepen.](https://codepen.io/collection/nVYWZR/)
- gzipping the animation jsons and the player have a huge reduction on the filesize. I recommend doing it if you use it for a project.

## Issues
- For missing mask in Safari browser, please call lottie.setLocationHref(locationHref) before animation is generated. It usually caused by usage of base tag in html. (see above for description of setLocationHref)


## Other Libraries

* [Android](https://github.com/airbnb/lottie-android)
* [iOS](https://github.com/airbnb/lottie-ios)
* [React Native](https://github.com/airbnb/lottie-react-native)
* [Windows](https://aka.ms/lottie)


## Contributors

### Code Contributors

This project exists thanks to all the people who contribute. [[Contribute](CONTRIBUTING.md)].
<a href="https://github.com/airbnb/lottie-web/graphs/contributors"><img src="https://opencollective.com/lottie/contributors.svg?width=890&button=false" /></a>

### Financial Contributors

Become a financial contributor and help us sustain our community. [[Contribute](https://opencollective.com/lottie/contribute)]

#### Individuals

<a href="https://opencollective.com/lottie"><img src="https://opencollective.com/lottie/individuals.svg?width=890"></a>

#### Organizations

Support this project with your organization. Your logo will show up here with a link to your website. [[Contribute](https://opencollective.com/lottie/contribute)]

<a href="https://opencollective.com/lottie/organization/0/website"><img src="https://opencollective.com/lottie/organization/0/avatar.svg"></a>
<a href="https://opencollective.com/lottie/organization/1/website"><img src="https://opencollective.com/lottie/organization/1/avatar.svg"></a>
<a href="https://opencollective.com/lottie/organization/2/website"><img src="https://opencollective.com/lottie/organization/2/avatar.svg"></a>
<a href="https://opencollective.com/lottie/organization/3/website"><img src="https://opencollective.com/lottie/organization/3/avatar.svg"></a>
<a href="https://opencollective.com/lottie/organization/4/website"><img src="https://opencollective.com/lottie/organization/4/avatar.svg"></a>
<a href="https://opencollective.com/lottie/organization/5/website"><img src="https://opencollective.com/lottie/organization/5/avatar.svg"></a>
<a href="https://opencollective.com/lottie/organization/6/website"><img src="https://opencollective.com/lottie/organization/6/avatar.svg"></a>
<a href="https://opencollective.com/lottie/organization/7/website"><img src="https://opencollective.com/lottie/organization/7/avatar.svg"></a>
<a href="https://opencollective.com/lottie/organization/8/website"><img src="https://opencollective.com/lottie/organization/8/avatar.svg"></a>
<a href="https://opencollective.com/lottie/organization/9/website"><img src="https://opencollective.com/lottie/organization/9/avatar.svg"></a>
