/* eslint-disable no-restricted-globals */
import { WorkerData } from "../types";

self.onmessage = (e: MessageEvent<WorkerData>) => {
  console.log('worker data', e.data);
  setTimeout(() => {
    self.postMessage('done');

  }, 1000)
}

export { };