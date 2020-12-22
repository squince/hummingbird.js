//import Hummingbird from "../hummingbird-wip.js";
import Hummingbird from "../wip/hummingbird.js";
import assert from "assert.js";

describe("Hummingbird Indexer", function () {
  let hum, callbackCalled, callbackArgs;
  const startOfStringIndicator = "\u0002";
  const doc1 = {id: 1, desc: "some meta data without a name field", title: "noname doc"};
  const doc2 = {id: 2, desc: "Mr", name: "Steven", title: "male"};
  const doc3 = {id: 3, desc: "Mrs", name: "Stephanie", title: "female"};

  beforeEach(function () {
    console.log('*****');
    console.log('Type Of Hummingbird', typeof Hummingbird);
    console.log('Hummingbird', Hummingbird);
    console.log('name', Hummingbird.name);
    hum = new Hummingbird();
    console.log('*****');
    console.log('hum.idx', hum.idx);
    addCallbackCalled = false;
    removeCallbackCalled = false;
    updateCallbackCalled = false;
    callbackArgs = [];
  });

  describe("creating a new index", function () {
    it("will set the class attribute foo to bar", function () {
      assert.equal(hum.idx.foo, 'bar');
    });
  });
});
