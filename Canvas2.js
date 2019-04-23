const date = new Date();
const time = date.getTime.bind(date);

var EventEmitter = function () {
    this.events = {};
};

EventEmitter.prototype.on = function (event, listener) {
    if (typeof this.events[event] !== 'object') {
        this.events[event] = [];
    }

    this.events[event].push(listener);
};

EventEmitter.prototype.removeListener = function (event, listener) {
    var idx;

    if (typeof this.events[event] === 'object') {
        idx = indexOf(this.events[event], listener);

        if (idx > -1) {
            this.events[event].splice(idx, 1);
        }
    }
};

EventEmitter.prototype.emit = function (event) {
    var i, listeners, length, args = [].slice.call(arguments, 1);

    if (typeof this.events[event] === 'object') {
        listeners = this.events[event].slice();
        length = listeners.length;

        for (i = 0; i < length; i++) {
            listeners[i].apply(this, args);
        }
    }
};

EventEmitter.prototype.once = function (event, listener) {
    this.on(event, function g () {
        this.removeListener(event, g);
        listener.apply(this, arguments);
    });
};

CanvasRenderingContext2D && (CanvasRenderingContext2D.prototype.reset = function () {
     this.setTransform(1, 0, 0, 1, 0, 0)
}, CanvasRenderingContext2D.prototype.clear = function (preserveTransform) {
     if(preserveTransform) {
          this.save();
          this.reset();
     }
     this.clearRect(0, 0, this.canvas.width, this.canvas.height);
     if(preserveTransform) {
          this.restore()
     }
});

CanvasRenderingContext2D.prototype.translateToCenter = function (width, height, scale) {
     scale = scale || 1;

     const x = window.innerWidth / 2 - width / 2 * scale;
     const y = window.innerHeight / 2 - height / 2 * scale;

     this.viewport = {
          x: x * -1,
          y: y * -1
     };

     this.viewport.width = this.canvas.width - this.viewport.x * 2;
     this.viewport.height = this.canvas.height - this.viewport.y * 2;

     this.translate(x, y);

     return scale;
};

CanvasRenderingContext2D.prototype.scaleToCover = function (width, height, center) {
     const scale = Math.max(this.canvas.width / width, this.canvas.height / height);
     this.instance.scale = scale;

     if(center) {
          this.translateToCenter(width, height, scale);
     }

     this.scale(scale, scale);

     return scale;
};

CanvasRenderingContext2D.prototype.scaleToContain = function (width, height, center) {
     const scale = Math.min(this.canvas.width / width, this.canvas.height / height);
     this.instance.scale = scale;

     if(center) {
          this.translateToCenter(width, height, scale);
     }

     this.scale(scale, scale);

     return scale;
};

CanvasRenderingContext2D.prototype.scaleToHeight = function (width, height, center) {
     const scale = this.canvas.height / height;
     this.instance.scale = scale;

     if(center) {
          this.translateToCenter(width, height, scale);
     }

     this.scale(scale, scale);

     return scale;
};

CanvasRenderingContext2D.prototype.scaleToWidth = function (width, height, center) {
     const scale = this.canvas.width / width;
     this.instance.scale = scale;

     if(center) {
          this.translateToCenter(width, height, scale);
     }

     this.scale(scale, scale);

     return scale;
};

function createCanvas(id, width, height, context) {
     const canvas = document.getElementById(id) || document.createElement('canvas');

     canvas.id = id;
     canvas.width = width;
     canvas.height = height;

     canvas.context = canvas.getContext(context);

     return canvas;
}

class Canvas {

     constructor(id, width, height, context = '2d', offscreen = false) {
          const self = this;

          self.timestamp = time();
          
          self.args = {
               id,
               width,
               height,
               context,
               offscreen
          };

          self.id = id;

          self.width = width;
          self.height = height;

          self.offscreen = offscreen;

          if(self.offscreen) {
               self.element = createCanvas(self.id, self.width, self.height, context);
               self.context = self.element.context;
          } else {
               self.element = createCanvas(self.id, self.width, self.height, '2d');
               self.element.innerHTML = 'Get a <a href="https://chrome.google.com/">less stupid</a> browser!';

               self.osc = createCanvas('osc_' + self.id, self.width, self.height, context);
               self.context = self.osc.context;
          }

          if(!self.context && context == 'webgl') {
               self.context = self.element.getContext('experimental-webgl');
          }

          if(!self.context) {
               throw new Error('Context `' + context + '` not supported by browser!');
               document.write(self.element.innerHTML);
          }

          if(self.width === window.innerWidth && self.height === window.innerHeight) {
               window.addEventListener('resize', function () {
                    self.width = self.element.width = window.innerWidth;
                    self.height = self.element.height = window.innerHeight;

                    if(self.osc) {
                         self.osc.width = window.innerWidth;
                         self.osc.height = window.innerHeight;
                    }
               });
          }

          if(!document.getElementById(self.id) && !offscreen) document.body.appendChild(self.element);

          self.listeners = new EventEmitter();

          // self.stats = new Stats();

          self.__STORE__ = {};

          self.isRunning = false;
          self.isPaused = false;
          
          self.raf = 0;

          self.lastFrame = time() - 16;
          self.fpsLimit = Infinity;

          self.fps = 60;
          self.delta = 0.016;
          self.scale = 1;

          self.element.instance = self;
          self.context.instance = self;
     }

     get store() {
          const self = this;

          return self.__STORE__;
     }

     set store(value) {
          const self = this;

          self.__STORE__ = value;
     }

     drawFrame(fn) {
          const self = this;

          fn.apply(self, [self.context, self.__STORE__]);
     }

     _LOOP_() {
          const self = this;

          if(!self.isRunning) return;

          self.raf = requestAnimationFrame(self._LOOP_.bind(self), self.element);

          const now = time();
          const delta = (now - self.lastFrame) / 1000;
          const fps = 1 / delta;

          if(fps > self.fpsLimit) return;

          self.lastFrame = now;
          self.delta = delta;
          self.fps = fps;

          // self.stats.begin();

          if(!self.isPaused) self.listeners.emit('update', delta, self.__STORE__);
          self.listeners.emit('draw', self.context, delta, self.__STORE__);

          if(self.osc) {
               self.element.context.clearRect(0, 0, self.width, self.height);
               self.element.context.drawImage(self.osc, 0, 0, self.width, self.height);
          }

          // self.stats.end();
     }

     start() {
          const self = this;
          
          if(self.isRunning) return;
          self.isRunning = true;

          self._LOOP_();
     }

     stop() {
          const self = this;

          if(!self.isRunning) return;
          self.isRunning = false;
          cancelAnimationFrame(self.raf);
     }

     pause() {
          const self = this;

          if(self.isPaused) return;
          self.isPaused = true;
     }

     resume() {
          const self = this;

          if(!self.isPaused) return;
          self.isPaused = false;

          self.lastFrame = time() - 16;
     }

}
