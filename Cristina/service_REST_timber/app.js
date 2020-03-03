#!/bin/env node

// Carga módulos express y cliente sparql virtuoso
const express = require('express');
const { Client } = require('virtuoso-sparql-client');

//Carga ficheros javascript
var ontouris = require('./onturis.js');

//Puerto donde escucha la aplicación 
const PORT = 8888;

//Definición de la URI del SPARQL y el grafo
const endpoint = "http://timber.gsic.uva.es:8890/sparql/";
const defaultGraph = "http://timber.gsic.uva.es";

//Definición de la aplicación
var TimberApp = function () {
	//Scope
	var self = this;

	/* ================================================================ */
	/* Helper functions. */
	/* ================================================================ */

	/** 
	* terminator === the termination handler 
	* Terminate server on receipt of the specified signal. 
	* @param {string} sig Signal to terminate on. 
	*/
	self.terminator = function (sig) {
		if (typeof sig === "string") {
			console.log('%s: Received %s - terminating sample app ...',
				Date(Date.now()), sig);
			process.exit(1);
		}
		console.log('%s: Node server stopped.', Date(Date.now()));
	};

	/** 
    * Setup termination handlers (for exit and a list of signals). 
    */
	self.setupTerminationHandlers = function () {
		// Process on exit and signals. 
		process.on('exit', function () { self.terminator(); });

		// Removed 'SIGPIPE' from the list - bugz 852598. 
		['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT',
			'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM'
		].forEach(function (element, index, array) {
			process.on(element, function () { self.terminator(element); });
		});
	};

	/* ================================================================ */
	/* App server functions (main app logic here). */
	/* ================================================================ */
	self.initialize = function () {
		self.setupTerminationHandlers();
		myApp.initSPARQL();
		myApp.initServer();
	};
	self.start = function () {
		// Start the app on the specific interface (and port). 
		self.app.listen(PORT, function () {
			console.log('%s: Node server started on %d ...',
				Date(Date.now()), PORT);
		});
	};

	self.initServer = function () {
		self.app = express();

		self.app.get('/', function (req, res) {	
			/* Object.entries(ontouris).forEach(
				([key, value]) => console.log(key +": " + value)
			);  */
			res.send('Timber REST API');
		});
		
		self.app.get('/test', (req, res) => {
			var data_return = [];
			var variables = ["s", "p", "o"];
			var query = 'SELECT ?' + variables[0] + ' ?' + variables[1] + ' ?' + variables[2] + ' WHERE { ?' + variables[0] + ' ?' + variables[1] + ' ?' + variables[2] + ' .} LIMIT 5';

			self.sparqlClient.query(query)
				.then((data) => {
					data.results.bindings.forEach(element => {
						//console.log(element[variables[0]]);
						data_return.push(element);
					});
					res.contentType('application/json');
					res.json(data_return);
				})
				.catch((err) => {
					console.log(err);
				});
		});
	};
	self.initSPARQL = function () {
		self.sparqlClient = new Client(endpoint);
		self.sparqlClient.setOptions("application/json");
		self.sparqlClient.setQueryGraph(defaultGraph);
	};
};

//Main
var myApp = new TimberApp();
myApp.initialize();
myApp.start();

