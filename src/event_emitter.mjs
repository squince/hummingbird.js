import { error } from "./utils.mjs";

/* EventEmitter
* Manages adding, removing, and triggering event handlers
*/
export default class EventEmitter {
  constructor() {
    /* events
    * Hash of event names bound to handler functions
    */
    this.events  = {};

    /* hasHandler
    * Private method that Checks whether a handler has ever been stored against an event.
    */
    this.hasHandler = (eventName) => {
      return eventName in this.events;
    };
  };

  /* addListener
  * Binds a handler function to specific events
  * Can bind a single function to many different events in one call
  */
  addListener(eventName, fn) {
    if (typeof eventName !== 'string') {
      throw error('first argument must be a string representing an event name');
    }
    if (typeof fn !== 'function') {
      throw error('last argument must be a function');
    }
    if (!this.hasHandler(eventName)) this.events[eventName] = [];
    this.events[eventName].push(fn);
  }

  /* removeListener
  * Removes a handler function from a specific event
  */
  removeListener(eventName, fn) {
    if (!this.hasHandler(eventName)) return;

    const fnIndex = this.events[eventName].indexOf(fn);
    this.events[eventName].splice(fnIndex, 1);

    if (!this.events[eventName].length) delete this.events[eventName];
  }

  /* emit
  * Calls all functions bound to the given event
  */
  emit(eventName, docId) {
    if (!this.hasHandler(eventName)) return;

    this.events[eventName].forEach(fn => fn(docId));
  }
};
