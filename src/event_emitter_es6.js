/** EventEmitter
* Manages adding, removing, and triggering event handlers
*/
class EventEmitter {
  constructor() {
    /** events
    * Hash of event names bound to handler functions
    */
    this.events  = {};
    this.addListener = addListener;
    this.removeListener = removeListener;
    this.emit = emit;
  }

  /** hasHandler
  * Private method that Checks whether a handler has ever been stored against an event.
  */
  static hasHandler = (eventName) => {
    return eventName in this.events;
  };

  /** addListener
  * Binds a handler function to specific events
  * Can bind a single function to many different events in one call
  */
  this.addListener = (eventName, fn) => {
    if (typeof eventNames !== 'string') {
      throw new TypeError('first argument must be a string representing an event name');
    }
    if (typeof fn !== 'function') {
      throw new TypeError('last argument must be a function');
    }
    if (!hasHandler(eventName)) this.events[eventName] = [];
    this.events[eventName].push(fn);
  };

  /** removeListener
  * Removes a handler function from a specific event
  */
  const removeListener = (eventName, fn) => {
    if (!hasHandler(eventName)) return;

    const fnIndex = this.events[eventName].indexOf(fn);
    this.events[eventName].splice(fnIndex, 1);

    if (!this.events[eventName].length) delete this.events[eventName];
  };

  /** emit
  * Calls all functions bound to the given event
  */
  const emit = (eventName, docId) => {
    if (!hasHandler(eventName)) return;

    this.events[eventName].forEach(fn => fn(docId));
  };
};

export default EventEmitter;
