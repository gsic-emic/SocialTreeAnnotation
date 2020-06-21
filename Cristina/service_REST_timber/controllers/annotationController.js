const queryInterface = require('../helpers/queryInterface');
var cache = require('../models/cache');
const onturis = require('../config/onturis');
const config = require('../config/config');
const imageController = require('./imageController');
const userController = require('./userController');
const nameQueries = require('../config/queries').nameQueries;
const errorCodes = require('../config/errorCodes');
const helpers = require('../helpers/helpers');
const httpCodes = require('../config/httpCodes');

async function getAnnotations(queryParameters, fullUrl) {
    return new Promise((resolve, reject) => {
        var arg = {};
        let nextPage = undefined;
        var response = {};
        var irisAnnotations = [];
        var noCache = [];
        var id;
        let finalResp = {};

        arg.offset = config.offset; //por defecto
        arg.limit = config.limit; //por defecto

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
                resolve(errorCodes.userNoExist);
            }
            else {
                arg.uri_creator = (queryParameters.creator == "ifn") ? onturis.ifn_ontology : onturis.user + queryParameters.creator;

                queryInterface.getData(nameQueries.annotationsUrisCreator, arg, sparqlClient)
                    .then((data) => {
                        irisAnnotations = Object.keys(data);
                        if (irisAnnotations.length == 0) {
                            resolve(httpCodes.empty);
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
                                queryInterface.getData(nameQueries.detailsAll, arg, sparqlClient)
                                    .then((data) => {
                                        data.results.bindings.forEach(element => {
                                            id = element.iri.value;
                                            cache.annotations[id] = cache.annotations[id] == undefined ? {} : cache.annotations[id];
                                            response[id] = response[id] == undefined ? {} : response[id];
                                            cache.annotations[id][element.prop.value] = element.value;
                                            response[id][element.prop.value] = cache.annotations[id][element.prop.value];
                                            noCache = noCache.filter(e => e !== id);
                                        })
                                        finalResp.code = 200;
                                        finalResp.msg = { response, nextPage };
                                        resolve(finalResp);
                                    }).catch((err) => {
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
                    }).catch((err) => {
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
        else{
            resolve(errorCodes.badRequest);
        }
    });
}
async function getAnnotation(uri) {
    return new Promise((resolve, reject) => {
        let finalResp = {};
        queryInterface.getIndiv(uri, cache.annotations).then((data) => {
            if (data == null) {
                resolve(errorCodes.annotationNotFound);
            }
            else {
                finalResp.code = 200;
                finalResp.msg = data;
                resolve(finalResp);
            }
        }).catch((err) => {
            console.log("Error en conexión con endpoint ", err);
            resolve(errorCodes.conexionVirtuoso);
        });
    });
}

function createAnnotation(url_Base_sta, bodyParameters, authorization) {
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
                    sparqlClient.setDefaultGraph(config.defaultGraph);
                    var idTree = bodyParameters.id.split("tree/")[1]; //me quedo el id solo
                    var uri_tree = bodyParameters.id;
                    var type = bodyParameters.type;
                    var typeEnum = {
                        position: "position",
                        species: "species",
                        image: "image"
                    };
                    var validate = false;

                    if (url_Base_sta.slice(-1) != "/")
                        url_Base_sta += "/";

                    if (idTree == undefined)
                        resolve(errorCodes.treeNoExist)

                    else {
                        // Comprobar que estos 3 campos están sino 400 Bad Request
                        if (uri_tree != undefined && type != undefined && creator != undefined) {
                            //Habría que comprobar que el árbol y el usuario existen y que el tipo es uno de los definidos (no lo compruebo, ya que habria que ver si está en la caché y sino en  el virtuoso. Líneas futuras)

                            var promiseCheckData = new Promise((resolve, reject) => {
                                //Comprobar si el árbol está cacheado y sino consulto al virtuoso.
                                if (cache.trees[uri_tree] != undefined) {
                                    //console.log("Árbol " + idTree + " cacheado");
                                    //Habría que comprobar que el usuario existe (ánalogo al árbol)
                                    //console.log("Comprobar si el usuario existe");
                                    validate = true;
                                    resolve(validate);
                                }
                                else {
                                    queryInterface.getIndiv(uri_tree, cache.trees).then((data) => {
                                        if (data == null) {
                                            resolve(errorCodes.treeNoExist);
                                        }
                                        else {
                                            //Árbol existe
                                            //console.log("El árbol existe");
                                            //Habría que comprobar que el usuario existe (ánalogo al árbol)
                                            //console.log("Comprobar si el usuario existe");
                                            validate = true;
                                            resolve(validate);
                                        }
                                    }).catch((err) => {
                                        console.log("Error recuperando árbol del virtuoso",err)
                                        resolve(errorCodes.conexionVirtuoso);
                                    })
                                }
                            });

                            promiseCheckData.then((validate) => {
                                if (validate==true) {
                                    //Compruebo el tipo
                                    if (Object.values(typeEnum).includes(type)) {
                                        return createAnn(bodyParameters, typeEnum, cache.trees[uri_tree]);
                                    }
                                }
                                else{
                                    resolve(validate);
                                }
                            }).then((response) => {
                                resolve(response);
                            }).catch((err) => {
                                console.log("Error creando anotación ", err)
                                //errorHandler.sendError(res, err)
                                resolve(errorCodes.conexionVirtuoso);
                            })
                        }
                        else
                            resolve(errorCodes.emptyRequiredFields);
                    }
                }
                else
                    resolve(auth);
            });
        }
    });
}

