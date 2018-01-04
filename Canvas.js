/**
 * Canvas.js
 * by Gustav Genberg
 * https://github.com/GustavGenberg/handy-front-end#canvasjs
 */


/**
 * window.requestAnimationFrame and window.cancelAnimationFrame polyfill
 */

!function(e){"use strict";var n,t=0,a=["moz","webkit","o","ms"];for(n=0;n<a.length&&!e.requestAnimationFrame;n+=1)e.requestAnimationFrame=e[a[n]+"RequestAnimationFrame"],e.cancelAnimationFrame=e[a[n]+"CancelAnimationFrame"]||e[a[n]+"CancelRequestAnimationFrame"];e.cancelAnimationFrame||(e.requestAnimationFrame?(a=e.requestAnimationFrame,t={},e.requestAnimationFrame=function(e){var i=n;return n+=1,t[i]=e,a(function(e){if(t.hasOwnProperty(i)){var n;try{t[i](e)}catch(e){n=e}finally{if(delete t[i],n)throw n}}}),i},e.cancelAnimationFrame=function(e){delete t[e]}):(e.requestAnimationFrame=function(n){var a=(new Date).getTime(),i=Math.max(t+16,a);return e.setTimeout(function(){n(t=i)},i-a)},e.cancelAnimationFrame=e.clearTimeout))}(this);


/**
 * Simple performance.now polyfill
 */

!function(n){n.performance||(n.performance={now:function(){return+new Date}})}(this);


/**
 * Helper functions for window.CanvasRenderingContext2D
 */

window.CanvasRenderingContext2D&&(CanvasRenderingContext2D.prototype.reset=function(){this.setTransform(1,0,0,1,0,0)},CanvasRenderingContext2D.prototype.clear=function(preserveTransform){if(preserveTransform){this.save();this.reset();}this.clearRect(0,0,this.canvas.width,this.canvas.height);if(preserveTransform){this.restore()}});


/**
 * class Canvas
 */

class Canvas {


  /**
   * class constructor
   *
   * Takes:
   * id*
   * width
   * height
   * context
   */

  constructor () {


    /**
     * Pass the id
     */

    this.id = arguments[0];


    /**
     * Assign the canvas
     */

    this.element = document.getElementById(this.id) ? document.getElementById(this.id) : document.createElement('canvas');


    /**
     * Set id of canvas
     */

    this.element.id = this.id;


    /**
     * Get the rendererContext
     */

    this.renderer = this.element.ctx = this.element.getContext(arguments[3] || '2d');


    /**
     * If canvas not exists in body append it
     */

    if(!document.getElementById(this.id)) document.body.appendChild(this.element);


    /**
     * Pass the width and the height
     */

    this.width = this.element.width = arguments[1] || this.element.width;
    this.height = this.element.height = arguments[2] || this.element.height;


    /**
     * Check if fullscreen. If it is, make sure it stays that way.
     */

    if(arguments[1] == window.innerWidth && arguments[2] == window.innerHeight)
      window.addEventListener('resize', function () { this.width = this.element.width = window.innerWidth; this.height = this.element.height = window.innerHeight; }.bind(this));


    /**
     * Map which stores all the eventlisteners created with canvas.on();
     */

    this.eventListeners = new Map();


    /**
     * The handyObject
     */

    this._HANDYOBJECT_ = {};


    /**
     * window.requestAnimationFrame global id. used for cancelAnimationFrame
     */

    this._rafid = 0;


    /**
     * Are we drawing?
     */

    this._running = false;


    /**
     * Is the update loop paused?
     */

    this._paused = false;


    /**
     * The previous frame timestamp, used for delta calculations
     */

    this._lastFrame = null;


    /**
     * Framerate limit
     */

    this.framerateLimit = Infinity;


    /**
     * Make the reset and clear CanvasRenderingContext2D functions easy to use for single frame drawing
     */

    this.reset = this.renderer.reset.bind(this.renderer);
    this.clear = this.renderer.clear.bind(this.renderer);


    /**
     * Make the example scene the default one
     */

    this.defaultEventListeners();


    /**
     * Fire the custom `init` event
     */

    this.fireEvent('init', this.renderer, this._HANDYOBJECT_, performance.now());


    /**
     * Return the created instance
     */

    return this;


  }


