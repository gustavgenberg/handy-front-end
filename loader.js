class Loader {
  constructor (base) {
    this.base = base || '';
    this.js_scripts = new Map();
    this.css_scripts = new Map();
  }
  load (url) {
    url = this.base + url;
    
    let element;
    
    if(url.indexOf('.css') > -1) {
    
      element = document.createElement('link');
      element.rel = 'stylesheet';
      element.href = url;
      document.querySelector('head').appendChild(element);
      
      this.css_scripts.set(url, element);
      
    } else if(url.indexOf('.js') > -1) {
    
      element = document.createElement('script');
      element.type = 'text/javascript';
      element.src = url;
      document.querySelector('body').appendChild(element);
      
      this.js_scripts.set(url, element);
      
    }
    
  }
}
