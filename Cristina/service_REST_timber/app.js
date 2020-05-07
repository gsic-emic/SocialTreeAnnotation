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

//Definición de la aplicación
var TimberApp = function () {
	//Scope
	var self = this;
	global.sparqlClient= {};
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
		self.app.use(bodyParser.json());// Para crear objeto body en la petición y admitir métodos HTTP con Content-Type json
		self.app.use('/sta', api);

		//BORRAR 

		/*self.app.get('/', (req, res) => {
			//Devuelve una promise, se usa then(), catch() para consumir la promesa
			queryInterface.getData("test",{},sparqlClient).then((data) => {
				console.log("Conexión con endpoint OK");
				res.status(200).send(data.results.bindings);
			})
			.catch((err) => { 
				console.log("Error en conexión con endpoint");
				if(err.statusCode!= null && err.statusCode!=undefined ){
					res.status(err.statusCode).send({message: err});
				}
				else{ 
					res.status(500).send({message: err});
				}
			});
		}); 
		/*self.app.get('/test/:testId', (req, res) => {	
			res.send({ message: `Hola ${req.params.testId}` });
		});*/
		/*self.app.get('/test', (req, res) => { 
			var data_return = [];
			var variables = ["s", "p", "o"];
			var query = 'SELECT ?' + variables[0] + ' ?' + variables[1] + ' ?' + variables[2] + ' WHERE { ?' + variables[0] + ' ?' + variables[1] + ' ?' + variables[2] + ' .} LIMIT 5';

			sparqlClient.query(query)
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
		});*/
	};
	/*self.initSPARQL = function () {
		self.sparqlClient = new Client(config.endpoint);
		self.sparqlClient.setOptions("application/json");
		self.sparqlClient.setQueryGraph(config.defaultGraph);
	};*/
};

//Main
var myApp = new TimberApp();
//myApp.initSPARQL();
myApp.initialize();
myApp.start();

