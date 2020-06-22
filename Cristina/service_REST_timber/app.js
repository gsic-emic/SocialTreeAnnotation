#!/bin/env node

//Modo estricto
//'use strict'

// Carga módulos express y cliente sparql virtuoso
const express = require('express');
//const {Client}  = require('virtuoso-sparql-client');
var compression = require('compression');
var cors = require('cors')
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
		self.app.use(cors()) //Habilitado para poder tener el Frontend en otra máquina (por ejemplo en mi pórtatil corriendo la app de Jimena y a través de un ssh -D port a titan y habilitando un socks5h proxy en el terminal, cmd o Linux, es posible que se comuniquen backend de timber y frontend localhost)

		//Comprimir respuestas
		self.app.use(compression())

		 //Límite en bytes del json. Se utiliza principalmente para los POST de las imágenes (hasta 10MB aprox) 15*0.75 (6/8) relacion base64 = 11.25 MB
		self.app.use(bodyParser.json({limit: '15mb', extended: true}));
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
setInterval(cache.getFreeMemory, config.timeCheckFreeMemory_ms); 
