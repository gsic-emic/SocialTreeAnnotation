const queryInterface = require('../helpers/queryInterface');
const onturis = require('../config/onturis');
var cache = require('../models/cache');
const helpers = require('../helpers/helpers');
const config = require('../config/config');
const annotationController = require('./annotationController');
const imageController = require('./imageController');
const userController = require('./userController');
const { nameQueries } = require('../config/queries');
const errorCodes = require('../config/errorCodes');
const httpCodes = require('../config/httpCodes');

var treesNoCache = [];

async function getTrees(queryParameters, fullUrl) {
    return new Promise((resolve, reject) => {

        sparqlClient.setDefaultGraph();
        var arg = {};
        let nextPage = undefined;
        var response = {};
        var namesParamsJson = [];
        var irisTrees = [];
        var querys = [];
        //var params = [];
        var propIrisFull = [];
        var setTrees = {};
        var parametro;
        var propAnn = false;
        var finalResp = {};

        arg.offset = config.offset; //por defecto
        arg.limit = config.limit; //por defecto

        if (queryParameters.page != undefined) {
            //Obtener número de página si se ha pasado por parámetro en la url. Si la página solicitada no existe (p.e es un número muy grande) devuelve status code 500, SPARQL Request Failed al hacer la consulta
            arg.offset = Number(queryParameters.page) * arg.limit;
        }
        else {
            queryParameters.page = 0;
        }
        //Listar todos los árboles del sistema en un área dada por 4 puntos (2 coordenadas) => lat0,long0,lat1,long1
        if (Object.keys(queryParameters).length == 4 || Object.keys(queryParameters).length == 5) {
            //Si alguna de las posiciones está vacía => 400 Bad Request
            if (queryParameters.lat0 == "" || queryParameters.lat0 == undefined || queryParameters.long0 == "" || queryParameters.long0 == undefined || queryParameters.lat1 == "" || queryParameters.lat1 == undefined || queryParameters.long1 == "" || queryParameters.long1 == undefined) {
                resolve(errorCodes.badRequest)
            }
            //Si la query es válida
            else {
                namesParamsJson = ["creator", "species"];
                arg.latsouth = queryParameters.lat0;
                arg.longwest = queryParameters.long0;
                arg.latnorth = queryParameters.lat1;
                arg.longeast = queryParameters.long1;

                fullUrl = fullUrl.split('&page')[0];

                // Paso 1, siempre se consulta al Virtuoso para obtener las IRIs de los árboles solicitados y sus posiciones primarias. Obtengo la página correspondiente de todos los árboles del sistema
                queryInterface.getData(nameQueries.treesUrisZone, arg, sparqlClient)
                    .then((data_trees) => {
                        // Las keys de data forman un array con todas las IRIs de los árboles
                        irisTrees = Object.keys(data_trees);
                        //console.log(irisTrees);
                        if (irisTrees.length == 0) {
                            resolve(httpCodes.empty)
                        }
                        else {
                            //Si hay más páginas las incluyo
                            if (irisTrees.length == arg.limit) {
                                nextPage = { "url": `${fullUrl}&page=${Number(queryParameters.page) + 1}` };
                            }
                            //COMPROBAR SI ESTÁN CACHEADOS, PARA CADA ÁRBOL
                            irisTrees.forEach(tree => {
                                if (cache.trees[tree] != undefined) {
                                    //console.log("Árbol cacheado, hay que ver si tengo guardados los datos que necesito devolver")
                                    //¿Si tengo un árbol cacheado tendré todos sus datos? Puede que tenga algunos sí y otros no cacheados y tenga que hacer las consultas de los que me faltan... PDTE IMPLEMENTAR
                                    if (cache.trees[tree].creator != undefined && cache.trees[tree].lat != undefined && cache.trees[tree].long != undefined) {
                                        //console.log("Arbol " + tree + " cacheado");
                                        treesNoCache = treesNoCache.filter(e => e !== tree); //Elimino el árbol del array de árboles no cacheados
                                        response[tree] = (response[tree] == undefined) ? {} : response[tree];
                                        response[tree].creator = cache.trees[tree].creator;
                                        response[tree].lat = cache.trees[tree].lat;
                                        response[tree].long = cache.trees[tree].long;
                                        response[tree].species = cache.trees[tree].species;
                                    }
                                    //Si le falta algún dato considero que no está cacheado y consulto
                                    else {
                                        treesNoCache.push(tree);
                                        cache.trees[tree] == undefined ? cache.trees[tree] = {} : cache.trees[tree];
                                        response[tree] == undefined ? response[tree] = {} : response[tree];
                                    }
                                }
                                else {
                                    //console.log("Árbol " + tree + " no cacheado");
                                    //Almaceno en cache y en el objeto de respuesta la posición
                                    cache.trees[tree] = {};
                                    response[tree] = {};
                                    cache.trees[tree]["lat"] = data_trees[tree][onturis.geo_lat][0].value;
                                    cache.trees[tree]["long"] = data_trees[tree][onturis.geo_long][0].value;
                                    response[tree]["lat"] = cache.trees[tree]["lat"];
                                    response[tree]["long"] = cache.trees[tree]["long"];
                                    treesNoCache.push(tree);
                                }
                            })
                            // Si hay algún árbol no cacheado consulto al virtuoso sobre él
                            if (treesNoCache.length != 0) {
                                arg = {};
                                arg.uri = treesNoCache.toString().replace(/,/g, '>, <');

                                var params = {
                                    propIris: [],
                                    querys: []
                                };

                                //REPASAR: Lo bueno sería hacer un bucle aquí. Y hacer un array con [onturis.dc_creator]... igual que namesParamsJson
                                propIrisFull.push({ [onturis.dc_creator]: namesParamsJson[0] });
                                propIrisFull.push({ [onturis.prHasTaxon]: namesParamsJson[1] });

                                // Si es una propiedad del árbol
                                propAnn = false;
                                params.propIris.push({ [onturis.dc_creator]: namesParamsJson[0] });
                                queryInterface.setQuerys(params, propAnn, arg);

                                // Si es una propiedad de una anotación (estaría bien pasar otro campo que indicase de que tipo es la anotación y así hacer una única llamada a queryInterface.setQuerys(). Mejoras a futuro)
                                propAnn = true;
                                arg.propiritype = onturis.prHasPrimarySpecies;
                                params.propIris.push({ [onturis.prHasTaxon]: namesParamsJson[1] });
                                queryInterface.setQuerys(params, propAnn, arg, querys);

                                Promise.all(params.querys).then((data) => {
                                    //Resolucion Promise.all
                                    params.querys = [];//Reincio array de querys

                                    // FORMATEAR RESULTADO PROMISES.FALTA!! NOVA BIEN
                                    //console.log(data)
                                    var i = 0;
                                    var j = 0;
                                    //uris árboles 
                                    for (j = 0; j < data.length; j++) {
                                        setTrees = data[j];
                                        parametro = namesParamsJson[j];
                                        Object.keys(setTrees).forEach(tree => {
                                            //console.log(tree)
                                            cache.trees[tree] == undefined ? cache.trees[tree] = {} : cache.trees[tree];
                                            response[tree] == undefined ? response[tree] = {} : response[tree];
                                            cache.trees[tree][parametro] = {};
                                            response[tree][parametro] = {};
                                            cache.trees[tree][parametro] = setTrees[tree][Object.keys(propIrisFull[i])[0]][0].value;
                                            response[tree][parametro] = cache.trees[tree][parametro];
                                            treesNoCache = treesNoCache.filter(e => e !== tree);
                                        })
                                        i = i + 1;
                                    }
                                    finalResp.code = 200;
                                    finalResp.msg = { response, nextPage };
                                    resolve(finalResp);
                                }).catch((err) => {
                                    console.log("Error: ", err);
                                    resolve(errorCodes.conexionVirtuoso);
                                    /*if (err.statusCode != null && err.statusCode != undefined) {
                                        res.status(err.statusCode).send({ message: err });
                                    }
                                    else {
                                        err = err.message;
                                        res.status(500).send(err);
                                    }*/
                                });
                            }
                            else {
                                finalResp.code = 200;
                                finalResp.msg = { response, nextPage };
                                resolve(finalResp);
                            }

                        }
                    })
                    .catch((err) => {
                        console.log("Error en conexión con endpoint", err);
                        /*if (err.statusCode != null && err.statusCode != undefined) {
                            res.status(err.statusCode).send({ message: err });
                        }
                        else {
                            err = err.message;
                            res.status(500).send(err);
                        }*/
                        resolve(errorCodes.conexionVirtuoso);
                    });
            }
        }
        //Listar todos los árboles del sistema o los árboles de una especie o los árboles creados por un usuario
        else {
            //Listar todos los árboles del sistema de una especie
            if (queryParameters.species != undefined) {
                if (queryParameters.species == "") {
                    resolve(errorCodes.badRequest);
                }
                else {
                    namesParamsJson = ["creator", "lat", "long", "species"];
                    fullUrl = fullUrl.split('&page')[0];
                    arg.uri_specie = onturis.ifn_ontology + queryParameters.species;
                    // Paso 1, siempre se consulta al Virutoso para obtener las IRIs de los árboles solicitados. Obtengo la página correspondiente de todos los árboles del sistema
                    queryInterface.getData(nameQueries.treesUrisSpecies, arg, sparqlClient)
                        .then((data_trees) => {
                            // Las keys de data forman un array con todas las IRIs de los árboles
                            irisTrees = Object.keys(data_trees);
                            if (irisTrees.length == 0) {
                                resolve(httpCodes.empty);
                            }
                            else {
                                //Si hay más páginas las incluyo
                                if (irisTrees.length == arg.limit) {
                                    nextPage = { "url": `${fullUrl}&page=${Number(queryParameters.page) + 1}` };
                                }
                                //COMPROBAR SI ESTÁN CACHEADOS, PARA CADA ÁRBOL
                                irisTrees.forEach(tree => {
                                    cache.trees[tree] = (cache.trees[tree] == undefined) ? {} : cache.trees[tree];
                                    cache.trees[tree].species = data_trees[tree][onturis.prHasTaxon][0].value;
                                    if (cache.trees[tree] != undefined) {
                                        response[tree] = (response[tree] == undefined) ? {} : response[tree];
                                        response[tree].species = cache.trees[tree].species;

                                        if (cache.trees[tree].creator != undefined && cache.trees[tree].lat != undefined && cache.trees[tree].long != undefined) {
                                            //console.log("Arbol " + tree + " cacheado");
                                            treesNoCache = treesNoCache.filter(e => e !== tree); //Elimino el árbol del array de árboles no cacheados
                                            response[tree] = (response[tree] == undefined) ? {} : response[tree];
                                            response[tree].creator = cache.trees[tree].creator;
                                            response[tree].lat = cache.trees[tree].lat;
                                            response[tree].long = cache.trees[tree].long;
                                            response[tree].species = cache.trees[tree].species;
                                        }
                                        //Si le falta algún dato considero que no está cacheado y consulto
                                        else {
                                            treesNoCache.push(tree);
                                            cache.trees[tree] == undefined ? cache.trees[tree] = {} : cache.trees[tree];
                                            response[tree] == undefined ? response[tree] = {} : response[tree];
                                        }
                                    }
                                    else {
                                        //console.log("Árbol " + tree + " no cacheado");
                                        //Almaceno en cache y en el objeto de respuesta la posición
                                        cache.trees[tree] = {};
                                        response[tree] = {};
                                        cache.trees[tree][namesParamsJson[3]] = data_trees[tree][onturis.prHasTaxon][0].value;
                                        response[tree][namesParamsJson[3]] = cache.trees[tree][namesParamsJson[3]]
                                        treesNoCache.push(tree);
                                    }
                                })
                                // Si hay algún árbol no cacheado consulto al virtuoso sobre él
                                if (treesNoCache.length != 0) {
                                    arg = {};
                                    arg.uri = treesNoCache.toString().replace(/,/g, '>, <');

                                    var params = {
                                        propIris: [],
                                        querys: []
                                    };

                                    //REPASAR: Lo bueno sería hacer un bucle aquí. Y hacer un array con [onturis.dc_creator]... igual que namesParamsJson
                                    propIrisFull.push({ [onturis.dc_creator]: namesParamsJson[0] });
                                    propIrisFull.push({ [onturis.geo_lat]: namesParamsJson[1] });
                                    propIrisFull.push({ [onturis.geo_long]: namesParamsJson[2] });


                                    // Si es una propiedad del árbol
                                    propAnn = false;
                                    params.propIris.push({ [onturis.dc_creator]: namesParamsJson[0] });
                                    queryInterface.setQuerys(params, propAnn, arg);

                                    // Si es una propiedad de una anotación (estaría bien pasar otro campo que indicase de que tipo es la anotación y así hacer una única llamada a queryInterface.setQuerys(). Mejoras a futuro)
                                    propAnn = true;
                                    arg.propiritype = onturis.prHasPrimaryPosition;
                                    params.propIris.push({ [onturis.geo_lat]: namesParamsJson[1] });
                                    params.propIris.push({ [onturis.geo_long]: namesParamsJson[2] });
                                    queryInterface.setQuerys(params, propAnn, arg, querys);

                                    Promise.all(params.querys).then((data) => {
                                        //Resolucion Promise.all
                                        params.querys = [];//Reincio array de querys

                                        // FORMATEAR RESULTADO PROMISES.FALTA!! NOVA BIEN
                                        //console.log(data)
                                        var i = 0;
                                        var j = 0;
                                        //uris árboles 
                                        for (j = 0; j < data.length; j++) {
                                            setTrees = data[j];
                                            parametro = namesParamsJson[j];
                                            Object.keys(setTrees).forEach(tree => {
                                                //console.log(tree)
                                                cache.trees[tree] == undefined ? cache.trees[tree] = {} : cache.trees[tree];
                                                response[tree] == undefined ? response[tree] = {} : response[tree];
                                                cache.trees[tree][parametro] = {};
                                                response[tree][parametro] = {};
                                                cache.trees[tree][parametro] = setTrees[tree][Object.keys(propIrisFull[i])[0]][0].value;
                                                response[tree][parametro] = cache.trees[tree][parametro];
                                                treesNoCache = treesNoCache.filter(e => e !== tree);
                                            })
                                            i = i + 1;
                                        }
                                        finalResp.code = 200;
                                        finalResp.msg = { response, nextPage };
                                        resolve(finalResp);
                                    })
                                        .catch((err) => {
                                            console.log("Error en conexión con endpoint", err);
                                            /*if (err.statusCode != null && err.statusCode != undefined) {
                                                res.status(err.statusCode).send({ message: err });
                                            }
                                            else {
                                                err = err.message;
                                                res.status(500).send(err);
                                            }*/
                                            resolve(errorCodes.conexionVirtuoso);
                                        });
                                }
                                else {
                                    finalResp.code = 200;
                                    finalResp.msg = { response, nextPage };
                                    resolve(finalResp);
                                }
                            }
                        })
                        .catch((err) => {
                            console.log("Error en conexión con endpoint ", err);
                            /*if (err.statusCode != null && err.statusCode != undefined) {
                                res.status(err.statusCode).send({ message: err });
                            }
                            else {
                                err = err.message;
                                res.status(500).send(err);
                            }*/
                            resolve(errorCodes.conexionVirtuoso);
                        });
                }
            }
            //Listar todos los árboles del sistema creados por un usuario
            else if (queryParameters.creator != undefined) {
                if (queryParameters.creator == "") {
                    resolve(errorCodes.badRequest);
                }
                else {
                    namesParamsJson = ["lat", "long", "species"];
                    fullUrl = fullUrl.split('&page')[0];
                    arg.uri_creator = (queryParameters.creator == "ifn") ? onturis.ifn_ontology : onturis.user + queryParameters.creator;
                    // Paso 1, siempre se consulta al Virutoso para obtener las IRIs de los árboles solicitados. Obtengo la página correspondiente de todos los árboles del sistema
                    queryInterface.getData(nameQueries.treesUrisCreator, arg, sparqlClient)
                        .then((data_trees) => {
                            // Las keys de data forman un array con todas las IRIs de los árboles
                            irisTrees = Object.keys(data_trees);
                            if (irisTrees.length == 0) {
                                resolve(httpCodes.empty);
                            }
                            else {
                                //Si hay más páginas las incluyo
                                if (irisTrees.length == arg.limit) {
                                    nextPage = { "url": `${fullUrl}&page=${Number(queryParameters.page) + 1}` };
                                }
                                //En el paso 2 se obtienen los datos a devolver (se comprueba si están cacheados y sino se consulta al Virtuoso). En este caso devuelvo la posición, la especie y el creador ¿¿ALGO MÁS??{};

                                //COMPROBAR SI ESTÁN CACHEADOS, PARA CADA ÁRBOL
                                irisTrees.forEach(tree => {
                                    cache.trees[tree] = (cache.trees[tree] == undefined) ? {} : cache.trees[tree];
                                    cache.trees[tree].creator = data_trees[tree][onturis.dc_creator][0].value;
                                    if (cache.trees[tree] != undefined) {
                                        response[tree] = (response[tree] == undefined) ? {} : response[tree];
                                        response[tree].creator = cache.trees[tree].creator;

                                        //console.log("Árbol cacheado, hay que ver si tengo guardados los datos que necesito devolver")
                                        //¿Si tengo un árbol cacheado tendré todos sus datos? Puede que tenga algunos sí y otros no cacheados y tenga que hacer las consultas de los que me faltan... PDTE IMPLEMENTAR
                                        if (cache.trees[tree].creator != undefined && cache.trees[tree].lat != undefined && cache.trees[tree].long != undefined) {
                                            //console.log("Arbol " + tree + " cacheado");
                                            treesNoCache = treesNoCache.filter(e => e !== tree); //Elimino el árbol del array de árboles no cacheados
                                            response[tree] = (response[tree] == undefined) ? {} : response[tree];
                                            response[tree].creator = cache.trees[tree].creator;
                                            response[tree].lat = cache.trees[tree].lat;
                                            response[tree].long = cache.trees[tree].long;
                                            response[tree].species = cache.trees[tree].species;

                                        }
                                        //Si le falta algún dato considero que no está cacheado y consulto
                                        else {
                                            treesNoCache.push(tree);
                                            cache.trees[tree] == undefined ? cache.trees[tree] = {} : cache.trees[tree];
                                            response[tree] == undefined ? response[tree] = {} : response[tree];
                                        }
                                    }
                                    else {
                                        treesNoCache.push(tree);
                                        cache.trees[tree] = {};
                                        response[tree] = {};
                                    }
                                })
                                // Si hay algún árbol no cacheado consulto al virtuoso sobre él
                                if (treesNoCache.length != 0) {
                                    arg = {};
                                    arg.uri = treesNoCache.toString().replace(/,/g, '>, <');

                                    var params = {
                                        propIris: [],
                                        querys: []
                                    };

                                    //REPASAR: Lo bueno sería hacer un bucle aquí. Y hacer un array con [onturis.dc_creator]... igual que namesParamsJson
                                    propIrisFull.push({ [onturis.geo_lat]: namesParamsJson[0] });
                                    propIrisFull.push({ [onturis.geo_long]: namesParamsJson[1] });
                                    propIrisFull.push({ [onturis.prHasTaxon]: namesParamsJson[2] });


                                    // Si es una propiedad de una anotación (estaría bien pasar otro campo que indicase de que tipo es la anotación y así hacer una única llamada a queryInterface.setQuerys(). Mejoras a futuro)
                                    propAnn = true;
                                    arg.propiritype = onturis.prHasPrimaryPosition;
                                    params.propIris.push({ [onturis.geo_lat]: namesParamsJson[0] });
                                    params.propIris.push({ [onturis.geo_long]: namesParamsJson[1] });
                                    queryInterface.setQuerys(params, propAnn, arg, querys);
                                    arg.propiritype = onturis.prHasPrimarySpecies;
                                    params.propIris.push({ [onturis.prHasTaxon]: namesParamsJson[2] });
                                    queryInterface.setQuerys(params, propAnn, arg, querys);

                                    Promise.all(params.querys).then((data) => {
                                        //Resolucion Promise.all
                                        params.querys = [];//Reincio array de querys

                                        //Formateo del resultado
                                        var i = 0;
                                        var j = 0;
                                        //uris árboles 
                                        for (j = 0; j < data.length; j++) {
                                            setTrees = data[j];
                                            parametro = namesParamsJson[j];
                                            Object.keys(setTrees).forEach(tree => {
                                                cache.trees[tree] = (cache.trees[tree] == undefined) ? {} : cache.trees[tree];
                                                response[tree] = (response[tree] == undefined) ? {} : response[tree];
                                                cache.trees[tree][parametro] = {};
                                                response[tree][parametro] = {};
                                                cache.trees[tree][parametro] = setTrees[tree][Object.keys(propIrisFull[i])[0]][0].value;
                                                response[tree][parametro] = cache.trees[tree][parametro];
                                                treesNoCache = treesNoCache.filter(e => e !== tree);
                                            })
                                            i = i + 1;
                                        }

                                        finalResp.code = 200;
                                        finalResp.msg = { response, nextPage };
                                        resolve(finalResp);
                                    })
                                        .catch((err) => {
                                            console.log("Error en conexión con endpoint ", err);
                                            /*if (err.statusCode != null && err.statusCode != undefined) {
                                                res.status(err.statusCode).send({ message: err });
                                            }
                                            else {
                                                err = err.message;
                                                res.status(500).send(err);
                                            }*/
                                            resolve(errorCodes.conexionVirtuoso);
                                        });
                                }
                                else {
                                    finalResp.code = 200;
                                    finalResp.msg = { response, nextPage };
                                    resolve(finalResp);
                                }
                            }
                        })
                        .catch((err) => {
                            console.log("Error en conexión con endpoint ", err);
                            /*if (err.statusCode != null && err.statusCode != undefined) {
                                res.status(err.statusCode).send({ message: err });
                            }
                            else {
                                err = err.message;
                                res.status(500).send(err);
                            }*/
                            resolve(errorCodes.conexionVirtuoso);
                        });
                }
            }
            //Listar todos los árboles del sistema
            else {
                namesParamsJson = ["creator", "lat", "long", "species"];
                fullUrl = fullUrl.split('?page')[0];

                // Paso 1, siempre se consulta al Virutoso para obtener las IRIs de los árboles solicitados. Obtengo la página correspondiente de todos los árboles del sistema
                queryInterface.getData(nameQueries.treesUris, arg, sparqlClient)
                    .then((data_trees) => {
                        // Las keys de data forman un array con todas las IRIs de los árboles
                        irisTrees = Object.keys(data_trees);
                        if (irisTrees.length == 0) {
                            resolve(httpCodes.empty)
                        }
                        else {
                            //Si hay más páginas las incluyo
                            if (irisTrees.length == arg.limit) {
                                nextPage = { "url": `${fullUrl}?page=${Number(queryParameters.page) + 1}` };
                            }
                            //En el paso 2 se obtienen los datos a devolver (se comprueba si están cacheados y sino se consulta al Virtuoso). En este caso devuelvo la posición, la especie y el creador ¿¿ALGO MÁS??{};

                            //COMPROBAR SI ESTÁN CACHEADOS, PARA CADA ÁRBOL
                            irisTrees.forEach(tree => {
                                if (cache.trees[tree] != undefined) {
                                    if (cache.trees[tree].creator != undefined && cache.trees[tree].lat != undefined && cache.trees[tree].long != undefined) {
                                        //console.log("Arbol " + tree + " cacheado");
                                        treesNoCache = treesNoCache.filter(e => e !== tree); //Elimino el árbol del array de árboles no cacheados
                                        response[tree] = (response[tree] == undefined) ? {} : response[tree];
                                        response[tree].creator = cache.trees[tree].creator;
                                        response[tree].lat = cache.trees[tree].lat;
                                        response[tree].long = cache.trees[tree].long;
                                        response[tree].species = cache.trees[tree].species;
                                    }
                                    //Si le falta algún dato considero que no está cacheado y consulto
                                    else {
                                        treesNoCache.push(tree);
                                        cache.trees[tree] == undefined ? cache.trees[tree] = {} : cache.trees[tree];
                                        response[tree] == undefined ? response[tree] = {} : response[tree];
                                    }
                                }
                                else {
                                    cache.trees[tree] == undefined ? cache.trees[tree] = {} : cache.trees[tree];
                                    response[tree] == undefined ? response[tree] = {} : response[tree];
                                    //console.log("Árbol " + tree + " no cacheado");
                                    treesNoCache.push(tree);
                                }
                            })
                            // Si hay algún árbol no cacheado consulto al virtuoso sobre él
                            if (treesNoCache.length != 0) {
                                arg = {};
                                arg.uri = treesNoCache.toString().replace(/,/g, '>, <');

                                var params = {
                                    propIris: [],
                                    querys: []
                                };

                                //REPASAR: Lo bueno sería hacer un bucle aquí. Y hacer un array con [onturis.dc_creator]... igual que namesParamsJson
                                propIrisFull.push({ [onturis.dc_creator]: namesParamsJson[0] });
                                propIrisFull.push({ [onturis.geo_lat]: namesParamsJson[1] });
                                propIrisFull.push({ [onturis.geo_long]: namesParamsJson[2] });
                                propIrisFull.push({ [onturis.prHasTaxon]: namesParamsJson[3] });

                                // Si es una propiedad del árbol
                                var propAnn = false;
                                params.propIris.push({ [onturis.dc_creator]: namesParamsJson[0] });
                                queryInterface.setQuerys(params, propAnn, arg);

                                // Si es una propiedad de una anotación (estaría bien pasar otro campo que indicase de que tipo es la anotación y así hacer una única llamada a queryInterface.setQuerys(). Mejoras a futuro)
                                propAnn = true;
                                arg.propiritype = onturis.prHasPrimaryPosition;
                                params.propIris.push({ [onturis.geo_lat]: namesParamsJson[1] });
                                params.propIris.push({ [onturis.geo_long]: namesParamsJson[2] });
                                queryInterface.setQuerys(params, propAnn, arg, querys);
                                arg.propiritype = onturis.prHasPrimarySpecies;
                                params.propIris.push({ [onturis.prHasTaxon]: namesParamsJson[3] });
                                queryInterface.setQuerys(params, propAnn, arg, querys);

                                Promise.all(params.querys).then((data) => {
                                    //Resolucion Promise.all
                                    params.querys = [];//Reincio array de querys

                                    //Formateo del resultado
                                    var i = 0;
                                    var j = 0;
                                    //uris árboles 
                                    for (j = 0; j < data.length; j++) {
                                        setTrees = data[j];
                                        parametro = namesParamsJson[j];
                                        Object.keys(setTrees).forEach(tree => {
                                            //console.log(tree)
                                            cache.trees[tree] == undefined ? cache.trees[tree] = {} : cache.trees[tree];
                                            response[tree] == undefined ? response[tree] = {} : response[tree];
                                            cache.trees[tree][parametro] = {};
                                            response[tree][parametro] = {};
                                            cache.trees[tree][parametro] = setTrees[tree][Object.keys(propIrisFull[i])[0]][0].value;
                                            response[tree][parametro] = cache.trees[tree][parametro];
                                            treesNoCache = treesNoCache.filter(e => e !== tree);
                                        })
                                        i = i + 1;
                                    }

                                    finalResp.code = 200;
                                    finalResp.msg = { response, nextPage };
                                    resolve(finalResp);
                                })
                                    .catch((err) => {
                                        console.log("Error en conexión con endpoint ", err);
                                        /*if (err.statusCode != null && err.statusCode != undefined) {
                                            res.status(err.statusCode).send({ message: err });
                                        }
                                        else {
                                            err = err.message;
                                            res.status(500).send(err);
                                        }*/
                                        resolve(errorCodes.conexionVirtuoso);
                                    });
                            }
                            else {
                                finalResp.code = 200;
                                finalResp.msg = { response, nextPage };
                                resolve(finalResp);
                            }
                        }
                    })
                    .catch((err) => {
                        console.log("Error en conexión con endpoint ", err);
                        /*if (err.statusCode != null && err.statusCode != undefined) {
                            res.status(err.statusCode).send({ message: err });
                        }
                        else {
                            err = err.message;
                            res.status(500).send(err);
                        }*/
                        resolve(errorCodes.conexionVirtuoso);
                    });
            }
        }
    })
}

