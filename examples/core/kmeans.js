#!/usr/bin/env node
'use strict';

var skale = require('skale');
var sizeOf = require('../../lib/sizeof.js');
var ml = require('../../lib/ml.js');

var opt = require('node-getopt').create([
	['h', 'help', 'print this help text'],
	['f', 'F=ARG', 'SVM input file (random data if undefined)'],
	['k', 'K=ARG', 'number of means'],
	['n', 'N=ARG', 'number of observations'],
	['d', 'D=ARG', 'number of features per observation'],
	['i', 'I=ARG', 'number of iterations']
]).bindHelp().parseSystem();

var file = opt.options.F;
var N = Number(opt.options.N) || 1000000;
var K = Number(opt.options.K) || 10;
var D = Number(opt.options.D) || 16;
var nIterations = Number(opt.options.I) || 4;
var seed = 1;
var P = undefined;		// number of partitions default to number of workers

var sample = [1, []];
for (var i = 0; i < D; i++) sample[1].push(Math.random());
var approx_data_size = N * sizeOf(sample);

console.log('Input data: ' + (file || 'random'));
console.log('Number of observations: ' + N);
console.log('Number of clusters: ' + K);
console.log('Features per observation: ' + D);
console.log('Iterations: ' + nIterations);
console.log('Approximate dataset size: ' + Math.ceil(approx_data_size / (1024 * 1024)) + ' Mb\n');

var sc = skale.context();
var points = file ? sc.textFile(file).map(function (e) {
	var tmp = e.split(' ').map(parseFloat);
	return [tmp.shift(), tmp];
}).persist() : ml.randomSVMData(sc, N, D, seed, P).persist();

// init means, K gaussian vectors of length D
var prng = new ml.Random();
var w = [];
for (var k = 0; k < K; k++) {
	w[k] = [];
	for (var d = 0; d < D; d++)
		//w[k].push(2 * Math.random() - 1);
		w[k].push(2 * prng.nextDouble() - 1);
}
var model = new ml.KMeans(sc, points, K, w);

model.train(nIterations, function (err) {
	//console.log(model.means);
	sc.end();
});
