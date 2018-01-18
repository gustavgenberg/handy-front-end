/**
 * ElementResizeEvent.js
 * by Gustav Genberg
 * https://github.com/GustavGenberg/handy-front-end#elementresizeevent.js
 */


(function (window) {


  /**
   * Store the default addEventListener function
   */

  const ADDEVENTLLISTENER = HTMLElement.prototype.addEventListener;


  let Listeners = [];


  /**
   * add an event listener to window
   */

  window.addEventListener('resize', function () {


    /**
     * Loop trough all listeners
     */

    Listeners.forEach(function (listener) {


      /**
       * Get width
       */

      const width = listener.element.clientWidth;


      /**
       * Get height
       */

      const height = listener.element.clientHeight;


      /**
       * Check for changes
       */

      if(width !== listener._width || height !== listener._height) {


        /**
         * trigger event
         */

        listener.triggerEvent();


        /**
         * set new width
         */

        listener._width = width;


        /**
         * set new height
         */

        listener._height = height;


      }


    });


  });


  /**
   * class ElementResizeEventListener
   */

  class ElementResizeEventListener {


    /**
     * class constructor
     */

    constructor (element, fn) {


      /**
       * Store provided element
       */

      this.element = element;

      /**
       * Store provided callback function
       */

      this.fn = fn;


      /**
       * Store current width
       */

      this._width = this.element.clientWidth;


      /**
       * Store current height
       */

      this._height = this.element.clientHeight;


      /**
       * Create the mutationObserver object
       */

      this.mutationObserver = new MutationObserver(function () {


        /**
         * check if the width or height has changed
         */

        if(this._width !== this.element.width || this._height !== this.element.height) {


          /**
           * trigger the event
           */

          this.triggerEvent();


          /**
           * Set the new current width
           */

          this._width = this.element.clientWidth;


          /**
           * Set the new current height
           */

          this._height = this.element.clientHeight;


        }

      }.bind(this));


      /**
       * Make the mutationObserver observe the element
       */

      this.mutationObserver.observe(this.element, { attributes: true });


    }


    /**
     * class function that triggers the 'resize' event
     */

    triggerEvent () {


      /**
       * call the callback function
       */

      this.fn(this.element.clientWidth, this.element.clientHeight);


    }


  }


  /**
   * replace the addEventListener function with the custom one
   */

  HTMLElement.prototype.addEventListener = function (event, fn) {


    /**
     * Check if the event type is 'resize'
     */

    if(event == 'resize') {


      /**
       * return the ElementResizeEventListener object
       */

      Listeners.push( new ElementResizeEventListener(this, fn) );


    } else {


      /**
       * return the default addEventListener
       */

      ADDEVENTLLISTENER.apply(this, [event, fn]);


    }


  }


})(window);
