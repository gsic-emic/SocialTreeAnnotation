const _ = require('underscore');
const queryInterface = require('../helpers/queryInterface');
var onturis = require('../config/onturis');
var Mustache = require('mustache');
var cache = require('../models/cache');


var treesNoCache = [];

/**
 * 
 * @param {*} req 
 * @param {*} res 
 */

function getTrees(req, res) {
    var arg = {};
    let nextPage = undefined;
    var response = {};
    var fullUrl = "";
    var namesParamsJson = [];
    var irisTrees = [];
    var querys = [];
    //var params = [];
    var propIrisFull = [];

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
    //Listar todos los árboles del sistema en un área dada por 4 puntos (2 coordenadas) => lat0,long0,lat1,long1
    if (Object.keys(queryParameters).length == 4 || Object.keys(queryParameters).length == 5) {
        //Si alguna de las posiciones está vacía => 400 Bad Request
        if (queryParameters.lat0 == "" || queryParameters.long0 == "" || queryParameters.lat1 == "" || queryParameters.long1 == "") {
            res.status(400).send();
        }
        //Si la query es válida
        else {
            namesParamsJson = ["creator", "species"];
            arg.latsouth = queryParameters.lat0;
            arg.longwest = queryParameters.long0;
            arg.latnorth = queryParameters.lat1;
            arg.longeast = queryParameters.long1;
            fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl.split('&page')[0];

            // Paso 1, siempre se consulta al Virtuoso para obtener las IRIs de los árboles solicitados y sus posiciones primarias. Obtengo la página correspondiente de todos los árboles del sistema
            queryInterface.getData("trees_uris_zone", arg, sparqlClient)
                .then((data_trees) => {
                    // Las keys de data forman un array con todas las IRIs de los árboles
                    irisTrees = Object.keys(data_trees);
                    //console.log(irisTrees);
                    if (irisTrees.length == 0) {
                        res.status(204).send();
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
                                    response[tree] = cache.trees[tree];
                                }
                                //Si le falta algún dato considero que no está cacheado y consulto
                                else {
                                    treesNoCache.push(tree);
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
                            var propAnn = false;
                            params.propIris.push({ [onturis.dc_creator]: namesParamsJson[0] });
                            setQuerys(params, propAnn, arg);

                            // Si es una propiedad de una anotación (estaría bien pasar otro campo que indicase de que tipo es la anotación y así hacer una única llamada a setQuerys(). Mejoras a futuro)
                            propAnn = true;
                            arg.propiritype = onturis.prHasPrimarySpecies;
                            params.propIris.push({ [onturis.prHasTaxon]: namesParamsJson[1] });
                            setQuerys(params, propAnn, arg, querys);

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
                                res.status(200).send({ response, nextPage });
                            })
                                .catch((err) => {
                                    console.log("Error" + err.message);
                                    if (err.statusCode != null && err.statusCode != undefined) {
                                        res.status(err.statusCode).send({ message: err });
                                    }
                                    else {
                                        err = err.message;
                                        res.status(500).send(err);
                                    }
                                });
                        }
                        else {
                            res.status(200).send({ response, nextPage });
                        }

                    }
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
        /*//Compruebo si hay árboles cacheados (pero en esa zona) PDTE!
        if ((Object.keys(trees).length == 0 || Object.keys(trees).length < lengthTotal + 1) && trees.constructor === Object) {
            queryInterface.getData("treesinArea_pos", arg, sparqlClient).then((data) => {
                console.log("Conexión con endpoint OK");
                if (Object.keys(data).length == 0) {
                    console.log("No hay arboles en el área");
                    res.status(204).send();
                }
                else {
                    treesPage = {};

                    //Si hay más páginas las incluyo. Puede fallar si la última página tiene justo 1000 resultados, daría un enlace a la siguiente página y al hacer la consulta devolvería un 500.
                    if (Object.keys(data).length == arg.limit) {
                        nextPage = { "url": `${fullUrl}&page=${Number(queryParameters.page) + 1}` };
                    }
                    Object.keys(data).forEach(tree => {
                        trees[tree] = {};
                        trees[tree].lat = data[tree][onturis.geo_lat][0].value;
                        trees[tree].long = data[tree][onturis.geo_long][0].value;
                        trees[tree].creator = data[tree][onturis.dc_creator][0].value;
                        treesPage[tree] = {};
                        treesPage[tree] = trees[tree];
                    });

                    if (Object.keys(trees).length != 0) {
                        //Formatear las uris de los árboles del sistema para consultar la especie. Puede que haya árboles sin especie (no es un campo obligatorio al crear un árbol)
                        arg.treesArea = "<" + Object.keys(treesPage).toString().replace(/,/g, '> <') + ">";
                        return queryInterface.getData("allTrees_species", arg, sparqlClient);
                    }
                    else {
                        response = treesPage;
                        res.status(200).send({ response, nextPage });
                    }
                }
            }).then((data) => {
                Object.keys(data).forEach(tree => {
                    trees[tree].species = data[tree][onturis.prHasTaxon][0].value;
                    treesPage[tree] = trees[tree];
                });
                response = treesPage;
                res.status(200).send({ response, nextPage });
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
        else {
            //console.log(lengthTotal);
            //console.log(trees);
            // si tengo ese box guardado (ese área) y hay árboles cacheados => PDTE Ver boxes.js crossforest
            console.log("Hay árboles en el área cacheados");

            let keys1page = [];
            let treesArea = [];
            Object.keys(trees).forEach(tree => {
                if (trees[tree].lat >= arg.latsouth && trees[tree].lat <= arg.latnorth && trees[tree].long >= arg.longsouth && trees[tree].long <= arg.longnorth) {
                    treesArea.push(tree);
                }
            });
            keys1page = treesArea.slice(lengthTotal, lengthTotal + arg.limit)
            treesPage = {};
            keys1page.forEach(tree => {
                treesPage[tree] = {};
                treesPage[tree] = trees[tree];
                trees[tree];
            });
            if (Object.keys(treesPage).length == arg.limit) {
                nextPage = { "url": `${fullUrl}&page=${Number(queryParameters.page) + 1}` };
            }
            response = treesPage;
            res.status(200).send({ response, nextPage });
        }*/


    }
    //Listar todos los árboles del sistema o los árboles de una especie o los árboles creados por un usuario
    else {
        //Listar todos los árboles del sistema de una especie
        if (queryParameters.species != undefined) {
            if (queryParameters.species == "") {
                res.status(400).send();
            }
            else {
                namesParamsJson = ["creator", "lat", "long", "species"];
                fullUrl = req.protocol + '://' + req.hostname + req.originalUrl.split('&page')[0];
                arg.uri_specie = onturis.ifn_ontology + queryParameters.species;
                // Paso 1, siempre se consulta al Virutoso para obtener las IRIs de los árboles solicitados. Obtengo la página correspondiente de todos los árboles del sistema
                queryInterface.getData("trees_uris_specie", arg, sparqlClient)
                    .then((data_trees) => {
                        // Las keys de data forman un array con todas las IRIs de los árboles
                        irisTrees = Object.keys(data_trees);
                        if (irisTrees.length == 0) {
                            res.status(204).send();
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
                                        response[tree] = cache.trees[tree];
                                    }
                                    //Si le falta algún dato considero que no está cacheado y consulto
                                    else {
                                        treesNoCache.push(tree);
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
                                var propAnn = false;
                                params.propIris.push({ [onturis.dc_creator]: namesParamsJson[0] });
                                setQuerys(params, propAnn, arg);

                                // Si es una propiedad de una anotación (estaría bien pasar otro campo que indicase de que tipo es la anotación y así hacer una única llamada a setQuerys(). Mejoras a futuro)
                                propAnn = true;
                                arg.propiritype = onturis.prHasPrimaryPosition;
                                params.propIris.push({ [onturis.geo_lat]: namesParamsJson[1] });
                                params.propIris.push({ [onturis.geo_long]: namesParamsJson[2] });
                                setQuerys(params, propAnn, arg, querys);

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
                                    res.status(200).send({ response, nextPage });
                                })
                                    .catch((err) => {
                                        console.log("Error" + err.message);
                                        if (err.statusCode != null && err.statusCode != undefined) {
                                            res.status(err.statusCode).send({ message: err });
                                        }
                                        else {
                                            err = err.message;
                                            res.status(500).send(err);
                                        }
                                    });
                            }
                            else {
                                res.status(200).send({ response, nextPage });
                            }
                        }
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
        }
        //Listar todos los árboles del sistema creados por un usuario
        else if (queryParameters.creator != undefined) {
            if (queryParameters.creator == "") {
                res.status(400).send();
            }
            else {
                namesParamsJson = ["lat", "long", "species"];
                fullUrl = req.protocol + '://' + req.hostname + req.originalUrl.split('&page')[0];
                arg.uri_creator = (queryParameters.creator == "ifn") ? onturis.ifn_ontology : onturis.users + queryParameters.creator;
                // Paso 1, siempre se consulta al Virutoso para obtener las IRIs de los árboles solicitados. Obtengo la página correspondiente de todos los árboles del sistema
                queryInterface.getData("trees_uris_creator", arg, sparqlClient)
                    .then((data_trees) => {
                        // Las keys de data forman un array con todas las IRIs de los árboles
                        irisTrees = Object.keys(data_trees);
                        if (irisTrees.length == 0) {
                            res.status(204).send();
                        }
                        else {
                            //Si hay más páginas las incluyo
                            if (irisTrees.length == arg.limit) {
                                nextPage = { "url": `${fullUrl}&page=${Number(queryParameters.page) + 1}` };
                            }
                            //En el paso 2 se obtienen los datos a devolver (se comprueba si están cacheados y sino se consulta al Virtuoso). En este caso devuelvo la posición, la especie y el creador ¿¿ALGO MÁS??{};

                            //COMPROBAR SI ESTÁN CACHEADOS, PARA CADA ÁRBOL
                            irisTrees.forEach(tree => {
                                if (cache.trees[tree] != undefined) {
                                    //console.log("Árbol cacheado, hay que ver si tengo guardados los datos que necesito devolver")
                                    //¿Si tengo un árbol cacheado tendré todos sus datos? Puede que tenga algunos sí y otros no cacheados y tenga que hacer las consultas de los que me faltan... PDTE IMPLEMENTAR
                                    if (cache.trees[tree].creator != undefined && cache.trees[tree].lat != undefined && cache.trees[tree].long != undefined) {
                                        //console.log("Arbol " + tree + " cacheado");
                                        treesNoCache = treesNoCache.filter(e => e !== tree); //Elimino el árbol del array de árboles no cacheados
                                        response[tree] = cache.trees[tree];
                                    }
                                    //Si le falta algún dato considero que no está cacheado y consulto
                                    else {
                                        treesNoCache.push(tree);
                                    }
                                }
                                else {
                                    //console.log("Árbol " + tree + " no cacheado");
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


                                // Si es una propiedad de una anotación (estaría bien pasar otro campo que indicase de que tipo es la anotación y así hacer una única llamada a setQuerys(). Mejoras a futuro)
                                propAnn = true;
                                arg.propiritype = onturis.prHasPrimaryPosition;
                                params.propIris.push({ [onturis.geo_lat]: namesParamsJson[0] });
                                params.propIris.push({ [onturis.geo_long]: namesParamsJson[1] });
                                setQuerys(params, propAnn, arg, querys);
                                arg.propiritype = onturis.prHasPrimarySpecies;
                                params.propIris.push({ [onturis.prHasTaxon]: namesParamsJson[2] });
                                setQuerys(params, propAnn, arg, querys);

                                /* SIN FUNCIÓN setQuerys(). Funciona
                                arg.propiri = onturis.dc_creator;
                                params.push({ [arg.propiri]: "creator" });
                                querys.push(queryInterface.getData("details", arg, sparqlClient));
                                arg.propiri = onturis.geo_lat;
                                params.push({ [arg.propiri]: "lat" });
                                arg.propiritype = onturis.prHasPrimaryPosition;
                                params.push({ [arg.propiritype]: "propiritype" });
                                querys.push(queryInterface.getData("trees_prop_annotation", arg, sparqlClient));
                                arg.propiri = onturis.geo_long;
                                params.push({ [arg.propiri]: "long" });
                                querys.push(queryInterface.getData("trees_prop_annotation", arg, sparqlClient));
                                */
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
                                    /*treesNoCache.forEach(tree => {
                                        trees[tree] = {};
                                        response[tree] = {};
                                        data.forEach(e => {
                                            //response[tree] = testParam(response, e, tree, params);
                                            trees[tree] = response[tree];
                                        })
                                    });*/

                                    res.status(200).send({ response, nextPage });
                                })
                                    .catch((err) => {
                                        console.log("Error" + err.message);
                                        if (err.statusCode != null && err.statusCode != undefined) {
                                            res.status(err.statusCode).send({ message: err });
                                        }
                                        else {
                                            err = err.message;
                                            res.status(500).send(err);
                                        }
                                    });
                            }
                            else {
                                res.status(200).send({ response, nextPage });
                            }
                        }
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
        }
        //Listar todos los árboles del sistema
        else {
            namesParamsJson = ["creator", "lat", "long", "species"];
            fullUrl = req.protocol + '://' + req.hostname + req.originalUrl.split('?page')[0];

            // Paso 1, siempre se consulta al Virutoso para obtener las IRIs de los árboles solicitados. Obtengo la página correspondiente de todos los árboles del sistema
            queryInterface.getData("trees_uris", arg, sparqlClient)
                .then((data_trees) => {
                    // Las keys de data forman un array con todas las IRIs de los árboles
                    irisTrees = Object.keys(data_trees);
                    if (irisTrees.length == 0) {
                        res.status(204).send();
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
                                //console.log("Árbol cacheado, hay que ver si tengo guardados los datos que necesito devolver")
                                //¿Si tengo un árbol cacheado tendré todos sus datos? Puede que tenga algunos sí y otros no cacheados y tenga que hacer las consultas de los que me faltan... PDTE IMPLEMENTAR
                                if (cache.trees[tree].creator != undefined && cache.trees[tree].lat != undefined && cache.trees[tree].long != undefined) {
                                    //console.log("Arbol " + tree + " cacheado");
                                    treesNoCache = treesNoCache.filter(e => e !== tree); //Elimino el árbol del array de árboles no cacheados
                                    response[tree] = cache.trees[tree];
                                }
                                //Si le falta algún dato considero que no está cacheado y consulto
                                else {
                                    treesNoCache.push(tree);
                                }
                            }
                            else {
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
                            setQuerys(params, propAnn, arg);

                            // Si es una propiedad de una anotación (estaría bien pasar otro campo que indicase de que tipo es la anotación y así hacer una única llamada a setQuerys(). Mejoras a futuro)
                            propAnn = true;
                            arg.propiritype = onturis.prHasPrimaryPosition;
                            params.propIris.push({ [onturis.geo_lat]: namesParamsJson[1] });
                            params.propIris.push({ [onturis.geo_long]: namesParamsJson[2] });
                            setQuerys(params, propAnn, arg, querys);
                            arg.propiritype = onturis.prHasPrimarySpecies;
                            params.propIris.push({ [onturis.prHasTaxon]: namesParamsJson[3] });
                            setQuerys(params, propAnn, arg, querys);

                            /* SIN FUNCIÓN setQuerys(). Funciona
                            arg.propiri = onturis.dc_creator;
                            params.push({ [arg.propiri]: "creator" });
                            querys.push(queryInterface.getData("details", arg, sparqlClient));
                            arg.propiri = onturis.geo_lat;
                            params.push({ [arg.propiri]: "lat" });
                            arg.propiritype = onturis.prHasPrimaryPosition;
                            params.push({ [arg.propiritype]: "propiritype" });
                            querys.push(queryInterface.getData("trees_prop_annotation", arg, sparqlClient));
                            arg.propiri = onturis.geo_long;
                            params.push({ [arg.propiri]: "long" });
                            querys.push(queryInterface.getData("trees_prop_annotation", arg, sparqlClient));
                            */
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
                                /*treesNoCache.forEach(tree => {
                                    trees[tree] = {};
                                    response[tree] = {};
                                    data.forEach(e => {
                                        //response[tree] = testParam(response, e, tree, params);
                                        trees[tree] = response[tree];
                                    })
                                });*/

                                res.status(200).send({ response, nextPage });
                            })
                                .catch((err) => {
                                    console.log("Error" + err.message);
                                    if (err.statusCode != null && err.statusCode != undefined) {
                                        res.status(err.statusCode).send({ message: err });
                                    }
                                    else {
                                        err = err.message;
                                        res.status(500).send(err);
                                    }
                                });
                        }
                        else {
                            res.status(200).send({ response, nextPage });
                        }
                    }
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

            /*  //Si no hay árboles cacheados consulto al SPARQL. Hay 0 ó menos que la cantidad total que corresponde a la página. Es decir si consultamos la página debe haber al menos 9000 árboles cacheados para no tener que consultar al punto SPARQL.
             if ((Object.keys(trees).length == 0 || Object.keys(trees).length < lengthTotal + 1) && trees.constructor === Object) {
                 //sparqlClient.setQueryFormat("application/x-json+ld");
                 //sparqlClient.setQueryGraph("http://timber.gsic.uva.es");
                 queryInterface.getData("allTrees_pos", arg, sparqlClient)
                     .then((data) => {
                         treesPage = {};
     
                         //Si hay más páginas las incluyo. Puede fallar si la última página tiene justo 1000 resultados, daría un enlace a la siguiente página y al hacer la consulta devolvería un 500.
                         if (Object.keys(data).length == arg.limit) {
                             nextPage = { "url": `${fullUrl}?page=${Number(queryParameters.page) + 1}` };
                         }
                         Object.keys(data).forEach(tree => {
                             trees[tree] = {};
                             trees[tree].lat = data[tree][onturis.geo_lat][0].value;
                             trees[tree].long = data[tree][onturis.geo_long][0].value;
                             trees[tree].creator = data[tree][onturis.dc_creator][0].value;
                             treesPage[tree] = {};
                             treesPage[tree] = trees[tree];
                         });
     
                         //Comprobar que si no hay árboles no se haga la 2ºconsulta (por ejemplo si hay 9000 árboles e intentamos acceder a la página 10, estará vacía)
                         if (Object.keys(trees).length != 0) {
                             //Formatear las uris de los árboles del sistema para consultar la especie. Puede que haya árboles sin especie (no es un campo obligatorio al crear un árbol)
                             arg.treesArea = "<" + Object.keys(treesPage).toString().replace(/,/g, '> <') + ">";
                             return queryInterface.getData("allTrees_species", arg, sparqlClient);
                         }
                         else {
                             response = treesPage;
                             res.status(200).send({ response, nextPage });
                         }
                     })
                     .then((data) => {
                         Object.keys(data).forEach(tree => {
                             trees[tree].species = data[tree][onturis.prHasTaxon][0].value;
                             treesPage[tree] = trees[tree];
                         });
                         response = treesPage;
                         res.status(200).send({ response, nextPage });
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
             else {
                 console.log("Hay árboles cacheados");
                 let keys1page = [];
                 keys1page = Object.keys(trees).slice(lengthTotal, lengthTotal + arg.limit)
                 treesPage = {};
                 keys1page.forEach(tree => {
                     treesPage[tree] = {};
                     treesPage[tree] = treess[tree];
                     trees[tree];
                 });
                 if (Object.keys(treesPage).length == arg.limit) {
                     nextPage = { "url": `${fullUrl}?page=${Number(queryParameters.page) + 1}` };
                 }
                 response = treesPage;
                 res.status(200).send({ response, nextPage });
             } */
        }
    }
}

function getTree(req, res) {
    var arg = {};
    arg.uri = "http://timber.gsic.uva.es/sta/data/tree/" + req.params.treeId;
    var response = {};

    queryInterface.getData("details_allprop", arg, sparqlClient)
        .then((data) => {
            var idTree = req.params.treeId;
            cache.trees[idTree] == undefined ? cache.trees[idTree] = {} : cache.trees[idTree];
            response[idTree] ={};

            data.results.bindings.forEach(element => {
                cache.trees[idTree][element.prop.value]=element.value;
                response[idTree][element.prop.value]=cache.trees[idTree][element.prop.value];
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


//NO LA ESTOY USANDO
function testParam(response, e, tree, params) {
    params.forEach(val => {
        if (e[tree] != undefined && e[tree][Object.keys(val)] != undefined) {
            response[tree][[Object.values(val)][0]] = e[tree][Object.keys(val)][0].value;
        }
    })
    return response[tree];
}


function setQuerys(params, propAnn, arg) {
    params.propIris.forEach(property => {
        arg.propiri = Object.keys(property);
        if (propAnn == false) {
            params.querys.push(queryInterface.getData("details", arg, sparqlClient));
        }
        else {
            params.querys.push(queryInterface.getData("trees_prop_annotation", arg, sparqlClient));
        }
    })
    params.propIris = [];
}


module.exports = {
    getTrees,
    getTree
}
