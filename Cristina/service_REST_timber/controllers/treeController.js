const queryInterface = require('../helpers/queryInterface');
var onturis = require('../config/onturis');
var cache = require('../models/cache');
const helpers = require('../helpers/helpers');
const config = require('../config/config');
const imageController = require('./imageController');

var treesNoCache = [];

/**
 * 
 * @param {*} req 
 * @param {*} res 
 */

function getTrees(req, res) {
    sparqlClient.setDefaultGraph();

    var arg = {};
    let nextPage = undefined;
    var response = {};
    var fullUrl = "";
    var namesParamsJson = [];
    var irisTrees = [];
    var querys = [];
    //var params = [];
    var propIrisFull = [];
    var setTrees = {};
    var parametro;
    var propAnn = false;

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
                                cache.trees[tree] = (cache.trees[tree] == undefined) ? {} : cache.trees[tree];
                                cache.trees[tree].species = data_trees[tree][onturis.prHasTaxon][0].value;
                                if (cache.trees[tree] != undefined) {
                                    response[tree] = (response[tree] == undefined) ? {} : response[tree];
                                    response[tree].species = cache.trees[tree].species;

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
                                cache.trees[tree] = (cache.trees[tree] == undefined) ? {} : cache.trees[tree];
                                cache.trees[tree].creator = data_trees[tree][onturis.dc_creator][0].value;
                                if (cache.trees[tree] != undefined) {
                                    response[tree] = (response[tree] == undefined) ? {} : response[tree];
                                    response[tree].creator = cache.trees[tree].creator;

                                    //console.log("Árbol cacheado, hay que ver si tengo guardados los datos que necesito devolver")
                                    //¿Si tengo un árbol cacheado tendré todos sus datos? Puede que tenga algunos sí y otros no cacheados y tenga que hacer las consultas de los que me faltan... PDTE IMPLEMENTAR
                                    if (cache.trees[tree].creator != undefined && cache.trees[tree].lat != undefined && cache.trees[tree].long != undefined) {
                                        console.log("Arbol " + tree + " cacheado");
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
    sparqlClient.setDefaultGraph();
    var arg = {};
    arg.uri = req.protocol + '://' + req.get('host').split(":")[0] + req.originalUrl;
    var response = {};
    var existe = false;

    if (cache.trees[arg.uri] != undefined && cache.trees[arg.uri][onturis.dc_created] != undefined) {
        response[arg.uri] = (response[arg.uri] == undefined) ? {} : response[arg.uri];
        response[arg.uri] = cache.trees[arg.uri];
        res.status(200).send({ response });
    }
    else {
        //Para crear los campos lat long species como al listar árboles

        /*var querys = [];
        arg.propiri = onturis.geo_lat;
        querys.push(queryInterface.getData("trees_prop_primaryAnnotation", arg, sparqlClient));
        arg.propiri = onturis.geo_long;
        querys.push(queryInterface.getData("trees_prop_primaryAnnotation", arg, sparqlClient));
        arg.propiri = onturis.prHasTaxon;
        querys.push(queryInterface.getData("trees_prop_primaryAnnotation", arg, sparqlClient));*/


        queryInterface.getData("details_allprop", arg, sparqlClient)
            .then((data) => {
                if (data.results.bindings.length == 0) {
                    res.status(404).send({ response: "El árbol no existe" });
                }
                else {
                    //Para crear los campos lat long species como al listar árboles
                    /*Promise.all(querys).then((data1) => {
                        cache.trees[arg.uri] == undefined ? cache.trees[arg.uri] = {} : cache.trees[arg.uri];
                        cache.trees[arg.uri].lat = data1[0][arg.uri][onturis.geo_lat][0].value;
                        cache.trees[arg.uri].long = data1[1][arg.uri][onturis.geo_long][0].value;
                        cache.trees[arg.uri].species = data1[2][arg.uri][onturis.prHasTaxon][0].value;*/
                        
                        cache.trees[arg.uri] == undefined ? cache.trees[arg.uri] = {} : cache.trees[arg.uri];
                        response[arg.uri] = cache.trees[arg.uri];

                        data.results.bindings.forEach(element => {
                            if (cache.trees[arg.uri][element.prop.value] != undefined) //para cachear un objeto que tiene una propiedad repetida- Por ejemplo un árbol con múltiples hasImgeAnnotation
                            {
                                exite = false;
                                if (!Array.isArray(cache.trees[arg.uri][element.prop.value])) {
                                    //No está creado el array
                                    if (Object.is(cache.trees[arg.uri][element.prop.value], element.value)) {
                                        //console.log("existe")
                                        existe = true;
                                    }
                                    if (!existe) {
                                        cache.trees[arg.uri][element.prop.value] = [cache.trees[arg.uri][element.prop.value]];
                                        cache.trees[arg.uri][element.prop.value].push(element.value);
                                    }
                                }
                                else {
                                    // Si ya existe el elemento en el array no lo añado
                                    for (var i = 0; i < cache.trees[arg.uri][element.prop.value].length; i++) {
                                        if (element.value.value == cache.trees[arg.uri][element.prop.value][i].value) {
                                            existe = true;
                                        }
                                    }
                                    if (!existe)
                                        cache.trees[arg.uri][element.prop.value].push(element.value);
                                }
                                response[arg.uri][element.prop.value] = cache.trees[arg.uri][element.prop.value];
                            }
                            else {
                                cache.trees[arg.uri][element.prop.value] = element.value;
                                response[arg.uri][element.prop.value] = cache.trees[arg.uri][element.prop.value];
                            }
                        });
                        res.status(200).send({ response });

                    /*})
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



function createTree(req, res) {
    var idTree = helpers.generateId().full_id;
    var arg = {};
    var parametersRequired = { creator: "creator", lat: "lat", long: "long" };
    var parametersOptional = { image: "image", species: "species" };
    var querys = [];
    var nameQuery = "";
    var idsAnnotation = [];
    var idAnnPosition;
    var flag = true;

    var url_Base_sta = req.protocol + '://' + req.get('host').split(":")[0] + req.originalUrl;
    if (url_Base_sta.slice(-1) != "/")
        url_Base_sta += "/";

    let bodyParameters = req.body;
    //console.log(bodyParameters.depicts)

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
        console.log("Crear árbol y anotación de posición");

        //Si hay más de 3 parámetros, entonces incluye opcionales como la especie y/o una imagen
        if (Object.keys(bodyParameters).length > 3) {
            //Hay imagen
            if (parametersOptional.image in bodyParameters) {
                var imageBlob = bodyParameters[parametersOptional.image];
                var idImage = imageController.uploadImage2SF(idTree, imageBlob);
                arg[parametersOptional.image] = config.uri_images + idImage;
                arg.imageId = onturis.data + "image/" + idImage.split('.')[0];//quito la extensión
                arg.varTriplesImg = "";
                if (bodyParameters.title != undefined) {
                    arg.varTriplesImg = "dc:title \"" + bodyParameters.title + "\";";
                }
                if (bodyParameters.description != undefined) {
                    arg.varTriplesImg += "dc:description \"" + bodyParameters.description + "\";";
                }
                if (bodyParameters.depicts != undefined) {
                    arg.varTriplesImg += "rdf:type <" + bodyParameters.depicts + ">;";
                }



                imageController.setDataImage(idImage, arg).then((exif) => {
                    Object.keys(exif).forEach((prop) => {
                        if (prop != undefined) {
                            arg[prop] = exif[prop];
                        }
                    }
                    )

                    if (arg.width != 0 && arg.width != undefined) {
                        arg.varTriplesImg += "exif:imageWidth " + arg.width + ";";
                    }
                    if (arg.height != 0 && arg.width != undefined) {
                        arg.varTriplesImg += "exif:imageLength " + arg.height + ";";
                    }
                    if (arg.latImg != 0 && arg.width != undefined) {
                        arg.varTriplesImg += "geo:lat " + arg.latImg + ";";
                    }
                    if (arg.longImg != 0 && arg.width != undefined) {
                        arg.varTriplesImg += "geo:long " + arg.longImg + ";";
                    }

                    //Si la imagen no tiene fecha de creación en los metadatos le pongo la actual
                    if (arg.date == undefined) {
                        arg.date = helpers.getDateCreated();
                    }

                    //elimiar arg.varTriplesImg si esta vacio
                    console.log(arg)
                    queryInterface.getData("create_image", arg, sparqlClient)
                        .then((data) => {
                            if (data.results.bindings.length > 0) {
                                console.log("Imagen creada correctamente en Virtuoso")
                                //Falta cachear imágenes
                                //Cachéo la anotación recién creada
                                cache.putNewCreationInCache(idImage.split('.')[0], onturis.image, cache.images).then((id) => {
                                    console.log("Imagen " + id + " cacheada");
                                }).catch((err) => {
                                    console.log("Error cacheando imagen");
                                    if (err.statusCode != null && err.statusCode != undefined) {
                                        res.status(err.statusCode).send({ message: err });
                                    }
                                    else {
                                        err = err.message;
                                        res.status(500).send(err);
                                    }
                                });
                            }
                        }).catch((err) => {
                            console.log("Error creando imagen en virtuoso");
                            if (err.statusCode != null && err.statusCode != undefined) {
                                res.status(err.statusCode).send({ message: err });
                            }
                            else {
                                err = err.message;
                                res.status(500).send(err);
                            }
                        });
                })


                nameQuery = "create_annotation_image";
                idsAnnotation.push(createAnnotation(arg, idTree, onturis.imageAnnotation, querys, nameQuery));
            }
            //Hay especie
            if (parametersOptional.species in bodyParameters) {
                arg[parametersOptional.species] = bodyParameters[parametersOptional.species];
                nameQuery = "create_annotation_species";
                idsAnnotation.push(createAnnotation(arg, idTree, onturis.primarySpecies, querys, nameQuery));
            }
        }

        //Primero creo las anotaciones necesarias para así asociárselas al árbol en la creación
        nameQuery = "create_annotation_position";
        idAnnPosition = createAnnotation(arg, idTree, onturis.primaryPosition, querys, nameQuery);
        idsAnnotation.push(idAnnPosition);
        Promise.all(querys).then((data) => {
            var i = 0;
            data.forEach(ann => {
                //Compruebo que todas las anotaciones se han creado. Esta comprobación no es muy exhaustiva.
                if (ann.results.bindings.length > 0) {
                    console.log("Anotación " + idsAnnotation[i] + " creada");
                    //Cachéo la anotación recién creada
                    cache.putNewCreationInCache(idsAnnotation[i], onturis.annotation, cache.annotations).then((id) => {
                        console.log("Anotación " + id + " cacheada");
                    }).catch((err) => {
                        console.log("Error cacheando anotación");
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
                    res.status(500).send({ error: "Error en la creación de la anotación " + idsAnnotation[i] });
                }
                i++;
            })

            //Creo el árbol y le asocio su anotación primaria de posición
            arg.annotation = onturis.data + "annotation/" + idAnnPosition;
            var dateISO = helpers.getDateCreated();
            arg.date = dateISO;
            arg.id = idTree;
            queryInterface.getData("create_tree", arg, sparqlClient)
                .then((data) => {
                    if (data.results.bindings.length > 0) {
                        console.log("Árbol " + idTree + " creado");

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
                                querys.push(queryInterface.getData("add_annotation_tree", arg, sparqlClient));
                            }
                        });
                        Promise.all(querys).then((data) => {
                            // Redirijo al nuevo árbol si ha ido todo bien
                            console.log("Árbol actualizado: se han asociado las anotaciones");
                            res.status(201).send({ "response": url_Base_sta + idTree });

                            // Cachear información del árbol
                            cache.putNewCreationInCache(idTree, onturis.tree, cache.trees).then((id) => {
                                console.log("Árbol " + id + " cacheado");
                            }).catch((err) => {
                                console.log("Error cacheando árbol");
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
        res.status(400).send({ error: "Faltan campos obligatorios para la creación del árbol" });
    }

}


function deleteTree(req, res) {
    var id = req.params.treeId;
    /*console.log(id)
    sparqlClient.setDefaultGraph(config.defaultGraph);
    queryInterface.getData("test_delete", {}, sparqlClient)
        .then((data) => {
            console.log(data)
            res.send(data)
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
        */
    res.status(200).send({ "response": "Se eliminaría el árbol " + id });
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


function createAnnotation(arg, idTree, type, querys, nameQuery) {
    var dateISO = helpers.getDateCreated();
    arg.date = dateISO;
    arg.type = type;
    var idAnnot = helpers.generateId().id;
    var stringType = "";
    if (type == onturis.imageAnnotation)
        stringType = "i";
    else if (type == onturis.positionAnnotation || type == onturis.primaryPosition || type == onturis.assertedPosition)
        stringType = "p";
    else if (type == onturis.speciesAnnotation || type == onturis.primarySpecies || type == onturis.assertedSpecies)
        stringType = "s";
    else // No se debería dar nunca
        stringType = "a";

    idAnnot = stringType + "-" + idTree + "_" + idAnnot;
    arg.id = idAnnot;
    console.log(arg)

    querys.push(queryInterface.getData(nameQuery, arg, sparqlClient));
    return idAnnot;
}

function getTreeParts(req, res) {
    var nameQuery = "subclasses";
    var arg = {};
    var response = {};
    arg.uri = onturis.treePartPhoto;
    queryInterface.getData(nameQuery, arg, sparqlClient).then((data) => {
        if (data.results.bindings.length == 0) {
            res.status(204);
        }
        else {
            data.results.bindings.forEach((element) => {
                if (response[element.sup.value] == undefined) {
                    response[element.sup.value] = { "subclasses": [] };
                }
                response[element.sup.value].subclasses.push(element.sub.value);
            })
            res.status(200).send({ response })
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

function getTreeVirtuoso(id) {
    sparqlClient.setDefaultGraph();
    var arg = {};
    arg.uri = id;
    var response = {};
    var existe = false;

    return new Promise((resolve, reject) => {
        queryInterface.getData("details_allprop", arg, sparqlClient)
            .then((data) => {
                if (data.results.bindings.length == 0) {
                    resolve(null);
                }
                else {
                    cache.trees[arg.uri] == undefined ? cache.trees[arg.uri] = {} : cache.trees[arg.uri];
                    response[arg.uri] = cache.trees[arg.uri];

                    data.results.bindings.forEach(element => {
                        if (cache.trees[arg.uri][element.prop.value] != undefined) //para cachear un objeto que tiene una propiedad repetida- Por ejemplo un árbol con múltiples hasImgeAnnotation
                        {
                            exite = false;
                            if (!Array.isArray(cache.trees[arg.uri][element.prop.value])) {
                                //No está creado el array
                                if (Object.is(cache.trees[arg.uri][element.prop.value], element.value)) {
                                    //console.log("existe")
                                    existe = true;
                                }
                                if (!existe) {
                                    cache.trees[arg.uri][element.prop.value] = [cache.trees[arg.uri][element.prop.value]];
                                    cache.trees[arg.uri][element.prop.value].push(element.value);
                                }
                            }
                            else {
                                // Si ya existe el elemento en el array no lo añado
                                for (var i = 0; i < cache.trees[arg.uri][element.prop.value].length; i++) {
                                    if (element.value.value == cache.trees[arg.uri][element.prop.value][i].value) {
                                        existe = true;
                                    }
                                }
                                if (!existe)
                                    cache.trees[arg.uri][element.prop.value].push(element.value);
                            }
                        }
                        else {
                            cache.trees[arg.uri][element.prop.value] = element.value;
                        }
                    });
                    resolve(cache.trees[arg.uri]);
                }
            })
            .catch((err) => {
                reject(err.statusCode);
            });
    });

}
module.exports = {
    getTrees,
    getTree,
    createTree,
    deleteTree,
    createAnnotation,
    getTreeParts,
    getTreeVirtuoso
}
