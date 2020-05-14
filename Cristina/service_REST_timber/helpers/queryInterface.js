const Mustache = require('mustache');
const _ = require('underscore');
const queries = require('../config/queries');

function getData(queryname, arg, sparqlClient) {
	// get query object
	var qo = _.find(queries.queriesArray, function (el) { return el.name === queryname; });
	// substitute parameters with mustache
	var query = Mustache.render(qo.query, arg);
	// process prefixes
	query = processPrefixes(query);
	// log query
	console.log(query); 
	// query! //Devuelvo una promesa
	return sparqlClient.query(query);
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

function getPropsResources(provdatos, ruris, props, target, callback) {
	// num de consultas
	var nrequests = 0;
	var totalrequests = 0;
	// chequeo los recursos implicados en cada propiedad
	_.each(props, function(prop) {
		// lista de uris a obtener
		var uris = [];
		// analizo si existen los recursos y las propiedades
		_.each(ruris, function(ruri) {
			// creo el recurso si hace falta
			if (target[ruri] == undefined)
				target[ruri] = { "uri" : ruri };
			if (target[ruri][prop] == undefined) 
				uris.push(ruri);
		});

		// preparo lotes de 100 uris
		var lote = 100;
		var urisets = [];
		for (var ind=0; uris.length > ind*lote; ind++) {
			var begin = ind*lote;
			var end = (ind + 1)*lote;
			if (end > uris.length)
				end = uris.length;		
			urisets.push( uris.slice( begin, end ) );		
		}
		
		// incremento peticiones
		nrequests += urisets.length;
		totalrequests += urisets.length;
				
		// solicito cada lote
		_.each(urisets, function(uriset) {
			// preparo subconjunto de uris
			var aux = {};
			aux.propuri = prop;
			aux.uris = [];
			aux.furis = []; 
			_.each(uriset, function(uri) {
				aux.uris.push(uri);
				aux.furis.push("<"+uri+">");
			});
            provdatos.getData('propvalues', aux, sparqlClient).then((datos) => {
				// creo los arrays de las propiedades aquí (ya que ha habido respuesta buena)
				_.each(aux.uris, function(evuri) {
					if (target[evuri][prop] == undefined)
						target[evuri][prop] = {};
				});						
				// ahora proceso los resultados
				_.each(datos.results.bindings, function(row) {
					// obtengo datos
					var evuri = row.uri.value;
					var value = row.value;
					// object property?
					if (value.type === "uri") {
						// inicializo array de object values si hace falta
						if (target[evuri][prop].ovals == undefined)
							target[evuri][prop].ovals = [];
						// guardo valor
						target[evuri][prop].ovals.push(value.value);
					}					
					// datatype property?
					else if (value.type === "literal" || value.type === "typed-literal") {	
						// inicializo objeto de literales si hace falta
						if (target[evuri][prop].lits == undefined)
							target[evuri][prop].lits = {};
						// guardo valor
						var lang = value["xml:lang"] == undefined? "nolang" : value["xml:lang"];
						var val = value.value;
						target[evuri][prop].lits[lang] = val;
					}
					// no incluyo blank nodes
				});				
				// decremento peticiones
				nrequests--;
				// callback?
				if (nrequests <= 0 && callback != undefined)
					callback();
            })
            .catch((err) => {
                console.log("Error en conexión con endpoint");
                if (err.statusCode != null && err.statusCode != undefined) {
                    res.status(err.statusCode).send({ message: err });
                }
                else {
                    err = err.message;
                    res.status(500).send(err);
                }
            });
		});
	});	
	// no requests, callback
	if (nrequests == 0 && callback != undefined)
		callback();
	
	// devuelvo número de consultas hechas
	return totalrequests;
}

module.exports = {
	getData,
	getPropsResources
}