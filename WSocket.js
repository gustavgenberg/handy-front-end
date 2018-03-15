(function (window) {

  window.WSocket = class WSocket {

    constructor () {

      this.address = typeof arguments[0] == 'string' ? arguments[0] : null;

      this.open = false;
      this.closed = false;
      this.error = false;

      this.secure = this.address ? this.address.substring(0, 6) == 'wss://' : null;
      this.binary = arguments[1] || false;

      this.listeners = new Map();

      this.socket = typeof arguments[0] == 'string' ? new WebSocket(this.address) : arguments[0];

      if(this.binary) this.socket.binaryType = 'arraybuffer';

      this._onopen = function () {};
      this._onclose = function () {};
      this._onerror = function () {};
      this._onmessage = function () {};
      this._onbinary = function () {};

      this.socket.onopen = function () {
        this.open = true;
        this.closed = false;
        this.error = false;
        this._onopen.apply(null, arguments);
      }.bind(this);

      this.socket.onclose = function () {
        this.open = false;
        this.closed = true;
        this.error = false;
        this._onclose.apply(null, arguments);
      }.bind(this);

      this.socket.onerror = function () {
        this.open = false;
        this.closed = true;
        this.error = true;
        this._onerror.apply(null, arguments);
      }.bind(this);

      this.socket.onmessage = function (packet) {

        this._onmessage.apply(null, arguments);

        if(this.binary) {
          this._onbinary(packet.data, packet);
        } else {

          const name = (function () {
            let name = '';
            for(let i = 0; i < packet.data.length; i++) {
              if(packet.data[i] == ':') break;
              name += packet.data[i];
            }
            return name;
          })();

          const value = packet.data.slice(name.length + 1, packet.data.length);

          if('' === value) {
            this.fireEvent(name);
          } else {

            let parsedJson;

            try {

              parsedJson = JSON.parse(value);

            } catch (e) {}

            this.fireEvent(name, parsedJson || value);

          }

        }

      }.bind(this);
      
      if(this.socket.readyState == 1) this.socket.onopen();

    }

    onopen (fn) {
      this._onopen = fn;
      return this;
    }

    onclose (fn) {
      this._onclose = fn;
      return this;
    }

    onerror (fn) {
      this._onerror = fn;
      return this;
    }

    onmessage (fn) {
      this._onmessage = fn;
      return this;
    }

    onbinary (fn) {
      this._onbinary = fn;
      return this;
    }

    disconnect () {
      this.socket.close();
    }

    on (event, fn) {
      this.listeners.set(event, fn);
    }

    send () {

      if(!this.open) return;

      if(this.binary || !arguments[1]) {
        this.socket.send(arguments[0]);
      } else {

        let stringifiedJson;

        try {
          stringifiedJson = JSON.stringify(arguments[1]);
        } catch (e) {}

        this.socket.send(arguments[0] + ':' + stringifiedJson || arguments[1]);
      }
    }

    fireEvent (event) {
      let args = [];
      Array.prototype.push.apply(args, arguments);
      args.shift();
      if( this.listeners.has(event) ) this.listeners.get(event).apply(this, args);
    }

  }

})((function () {

  return 'undefined' !== typeof window ? window :
          'undefined' !== typeof module && 'exports' in module ? module.exports : {};

})());

  // window.WSocket.Buffer = class Buffer {
  //
  //   constructor (buffer) {
  //     this.buffer = buffer;
  //   }
  //
  //   getString (offset, length) {
  //     const buffer = new ArrayBuffer(length * 2);
  //     const view = new UInt16Array(buffer);
  //     for(let i = 0; i < length; i++) {
  //       view[i] = this.buffer.getUint8(offset + i);
  //     }
  //     return String.fromCharCode.apply(null, view);
  //   }
  //
  //
  //
  // }
