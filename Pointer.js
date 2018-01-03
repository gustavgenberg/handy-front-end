/**
 * Pointer.js
 * by Gustav Genberg
 * https://github.com/GustavGenberg/handy-front-end#pointerjs
 */


/**
 * class Pointer
 */

class Pointer {


  /**
   * The class constructor
   *
   * Takes a single argument of type DOMElement or nothing
   */

  constructor (el) {

    /**
     * Set the element that the listeners will later be bound to
     */

    this.element = el || window;


    /**
     * "GLOBALS"
     */

    this.BTN_LEFT = 0;
    this.BTN_MIDDLE = 1;
    this.BTN_RIGHT = 2;


    /**
     * Define the vars that will hold the basic mouse properties
     */

    this.x = null;
    this.y = null;

    this.buttonsDown = [];


    /**
     * Handy variable that will store what element(s) the mouse is pointing at
     */

    this.path = null;


    /**
     * variables that holds the latest known mousedown and mouseup coordinates aswell as the timestamp for each button
     */

    this.mousedown = {};
    this.mouseup = {};

    [this.BTN_LEFT, this.BTN_MIDDLE, this.BTN_RIGHT].forEach(function (button) {
      this.mousedown[button] = this.mouseup[button] = { t: null, x: null, y: null, evt: null };
    }.bind(this));


    /**
     * The listener map that the on() fn(s) will be stored in
     */

    this.listeners = new Map();


    /**
     * History arrays that contains mouse moves and clicks/drags
     *
     * history will hold last 1000 mouse moves registred by the browser
     * clickHistory will hold every click made by the user, aswell as the coordinates when the mouseup event is triggered.
     */

    this.moveHistory = [];
    this.clickHistory = [];


    /**
     * Function that disables the right-click menu
     */

    const _p = this;

    this.preventContextMenu = function (event) {


      /**
       * Fire `contextmenu` event
       */

      _p.fireEvent('contextmenu', event);


      /**
       * Prevent the context menu
       */

      event.preventDefault();


      /**
       * Return false
       */

      return false;


    };


    /**
     * Bind the listeners to this.element
     */

    this.bindElementListeners();


    /**
     * return the instance
     */

    return this;


  };


  /**
   * class function that bind all mouse related event listeners to this.element
   */

  bindElementListeners () {


    /**
     * Listener for the MOUSEDOWN event
     */

    this.element.addEventListener('mousedown', function (event) {


      /**
       * Add button to the list
       */

      if(!this.isDown(event.button)) this.buttonsDown.push(event.button);


      /**
       * Object with all necessary information from a mousedown event
       */

      const obj = {


        /**
         * Timestamp
         */

        t: +new Date,


        /**
         * x position relative to top left of window
         */

        x: event.clientX,


        /**
         * y position relative to top left of window
         */

        y: event.clientY,


        /**
         * button down
         */

        button: event.button,


        /**
         * raw event
         */

        evt: event


      };


      /**
       * Update objects
       */

      this.mousedown[event.button] = obj;
      this.mouseup[event.button] = { t: null, x: null, y: null, button: null, evt: null };


      /**
       * Fire the custom MOUSEDOWN event
       */

      this.fireEvent('down', obj);


    }.bind(this));


    /**
     * Listener for the MOUSEUP event
     */

    this.element.addEventListener('mouseup', function (event) {


      /**
       * Remove button from the list
       */

      if(this.isDown(event.button)) this.buttonsDown.splice( this.buttonsDown.indexOf(event.button), 1 );


      /**
       * Object with all necessary information from a mouseup event
       */

      const obj = {


        /**
         * Timestamp
         */

        t: +new Date,


        /**
         * x position relative to left of window
         */

        x: event.clientX,


        /**
         * y position relative to top of window
         */

        y: event.clientY,


        /**
         * the clicked button
         */

        button: event.button,


        /**
         * raw event
         */

        evt: event


      };


      /**
       * Save the MOUSEUP event in click history
       */

      this.clickHistory.push({


        /**
         * Timestamp
         */

        t: +new Date,


        /**
         * x position of the down
         * x position relative to left of window
         */

        x: this.mousedown[event.button].x,


        /**
         * y position of the down
         * y position relative to top of window
         */

        y: this.mousedown[event.button].y,


        /**
         * clicked button
         */

        button: event.button,


        /**
         * raw mousedown event
         */

        evt: this.mousedown[event.button].evt,


        /**
         * x position of the mouseup
         * x position relative to left of window
         */

        endx: obj.x,


        /**
         * y position of the mouseup
         * y position relative to top of window
         */

        endy: obj.y,


        /**
         * raw mouseup event
         */

        endevt: obj.evt


      });


      /**
       * Update objects
       */

      this.mouseup[event.button] = obj;
      this.mousedown[event.button] = { t: null, x: null, y: null, button: null, evt: null };


      /**
       * Fire the custom MOUSEUP event
       */

      this.fireEvent('up', obj);


    }.bind(this));


    /**
     * Listener for the MOUSEMOVE event
     */

    this.element.addEventListener('mousemove', function (event) {


      /**
       * Save current known coordinates of mouse to variables
       */

      this.x = event.clientX;
      this.y = event.clientY;


      /**
       * Save the path of the current known mouse position
       */

      this.path = event.path;


      /**
       * Object with all necessary information from a mousemove event
       */

      const obj = {


        /**
         * Timestamp
         */

        t: +new Date,


        /**
         * x position relative to left of window
         */

        x: event.clientX,


        /**
         * y position relative to top of window
         */

        y: event.clientY,


        /**
         * buttons down
         */

        buttons: this.buttonsDown,


        /**
         * raw event
         */

        evt: event


      };


      /**
       * Save the MOUSEMOVE event in moveHistory
       */

      this.moveHistory.push(obj);


      /**
       * If the history contains more than 1000 items, remove the first one ( keeping it on 1000 by removing oldest entry )
       */

      if(this.moveHistory.length > 1000) {


        /**
         * Remove the first entry of the array
         */

        this.moveHistory.shift();


      }


      /**
       * Fire the custom MOUSEMOVE event
       */

      this.fireEvent('move', obj);


    }.bind(this));


  }


