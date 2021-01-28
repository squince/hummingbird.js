import EventEmitter from '../src/event_emitter.mjs';
import assert from 'assert';

describe('Hummingbird Event Emitter', function () {
  let emitter, handler, callbackCalled, callbackArgument;

  beforeEach(function () {
    callbackCalled = false;
    emitter = new EventEmitter();
    handler = function () {
      console.log("This is the handler function");
    };
  });

  describe('adding an event listener', function () {
    it('should register the event handler', function () {
      emitter.addListener('test', handler);
      assert.ok('test' in emitter.events);
      assert.deepEqual(emitter.events.test[0], handler);
    });
  });

  describe('adding a listener to multiple events', function () {
    it('should register the event handler on each', function () {
      emitter.addListener('foo', handler);
      emitter.addListener('bar', handler);
      emitter.addListener('baz', handler);
      assert.ok('foo' in emitter.events);
      assert.ok('bar' in emitter.events);
      assert.ok('baz' in emitter.events);
      assert.deepEqual(emitter.events.foo[0], handler);
      assert.deepEqual(emitter.events.bar[0], handler);
      assert.deepEqual(emitter.events.baz[0], handler);
    });
  });

  describe('removing a single event listener', function () {
    it('should remove the handler', function () {
      emitter.addListener('test', handler);
      assert.ok('test' in emitter.events);
      emitter.removeListener('test', handler);
      assert.ok(!('test' in emitter.events));
    });
  });

  describe('removing one of several listeners', function () {
    const otherHandler = function () {};

    it('should remove only the one handler', function () {
      emitter.addListener('test', handler);
      emitter.addListener('test', otherHandler);
      assert.ok(emitter.events['test'].includes(handler));
      assert.ok(emitter.events['test'].includes(otherHandler));

      emitter.removeListener('test', handler);
      assert.ok(!emitter.events['test'].includes(handler));
      assert.ok(emitter.events['test'].includes(otherHandler));
    });
  });

  describe('emitting events', function () {
    const callback = (docId) => {
      callbackArgument = docId;
      callbackCalled = true;
    };
    const doc1 = { id: 1, name: 'steve' };

    it('should trigger the registered callback', function () {
      emitter.emit('test', doc1.id);
      assert.equal(callbackCalled, false);
      emitter.addListener('test', callback);
      emitter.emit('test', doc1.id);
      assert.equal(callbackCalled, true);
      assert.equal(callbackArgument, doc1.id);
    });
  });
});
