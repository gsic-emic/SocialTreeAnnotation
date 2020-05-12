const queryInterface = require('../helpers/queryInterface');
var onturis = require('../config/onturis');
const _ = require('underscore');
const config = require('../config/onturis');

var especies = {};

function getSpecies(req, res) {
    var arg = {};
    let nextPage = undefined;
    var response = {};
    var fullUrl = "";

    let queryParameters = req.query;
    arg.offset = 0; //por defecto
    arg.limit = 1000; //por defecto

    if (queryParameters.page != undefined) {
        arg.offset = Number(queryParameters.page) * arg.limit;
    }
    else {
        queryParameters.page = 0;
    }
    fullUrl = req.protocol + '://' + req.hostname + req.originalUrl.split('?page')[0];

    if (Object.keys(especies).length == 0 ){
        getSpeciesInfo(function() {
            console.info("Info de especies cargada");
            response = especies;
            res.status(200).send({response , nextPage});
        });
    }
    else{
        console.info("Info de especies cacheada");
        response = especies;
        res.status(200).send({response , nextPage});
    }
   



    /*arg.cluri = onturis.ifn_species;
    queryInterface.getData("indivs", arg, sparqlClient)
        .then((data) => {
            // Las keys de data forman un array con todas las IRIs de los árboles
            irisSpecies = Object.keys(data);
            if (irisSpecies.length == 0) {
                res.status(204).send();
            }
            else {
                //Si hay más páginas las incluyo
                if (irisSpecies.length == arg.limit) {
                    nextPage = { "url": `${fullUrl}?page=${Number(queryParameters.page) + 1}` };
                }
                arg.uri = irisSpecies.toString().replace(/,/g, '>,<');
                return queryInterface.getData("details_allprop", arg, sparqlClient);
            }

        }).then((data) => {
            res.status(200).send({data , nextPage});
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
        });*/

}

function getSpeciesInfo(callback) {
    // inicializo lista con las especies top
    var suristop = _.toArray(onturis.ifn_especiesTop);
    // obtengo subclases de suristop
    getSubclassesSpecies(suristop, function () { // aquí ya tengo la taxonomía de especies
        var suris = _.keys(especies);
        getPropsResources(queryInterface, suris, [onturis.prifnScientificName, onturis.prifnVulgarName,
        onturis.prifnWikipediaPage, onturis.prifnSameAs],
            especies, function () {
                // callback?
                if (callback != undefined)
                    callback();
            });

        // guardo la lista expandida de especies para cada una (lo hace rápido y bien)
        var evsuris = _.keys(especies);
        while (evsuris.length > 0) {
            var newevsuris = [];
            _.each(evsuris, function (suri) {
                // recupero especie
                var especie = especies[suri];
                // ajusto nivel (para determinar si es especie/género/familia/clase)
                if (especie.nivel == undefined)
                    especie.nivel = 0;
                else
                    especie.nivel++;
                // obtengo la uri de cualquier subespecie sin expandir
                var algsubsuri = _.find(especie.subclasses, function (subsuri) {
                    return especies[subsuri].expuris == undefined;
                });
                // si no está definida, puedo hacer la expansión de uris
                if (algsubsuri == undefined) {
                    // inicializo con la uri de la propia especie
                    especie.expuris = [suri];
                    // y ahora incluimos las de la subclases
                    _.each(especie.subclasses, function (subsuri) {
                        especie.expuris = _.union(especie.expuris, especies[subsuri].expuris);
                    });
                }
                else // hay que esperar a la siguiente iteración
                    newevsuris.push(suri);
            });
            // actualizo lista de tipos a evaluar
            evsuris = newevsuris;
        }
    });
}
function getSubclassesSpecies(sturis, callback) {
    var nrequests = sturis.length;
    _.each(sturis, function (sturi) {
        // obtengo lista de pares de superclase-subclase a partir de la clase sturi
        queryInterface.getData("subclasses", { 'uri': sturi }, sparqlClient).then((data) => {
            // fue todo bien, inicializo clase sturi			
            initClass(especies, sturi);
            // analizo cada fila
            _.each(data.results.bindings, function (row) {
                // obtengo datos
                var supuri = row.sup.value;
                var suburi = row.sub.value;
                // inicializo clases
                initClass(especies, supuri);
                initClass(especies, suburi);
                // guardo subclase
                especies[supuri].subclasses.push(suburi);
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
}
function initClass(objbase, cluri) {
    if (objbase[cluri] == undefined) {
        objbase[cluri] = {
            "uri": cluri,
            //"prefix": _.findKey(queryPrefixes, function(pu) { return cluri.startsWith(pu); }) 
        };
        objbase[cluri].subclasses = [];
    }
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
    getSpecies
}