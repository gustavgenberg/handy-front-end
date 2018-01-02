/**
 * Pointer.js
 * by Gustav Genberg
 * https://github.com/GustavGenberg/handy-front-end/
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
     * variables that golds the latest known mousedown and mouseup coordinates aswell as the timestamp
     */

    this.mousedown = { t: null, x: null, y: null };
    this.mouseup = { t: null, x: null, y: null };


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

    this.history = [];
    this.clickHistory = [];


    /**
     * Function that disables the right-click menu
     */

    this.preventContextMenu = function (event) {


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

  }


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

      this.buttonsDown.push(event.button);


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

        y: event.clientY


      };


      /**
       * Save the object
       */

      this.mousedown = obj;


      /**
       * Fire the custom MOUSEDOWN event
       */

      this.fireEvent('mousedown');


    }.bind(this));


    /**
     * Listener for the MOUSEUP event
     */

    this.element.addEventListener('mouseup', function (event) {


      /**
       * Remove button from the list
       */

      this.buttonsDown.splice( this.buttonsDown.indexOf(event.button), 1 );


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

        y: event.clientY


      };


      /**
       * Save the object
       */

      this.mouseup = obj;


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

        x: this.mousedown.x,


        /**
         * y position of the down
         * y position relative to top of window
         */

        y: this.mousedown.y,


        /**
         * x position of the mouseup
         * x position relative to left of window
         */

        endx: obj.x,


        /**
         * y position of the mouseup
         * y position relative to top of window
         */

        endy: obj.y


      });


      /**
       * Fire the custom MOUSEUP event
       */

      this.fireEvent('mouseup');


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

        y: event.clientY


      };


      /**
       * Save the MOUSEMOVE event in history
       */

      this.history.push(obj);


      /**
       * If the history contains more than 1000 items, remove the first one ( keeping it on 1000 by removing oldest entry )
       */

      if(this.history.length > 1000) {


        /**
         * Remove the first entry of the array
         */

        this.history.shift();


      }


      /**
       * Fire the custom MOUSEMOVE event
       */

      this.fireEvent('mousemove');


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


  }


  /**
   * class function that fires a custom event
   */

  fireEvent (event) {


    /**
     * Check if the event fired exists
     */

    if( this.listeners.has(event) ) {


      /**
       * Trigger the event
       */

      this.listeners.get(event).apply(null, this);


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
   * class function that disables the right-click menu
   */

  disableContextMenu () {


    /**
     * Add event listener
     */

    this.element.addEventListener('contextmenu', this.preventContextMenu);

  }


  /**
   * class function that enables the right-click menu
   */

  enableContextMenu () {


    /**
     * Remvoe event listener
     */

    this.element.removeEventListener('contextmenu', this.preventContextMenu);

  }


}
