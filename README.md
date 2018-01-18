# handy-front-end
Handy help scripts for a front-end developer

Github repo:
[https://github.com/GustavGenberg/handy-front-end](https://github.com/GustavGenberg/handy-front-end)


### included:

Some handy scripts for a easier experience building the web:

- [Canvas.js](#canvasjs)
- [Pointer.js](#pointerjs)
- [SoundPlayer.js](#soundplayerjs)
- [ElementResizeEvent.js](#elementresizeeventjs)

## Canvas.js
Makes it much easier handling the awesome canvas

Script link:

[https://gustavgenberg.github.io/handy-front-end/Canvas.js](https://gustavgenberg.github.io/handy-front-end/Canvas.js)

```javascript
// Initialize
const canvas = new Canvas( id [ width, height, context ] );
```
```javascript
// Drawing individual frames
canvas.drawFrame(function ( rendererContext, handyObject ) {
	
	rendererContext.fillText('Hello', 10, 10);
	
});

// Can also be reset and cleared easely for drawing new frames:
canvas.reset();
canvas.clear( [ bool preserveTransform ] );

// Important note!
// When the canvas element is resized, it will automatically clear its content!
// Therefore the single frame drawing is not suitable for apps where the canvas element is resized (often fullscreen)!

```
```javascript
// Drawing speed adapted to clients capabilities
// Catch the `draw` event. Functions is given arguments described in the Events section below.
canvas.on( 'draw', function ( rendererContext, handyObject, delta, now ) {

	// rendererContext : provided rendererContext ( default CanvasRenderingContext2D )
	// handyObject : object that is available in all event callback functions. very handy!
	// delta

	rendererContext.fillText('Hello', 10, 10);
	
	// in every event callback, the `this` keyword is referring to the instance

});
```

Events:

`init` => rendererContext, handyObject, now (performance.now)

`draw` => rendererContext, handyObject, delta, now (performance.now)

`update` => handyObject, delta, now (performance.now)

`start` => rendererContext, handyObject, now (performance.now)

`stop` => rendererContext, handyObject, now (performance.now)

`pause` => rendererContext, handyObject, now (performance.now)

`resume` => rendererContext, handyObject, now (performance.now)

#### handyObject

The `handyObject` is an object that is available inside all canvas events. Very handy!

It can be retrieved from outside:
```javascript
canvas.getObject();
```

```javascript
// Functions

// Start rendering
canvas.start(); // const canvas = new Canvas(...).start(function( ... ){ `start` event });

// Stop rendering
canvas.stop();

// Pause update loop
canvas.pause();

// Resume update loop
canvas.resume();


// Get base64 image of canvas
canvas.toImage( [ format ] ); // format default is png

// Save base64 image to localstorage
canvas.saveToStorage( key );

// Draw from storage
canvas.restoreFromStorage( key );

// Remove from storage
canvas.removeFromStorage( key );

// Save HandyObject to storage
canvas.saveObject( key );

// Load HandyObject from storage
canvas.loadObject( key );

// Remove saved object from storage
canvas.removeSavedObject( key );

// Limit the framerate
canvas.setFramerateLimit( fps ); // Infinity default. 0.5 = 1 frame every two secs

```
```javascript
//functions added to window.CanvasRenderingContext2D:

clear(); // clears the whole canvas
		// equal to clearRect(0, 0, width, height);
reset(); // resets the transform made on canvas
		// equal to setTransform(1, 0, 0, 1, 0, 0);
```
```javascript
// Full example

// Initialize
const canvas = new Canvas('my-canvas', 500, 500);

// Catch `start` event
canvas.on('start', function (renderingContext, handyObject, now) {

	// set start position
	handyObject.x = 5;

});

// Catch `update` event aka update loop, logic loop, game loop (clientside)
canvas.on('update', function (handyObject, delta) {

	// Use delta to move object, making sure object moves equally fast no matter the framerate (except 0 heh.. no moving at all)
	handyObject.x += 100 * delta;

});

// Catch the `draw` loop
canvas.on('draw', function (rendererContext, handyObject, delta) {

	// Clear the whole canvas
	rendererContext.clear();

	// Draw moving rectangle
	rendererContext.fillRect(handyObject.x, 10, 10, 10);

});

canvas.start();


// Full example with the start event fired directly on initialization

// Initialize
const canvas = new Canvas('my-canvas', 500, 500).start(function (renderingContext, handyObject, now) {

	// set start position
	handyObject.x = 5;

});

// Catch `update` event aka update loop, logic loop, game loop (clientside)
canvas.on('update', function (handyObject, delta) {

	// Use delta to move object, making sure object moves equally fast no matter the framerate (except 0 heh.. no moving at all)
	handyObject.x += 100 * delta;

});

// Catch the `draw` loop
canvas.on('draw', function (rendererContext, handyObject, delta) {

	// Clear the whole canvas
	rendererContext.clear();

	// Draw moving rectangle
	rendererContext.fillRect(handyObject.x, 10, 10, 10);

});
```

## Pointer.js
Script that keeps tracking the mouse pointer easy.

Script link:

[https://gustavgenberg.github.io/handy-front-end/Pointer.js](https://gustavgenberg.github.io/handy-front-end/Pointer.js)

```javascript
// Initialize
const pointer = new Pointer( [ element (default window) ] );

// Get mouse x
pointer.x
// Get mouse y
pointer.y

// returns undefined if not known


// Get mouse pointer path ( elements that the pointer is pointing at)
pointer.path
// Get the "closest" element (like p)
pointer.path[0]
// Get "faraway" element (like body, html)
pointer.path[.. > 0]

// returns undefined if not known


// Get the state of a button
pointer.isDown(pointer.BTN_LEFT); // true or false

// Buttons:
// pointer.BTN_LEFT
// pointer.BTN_MIDDLE
// pointer.BTN_RIGHT

// Disable the right-click context menu
pointer.disableContextMenu();

// Enable the right click context menu that was disabled by this script!
pointer.enableContextMenu();

// Get newest clickHistory entry
pointer.getLastClick(); // => {t, x, y, evt, endx, endy, endevt} t = timestamp x,y is the mousedown pos and endx,endy is the mouseup pos.

// add event listener
pointer.on( 'down'/'up'/'move' , function (event) {
	// event => {t: timestamp, x: x-pos, y: y-pos, [ down/up : button ], evt: raw event}
});

// oncontextmenu of Pointer.element
pointer.on( 'contextmenu', function (raw event) {

});

// get relative pointer position of element
pointer.relative(); => {element: Pointer.element, x: xpos relative to element, y: ypos relative to element}

// get relative position of provided element
pointer.relative(element, x, y); => same ^

// check if pointer is touching an element/object
pointer.touches( [ x, y, ] {x, y: width, height}|HTMLElement);


new Pointer() =>

// variables

BTN_LEFT: 0
BTN_MIDDLE: 1
BTN_RIGHT: 2
buttonsDown: []
clickHistory: []
element: [default window]
listeners: Map(0) {}
mousedown: {} // mousedown[Pointer.BTN_*] when mouse button is down this is the object when the mouse button was pressed
mouseup: {} // same but for mouseup
moveHistory: [] // last 1000 mousemoves
path: null // last mousemove's event.path
preventContextMenu: ƒunction
x: null
y: null

//functions

disableContextMenu: ƒ disableContextMenu()
enableContextMenu: ƒ enableContextMenu()
getLastClick: ƒ getLastClick()
isDown: ƒ isDown(button)
on: ƒ on(event,fn)
relative: ƒ relative()

// used by Pointer
// bindElementListeners: ƒ bindElementListeners()
// fireEvent: ƒ fireEvent(event)

```
```javascript
// can be used as a fast way to disable right-click context menu
(new Pointer( element (default window) )).disableContextMenu();
// Note that doing it this way you will not be able to enable it later!

// "long" way
const pointer = new Pointer( element (default window) );
pointer.disableContextMenu();

// But you are able to enable it:
pointer.enableContextMenu();
```

## SoundPlayer.js
Makes it very easy to play audio in the browser. This script uses the Web Audio API and not the DOM way of creating audio.

Script link:

[https://gustavgenberg.github.io/handy-front-end/SoundPlayer.js](https://gustavgenberg.github.io/handy-front-end/SoundPlayer.js)

```javascript
// Initialize
const player = new SoundPlayer();

// Load AND play a sound
player.load( 'sound.mp3' ).play();

// Play loaded sound (it has to be loaded first)
player.get( 'sound.mp3' ).play();

```
SoundPlayer functions:
```javascript
player.load( [ name ], url ) => Sound object
player.get( [ name ] | url ) => Sound object

// Example
player.load('file.mp3'); => Sound object
player.get('file.mp3'); => Sound object

player.load('Good Music', 'file.mp3') => Sound object
player.get('Good Music'); => Sound object
```
Sound object functions:
```javascript
sound.play( [wait x seconds, play for x seconds] ) - plays/resumes the audio
sound.pause() - pauses the audio
sound.rewind() - starts the audio over
sound.seek( seconds ) - sets the sound starting position in seconds 
sound.setVolume( decimal zero to one ) - sets audio volume
```
Examples:
```javascript
// Example with seek
const sound = player.load('Good Music', 'file.mp3') => Sound object

sound.seek(200).play();
// OR
player.get('Good Music').seek(200).play();

// Example with play( seconds, seconds )
const sound = player.load('Good Music', 'file.mp3') => Sound object

sound.play(2, 2); // wait 2 seconds and play for 2 seconds
// OR
player.get('Good Music').play(2, 2);

// Will wait 2 seconds before playing.
```

## ElementResizeEvent.js
Adds the lacking element 'resize' event functionality. Event-based, so there is not any cpu waste at all!

Script link:

[https://gustavgenberg.github.io/handy-front-end/ElementResizeEvent.js](https://gustavgenberg.github.io/handy-front-end/ElementResizeEvent.js)

```javascript
// Get the element
const element = document.querySelector('div');

// Listen for resize events
element.addEventListener('resize', function ( width, height ) {
	// width & height are the new dimensions efter the resize
	console.log(width, height);
});
```
It is very simple! It just adds the onresize functionality to every element, not just window & document. `resize` event is triggered when a new width or height is set, through window resize (if percentage is used) & javascript. The `resize` event is NOT triggered when the style dimensions is changed due to no (known) clean solution!