  /**
   * class function that lets you bind your own functions to handle an event
   * takes event [mousedown, mouseup, mousemove] and a function
   */

  on (event, fn) {


    /**
     * Put the event listener in the map
     */

    this.listeners.set(event, fn);


    /**
     * return the instance
     */

    return this;


  }


  /**
   * class function that fires a custom event
   */

  fireEvent (event) {


    /**
     * Check arguments.length
     */

    if(arguments.length !== 2) return;


    /**
     * Check if the event fired exists
     */

    if( this.listeners.has(event) ) {


      /**
       * Trigger the event
       */

      this.listeners.get(event).apply(this, [arguments[1]]);


    }


  }


  /**
   * class function that returns the current state of a mouse button
   */

  isDown (button) {


    /**
     * Check if the button is down
     */

    return this.buttonsDown.indexOf(button) > -1;


  }


  /**
   * class function for getting newest clickHistory entry with matching button
   */

  getLastClick (button) {


    /**
     * check if there has been any clicks
     */

    if(this.clickHistory.length == 0) return null;


    /**
     * Loop back from the newest and check button type
     */

    for(let i = this.clickHistory.length - 1; i >= 0; i--)
      if(this.clickHistory[i].button == button || !button)
        return this.clickHistory[i];


    /**
     * No match, return null
     */

    return null;

  }


  /**
   * class function that returns relative coordinates to an element
   */

  relative () {


    /**
     * Set default element
     */

    let element = this.element == window ? window.document.body : this.element;


    /**
     * Check if element is provided, replace default element
     */

    if(arguments.length > 0) element = arguments[0];


    /**
     * Get element boundings for offset calculations
     */

    const elementBoundings = element.getBoundingClientRect();


    /**
     * Calculate and return
     */

    return {


      element: element,
      x: this.x == null ? null : (arguments[1] ? arguments[1] : this.x) - elementBoundings.left,
      y: this.y == null ? null : (arguments[2] ? arguments[2] : this.y) - elementBoundings.top


    };


  }


  /**
   * class function that disables the right-click menu
   */

  disableContextMenu () {


    /**
     * Add event listener
     */

    this.element.addEventListener('contextmenu', this.preventContextMenu);


    /**
     * return the instance
     */

    return this;


  }


  /**
   * class function that enables the right-click menu
   */

  enableContextMenu () {


    /**
     * Remvoe event listener
     */

    this.element.removeEventListener('contextmenu', this.preventContextMenu);


    /**
     * return the instance
     */

    return this;
    

  }


}
