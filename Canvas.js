!function(e){"use strict";var n,t=0,a=["moz","webkit","o","ms"];for(n=0;n<a.length&&!e.requestAnimationFrame;n+=1)e.requestAnimationFrame=e[a[n]+"RequestAnimationFrame"],e.cancelAnimationFrame=e[a[n]+"CancelAnimationFrame"]||e[a[n]+"CancelRequestAnimationFrame"];e.cancelAnimationFrame||(e.requestAnimationFrame?(a=e.requestAnimationFrame,t={},e.requestAnimationFrame=function(e){var i=n;return n+=1,t[i]=e,a(function(e){if(t.hasOwnProperty(i)){var n;try{t[i](e)}catch(e){n=e}finally{if(delete t[i],n)throw n}}}),i},e.cancelAnimationFrame=function(e){delete t[e]}):(e.requestAnimationFrame=function(n){var a=(new Date).getTime(),i=Math.max(t+16,a);return e.setTimeout(function(){n(t=i)},i-a)},e.cancelAnimationFrame=e.clearTimeout))}(this);

window.CanvasRenderingContext2D&&(CanvasRenderingContext2D.prototype.reset=function(){this.setTransform(1,0,0,1,0,0)},CanvasRenderingContext2D.prototype.clear=function(){this.clearRect(0,0,this.canvas.width,this.canvas.height)});

class Canvas {

  constructor () {

    this.canvas = document.createElement('canvas');
    this.renderer = this.canvas.ctx = this.canvas.getContext(arguments[3] || '2d');

    this.id = this.canvas.id = arguments[0];

    if(!document.getElementById(this.id)) document.body.appendChild(this.canvas);

    this.width = this.canvas.width = arguments[1] || 300;
    this.height = this.canvas.height = arguments[2] || 150;

    if(arguments[1] == window.innerWidth && arguments[2] == window.innerHeight)
      window.addEventListener('resize', function () { this.width = this.canvas.width = window.innerWidth; this.height = this.canvas.height = window.innerHeight; });

    this.eventListeners = new Map();
    this._SCOPE_ = {};
    this._rafid = 0;
    this._running = false;
    this._paused = false;
    this._lastFrame = +new Date;

    this.defaultEventListeners();

    this.fireEvent('setup', this.renderer, this._SCOPE_);

    return this;

  }

  on (event, fn) {
    this.eventListeners.set(event, fn);
  }

  fireEvent (event) {
    let args = [];
    Array.prototype.push.apply(args, arguments);
    args.shift();
    if( this.eventListeners.has(event) ) this.eventListeners.get(event).apply(this, args);
  }

  defaultEventListeners () {
    this.on('draw', function (renderer, vars, delta) {
      if(renderer instanceof CanvasRenderingContext2D) {
        renderer.clearRect(0, 0, this.width, this.height);
        renderer.textAlign = 'center';
        renderer.font = '30px Arial';
        renderer.fillText('Its Working!', this.width / 2, this.height / 2);
      }
    });
  }

  _loop () {
    if(!this._running) return;

    const now = +new Date;
    const delta = (now - this._lastFrame) / 1000.0;
    this._lastFrame = now;

    if(!this._paused) this.fireEvent('update', this._SCOPE_, delta);
    this.fireEvent('draw', this.renderer, this._SCOPE_, delta);

    this._rafid = window.requestAnimationFrame(this._loop.bind(this), this.canvas);
  }

  start () {
    this._running = true;
    this._lastFrame = +new Date - 16;
    this.fireEvent('start', this.renderer, this._SCOPE_);
    this._loop();
    return this;
  }

  stop () {
    this._running = false;
    this.fireEvent('stop', this.renderer, this._SCOPE_);
    window.cancelAnimationFrame(this._rafid);
    return this;
  }

  pause () {
    this._paused = true;
    this.fireEvent('pause', this.renderer, this._SCOPE_);
    return this;
  }

  resume () {
    this._paused = false;
    this.fireEvent('resume', this.renderer, this._SCOPE_);
    return this;
  }

}