async function getTree(uri) {
    return new Promise((resolve, reject) => {
        let finalResp = {};
        queryInterface.getIndiv(uri, cache.trees).then((data) => {
            if (data == null){
                resolve(errorCodes.treeNotFound);
            }
            else {
                finalResp.code = 200;
                finalResp.msg = data;
                resolve(finalResp);
            }
        }).catch((err) => {
            console.log("Error en conexión con endpoint: ", err);
            resolve(errorCodes.conexionVirtuoso)
        });
    });
}

async function createTree(url_Base_sta, bodyParameters, authorization) {
    return new Promise((resolve, reject) => {
        var creator = bodyParameters.creator;

        if (creator == undefined) {
            resolve(errorCodes.emptyRequiredFields)
        }
        else {
            var idUser = creator.split("user/")[1];
            userController.checkAuth(authorization, idUser).then((auth) => {
                if (auth === httpCodes.authorized) {
                    //console.log("Usuario autenticado");
                    var idTree = helpers.generateId().full_id;
                    var arg = {};
                    var parametersRequired = { creator: "creator", lat: "lat", long: "long" };
                    var parametersOptional = { image: "image", species: "species" };
                    var querys = [];
                    var nameQuery = "";
                    var idsAnnotation = [];
                    var idAnnPosition;
                    var flag = true;

                    if (url_Base_sta.slice(-1) != "/")
                        url_Base_sta += "/";

                    sparqlClient.setDefaultGraph(config.defaultGraph);

                    //Parámetros obligatorios (pdte la fecha)
                    Object.keys(parametersRequired).forEach(parametro => {
                        if (bodyParameters[parametro] != undefined) {
                            if (parametro == parametersRequired.creator)
                                arg[parametersRequired.creator] = bodyParameters[parametersRequired.creator];
                            else
                                arg[parametro] = bodyParameters[parametro];
                        }
                        else {
                            flag = false;
                        }
                    });

                    if (flag) {
                        //console.log("Crear árbol y anotación de posición");

                        //Si hay más de 3 parámetros, entonces incluye opcionales como la especie y/o una imagen
                        if (Object.keys(bodyParameters).length > 3) {
                            //Hay imagen
                            if (parametersOptional.image in bodyParameters) {
                                var imageBlob = bodyParameters[parametersOptional.image];

                                imageController.createImageVirtuoso(arg, imageBlob, idTree, bodyParameters.title, bodyParameters.description, bodyParameters.depicts);

                                idsAnnotation.push(annotationController.createAnnotationVirtuoso(arg, idTree, onturis.imageAnnotation, querys, nameQueries.createAnnotationImage));

                                console.log(idAnnPosition);
                            }
                            //Hay especie
                            if (parametersOptional.species in bodyParameters) {
                                arg[parametersOptional.species] = bodyParameters[parametersOptional.species];
                                nameQuery = nameQueries.createAnnotationSpecies;
                                idsAnnotation.push(annotationController.createAnnotationVirtuoso(arg, idTree, onturis.primarySpecies, querys, nameQuery));
                            }
                        }

                        //Primero creo las anotaciones necesarias para así asociárselas al árbol en la creación
                        nameQuery = nameQueries.createAnnotationPosition;
                        idAnnPosition = annotationController.createAnnotationVirtuoso(arg, idTree, onturis.primaryPosition, querys, nameQuery);
                        idsAnnotation.push(idAnnPosition);
                        Promise.all(querys).then((data) => {
                            var i = 0;
                            data.forEach(ann => {
                                //Compruebo que todas las anotaciones se han creado. Esta comprobación no es muy exhaustiva.
                                if (ann.results.bindings.length > 0) {
                                    //console.log("Anotación " + idsAnnotation[i] + " creada");
                                    //Cachéo la anotación recién creada
                                    cache.putNewCreationInCache(idsAnnotation[i], onturis.annotation, cache.annotations).then((id) => {
                                        //console.log("Anotación " + id + " cacheada");
                                    }).catch((err) => {
                                        console.log("Error cacheando anotación ", err);
                                        /*if (err.statusCode != null && err.statusCode != undefined) {
                                            res.status(err.statusCode).send({ message: err });
                                        }
                                        else {
                                            err = err.message;
                                            res.status(500).send(err);
                                        }*/
                                        resolve(errorCodes.errorCache);
                                    });
                                }
                                else {
                                    console.log("Error en la creación de la anotación " + idsAnnotation[i])
                                    resolve(errorCodes.conexionVirtuoso);

                                    //res.status(500).send({ error: "Error en la creación de la anotación " + idsAnnotation[i] });
                                }
                                i++;
                            })

                            //Creo el árbol y le asocio su anotación primaria de posición
                            arg.annotation = onturis.data + "annotation/" + idAnnPosition;
                            var dateISO = helpers.getDateCreated();
                            arg.date = dateISO;
                            arg.id = idTree;
                            queryInterface.getData(nameQueries.createTree, arg, sparqlClient)
                                .then((data) => {
                                    if (data.results.bindings.length > 0) {
                                        //console.log("Árbol " + idTree + " creado");

                                        querys = [];
                                        arg = {};
                                        arg.id = idTree;

                                        //Si hay más anotaciones se las asocio como un UPDATE una vez creado el árbol
                                        idsAnnotation.forEach((ann) => {
                                            if (ann != idAnnPosition) {
                                                arg.annotation = onturis.data + "annotation/" + ann;
                                                if (ann.split("-")[0] == "s") {
                                                    arg.hasAnnotation = onturis.prHasPrimarySpecies;
                                                }
                                                else if (ann.split("-")[0] == "i") {
                                                    arg.hasAnnotation = onturis.prHasImageAnnotation;
                                                }
                                                querys.push(queryInterface.getData(nameQueries.addAnnotationTree, arg, sparqlClient));
                                            }
                                        });
                                        Promise.all(querys).then((data) => {
                                            // Redirijo al nuevo árbol si ha ido todo bien
                                            //console.log("Árbol actualizado: se han asociado las anotaciones");
                                            resolve(httpCodes.treeCreated);

                                            // Cachear información del árbol
                                            cache.putNewCreationInCache(idTree, onturis.tree, cache.trees).then((id) => {
                                                //console.log("Árbol " + id + " cacheado");
                                            }).catch((err) => {
                                                console.log("Error cacheando árbol");
                                                /*if (err.statusCode != null && err.statusCode != undefined) {
                                                    res.status(err.statusCode).send({ message: err });
                                                }
                                                else {
                                                    err = err.message;
                                                    res.status(500).send(err);
                                                }*/
                                                resolve(errorCodes.errorCache);
                                            });
                                        });
                                    }
                                })
                                .catch((err) => {
                                    console.log("Error en conexión con endpoint", err);
                                    /*if (err.statusCode != null && err.statusCode != undefined) {
                                        res.status(err.statusCode).send({ message: err });
                                    }
                                    else {
                                        err = err.message;
                                        res.status(500).send(err);
                                    }
                                    */
                                    resolve(errorCodes.conexionVirtuoso);
                                });

                        })
                            .catch((err) => {
                                console.log("Error en conexión con endpoint", err);
                                /*if (err.statusCode != null && err.statusCode != undefined) {
                                    res.status(err.statusCode).send({ message: err });
                                }
                                else {
                                    err = err.message;
                                    res.status(500).send(err);
                                }
                                */
                                resolve(errorCodes.conexionVirtuoso);
                            });
                    }
                    else {
                        resolve(errorCodes.emptyRequiredFields)
                    }
                }
                else
                    resolve(auth);
            });
        }
    });
}

module.exports = {
    getTrees,
    getTree,
    createTree,
}
