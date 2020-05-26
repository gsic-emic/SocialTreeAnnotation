#!/bin/env node

//Modo estricto
//'use strict'

// Carga módulos express y cliente sparql virtuoso
const express = require('express');
//const {Client}  = require('virtuoso-sparql-client');

const bodyParser = require('body-parser');

//Carga ficheros javascript
var ontouris = require('./config/onturis');
const config = require('./config/config');
const helpers = require('./helpers/helpers');
const api = require('./config/routes');
const index = require('./index');
var cache = require('./models/cache');

//Definición de la aplicación
var TimberApp = function () {
	//Scope
	var self = this;
	global.sparqlClient = {};
	/* ================================================================ */
	/* App server functions (main app logic here). */
	/* ================================================================ */
	self.initialize = function () {
		helpers.setupTerminationHandlers();
		sparqlClient = index.initSPARQL();
		myApp.initServer();
	};
	self.start = function () {
		// Start the app on the specific interface (and port).  
		self.app.listen(config.port, () => {
			console.log('%s: Node server started on %d ...',
				Date(Date.now()), config.port);
		});
	};
	self.initServer = function () {
		self.app = express();
		/**
		 * Middlewares 
		 */
		self.app.use(bodyParser.json({limit: '50mb', extended: true}))
		//self.app.use(bodyParser.urlencoded({limit: '10mb', extended: true}))

		//self.app.use(bodyParser.json());// Para crear objeto body en la petición y admitir métodos HTTP con Content-Type json
		self.app.use('/sta', api);
	};
};

//Main
var myApp = new TimberApp();
//myApp.initSPARQL();
myApp.initialize();
myApp.start();
setInterval(cache.clearCache, config.timeClearCache_ms); 