  /**
   * class function that binds an event and function to the listener
   */

  on (event, fn) {


    /**
     * clear canvas if new draw function is set
     */

    if(event == 'draw') this.element.ctx.clear();


    /**
     * bind the event
     */

    this.eventListeners.set(event, fn);


    /**
     * return the instance
     */

    return this;

  }


  /**
   * class function that fires an custom event
   */

  fireEvent (event) {


    /**
     * passing all arguments provided except the event name by creating a duplicate and removing the first entry
     */

    let args = [];
    Array.prototype.push.apply(args, arguments);
    args.shift();


    /**
     * If the event exist in the list, call its function
     */

    if( this.eventListeners.has(event) ) this.eventListeners.get(event).apply(this, args);


  }


  /**
   * class function that binds the default scene
   */

  defaultEventListeners () {


    /**
     * binds the `draw` event
     */

    this.on('draw', function (renderer, vars, delta) {


      /**
       * Check if the current redering conext is CanvasRenderingContext2D
       */

      if(renderer instanceof CanvasRenderingContext2D) {


        /**
         * Clears the whole canvas
         */

        renderer.clear();


        /**
         * The default scene
         */

        renderer.save();

        renderer.textAlign = 'center';
        renderer.font = '30px Arial';
        renderer.fillText('Its Working!', this.width / 2, this.height / 2);

        renderer.restore();


      }


    });


  }


  /**
   * class function - the main loop
   */

  _loop () {


    /**
     * If it has been stopped, don't let it run!
     */

    if(!this._running) return;


    /**
     * Request the next frame
     */

    this._rafid = window.requestAnimationFrame(this._loop.bind(this), this.element);


    /**
     * calculate the delta betweek previous loop
     */

    const now = performance.now();
    const delta = (now - this._lastFrame) / 1000.0;


    /**
     * check if this frame can be skipped
     */

    if(1.0 / delta > this.framerateLimit) return;


    /**
     * update last rendered frame timestamp
     */

    this._lastFrame = now;


    /**
     * If the update loop is not paused, fire the `update` event
     */

    if(!this._paused) this.fireEvent('update', this._HANDYOBJECT_, delta, performance.now());


    /**
     * Fire the `draw` event
     */

    this.fireEvent('draw', this.renderer, this._HANDYOBJECT_, delta, performance.now());


  }


  /**
   * class function that makes drawing single frames easy
   */

  drawFrame (fn) {


    /**
     * call the function with basic arguments
     */

    fn.bind(this)(this.renderer, this._HANDYOBJECT_);


  }


  /**
   * class function that starts the rendering
   */

  start (callback) {


    /**
     * are we drawing? yes we are
     */

    this._running = true;


    /**
     * guess the previous frame timestamp at start which maximizes delta accuricy
     */

    this._lastFrame = performance.now() - 16;


    /**
     * Fire the `start` event
     */

    this.fireEvent('start', this.renderer, this._HANDYOBJECT_, performance.now());


    /**
     * Callback
     */

    if(callback) callback.bind(this)(this.renderer, this._HANDYOBJECT_, performance.now());


    /**
     * Call the main loop for the first time
     */

    this._loop();


    /**
     * return the instance
     */

    return this;


  }


  /**
   * game function that stops the rendering aswell as the updateloop
   */

  stop () {


    /**
     * we are not drawing
     */

    this._running = false;


    /**
     * fire the `stop` event
     */

    this.fireEvent('stop', this.renderer, this._HANDYOBJECT_, performance.now());


    /**
     * cancel the requested frame
     */

    window.cancelAnimationFrame(this._rafid);


    /**
     * return the instance
     */

    return this;


  }


  /**
   * class function that pauses the update loop
   */

