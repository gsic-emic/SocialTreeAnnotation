const Mustache = require('mustache');
const _ = require('underscore');
const queries = require('../config/queries');

function getData(queryname, arg, sparqlClient, callback, failfunc) {
	var data_return = [];

	// get query object
	var qo = _.find(queries.queriesArray, function (el) { return el.name === queryname; });
	// substitute parameters with mustache
	var query = Mustache.render(qo.query, arg);
	// process prefixes
	query = processPrefixes(query);
	// log query
	console.debug(query); 
	// query!
	return sparqlClient.query(query);/*.then((data) => {
			//console.log(data);
			data.results.bindings.forEach(element => {
				data_return.push(element);
			});
			//console.log(data_return); 
			return data_return; 
		})
		.catch((err) => {
			//console.log(err);
			return err;
		}); */
}


function processPrefixes(query) {
	// inicializo cadena de prefijos
	var cadprefs = "";
	// cojo los prefijos y analizo uno a uno
	var prefijos = _.keys(queries.queryPrefixes);
	_.each(prefijos, function (pref) {
		// preparamos la cadena a sustituir
		var cadsust = "<" + queries.queryPrefixes[pref];
		// analizamos la cadena para las sustituciones		
		while (query.indexOf(cadsust) != -1) {
			// obtengo el índice la sustitución (para eliminar el ">" siguiente)
			var indice = query.indexOf(cadsust);
			// hago reemplazo
			query = query.replace(cadsust, pref + ":");
			// elimino el ">" siguiente
			var indmayor = query.indexOf(">", indice);
			query = query.slice(0, indmayor) + query.slice(indmayor + 1);
		}
		// incluyo el prefijo si hay alguno en el texto de la consulta (se haya hecho lo anterior o no)
		if (query.indexOf(pref + ":") != -1)
			cadprefs += "PREFIX " + pref + ": <" + queries.queryPrefixes[pref] + ">\n";
	});
	return cadprefs + query;
}

module.exports = {
	getData
}