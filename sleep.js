function sleep (milliseconds) {
  const start = performance.now();
  while(start + milliseconds > performance.now()) {}
}