  pause () {


    /**
     * do not run update loop
     */

    this._paused = true;


    /**
     * fire the `pause` event
     */

    this.fireEvent('pause', this.renderer, this._HANDYOBJECT_, performance.now());


    /**
     * return the instance
     */

    return this;


  }


  /**
   * class function that resumes the update loop
   */

  resume () {


    /**
     * the update loop is not paused
     */

    this._paused = false;


    /**
     * fire the `resume` event
     */

    this.fireEvent('resume', this.renderer, this._HANDYOBJECT_, performance.now());


    /**
     * return the instance
     */

    return this;


  }


  /**
   * class function that sets a framerate limit
   */

  setFramerateLimit (limit) {


    /**
     * set the limit
     */

    this.framerateLimit = limit;


  }


  /**
   * class function that returns base64 image of canvas
   */

  toImage (format) {


    /**
     * Set the default format
     */

    format = format || 'png';


    /**
     * return the base64 image
     */

    return this.element.toDataURL('image/' + format);


  }


  /**
   * class function that saves the current canvas image to localStorage
   */

  saveToStorage (key) {


    /**
     * set default key
     */

    key = key || 'Canvas';


    /**
     * save the base64 image
     */

    window.localStorage.setItem('canvas-' + key, this.toImage());


  }


  /**
   * class function that removes canvas state from storage
   */

  removeFromStorage (key) {


    /**
     * set default key
     */

    key = key || 'Canvas';


    /**
     * get base 64
     */

    const base64 = window.localStorage.getItem('canvas-' + key);


    /**
     * check if image exists
     */

    if(!base64) return false;


    /**
     * remove the item
     */

    window.localStorage.removeItem('canvas-' + key);


    /**
     * return true
     */

    return true;


  }


  /**
   * class function that writes canvas image from localStorage
   */

  restoreFromStorage (key) {


    /**
     * set default key
     */

    key = key || 'Canvas';


    /**
     * get base 64
     */

    const base64 = window.localStorage.getItem('canvas-' + key);


    /**
     * check if image exists
     */

    if(!base64) return false;


    /**
     * create image
     */

    const image = new Image();


    /**
     * set image source
     */

    image.src = base64;


    /**
     * image onload
     */

    image.onload = function () {


      /**
       * draw single frame to canvas
       */

      this.drawFrame(function (ctx) {


        /**
         * draw image to canvas
         */

        ctx.drawImage(image, 0, 0);


      });


    }.bind(this);


    /**
     * return true if success
     */

    return true;


  }


  /**
   * class function that returns the handyObject
   */

  getObject () {


    /**
     * return the handyObject
     */

    return this._HANDYOBJECT_;


  }


  /**
   * class function that saves the handyObject
   */

  saveObject (key) {


    /**
     * set default key
     */

    key = key || 'HO';


    /**
     * save the handyObject
     */

    window.localStorage.setItem('canvas-' + key, JSON.stringify(this.getObject()));


  }


  /**
   * class function that loads the handyObject from storage
   */

  loadObject (key) {


    /**
     * set default key
     */

    key = key || 'HO';


    /**
     * get handyObject from storage
     */

    const handyObject = JSON.parse(window.localStorage.getItem('canvas-' + key));


    /**
     * check if it exists and if it is an object
     */

    if(!handyObject || typeof handyObject !== 'object') return false;


    /**
     * update current handyObject
     */

    this._HANDYOBJECT_ = handyObject;


    /**
     * return handyObject
     */

    return this._HANDYOBJECT_;


  }


  /**
   * class function that clears the saved object
   */

  removeSavedObject (key) {


    /**
     * set default key
     */

    key = key || 'HO';


    /**
     * get handyObject from storage
     */

    const handyObject = window.localStorage.getItem('canvas-' + key);


    /**
     * check if it exists and if it is an object
     */

    if(!handyObject) return false;


    /**
     * remove
     */

    window.localStorage.removeItem('canvas-' + key);


    /**
     * return true
     */

    return true;


  }


}
