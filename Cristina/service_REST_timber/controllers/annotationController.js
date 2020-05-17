const _ = require('underscore');
const queryInterface = require('../helpers/queryInterface');
var cache = require('../models/cache');
const onturis = require('../config/onturis');

function getAnnotations(req, res) {
    var arg = {};
    let nextPage = undefined;
    var response = {};
    var fullUrl = "";
    var irisAnnotations = [];
    var noCache = [];
    var id;

    let queryParameters = req.query;
    arg.offset = 0; //por defecto
    arg.limit = 1000; //por defecto

    if (queryParameters.page != undefined) {
        //Obtener número de página si se ha pasado por parámetro en la url. Si la página solicitada no existe (p.e es un número muy grande) devuelve status code 500, SPARQL Request Failed al hacer la consulta
        arg.offset = Number(queryParameters.page) * arg.limit;
    }
    else {
        queryParameters.page = 0;
    }
    //Listar todas las anotaciones de un usuario
    if (queryParameters.creator != undefined) {
        if (queryParameters.creator == "") {
            res.status(400).send();
        }
        else {
            fullUrl = req.protocol + '://' + req.hostname + req.originalUrl.split('&page')[0];
            arg.uri_creator = (queryParameters.creator == "ifn") ? onturis.ifn_ontology : onturis.users + queryParameters.creator;

            queryInterface.getData("annotations_uris_creator", arg, sparqlClient)
                .then((data) => {
                    irisAnnotations = Object.keys(data);
                    if (irisAnnotations.length == 0) {
                        res.status(204).send();
                    }
                    else {
                        //Si hay más páginas las incluyo
                        if (irisAnnotations.length == arg.limit) {
                            nextPage = { "url": `${fullUrl}&page=${Number(queryParameters.page) + 1}` };
                        }
                        //COMPROBAR SI ESTÁN CACHEADAS
                        irisAnnotations.forEach(annot => {
                            if (cache.annotations[annot] != undefined) {
                                noCache = noCache.filter(e => e !== annot);
                                response[annot] = cache.annotations[annot];
                            }
                            else {
                                noCache.push(annot);
                            }
                        });

                        // Si hay alguna anotación no cacheada consulto al virtuoso sobre él
                        if (noCache.length != 0) {
                            arg = {};
                            arg.uri = noCache.toString().replace(/,/g, '>, <');
                            queryInterface.getData("details_allprop", arg, sparqlClient)
                                .then((data) => {
                                    data.results.bindings.forEach(element => {
                                        id = element.iri.value;
                                        console.log(cache.annotations[id])
                                        cache.annotations[id] = cache.annotations[id] == undefined ? {} : cache.annotations[id];
                                        response[id] = response[id] == undefined ? {} : response[id];
                                        cache.annotations[id][element.prop.value] = element.value;
                                        response[id][element.prop.value] = cache.annotations[id][element.prop.value];
                                        noCache = noCache.filter(e => e !== id);
                                    })
                                    res.status(200).send({ response, nextPage });
                                })
                        }
                        else{
                            res.status(200).send({ response, nextPage });
                        }
                    }
                }).catch((err) => {
                    console.log("Error en conexión con endpoint");
                    if (err.statusCode != null && err.statusCode != undefined) {
                        res.status(err.statusCode).send({ message: err });
                    }
                    else {
                        err = err.message;
                        res.status(500).send(err);
                    }
                });
        }
    }
}
function getAnnotation(req,res){
    var arg = {};
    arg.uri = "http://timber.gsic.uva.es/sta/data/annotation/" + req.params.annotationId;
    var response = {};

    queryInterface.getData("details_allprop", arg, sparqlClient)
        .then((data) => {
            var id = req.params.annotationId;
            cache.annotations[id] == undefined ? cache.annotations[id] = {} : cache.annotations[id];
            response[id] ={};

            data.results.bindings.forEach(element => {
                cache.annotations[id][element.prop.value]=element.value;
                response[id][element.prop.value]=cache.annotations[id][element.prop.value];
            });
            res.status(200).send({response});
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
}
module.exports = {
    getAnnotations,
    getAnnotation
}