//
//   window.Buffer = class Buffer {
//
//     constructor( fieldObject ) {
//
//       this.fields = (function () {
//
//         let fields = new Map();
//
//         for(let i = 0; i < Object.keys(fieldObject).length; i++) {
//
//           const name = Object.keys(fieldObject)[i];
//           const type = fieldObject[name];
//
//           fields.set(name, type);
//
//         }
//
//         return fields;
//
//       })();
//
//       this.values = new Map();
//
//     }
//
//     size () {
//       let bufferLength = 0;
//       for(let [key, field] of this.fields) {
//         bufferLength += field.bytes;
//       }
//       return bufferLength;
//     }
//
//     buffer () {
//
//       let buffer = new ArrayBuffer(this.size());
//       let dataview = new DataView(buffer);
//
//       let offset = 0;
//
//       for(let [key, value] of this.values) {
//
//         const field = this.fields.get(key);
//         let f;
//
//         switch (field.constructor.name) {
//           case 'Int':
//             const intType = field.getIntType();
//             f = (intType == 'Int8Array' ? 'setInt8' :
//                       intType == 'Uint8Array' ? 'setUint8' :
//                       intType == 'Int16Array' ? 'setInt16' :
//                       intType == 'Uint16Array' ? 'setUint16' :
//                       intType == 'Int32Array' ? 'setInt32' :
//                       intType == 'Uint32Array' ? 'setUint32' : '');
//             dataview[f](offset, value);
//             break;
//
//           case 'Float':
//             const floatType = field.double;
//             f = (floatType == 64 ? 'setFloat64' : 'setFloat32');
//             dataview[f](offset, value);
//             break;
//
//           case 'String':
//             //
//             // for(var i = 0; i < str.length; i++) {
//             //     var char = str.charCodeAt(i);
//             //     bytes.push(char >>> 8);
//             //     bytes.push(char & 0xFF);
//             // }
//
//             for(let i = 0; i < value.length; i++) {
//               dataview.setUint16(offset + i * 2, value.charCodeAt(i));
//             }
//             break;
//
//           case 'Boolean':
//             dataview.setUint8(offset, value === true ? 1 : 0);
//             break;
//
//         }
//
//         offset += field.bytes;
//
//       }
//
//       return dataview.buffer;
//
//     }
//
//     load (buffer) {
//
//       let dataview = new DataView(buffer);
//
//       let offset = 0;
//
//       for(let [key, field] of this.fields) {
//
//         const type = field.constructor.name;
//
//         let value,
//             f;
//
//         switch (type) {
//           case 'Int':
//             const intType = field.getIntType();
//             f = (intType == 'Int8Array' ? 'getInt8' :
//                       intType == 'Uint8Array' ? 'getUint8' :
//                       intType == 'Int16Array' ? 'getInt16' :
//                       intType == 'Uint16Array' ? 'getUint16' :
//                       intType == 'Int32Array' ? 'getInt32' :
//                       intType == 'Uint32Array' ? 'getUint32' : '');
//             value = dataview[f](offset);
//             break;
//
//           case 'Float':
//             const floatType = field.double;
//             f = (floatType == 64 ? 'getFloat64' : 'getFloat32');
//             value = dataview[f](offset);
//             break;
//
//           case 'String':
//             value = '';
//             for(let i = 0; i < field.bytes / 2; i++) {
//               value += String.fromCharCode(dataview.getUint16(offset + i * 2));
//             }
//             break;
//
//         }
//
//         this.values.set(key, value);
//
//         offset += field.bytes;
//
//       }
//
//       return this;
//
//     }
//
//     set () {
//       if(arguments.length == 1) {
//         for(let i = 0; i < Object.keys(arguments[0]).length; i++) {
//           const key = Object.keys(arguments[0])[i];
//           const value = arguments[0][key];
//           this.values.set(key, value);
//         }
//       } else {
//         this.values.set(arguments[0], arguments[1]);
//       }
//       return this;
//     }
//
//     get () {
//       if(arguments[0]) {
//         return this.values.get(key);
//       } else {
//         let object = {};
//         for(let [key, value] of this.values) {
//           object[key] = value;
//         }
//         return object;
//       }
//     }
//
//   }
//
//   Buffer.Field = class Field {
//     constructor () {
//       this.bytes = null;
//     }
//   }
//
//   Buffer.String = class String extends Buffer.Field {
//
//     constructor () {
//
//       super();
//
//       this.bytes = arguments[0] * 2; // + ( arguments[0].length !== [...(arguments[0])].length ? arguments[0].length - [...arguments[0]].length : 0 );
//
//     }
//
//   }
//
//   Buffer.Boolean = class Boolean extends Buffer.Field {
//
//     constructor () {
//
//       super();
//
//       this.bytes = 1;
//
//     }
//
//   }
//
//   Buffer.Float = class Float extends Buffer.Field {
//
//     constructor () {
//
//       super();
//
//       this.double = arguments[0] == Float32Array ? false : true;
//
//       this.bytes = this.double ? 8 : 4;
//
//     }
//
//   }
//
//   Buffer.Int = class Int extends Buffer.Field {
//
//     constructor () {
//
//       super();
//
//       this.types = [Int8Array, Uint8Array, Int16Array, Uint16Array, Int32Array, Uint32Array];
//
//       if(arguments.length == 1) {
//         this.min = this.getMinMax(arguments[0]).min;
//         this.max = this.getMinMax(arguments[0]).max;
//       } else {
//         this.min = arguments[0];
//         this.max = arguments[1];
//       }
//
//       this.type = this.getIntType();
//       this.bytes = this.getIntBytes();
//
//     }
//
//     getIntType () {
//
//       return 'Int16Array';
//
//       for(let type of this.types) {
//
//         const minmax = this.getMinMax(type);
//
//         const min = minmax.min;
//         const max = minmax.max;
//
//         if(this.min >= min && this.max <= max) {
//           return type.name;
//         }
//
//       }
//
//     }
//
//     getIntBytes () {
//       return window[this.type].BYTES_PER_ELEMENT;
//     }
//
//     getMinMax (type) {
//
//       switch (arguments[0]) {
//
//         case Int8Array:
//           return {
//             min: -Math.pow(2, 8) / 2,
//             max: Math.pow(2, 8) / 2 - 1
//           }
//
//         case Uint8Array:
//           return {
//             min: 0,
//             max: Math.pow(2, 8) - 1
//           }
//
//         case Uint8ClampedArray:
//           return {
//             min: 0,
//             max: Math.pow(2, 8) - 1
//           }
//
//         case Int16Array:
//           return {
//             min: -Math.pow(2, 16) / 2,
//             max: Math.pow(2, 16) / 2 - 1
//           }
//
//         case Uint16Array:
//           return {
//             min: 0,
//             max: Math.pow(2, 16) - 1
//           }
//
//         case Int32Array:
//           return {
//             min: -Math.pow(2, 32) / 2,
//             max: Math.pow(2, 32) / 2 - 1
//           }
//
//         case Uint32Array:
//           return {
//             min: 0,
//             max: Math.pow(2, 32) - 1
//           }
//
//       }
//
//     }
//   }
//
// })(window);
