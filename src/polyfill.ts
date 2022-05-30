/** RxDb with PouchDB storage requires this polyfill*/

(window as any).global = window;
(window as any).process = {
  env: { DEBUG: undefined },
};

export {};
