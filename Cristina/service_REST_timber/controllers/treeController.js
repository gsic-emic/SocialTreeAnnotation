const _ = require('underscore');
const queryInterface = require('../helpers/queryInterface');
var onturis = require('../config/onturis');
var config = require('../config/config');
/**
 * 
 * @param {*} req 
 * @param {*} res 
 */
function getTrees(req, res) {
    let queryParameters = req.query;
    //Si hay query, leer los parámetros. 
    if (!_.isEmpty(queryParameters)) {
        // Para recuperar los árboles en un área se necesitan 4 puntos (2 coordenadas) => lat0,long0,lat1,long1 
        if (Object.keys(queryParameters).length == 4) {
            arg = {
                "latsouth": queryParameters.lat0,
                "longsouth": queryParameters.long0,
                "latnorth": queryParameters.lat1,
                "longnorth": queryParameters.long1,
            };
        }
        /**
         * Se haría un SELECT al SPARQL para todos los árboles en el sistema en el área. Solo la primera vez, luego se consultan los datos almacenados en el objeto trees ("cacheados"). => ¡¡ REVISAR/COMENTAR CON GUILLERMO !!
         * 
         * 1. Consulto a ver si tiene anotación aceptada de tipo posicion y esa posicion la guardo en el models/tree como posición "buena" del árbol
         * 2. Si no tiene consulto si tiene anotaciçon de posición y la que tenga mayor ranking (parte social, pdte) me la quedo como posición "buena" por el momento.
        */
        queryInterface.getData("treesinAreaAssert", arg, sparqlClient).then((data) => {
            console.log("Conexión con endpoint OK");
            if (data.results.bindings.length == 0) {
                console.log("No hay arboles, pruebo si hay sin anotación aceptada");
                //Anido las promises aí porque es un caso especial (no es una cadena de promesas siempre, solo en un caso).
                queryInterface.getData("treesinArea", arg, sparqlClient).then((data) => {
                    if (data.results.bindings.length == 0) {
                        console.log("No hay arboles en el área");
                        res.status(204).send();
                    }
                    else {
                        res.status(200).send(data.results.bindings);
                    }
                })
                    .catch((err) => {
                        console.log("Error en conexión con endpoint");
                        if (err.statusCode != null && err.statusCode != undefined) {
                            res.status(err.statusCode).send({ message: err });
                        }
                        else {
                            res.status(500).send({ message: err });
                        }
                    });
            }
            else {
                res.status(200).send(data.results.bindings);
            }
        })
            .catch((err) => {
                console.log("Error en conexión con endpoint");
                if (err.statusCode != null && err.statusCode != undefined) {
                    res.status(err.statusCode).send({ message: err });
                }
                else {
                    res.status(500).send({ message: err });
                }
            });
    }
    else {
        arg = {"cluri": onturis.tree};
        //sparqlClient.setQueryFormat("application/x-json+ld");
        console.log("TEST");
        queryInterface.getData("indivs", arg, sparqlClient).then((data) => {
           /*if (data.results.bindings.length == 0) {
                console.log("No hay arboles");
                res.status(204).send();
            }
            else {
                res.status(200).send(data.results.bindings);
            }*/
            res.status(200).send(data);
            console.log(data);
            console.log("OK");
        })
            .catch((err) => {
                console.log("Error en conexión con endpoint");
                if (err.statusCode != null && err.statusCode != undefined) {
                    res.status(err.statusCode).send({ message: err });
                }
                else {
                    res.status(500).send({ message: err });
                }
            });
    }
}
module.exports = {
    getTrees
}
