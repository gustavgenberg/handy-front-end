(function (window) {

  window.PerformanceTest = function (fn, iterations) {

    iterations = iterations || 10000;

    const start = performance.now();

    for(let i = 0; i < iterations; i++) {
      fn();
    }

    const stop = performance.now();

    return stop - start;

  }

})(window);
