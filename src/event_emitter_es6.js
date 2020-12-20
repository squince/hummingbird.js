/** EventEmitter
* Manages adding, removing, and triggering events handlers
*/
const EventEmitter = () => {
  events: {},
  addListener,
  removeListener,
  emit,
};

/** addListener
* Binds a handler function to specific events
* Can bind a single function to many different events in one call
*/
const addListener = (eventNames, fn) => {
  if (!Array.isArray(eventNames)) {
    throw new TypeError('first argument must be an array');
  }
  if (typeof fn !== 'function') {
    throw new TypeError('last argument must be a function');
  }
  eventNames.forEach((eventName) => {
    if (!hasHandler(eventName)) {
      events[eventName] = [];
    }
    events[eventName].push(fn);
  });
};

/** removeListener
* Removes a handler function from a specific event
*/
const removeListener = (name, fn) => {
  var fnIndex;
  if (!hasHandler(name)) {
    return;
  }
  fnIndex = this.events[name].indexOf(fn);
  this.events[name].splice(fnIndex, 1);
  if (!this.events[name].length) {
    delete this.events[name];
  }
};

/** emit
* Calls all functions bound to the given event
*/
const emit = (name) => {
  var args;
  if (!hasHandler(name)) {
    return;
  }
  args = Array.prototype.slice.call(arguments, 1);
  this.events[name].forEach(function(fn) {
    fn.apply(undefined, args);
  });
};

/** hasHandler
* Checks whether a handler has ever been stored against an event.
*/
const hasHandler = (name) => {
  return name in this.events;
};

export {EventEmitter as default};
