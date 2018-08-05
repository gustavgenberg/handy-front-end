/**
 * Canvas.js
 * by Gustav Genberg
 * https://github.com/GustavGenberg/handy-front-end#canvasjs
 */


(function (window) {


  /**
   * window.requestAnimationFrame and window.cancelAnimationFrame polyfill
   */

  !function(e){"use strict";var n,t=0,a=["moz","webkit","o","ms"];for(n=0;n<a.length&&!e.requestAnimationFrame;n+=1)e.requestAnimationFrame=e[a[n]+"RequestAnimationFrame"],e.cancelAnimationFrame=e[a[n]+"CancelAnimationFrame"]||e[a[n]+"CancelRequestAnimationFrame"];e.cancelAnimationFrame||(e.requestAnimationFrame?(a=e.requestAnimationFrame,t={},e.requestAnimationFrame=function(e){var i=n;return n+=1,t[i]=e,a(function(e){if(t.hasOwnProperty(i)){var n;try{t[i](e)}catch(e){n=e}finally{if(delete t[i],n)throw n}}}),i},e.cancelAnimationFrame=function(e){delete t[e]}):(e.requestAnimationFrame=function(n){var a=(new Date).getTime(),i=Math.max(t+16,a);return e.setTimeout(function(){n(t=i)},i-a)},e.cancelAnimationFrame=e.clearTimeout))}(this);


  /**
   * Simple Canvas.now polyfill
   */

  !function(n){n.performance||(n.performance={now:function(){return+new Date}})}(this);


  /**
   * Helper functions for window.CanvasRenderingContext2D
   */

  window.CanvasRenderingContext2D&&(CanvasRenderingContext2D.prototype.reset=function(){this.setTransform(1,0,0,1,0,0)},CanvasRenderingContext2D.prototype.clear=function(preserveTransform){if(preserveTransform){this.save();this.reset();}this.clearRect(0,0,this.canvas.width,this.canvas.height);if(preserveTransform){this.restore()}});


  /**
   * class Canvas
   */

  window.Canvas = class Canvas {


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
       * check if ElementResizeEvent.js is loaded
       */
      
      if('ElementResizeEventListener' in window) {
      
        
        /**
         * add custom resize event to the canvas element
         */
        
        this.element.addEventListener('resize', function (width, height) {
          
          
          /**
           * Fire the custom resize event
           */
          
          this.fireEvent('resize', width, height);
          
          
          /**
           * set new width
           */
          
          this.width = width;
         
          
          /**
           * set new height
           */
         
          this.height = height;


        }.bind(this));


      }
      
      
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
       * framerate balancing min/max
       */

      this._balanceFramerateMin = 5;
      this._balanceFramerateMax = Infinity;


      /**
       * canvasElements list
       */

      this.canvasElements = [];


      /**
       * Make the reset and clear CanvasRenderingContext2D functions easy to use for single frame drawing
       */

      this.reset = this.renderer.reset.bind(this.renderer);
      this.clear = this.renderer.clear.bind(this.renderer);


      /**
       * Draw the 'Its Working!' frame
       */

      this.drawWorkingFrame();


      /**
       * Fire the custom `init` event
       */

      this.fireEvent('init', this.renderer, this._HANDYOBJECT_, Canvas.now());


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

      if(event == 'draw') {


        /**
         * clear canvas
         */

        this.element.ctx.clear();


      }


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

    drawWorkingFrame () {


      /**
       * binds the `draw` event
       */

      this.drawFrame(function (renderer) {


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

      const now = Canvas.now();
      const delta = (now - this._lastFrame) / 1000.0;


      /**
       * check if this frame can be skipped
       */

      if(1.0 / delta > this.framerateLimit) return;


      /**
       * PLANNED FUNCTION balanceFramerate
       */


      /**
       * update last rendered frame timestamp
       */

      this._lastFrame = now;


      /**
       * If the update loop is not paused, fire the `update` event
       */

      if(!this._paused) this.fireEvent('update', this._HANDYOBJECT_, delta, Canvas.now());


      /**
       * render all elements in canvasElements
       */

      //this.renderCanvasElements();

      /**
       * Fire the `draw` event
       */

      this.fireEvent('draw', this.renderer, this._HANDYOBJECT_, delta, Canvas.now());


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

    start (fn) {

      
      /**
       * check if we are already running
       */
       
      if(this._running) return;
      

      /**
       * are we drawing? yes we are
       */

      this._running = true;


      /**
       * guess the previous frame timestamp at start which maximizes delta accuricy
       */

      this._lastFrame = Canvas.now() - 16;


      /**
       * Fire the `start` event
       */

      this.fireEvent('start', this.renderer, this._HANDYOBJECT_, Canvas.now());


      /**
       * Callback
       */

      if(fn) fn.apply(this, [this.renderer, this._HANDYOBJECT_, Canvas.now()]);


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

    stop (fn) {


      /**
       * check if we are already not running
       */
       
      if(!this._running) return;
      
      
      /**
       * we are not drawing
       */

      this._running = false;


      /**
       * fire the `stop` event
       */

      this.fireEvent('stop', this.renderer, this._HANDYOBJECT_, Canvas.now());


      /**
       * Callback
       */

      if(fn) fn.apply(this, [this.renderer, this._HANDYOBJECT_, Canvas.now()]);


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

    pause (fn) {
      
      
      /**
       * check if we are already paused
       */
       
      if(this._paused) return;


      /**
       * do not run update loop
       */

      this._paused = true;


      /**
       * fire the `pause` event
       */

      this.fireEvent('pause', this.renderer, this._HANDYOBJECT_, Canvas.now());


      /**
       * Callback
       */

      if(fn) fn.apply(this, [this.renderer, this._HANDYOBJECT_, Canvas.now()]);


      /**
       * return the instance
       */

      return this;


    }


    /**
     * class function that resumes the update loop
     */

    resume (fn) {

      
      /**
       * check if we are already not paused
       */
       
      if(!this._paused) return;
      

      /**
       * the update loop is not paused
       */

      this._paused = false;


      /**
       * fire the `resume` event
       */

      this.fireEvent('resume', this.renderer, this._HANDYOBJECT_, Canvas.now());


      /**
       * Callback
       */

      if(fn) fn.apply(this, [this.renderer, this._HANDYOBJECT_, Canvas.now()]);


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
     * class function that reduces the frame count when frames are identical
     */

    balanceFramerate (bool, min, max) {


      /**
       * set balanceFramerate true/false
       */

      this.balanceFramerate = bool;


      /**
       * set balanceFramerate min
       */

      if(min) this._balanceFramerateMin = min;


      /**
       * set balanceFramerate max
       */

      if(max) this._balanceFramerateMax = max;

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


    /**
     * class function that adds a canvas image object to renderlist
     */

    addElement (canvasElement) {


      /**
       * add canvaselement to list
       */

      this.canvasElements.push(canvasElement);


    }


    /**
     * class function that removes a canvasElement from the renderlist
     */

    removeElement (canvasElement) {


      /**
       * remove the canvasElement
       */

      this.canvasElements.splice(this.canvasElements.indexOf(canvasElement), 1);


    }


    /**
     * class function that returns all canvasElements
     */

    getElements () {


      /**
       * return all canvasElements
       */

      return this.canvasElements;


    }


    /**
     * class function that renders all canvas elements
     */

    renderCanvasElements () {

      const renderer = this.renderer;
      renderer.clear();
      if(this.canvasElements.length) renderer.clear();

      for( let element of this.canvasElements ) {

        if(element.animation) {

          const ratio = (Canvas.now() - element.animation.start) / (element.animation.end - element.animation.start);

          if(ratio >= 1) {
            element.animation = false;
          } else {

            switch(element.animation.type) {
              case 'move':
                  element.x = Canvas.lerp(element.animation.from.x, element.animation.to.x, ratio);
                  element.y = Canvas.lerp(element.animation.from.y, element.animation.to.y, ratio);
                break;

              case 'lineLength':
                element.lineLength = Canvas.lerp(element.animation.from.lineLength, element.animation.to.lineLength, ratio);

            }

          }

        }

        switch (element.constructor.name) {

          case 'CanvasImage':
            if(!element.element) continue;
            if(element.sourceX)
              renderer.drawImage(element.element, element.sourceX, element.sourceY, element.sourceWidth, element.sourceHeight, element.x, element.y, element.width, element.height);
            else
              renderer.drawImage(element.element, element.x, element.y, element.width, element.height);
            break;

          case 'CanvasLine':
            renderer.save();
            renderer.beginPath();
            renderer.moveTo(element.from.x, element.from.y);
            renderer.lineTo(Canvas.lerp(element.from.x, element.to.x, element.lineLength), Canvas.lerp(element.from.y, element.to.y, element.lineLength));
            renderer.lineWidth = element.lineWidth;
            renderer.lineCap = element.lineCap;
            renderer.stroke();
            renderer.restore();

        };

      }


    }


  };


  /**
   * Linear interpolation - used for animations
   */

  Canvas.lerp = function (v1, v2, t) {
    return (1 - t) * v1 + t * v2;
  };


  /**
   * returns Canvas.now() or +new Date
   */

  Canvas.now = function () {


    /**
     * check if performance exists
     */

    if('performance' in window && 'now' in window.performance) {


      /**
       * return Canvas.now
       */

      return performance.now();


    }


    /**
     * if performance does not exist, use +new Date
     */

    return +new Date;


  };


  /**
   * CANVAS ELEMENTS
   * EXPERIMENTAL
   */
  
  
  Canvas.Vector = class Vector {
    constructor () {
    
      this.pos = {};
      
      this.pos.x = arguments[0];
      this.pos.y = arguments[1];
      this.pos.z = arguments[2];
      
      this.rotation = {};
      
      this.rotation.x = arguments[3];
      this.rotation.y = arguments[4];
      this.rotation.z = arguments[5];
      
      
    }
    
    mult (vector) {
      
      this.pos.x *= vector.pos.x;
      this.pos.y *= vector.pos.y;
      this.pos.z *= vector.pos.z;
      
      this.pos.x *= vector.rotation.x;
      this.pos.y *= vector.rotation.y;
      this.pos.z *= vector.rotation.z;
      
    }
    
    add (vector) {
      
      this.pos.x += vector.pos.x;
      this.pos.y += vector.pos.y;
      this.pos.z += vector.pos.z;
      
      this.pos.x += vector.rotation.x;
      this.pos.y += vector.rotation.y;
      this.pos.z += vector.rotation.z;
      
    }
      
  }

  Canvas.Element = class Element {

    constructor () {

      const args = arguments[0] || {};

      this.x = typeof args.x !== 'undefined' ? args.x : null;
      this.y = typeof args.y !== 'undefined' ? args.y : null;

      this.width = typeof args.width !== 'undefined' ? args.width : null;
      this.height = typeof args.height !== 'undefined' ? args.height : null;

      this.rotation = typeof args.rotation !== 'undefined' ? args.rotation : null;

      this.animation = false;

    }

    animate () {

      const type = arguments[0];
      const args = arguments[1];

      switch(type) {

        case 'move':

          this.animation = {
            type: type,
            from: {
              x: this.x,
              y: this.y
            },
            to: {
              x: args.x,
              y: args.y
            }
          };

          break;

        case 'lineLength':

          this.animation = {
            type: type,
            from: {
              lineLength: this.lineLength
            },
            to: {
              lineLength: args.lineLength
            }
          };

          break;

        default:
          return false;

      };

      this.animation.start = Canvas.now();
      this.animation.end = this.animation.start + args.duration;

    }

  };


  /**
   * canvas image
   */

  Canvas.Image = class CanvasImage extends Canvas.Element {

    constructor () {

      const args = arguments[0] || {};

      super(args);

      this.element = (function () {

        if(args.image)
          return args.image;
        else {
          const image = new Image();
          image.src = args.url;
          return image;
        }

      })();

      this.sourceX = args.sourceX || null;
      this.sourceY = args.sourceY || null;
      this.sourceWidth = args.sourceWidth || null;
      this.sourceHeight = args.sourceHeight || null;

      this.element.onload = function () {

        if(this.width) {
          this.element.width = this.width;
        } else
          this.width = this.element.width;

        if(this.height) {
          this.element.height = this.height;
        } else
          this.height = this.element.height;

        this.sourceX = args.sourceX || 0;
        this.sourceY = args.sourceY || 0;
        this.sourceWidth = args.sourceWidth || this.width;
        this.sourceHeight = args.sourceHeight || this.height;

        if(typeof arguments[1] == 'function') arguments[1]();

      }.bind(this);

    }

  };


  /**
   * canvas line
   */

  Canvas.Line = class CanvasLine extends Canvas.Element {

    constructor () {

      const args = arguments[0] || {};

      super(args);

      this.from = { x: args.from.x, y: args.from.y };
      this.to = { x: args.to.x, y: args.to.y };

      this.lineWidth = args.lineWidth || 2;
      this.lineCap = args.lineCap || 'butt';

      this.lineLength = args.lineLength || 0.5;

    }

  };
  
  
})(window);
