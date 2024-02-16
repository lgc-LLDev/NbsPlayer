import { formatError } from 'form-api-ex';

export function catchAndLog<T>(promise: Promise<T>): Promise<T> {
  return promise.catch((e) => {
    logger.error(formatError(e));
    return e;
  });
}

export const ticker = new (class {
  private callbacks: (() => any)[] = [];

  private calling = false;

  constructor() {
    mc.listen('onTick', () => {
      catchAndLog(this.trigger());
    });
  }

  add(callback: () => any) {
    this.callbacks.push(callback);
    return this.remove.bind(this, callback);
  }

  remove(callback: () => any) {
    const index = this.callbacks.indexOf(callback);
    if (index !== -1) this.callbacks.splice(index, 1);
  }

  async trigger() {
    if (this.calling) return;
    this.calling = true;
    await Promise.all(this.callbacks.map((x) => x()));
    this.calling = false;
  }
})();