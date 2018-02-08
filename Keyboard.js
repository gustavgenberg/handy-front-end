(function (window) {

  window.Keyboard = class KeyBoard {

    constructor (element) {

      this.element = element || window;

      this.listeners = new Map();

      this.disabledKeys = [];
      this.keysDown = [];

      this.bindElementListeners();

    }

    bindElementListeners () {

      this.element.addEventListener('blur', function (event) {

        this.keysDown = [];

        this.fireEvent('blur', event);

      }.bind(this));

      this.element.addEventListener('keydown', function (event) {

        if(!this.isDown(event.keyCode)) this.keysDown.push(event.keyCode);

        const obj = {
          key: event.key,
          lowercase: event.key == event.key.toLowerCase(),
          uppercase: event.key == event.key.toUpperCase(),
          code: event.keyCode,
          t: +new Date,
          evt: event
        };

        this.fireEvent('down', obj);

        if(this.disabledKeys.indexOf(event.keyCode) > -1) {
          event.preventDefault();
        }

      }.bind(this));

      this.element.addEventListener('keyup', function (event) {

        if(this.isDown(event.keyCode)) this.keysDown.splice( this.keysDown.indexOf(event.keyCode), 1 );

        const obj = {
          key: event.key,
          lowercase: event.key == event.key.toLowerCase(),
          uppercase: event.key == event.key.toUpperCase(),
          code: event.keyCode,
          t: +new Date,
          evt: event
        };

        this.fireEvent('up', obj);

      }.bind(this));

    }

    on (event, fn) {



      this.listeners.set(event, fn);



      return this;


    }

    fireEvent (event) {


      if(arguments.length !== 2) return;


      if( this.listeners.has(event) ) {


        this.listeners.get(event).apply(this, [arguments[1]]);


      }


    }

    disableKey (key) {
      this.disabledKeys.push(key);
    }

    enableKey (key) {
      this.disabledKeys.splice(this.disabledKeys.indexOf(key), 1);
    }

    isDown (key) {
      return this.keysDown.indexOf(key) > -1;
    }

  }

  window.Keyboard.KEY_1 = 49;
  window.Keyboard.KEY_2 = 50;
  window.Keyboard.KEY_3 = 51;
  window.Keyboard.KEY_4 = 52;
  window.Keyboard.KEY_5 = 53;
  window.Keyboard.KEY_6 = 54;
  window.Keyboard.KEY_7 = 55;
  window.Keyboard.KEY_8 = 56;
  window.Keyboard.KEY_9 = 57;
  window.Keyboard.KEY_0 = 48;

  window.Keyboard.KEY_NUMPAD_1 = 97;
  window.Keyboard.KEY_NUMPAD_2 = 98;
  window.Keyboard.KEY_NUMPAD_3 = 99;
  window.Keyboard.KEY_NUMPAD_4 = 100;
  window.Keyboard.KEY_NUMPAD_5 = 101;
  window.Keyboard.KEY_NUMPAD_6 = 102;
  window.Keyboard.KEY_NUMPAD_7 = 103;
  window.Keyboard.KEY_NUMPAD_8 = 104;
  window.Keyboard.KEY_NUMPAD_9 = 105;
  window.Keyboard.KEY_NUMPAD_0 = 96;

  window.Keyboard.KEY_a = 65;
  window.Keyboard.KEY_b = 66;
  window.Keyboard.KEY_c = 67;
  window.Keyboard.KEY_d = 68;
  window.Keyboard.KEY_e = 69;
  window.Keyboard.KEY_f = 70;
  window.Keyboard.KEY_g = 71;
  window.Keyboard.KEY_h = 72;
  window.Keyboard.KEY_i = 73;
  window.Keyboard.KEY_j = 74;
  window.Keyboard.KEY_k = 75;
  window.Keyboard.KEY_l = 76;
  window.Keyboard.KEY_m = 77;
  window.Keyboard.KEY_n = 78;
  window.Keyboard.KEY_o = 79;
  window.Keyboard.KEY_p = 80;
  window.Keyboard.KEY_q = 81;
  window.Keyboard.KEY_r = 82;
  window.Keyboard.KEY_s = 83;
  window.Keyboard.KEY_t = 84;
  window.Keyboard.KEY_u = 85;
  window.Keyboard.KEY_v = 86;
  window.Keyboard.KEY_w = 87;
  window.Keyboard.KEY_x = 88;
  window.Keyboard.KEY_y = 89;
  window.Keyboard.KEY_z = 90;

  window.Keyboard.KEY_A = 65;
  window.Keyboard.KEY_B = 66;
  window.Keyboard.KEY_C = 67;
  window.Keyboard.KEY_D = 68;
  window.Keyboard.KEY_E = 69;
  window.Keyboard.KEY_F = 70;
  window.Keyboard.KEY_G = 71;
  window.Keyboard.KEY_H = 72;
  window.Keyboard.KEY_I = 73;
  window.Keyboard.KEY_J = 74;
  window.Keyboard.KEY_K = 75;
  window.Keyboard.KEY_L = 76;
  window.Keyboard.KEY_M = 77;
  window.Keyboard.KEY_N = 78;
  window.Keyboard.KEY_O = 79;
  window.Keyboard.KEY_P = 80;
  window.Keyboard.KEY_Q = 81;
  window.Keyboard.KEY_R = 82;
  window.Keyboard.KEY_S = 83;
  window.Keyboard.KEY_T = 84;
  window.Keyboard.KEY_U = 85;
  window.Keyboard.KEY_V = 86;
  window.Keyboard.KEY_W = 87;
  window.Keyboard.KEY_X = 88;
  window.Keyboard.KEY_Y = 89;
  window.Keyboard.KEY_Z = 90;

  window.Keyboard.KEY_SPACE = 32;

  window.Keyboard.KEY_ARROW_LEFT = 37;
  window.Keyboard.KEY_ARROW_UP = 38;
  window.Keyboard.KEY_ARROW_RIGHT = 39;
  window.Keyboard.KEY_ARROW_DOWN = 40;

  window.Keyboard.KEY_BACKQUOTE = 220;
  window.Keyboard.KEY_TAB = 9;
  window.Keyboard.KEY_CAPSLOCK = 20;
  window.Keyboard.KEY_LEFT_SHIFT = 16;
  window.Keyboard.KEY_LEFT_CONTROL = 17;
  window.Keyboard.KEY_LEFT_META = 91;
  window.Keyboard.KEY_LEFT_ALT = 18;
  window.Keyboard.KEY_RIGHT_ALT = 18;
  window.Keyboard.KEY_CONTEXTMENU = 93;
  window.Keyboard.KEY_RIGHT_CONTROL = 17;
  window.Keyboard.KEY_RIGHT_SHIFT = 16;
  window.Keyboard.KEY_ENTER = 13;
  window.Keyboard.KEY_BACKSPACE = 8;

})(window);
