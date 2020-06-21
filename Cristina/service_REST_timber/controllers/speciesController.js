const queryInterface = require('../helpers/queryInterface');
var onturis = require('../config/onturis');
const _ = require('underscore');
const config = require('../config/onturis');
const { nameQueries } = require('../config/queries');
const { errorCache } = require('../config/errorCodes');
const errorCodes = require('../config/errorCodes');
const { response } = require('express');
var especies = require('../models/cache').species;

async function getSpecies(fullUrl) {
    return new Promise((resolve, reject) => {

        var arg = {};
        let nextPage = undefined;
        var finalResp = {};
        var page = undefined;
        var response = {};

        arg.offset = config.offset; //por defecto
        arg.limit = config.limit; //por defecto

        page = fullUrl.split('?page=')[1];
        if (page != undefined) {
            arg.offset = Number(page) * arg.limit;
        }
        else {
            page = 0;
        }
        fullUrl = fullUrl.split('?page=')[0];

        if (Object.keys(especies).length == 0) {
            getSpeciesInfo(function (err) {
                if (err != undefined) {
                    resolve(err);
                }
                else {
                console.info("Info de especies cargada");
                finalResp.code = 200;
                response = especies;
                finalResp.msg = { response, nextPage };
                resolve(finalResp);
                }
            });
        }
        else {
            console.info("Info de especies cacheada");
            finalResp.code = 200;
            response = especies;
            finalResp.msg = { response, nextPage };
            resolve(finalResp);
        }
    });
}

function getSpeciesInfo(callback) {
    // inicializo lista con las especies top
    var suristop = _.toArray(onturis.ifn_especiesTop);
    // obtengo subclases de suristop
    getSubclassesSpecies(suristop, function (err) { // aquí ya tengo la taxonomía de especies
        if (err != undefined) {
            callback(err);
        }
        else {
            var suris = _.keys(especies);
            queryInterface.getPropsResources(queryInterface, suris, [onturis.prifnScientificName, onturis.prifnVulgarName,
            onturis.prifnWikipediaPage, onturis.prifnSameAs],
                especies, function () {
                    // callback?
                    if (callback != undefined)
                        callback();
                })

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
        }
    });
}

function getSubclassesSpecies(sturis, callback) {
    var nrequests = sturis.length;
    _.each(sturis, function (sturi) {
        // obtengo lista de pares de superclase-subclase a partir de la clase sturi
        queryInterface.getData(nameQueries.subclasses, { 'uri': sturi }, sparqlClient).then((data) => {
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
        }).catch((err) => {
            console.log("Error en conexión con endpoint SPECIES", err);
            callback(errorCodes.conexionVirtuoso);
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


module.exports = {
    getSpecies
}