function createAnn(bodyParameters, typeEnum, tree) {
    sparqlClient.setDefaultGraph(config.defaultGraph);

    var querys = [];
    var querysFirst = [];
    var arg = {};
    var nameQuery = "";
    var idTree = bodyParameters.id.split("tree/")[1]; //me quedo el id solo
    var type = bodyParameters.type;
    var creator = bodyParameters.creator;
    //if (cache.trees[idTree] != undefined) {
    //if (cache.users[creator] != undefined) {
    //if (type == typeEnum.position || type == typeEnum.species || type == typeEnum.image) {

    arg.creator = creator;
    return new Promise((resolve, reject) => {
        switch (type) {
            case typeEnum.position:
                type = onturis.primaryPosition;
                arg.lat = bodyParameters.lat; // Habría que comprobar que las latitudes y longitudes existen
                arg.long = bodyParameters.long;

                //Habría que recuperar la anotación primaria de posición de ese árbol y quitarle la clase primaryPosition
                //Borrar la tripla del árbol hasPrimaryPosition anterior y crear la nueva

                arg.idTree = bodyParameters.id;
                arg.hasPrimary = onturis.prHasPrimaryPosition;
                arg.hasAnnot = onturis.prHasPositionAnnotation;
                arg.type = onturis.positionAnnotation;
                arg.typePrimary = onturis.primaryPosition;

                querysFirst.push(queryInterface.getData(nameQueries.updatePrimaryAnnotation, arg, sparqlClient));
                nameQuery = nameQueries.createAnnotationPosition;
                //Actualizar caché
                tree.lat = arg.lat;
                tree.long = arg.long;
                delete tree[onturis.prHasPrimaryPosition]; //Borrar la antigua

                break;
            case typeEnum.species:
                type = onturis.primarySpecies;
                arg.species = bodyParameters.species;//Habría que comprobar que la especie es válida

                //Habría que recuperar la anotación primaria de especie de ese árbol y quitarle la clase primarySpecies
                //Borrar la tripla del árbol hasPrimarySpecies anterior y crear la nueva

                if (tree[onturis.prHasPrimarySpecies] != undefined || tree.species != undefined) {
                    //console.log("Tiene especie primaria");

                    //Recuperar la anotación (oldSpecieAnn): tree hasPrimarySpecies oldSpecieAnn
                    //Eliminar la tripla tree sta:hasPrimarySpecies oldSpecieAnn
                    //Cambiar el tipo oldSpecieAnn a SpeciesAnnotation 
                    //Crear nueva anotación de especie de tipo primario (newSpecieAnn)
                    //Añadir tripla tree sta:hasPrimarySpecies newSpecieAnn
                    //Modificar tree.species a newSpecie

                    arg.idTree = bodyParameters.id;
                    arg.hasPrimary = onturis.prHasPrimarySpecies;
                    arg.hasAnnot = onturis.prHasSpeciesAnnotation;
                    arg.type = onturis.speciesAnnotation;
                    arg.typePrimary = onturis.primarySpecies;

                    querysFirst.push(queryInterface.getData(nameQueries.updatePrimaryAnnotation, arg, sparqlClient));
                    nameQuery = nameQueries.createAnnotationSpecies;

                    //Actualizar caché
                    tree.species = arg.species;
                    delete tree[onturis.prHasPrimarySpecies]; //Borrar la antigua

                }
                else {
                    //console.log("No tiene especie");
                    nameQuery = nameQueries.createAnnotationSpecies;
                }

                break;
            case typeEnum.image:
                //console.log("Tipo imagen")
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
                    arg.varTriplesImg += "rdf:type <" + bodyParameters.depicts + ">;";
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
                    queryInterface.getData(nameQueries.createImage, arg, sparqlClient)
                        .then((data) => {
                            if (data.results.bindings.length > 0) {
                                //console.log("Imagen creada correctamente en Virtuoso");
                                cache.putNewCreationInCache(idImage.split('.')[0], onturis.image, cache.images).then((id) => {
                                    //console.log("Imagen " + id + " cacheada");
                                }).catch((err) => {
                                    console.log("Error cacheando imagen");
                                    reject(errorCodes.errorCache);
                                });
                            }
                        }).catch((err) => {
                            console.log("Error creando imagen en virtuoso", err);
                            reject(errorCodes.internalError);
                        });
                }).catch((err) => {
                    console.log("Error leyendo exif imagen, no se puede continuar ", err);
                    reject(errorCodes.errorExif);
                });

                nameQuery = nameQueries.createAnnotationImage;

                break;
        }

        Promise.all(querysFirst).then((data) => {
            idAnnot = createAnnotationVirtuoso(arg, idTree, type, querys, nameQuery);

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
            querys.push(queryInterface.getData(nameQueries.addAnnotationTree, arg, sparqlClient));


            Promise.all(querys).then((data) => {
                //console.log("Árbol actualizado: se han asociado las anotaciones");
                //console.log(data)

                //Cachear anotaciones
                //Cachéo la anotación recién creada
                cache.putNewCreationInCache(idAnnot, onturis.annotation, cache.annotations).then((id) => {
                    //console.log("Anotación " + id + " cacheada");
                }).catch((err) => {
                    reject(errorCodes.errorCache);
                });

                //Cachear árbol
                // Cachear información del árbol
                cache.putNewCreationInCache(idTree, onturis.tree, cache.trees).then((id) => {
                    //console.log("Árbol " + id + " cacheado");
                }).catch((err) => {
                    console.log("Error cacheando árbol", err);
                    reject(errorCodes.errorCache);
                });
                querys = [];
                resolve(httpCodes.annotCreated);
            }).catch((err) => {
                console.log("Error en conexión con endpoint", err);
                /*err.statusCode = 400;
                err.statusMessage += ": Error asociando anotaciones al árbol";*/
                reject(errorCodes.conexionVirtuoso);
            });
        })
    }).catch((err) => {
        console.log("Error en conexión con endpoint", err);
        /*err.statusCode = 400;
            err.statusMessage += ": Error en querysFirst";*/
        reject(errorCodes.conexionVirtuoso);
    });
}

function createAnnotationVirtuoso(arg, idTree, type, querys, nameQuery) {
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
    //console.log(arg)

    querys.push(queryInterface.getData(nameQuery, arg, sparqlClient));
    return idAnnot;
}

//Podría hacerse una función para validar que los datos son correctos antes de crear la anotación ya que ahora mismo se puede crear una anotación de un árbol que no existe.
/*
function validateData(params) {
    var validate = false;

    Object.keys(params).forEach((parametro) => {
        switch (parametro) {
            case "idTree":
                //mirar cache y sino virtuoso si existe

                break;
            case "creator":
                //mirar cache y sino virtuoso si existe

                break;
            case "type":
                //mirar si es uno de los tipos 

                break;
        }
    })

    return validate;
}
*/

module.exports = {
    getAnnotations,
    getAnnotation,
    createAnnotation,
    createAnnotationVirtuoso
}