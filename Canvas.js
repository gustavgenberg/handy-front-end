/**
 * Canvas.js
 * by Gustav Genberg
 * https://github.com/GustavGenberg/handy-front-end/
 */


/**
 * window.requestAnimationFrame and window.cancelAnimationFrame polyfill
 */

!function(e){"use strict";var n,t=0,a=["moz","webkit","o","ms"];for(n=0;n<a.length&&!e.requestAnimationFrame;n+=1)e.requestAnimationFrame=e[a[n]+"RequestAnimationFrame"],e.cancelAnimationFrame=e[a[n]+"CancelAnimationFrame"]||e[a[n]+"CancelRequestAnimationFrame"];e.cancelAnimationFrame||(e.requestAnimationFrame?(a=e.requestAnimationFrame,t={},e.requestAnimationFrame=function(e){var i=n;return n+=1,t[i]=e,a(function(e){if(t.hasOwnProperty(i)){var n;try{t[i](e)}catch(e){n=e}finally{if(delete t[i],n)throw n}}}),i},e.cancelAnimationFrame=function(e){delete t[e]}):(e.requestAnimationFrame=function(n){var a=(new Date).getTime(),i=Math.max(t+16,a);return e.setTimeout(function(){n(t=i)},i-a)},e.cancelAnimationFrame=e.clearTimeout))}(this);


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

    this.canvas = document.getElementById(this.id) ? document.getElementById(this.id) : document.createElement('canvas');


    /**
     * Set id of canvas
     */

    this.canvas.id = this.id;


    /**
     * Get the rendererContext
     */

    this.renderer = this.canvas.ctx = this.canvas.getContext(arguments[3] || '2d');


    /**
     * If canvas not exists in body append it
     */

    if(!document.getElementById(this.id)) document.body.appendChild(this.canvas);


    /**
     * Pass the width and the height
     */

    this.width = this.canvas.width = arguments[1] || 300;
    this.height = this.canvas.height = arguments[2] || 150;


    /**
     * Check if fullscreen. If it is, make sure it stays that way.
     */

    if(arguments[1] == window.innerWidth && arguments[2] == window.innerHeight)
      window.addEventListener('resize', function () { this.width = this.canvas.width = window.innerWidth; this.height = this.canvas.height = window.innerHeight; }.bind(this));


    /**
     * Map which stores all the eventlisteners created with canvas.on();
     */

    this.eventListeners = new Map();


    /**
     * The handyObject
     */

    this._SCOPE_ = {};


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

    this._lastFrame = +new Date;


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
     * Fire the custom `setup` event
     */

    this.fireEvent('setup', this.renderer, this._SCOPE_);


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
     * bind the event
     */

    this.eventListeners.set(event, fn);


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

        renderer.textAlign = 'center';
        renderer.font = '30px Arial';
        renderer.fillText('Its Working!', this.width / 2, this.height / 2);


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
     * calculate the delta betweek previous loop
     */

    const now = +new Date;
    const delta = (now - this._lastFrame) / 1000.0;
    this._lastFrame = now;


    /**
     * If the update loop is not paused, fire the `update` event
     */

    if(!this._paused) this.fireEvent('update', this._SCOPE_, delta);


    /**
     * Fire the `draw` event
     */

    this.fireEvent('draw', this.renderer, this._SCOPE_, delta);


    /**
     * Request the next frame
     */

    this._rafid = window.requestAnimationFrame(this._loop.bind(this), this.canvas);


  }


  /**
   * class function that makes drawing single frames easy
   */

  drawFrame (fn) {


    /**
     * call the function with basic arguments
     */

    fn.bind(this)(this.renderer, this._SCOPE_);

  }


  /**
   * class function that starts the rendering
   */

  start () {


    /**
     * are we drawing? yes we are
     */

    this._running = true;


    /**
     * guess the previous frame timestamp at start which maximizes delta accuricy
     */

    this._lastFrame = +new Date - 16;


    /**
     * Fire the `start` event
     */

    this.fireEvent('start', this.renderer, this._SCOPE_);


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

    this.fireEvent('stop', this.renderer, this._SCOPE_);


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

    this.fireEvent('pause', this.renderer, this._SCOPE_);


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

    this.fireEvent('resume', this.renderer, this._SCOPE_);


    /**
     * return the instance
     */

    return this;


  }


}
