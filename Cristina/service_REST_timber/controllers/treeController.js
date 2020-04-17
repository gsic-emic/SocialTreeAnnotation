const _ = require('underscore');
const queryInterface = require('../helpers/queryInterface');
var onturis = require('../config/onturis');
var config = require('../config/config');
var Mustache = require('mustache');

var trees = {};
/**
 * 
 * @param {*} req 
 * @param {*} res 
 */


function getTrees(req, res) {
    var arg = {};
    let nextPage = undefined;

    let queryParameters = req.query;
    arg.offset = 0; //por defecto
    arg.limit = 1000; //por defecto

    
    if (queryParameters.page != undefined) {
        //Obtener número de página si se ha pasado por parámetro en la url. Si la página solicitada no existe (p.e es un número muy grande) devuelve status code 500, SPARQL Request Failed al hacer la consulta
        arg.offset = Number(queryParameters.page) * arg.limit;
    }
    else{
        queryParameters.page = 0; 
    }

    // Para recuperar los árboles en un área se necesitan 4 puntos (2 coordenadas) => lat0,long0,lat1,long1 (+página)
    if (Object.keys(queryParameters).length == 4 || Object.keys(queryParameters).length == 5) {
        arg.latsouth = queryParameters.lat0;
        arg.longsouth = queryParameters.long0;
        arg.latnorth = queryParameters.lat1;
        arg.longnorth = queryParameters.long1;

        //Compruebo si hay árboles cacheados (pero en esa zona) PDTE!
        //if (Object.keys(trees).length < arg.limit * queryParameters.page && trees.constructor === Object) {

            queryInterface.getData("treesinArea_pos", arg, sparqlClient).then((data) => {
                console.log("Conexión con endpoint OK");
                if (Object.keys(data).length == 0) {
                    console.log("No hay arboles en el área");
                    res.status(204).send();
                }
                else {
                    if (Object.keys(data).length == arg.limit) {
                        nextPage = { "url": `http://timber.gsic.uva.es/sta/data/tree/?page=${arg.offset + 1}` };
                    }
                    Object.keys(data).forEach(tree => {
                        trees[tree] = {}
                        trees[tree].lat = data[tree][onturis.geo_lat][0].value;
                        trees[tree].long = data[tree][onturis.geo_long][0].value;
                    })
                    console.log(trees)
                    res.status(200).send({ trees, nextPage });
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

       /* }
        else {
            console.log("Hay árboles cacheados");
        }*/


    }
    else {
        var lengthTotal =  arg.limit * queryParameters.page ;
        console.log(lengthTotal)
        var stpage="page"+queryParameters.page;
        console.log(stpage)
        
        if (Object.keys(trees).length == 0 || trees[stpage] == undefined || Object.keys(trees[stpage]).length == 0 ) {
            trees[stpage]={};
            //sparqlClient.setQueryFormat("application/x-json+ld");
            //sparqlClient.setQueryGraph("http://timber.gsic.uva.es");
            queryInterface.getData("allTrees_pos", arg, sparqlClient)
                .then((data) => {
                    //Si hay más páginas las incluyo. Puede fallar si la última página tiene justo 1000 resultados, daría un enlace a la siguiente página y al hacer la consulta devolvería un 500.
                    if (Object.keys(data).length == arg.limit) {
                        nextPage = { "url": `http://timber.gsic.uva.es/sta/data/tree/?page=${Number(queryParameters.page) + 1}` };
                    }
                    Object.keys(data).forEach(tree => {
                        trees[stpage][tree] = {}
                        trees[stpage][tree].lat = data[tree][onturis.geo_lat][0].value;
                        trees[stpage][tree].long = data[tree][onturis.geo_long][0].value;
                    });

                    //Formatear las uris de los árboles del sistema para consultar la especie. Puede que haya árboles sin especie (no es un campo obligatorio al crear un árbol)
                    arg.treesArea = "<" + Object.keys(trees[stpage]).toString().replace(/,/g, '> <') + ">";

                    return queryInterface.getData("allTrees_species", arg, sparqlClient);
                })
                .then((data) => {
                    Object.keys(data).forEach(tree => {
                        trees[stpage][tree].species = data[tree][onturis.prHasTaxon][0].value;
                    });
                    var response = trees[stpage];
                    res.status(200).send({ response , nextPage });
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
            console.log("Hay árboles cacheados");
            if (Object.keys(trees[stpage]).length == arg.limit) {
                nextPage = { "url": `http://timber.gsic.uva.es/sta/data/tree/?page=${Number(queryParameters.page) + 1}` };
            }
            var response = trees[stpage];
            res.status(200).send({ response, nextPage });

        }

    }

}

function getTree(req, res) {
    var arg = {};
    var objResults = {};
    var objAux = {};
    var my_array = [];
    arg.uri = "http://timber.gsic.uva.es/sta/data/tree/" + req.params.treeId;
    queryInterface.getData("details", arg, sparqlClient)
        .then((data) => {
            // Array con variables usadas en la consulta sparql
            //var variablesQuery = (Mustache.render("{{{head.vars}}}",data)).split(",");
            //console.log(variablesQuery)
            var result = Mustache.render(Mustache.render(unescape("{ {{#results.bindings}} {{& s.value}} : { {{& p.value}} : [ type : {{& o.type}} , value : {{& o.value}} ] },{{/results.bindings}} }"), data))
            //console.log(result);
            res.contentType('application/json');

            data.results.bindings.forEach(element => {
                objAux = {};
                objAux[element.p.value] = element.o;
                my_array.push(objAux)
                objResults[element.s.value] = my_array;
            });
            //console.log(objResults);
            res.status(200).send(JSON.stringify(objResults));
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
    //res.send({ message: `Árbol ${req.params.treeId}` });
}

module.exports = {
    getTrees,
    getTree
}
