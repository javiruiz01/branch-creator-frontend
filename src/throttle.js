export async function throttle(func, throttleTime) {
  let lastTime = 0;
  return await (async () => {
    let now = new Date();
    if (now - lastTime >= throttleTime) {
      lastTime = now;
      return await func();
    }
  });
}
