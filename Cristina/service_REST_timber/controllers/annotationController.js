const _ = require('underscore');
const queryInterface = require('../helpers/queryInterface');
var cache = require('../models/cache');
const onturis = require('../config/onturis');
const config = require('../config/config');
const imageController = require('./imageController');
const treeController = require('./treeController');

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
                                        cache.annotations[id] = cache.annotations[id] == undefined ? {} : cache.annotations[id];
                                        response[id] = response[id] == undefined ? {} : response[id];
                                        cache.annotations[id][element.prop.value] = element.value;
                                        response[id][element.prop.value] = cache.annotations[id][element.prop.value];
                                        noCache = noCache.filter(e => e !== id);
                                    })
                                    res.status(200).send({ response, nextPage });
                                })
                        }
                        else {
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
function getAnnotation(req, res) {
    var arg = {};
    arg.uri = req.protocol + '://' + req.get('host').split(":")[0] + req.originalUrl;
    var response = {};

    if (cache.annotations[arg.uri] != undefined && cache.annotations[arg.uri][onturis.dc_created] != undefined) {
        response[arg.uri] = (response[arg.uri] == undefined) ? {} : response[arg.uri];
        response[arg.uri] = cache.annotations[arg.uri];
        res.status(200).send({ response });
    }
    else {
        queryInterface.getData("details_allprop", arg, sparqlClient)
            .then((data) => {
                if (data.results.bindings.length == 0) {
                    res.status(404).send({ response: "La anotación no existe" });
                }
                else {
                    var id = req.params.annotationId;
                    cache.annotations[arg.uri] == undefined ? cache.annotations[arg.uri] = {} : cache.annotations[arg.uri];
                    response[arg.uri] = {};

                    data.results.bindings.forEach(element => {
                        cache.annotations[arg.uri][element.prop.value] = element.value;
                        response[arg.uri][element.prop.value] = cache.annotations[arg.uri][element.prop.value];
                    });
                    res.status(200).send({ response });
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

function createAnnotation(req, res) {
    /**
     * Siempre pasar estos 3 paramétros:
     * id => uri del árbol
     * type => tomará uno de estos 3 valores: position, species, image
     * creator => uri del usuario
     * Luego en función del tipo:
     * Si es de tipo posición:
     *  lat
     *  long 
     * Si es de tipo especies: 
     *  species (uri de la especie)
     * Si es de tipo imagen:
     *   image (la imagen en base64)
     *   Optativos: title, description, depicts (bueno este último igual debería ser obligatorio...)
     */

    sparqlClient.setDefaultGraph(config.defaultGraph);

    var bodyParameters = req.body;
    var idTree = bodyParameters.id.split("tree/")[1]; //me quedo el id solo
    var uri_tree = bodyParameters.id;
    var type = bodyParameters.type;
    var creator = bodyParameters.creator;
    var typeEnum = {
        position: "position",
        species: "species",
        image: "image"
    };
    var querys = [];
    var arg = {};
    var nameQuery = "";

    var url_Base_sta = req.protocol + '://' + req.get('host').split(":")[0] + req.originalUrl;
    if (url_Base_sta.slice(-1) != "/")
        url_Base_sta += "/";

    var idAnnot = null;

    //console.log(bodyParameters);

    // Comprobar que estos 3 campos están sino 400 Bad Request
    if (idTree != undefined && type != undefined && creator != undefined) {
        //Habría que comprobar que el árbol y el usuario existen y que el tipo es uno de los definidos (no lo compruebo, ya que habria que ver si está en la caché y sino en  el virtuoso. Líneas futuras)
        //if (cache.trees[idTree] != undefined) {
        //if (cache.users[creator] != undefined) {
        //if (type == typeEnum.position || type == typeEnum.species || type == typeEnum.image) {
        arg.creator = creator;
        switch (type) {
            case typeEnum.position:
                type = onturis.primaryPosition;
                arg.lat = bodyParameters.lat; // Habría que comprobar que las latitudes y longitudes existen
                arg.long = bodyParameters.long;

                //Habría que recuperar la anotación primaria de posición de ese árbol y quitarle la clase primaryPosition
                //Borrar la tripla del árbol hasPrimaryPosition anterior y crear la nueva

                break;
            case typeEnum.species:
                type = onturis.primarySpecies;
                arg.species = bodyParameters.species;//Habría que comprobar que la especie es válida

                //Habría que recuperar la anotación primaria de especie de ese árbol y quitarle la clase primarySpecies
                //Borrar la tripla del árbol hasPrimarySpecies anterior y crear la nueva
                break;
            case typeEnum.image:
                type = onturis.imageAnnotation;
                var imageBlob = bodyParameters.image;
                var idImage = imageController.uploadImage2SF(idTree, imageBlob);
                arg.image = config.uri_images + idImage;
                arg.imageId = onturis.data + "image/" + idImage.split('.')[0];//quito la extensión
                arg.varTriplesImg = "";
                if (bodyParameters.title != undefined) {
                    arg.varTriplesImg = "dc:title \"" + bodyParameters.title + "\";";
                }
                if (bodyParameters.description != undefined) {
                    arg.varTriplesImg += "dc:description \"" + bodyParameters.description + "\";";
                }
                if (bodyParameters.depicts != undefined) {
                    arg.varTriplesImg += "foaf:depicts <" + bodyParameters.depicts + ">;";
                }

                imageController.setDataImage(idImage, arg).then((exif) => {
                    Object.keys(exif).forEach((prop) => {
                        if (prop != undefined) {
                            arg[prop] = exif[prop];
                        }
                    })
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
                    //eliminar arg.varTriplesImg si esta vacio
                    //console.log(arg)
                    queryInterface.getData("create_image", arg, sparqlClient)
                        .then((data) => {
                            if (data.results.bindings.length > 0) {
                                console.log("Imagen creada correctamente en Virtuoso");
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

                break;
        }
        idAnnot = treeController.createAnnotation(arg, idTree, type, querys, nameQuery);

        // Asociar anotación creada al árbol
        arg.annotation = onturis.data + "annotation/" + idAnnot;
        arg.id = idTree; //solo el id no a uri completa... (prefiero cambiar la query y madar la uri completa). Cambiar

        if (idAnnot.split("-")[0] == "p") {
            arg.hasAnnotation = onturis.prHasPrimaryPosition;
        }
        if (idAnnot.split("-")[0] == "s") {
            arg.hasAnnotation = onturis.prHasPrimarySpecies;
        }
        else if (idAnnot.split("-")[0] == "i") {
            arg.hasAnnotation = onturis.prHasImageAnnotation;
        }
        querys.push(queryInterface.getData("add_annotation_tree", arg, sparqlClient));


        Promise.all(querys).then((data) => {
            console.log("Árbol actualizado: se han asociado las anotaciones");
            //console.log(data)

            //Cachear anotaciones
            //Cachéo la anotación recién creada
            cache.putNewCreationInCache(idAnnot, onturis.annotation, cache.annotations).then((id) => {
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

            //Cachear árbol
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
            querys = [];
            res.status(201).send({ "response": url_Base_sta + idAnnot });
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
    /*/else
        res.status(400).send({ "error": "La anotación de tipo " + type + " no existe" });
}
else
    res.status(400).send({ "error": "El usuario " + creator + " no existe" });
}
else
res.status(400).send({ "error": "El árbol " + idTree + " no existe" });
}*/
    else {
        res.status(404).send({ "error": "Faltan campos obligatorios para crear la anotación" });
    }


}


module.exports = {
    getAnnotations,
    getAnnotation,
    createAnnotation
}