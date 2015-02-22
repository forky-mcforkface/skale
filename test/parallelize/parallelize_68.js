#!/usr/local/bin/node --harmony

// parallelize -> persist -> sample -> count

var co = require('co');
var ugrid = require('../../lib/ugrid-context.js')();
var sample = require('../ugrid-test.js').sample;

co(function *() {
	yield ugrid.init();

	var v = [1, 2, 3, 4, 5];
	var frac = 0.1;
	var seed = 1;

	var loc = sample(v, ugrid.worker.length, frac, seed);

	var data = ugrid.parallelize(v).persist();
	yield data.count();

	v.push(6);
	var dist = yield data.sample(frac).count();

	console.assert(loc.length == dist);

	ugrid.end();
})();
