q.module('Observable');

function OTest() {};
OTest.prototype = Object.create(m.Observable);

q.test('add specific event', 1, function() {
  var o = new OTest();
  o.addEventListener('dummy', function() {
    q.ok(1);
  });
  o.trigger({ type: 'dummy' });
});

q.test('remove specific event', 1, function() {
  var listener = function() {
    q.ok(false, 'called removed event');
  };
  var o = new OTest();
  o.addEventListener('foo', listener);
  o.removeEventListener('foo', listener);
  o.trigger({ type: 'foo' });
  q.ok(true, 'passed');
});

q.test('remove all events by type', 1, function() {
  var listener = function() {
    q.ok(false, 'called removed event');
  };
  var o = new OTest();
  o.addEventListener('foo', listener);
  o.removeEventListener('foo');
  o.trigger({ type: 'foo' });
  q.ok(true, 'passed');
});


q.module('Model');
function MTest() {};
MTest.prototype = Object.create(m.Base);
m.defineProperty(MTest.prototype, 'name');
m.defineProperty(MTest.prototype, 'age');

q.test('trigger change.name event', 2, function() {
  var m = new MTest();
  m.addEventListener('change.name', function(e) {
    q.ok(true, 'change.name');
  });
  m.addEventListener('change', function(e) {
    q.equal(e.name, 'name');
  });
  m.name = 'foo';
});

q.test('trigger change.name within event', 2, function() {
  var m = new MTest();
  m.addEventListener('change.name', function(e) {
    q.ok(true, 'change.name');
    m.name = 'foo1';
  });
  m.name = 'foo';
});
