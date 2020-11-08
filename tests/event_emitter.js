const hum = require("../../hummingbird.js");
const assert = require("assert").strict;

describe('Hummingbird Event Emitter', function () {
  const handler = function () {};
  let emitter;

  beforeEach(function () {
    emitter = new hum.EventEmitter;
  });

  describe('adding an event listener', function () {
    it("should register the event handler", function () {
      emitter.addListener('test', handler);
      assert.ok('test' in emitter.events);
      assert.deepEqual(emitter.events.test[0], handler);
    });
  });

  describe('adding a listener to multiple events', function () {
    it("should register the event handler on each", function () {
      emitter.addListener('foo', 'bar', 'baz', handler);
      assert.ok('foo' in emitter.events);
      assert.ok('bar' in emitter.events);
      assert.ok('baz' in emitter.events);
      assert.deepEqual(emitter.events.foo[0], handler);
      assert.deepEqual(emitter.events.bar[0], handler);
      assert.deepEqual(emitter.events.baz[0], handler);
    });
  });

  /*
  describe('removing a single event listener', function () {
    emitter.addListener('test', handler);

    assert.ok('test' in emitter.events)
    assert.ok(emitter.events.test.indexOf(handler) > -1)

    emitter.removeListener('test', handler)

    assert.ok(!('test' in emitter.events))
  });

  describe('removing a single event listener from many listeners', function () {
    const otherHandler = function () {};

    emitter.addListener('test', handler)
    emitter.addListener('test', otherHandler)

    assert.ok('test' in emitter.events)
    assert.ok(emitter.events.test.indexOf(handler) > -1)

    emitter.removeListener('test', handler)

    assert.ok('test' in emitter.events)
    assert.equal(emitter.events.test.indexOf(handler), -1)
    assert.ok(emitter.events.test.indexOf(otherHandler) > -1)
  });

  describe('emitting events', function () {
    let callbackCalled = false;
    let callbackArguments = [];
    const callback = function () {
      callbackArguments = Array.prototype.slice.call(arguments)
      callbackCalled = true
    };

    emitter.emit('test', 1, 'a')
    emitter.addListener('test', callback)
    emitter.emit('test', 1, 'a')

    assert.ok(callbackCalled)
    assert.deepEqual(callbackArguments, [1, 'a'])
  });
  */
});
