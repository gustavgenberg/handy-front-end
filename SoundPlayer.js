/**
 * SoundPlayer.js
 * by Gustav Genberg
 * https://github.com/GustavGenberg/handy-front-end#soundplayerjs
 */


(function (window) {


  /**
   * window.AudioContext polyfill
   */

  !function(t,e){"use strict";t.AudioContext=t.AudioContext||t.webkitAudioContext,t.OfflineAudioContext=t.OfflineAudioContext||t.webkitOfflineAudioContext;var o=AudioContext.prototype,r=new AudioContext,n=function(t,e){return void 0===t&&void 0!==e},c=r.createBufferSource().constructor.prototype;if(n(c.start,c.noteOn)||n(c.stop,c.noteOff)){var i=o.createBufferSource;o.createBufferSource=function(){var t=i.call(this);return t.start=t.start||t.noteOn,t.stop=t.stop||t.noteOff,t}}if("function"==typeof r.createOscillator){var a=r.createOscillator().constructor.prototype;if(n(a.start,a.noteOn)||n(a.stop,a.noteOff)){var s=o.createOscillator;o.createOscillator=function(){var t=s.call(this);return t.start=t.start||t.noteOn,t.stop=t.stop||t.noteOff,t}}}if(void 0===o.createGain&&void 0!==o.createGainNode&&(o.createGain=o.createGainNode),void 0===o.createDelay&&void 0!==o.createDelayNode&&(o.createDelay=o.createGainNode),void 0===o.createScriptProcessor&&void 0!==o.createJavaScriptNode&&(o.createScriptProcessor=o.createJavaScriptNode),-1!==navigator.userAgent.indexOf("like Mac OS X")){var u=AudioContext;t.AudioContext=function(){function t(){r.start(0),r.connect(n),n.connect(e.destination)}var e=new u,o=document.body,r=e.createBufferSource(),n=e.createScriptProcessor(256,1,1);return o.addEventListener("touchstart",t,!1),n.onaudioprocess=function(){r.disconnect(),n.disconnect(),o.removeEventListener("touchstart",t,!1),n.onaudioprocess=null},e}}}(window);


  /**
   * class SoundPlayer
   */

  window.SoundPlayer = class SoundPlayer {


    /**
     * class constructor
     */

    constructor () {


      /**
       * Get a fresh audio context
       */

      this.context = new window.AudioContext();


      /**
       * This is where all loaded sounds go
       */

      this.sounds = new Map();


    }


    /**
     * class function that returns a loaded sound
     */

    get () {


      /**
       * check if sound is loaded
       */

      if(this.sounds.has(arguments[0])) {


        /**
         * get the sound
         */

        const sound = this.sounds.get(arguments[0]);


        /**
         * return the sound object
         */

        return sound;


      }


      /**
       * return false if it did not exist
       */

      return false;


    }


    /**
     * class function that loads a script
     * name, url
     * returns sound object
     */

    load () {


      /**
       * get name, url from arguments
       */

      const name = arguments[0];
      const url = arguments.length > 1 ? arguments[1] : arguments[0];


      /**
       * load sound from url
       */

      const sound = this.getSound(url);


      /**
       * Update the loaded sounds map with the new entry
       */

      this.sounds.set(name, sound);


      /**
       * return the sound object
       */

      return sound;


    }


    /**
     * class function that returns a new sound and binds the buffer when loaded
     */

    getSound (url, callback) {


      /**
       * create new sound object
       */

      const sound = new SoundPlayer.Sound();


      /**
       * create a new soundbuffer
       */

      new SoundPlayer.SoundBuffer(this.context, url, function (soundbuffer) {


        /**
         * set buffer of sound object
         */

        sound.setBuffer(soundbuffer);


      }.bind(this));


      /**
       * return the sound object
       */

      return sound;


    }


  }


  /**
   * class SoundPlayer.Sound
   */

  SoundPlayer.Sound = class Sound {


    /**
     * constructor is not given any argmuents
     */

    constructor () {


      /**
       * the variable that holds the SoundPlayer.SoundBuffer when its loaded
       */

      this.buffer = null;


      /**
       * get playback offset from start
       */

      this.offset = 0;


      /**
       * context.currentTime for start and stop
       */

      this.startedAt = 0;
      this.stoppedAt = 0;


      /**
       * is the sound playing?
       */

      this.isPlaying = false;
      
      
      /**
       * do we want to repeat the sound?
       */
      
      this.repeat = false;


      /**
       * default volume
       */

      this.volume = 1;


      /**
       * used for the magic "sync" async "callback"
       */

      this.queuedCalls = [];


    }


    /**
     * class function that binds necessary events to sourceNode
     */

    bindSourceNodeEvents () {


      /**
       * onended event
       */

      this.buffer.sourceNode.onended = function () {
        
        
        /**
         * Check if we want to repeat
         */
        
        if(this.repeat) {
          
          
          /**
           * Play the sound
           */
          
          this.play();
          
          
          /**
           * Rewind the sound
           */
          
          this.rewind();
          
          
          /**
           * return
           */
          
          return;
         
          
        }


        /**
         * current bufferDuration
         */

        const bufferDuration = this.buffer.sourceNode.buffer.duration;


        /**
         * current sound offset
         */

        const currentTime = this.buffer.sourceNode.context.currentTime - this.startedAt;


        /**
         * the acceptable range
         */

        const range = 0.2;


        /**
         * check if current time is same as bufferDuration ( +- 0.2 )
         */

        if(currentTime > bufferDuration - range && currentTime < bufferDuration + range) {


          /**
           * set isPlaying to false
           */

          this.isPlaying = false;


        }



      }.bind(this);


    }


    /**
     * class function that sets the soundbuffer
     */

    setBuffer (soundbuffer) {


      /**
       * set the buffer
       */

      this.buffer = soundbuffer;


      /**
       * execute all queued calls to the sound object
       */

      this.queuedCalls.forEach(function (call) {

        console.log(this.queuedCalls, call);

        /**
         * call the queued call
         */

        this[call[0]].apply(this, call[1]);


        /**
         * remove call from queue
         */

        this.queuedCalls.splice( this.queuedCalls.indexOf(call), 1 );


      }.bind(this));


    }


    /**
     * class function that create buffer nodes and starts the source "stream"
     */

    start (offset, start) {


      /**
       * check if the buffer has been loaded
       */

      if(this.buffer) {


        /**
         * currentTime
         */

        const now = this.buffer.context.currentTime;


        /**
         * set the startedAt time
         */

        this.startedAt = now;


        /**
         * create buffer nodes
         */

        this.buffer.createNodes();


        /**
         * bind sourceNode events
         */

        this.bindSourceNodeEvents();


        /**
         * start the "stream"
         */

        this.buffer.sourceNode.start(now + start, offset);


      }


    }

    stop (stop) {


      /**
       * check if the buffer has been loaded
       */

      if(this.buffer) {


        /**
         * check if the buffer has been loaded
         */

        const now = this.buffer.context.currentTime;


        /**
         * set the stoppedAt time
         */

        this.stoppedAt = now;


        /**
         * stop the "stream"
         */
        this.buffer.sourceNode.stop(now + stop);


      }


    }

    play (start, stop) {


      /**
       * check if the buffer has been loaded
       */

      if(this.buffer) {


        /**
         * return if already playing to avoid errors
         */

        if(this.isPlaying) return this;


        /**
         * update isPlaying to true
         */

        this.isPlaying = true;


        /**
         * currentTime
         */

        const now = this.buffer.context.currentTime;


        /**
         * check if start is provided
         */

        start = start || 0;


        /**
         * call the start function and start at offset
         */

        this.start(this.offset, start);


        /**
         * check if stop
         */

        if(stop) {


          /**
           * schedule stop
           */

          this.stop(start + stop);


          /**
           * update isPlaying
           */

          window.setTimeout(function () {


            /**
             * update isPlaying
             */

            this.isPlaying = false;


          }.bind(this));


        }


      } else {


        /**
         * buffer has not been set - place the call in queue
         */

        this.queuedCalls.push(['play', arguments]);


      }


      /**
       * return the instance
       */

      return this;


    }


    /**
     * class function that seeks to given point
     */

    seek (start) {


      /**
       * check if the buffer has been loaded
       */

      if(this.buffer) {


        /**
         * set the offset
         */

        this.offset = start;


        /**
         * check if playing
         */

        if(this.isPlaying) {


          /**
           * call the stop function
           */

          this.stop(0);


          /**
           * call the start function
           */

           this.start(this.offset, 0);


        }


      } else {


        /**
         * buffer has not been set - place the call in queue
         */

        this.queuedCalls.push(['seek', arguments]);


      }


      /**
       * return the instance
       */

      return this;


    }


    pause () {


      /**
       * check if the buffer has been loaded
       */

      if(this.buffer) {


        /**
         * return if not playing to avoid errors
         */

        if(!this.isPlaying) return this;


        /**
         * update isPlaying to false
         */

        this.isPlaying = false;


        /**
         * currentTime
         */

        const now = this.buffer.context.currentTime;


        /**
         * update the offset for pausing/resuming purposes
         */

        this.offset += now - this.startedAt;


        /**
         * call the stop function
         */

        this.stop(0);


      } else {


        /**
         * buffer has not been set - place the call in queue
         */

        this.queuedCalls.push(['pause', arguments]);


      }


      /**
       * return the instance
       */

      return this;


    }

    rewind () {


      /**
       * check if the buffer has been loaded
       */

      if(this.buffer) {


        /**
         * set offset to 0
         */

        this.offset = 0;


        /**
         * call the stop function
         */

        this.stop(0);


        /**
         * call the start function and set the new offset
         */

        this.start(this.offset, 0);


      } else {


        /**
         * buffer has not been set - place the call in queue
         */

        this.queuedCalls.push(['rewind', arguments]);


      }


      /**
       * return the instance
       */

      return this;


    }

    setVolume (value) {


      /**
       * check if the buffer has been loaded
       */

      if(this.buffer) {


        /**
         * currentTime
         */

        const now = this.buffer.context.currentTime;


        /**
         * set gainNode gain value instantly
         */

        this.buffer.gainNode.gain.setTargetAtTime(value, now, 0);


        /**
         * update the object volume for reading current volume
         */

        this.volume = value;


      } else {


        /**
         * buffer has not been set - place the call in queue
         */

        this.queuedCalls.push(['setVolume', arguments]);


      }


      /**
       * return the instance
       */

      return this;


    }


  };


  /**
   * class SoundPlayer.SoundBuffer
   */

  SoundPlayer.SoundBuffer = class SoundBuffer {


    /**
     * constroctor
     * takes AudioContext, url of audio, callback function
     */

    constructor (context, url, fn) {


      /**
       * set the context
       */

      this.context = context;


      /**
       * set the url
       */

      this.url = url;


      /**
       * store the callback function
       */

      this.callback = fn;


      /**
       * set buffer
       */

      this.buffer = null;


      /**
       * set gainNode
       */

      this.gainNode = null;


      /**
       * set sourceNode
       */

      this.sourceNode = null;


      /**
       * load the requested audio from url
       */

      this.load(function (response) {


        /**
         * decode loaded audio
         */

        this.decodeAudio(response, function (buffer) {


          /**
           * store the buffer
           */

          this.buffer = buffer;


          /**
           * callback indicating that the SoundBuffer is loaded
           */

          this.callback.apply(this, [this]);


        }.bind(this));


      }.bind(this));


    }


    /**
     * class function that loads audio from url
     */

    load (fn) {


      /**
       * create new request
       */

      let request = new XMLHttpRequest();


      /**
       * open the new request
       */

      request.open('get', this.url, true);


      /**
       * set the equest responsetype
       */

      request.responseType = 'arraybuffer';


      /**
       * binding the request onload event
       */

      request.onload = function() {


        /**
         * callback with the response audio
         */

        fn(request.response);


      }.bind(this);


      /**
       * send the request
       */

      request.send();


    }


    /**
     * class function that creates the necessary nodes
     */

    createNodes () {

      /**
       * create gainNode
       */

      this.gainNode = this.context.createGain();


      /**
       * create sourceNode
       */

      this.sourceNode = this.context.createBufferSource();


      /**
       * set sourceNode buffer
       */

      this.sourceNode.buffer = this.buffer;


      /**
       * connect sourceNode to gainNode
       */

      this.sourceNode.connect(this.gainNode);


      /**
       * connect gainNode to "stream"
       */

      this.gainNode.connect(this.context.destination);


    }


    /**
     * class function that decodes audio data
     */

    decodeAudio (audio, fn) {


      /**
       * decode audio data
       */

      this.context.decodeAudioData(audio, function(buffer) {


        /**
         * callback with decoded audio buffer
         */

        fn(buffer);


      }.bind(this));


    }


  };


})(window);
