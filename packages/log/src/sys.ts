export function gracefulExit() {
  // istanbul ignore next
  process.exit(1);
}

export function nextToGracefulExit() {
  // istanbul ignore next
  process.nextTick(gracefulExit);
}
