const queryInterface = require('../helpers/queryInterface');
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const errorHandler = require('../handlers/errorHandler');
const nameQueries = require('../config/queries').nameQueries;
const helpers = require('../helpers/helpers');

var config = require('../config/config');
var cache = require('../models/cache');
var bcrypt = require('bcrypt');
const errorCodes = require('../config/errorCodes');
const httpCodes = require('../config/httpCodes');

const onturis = require('../config/onturis');
const { resolve } = require('path');
const { reject } = require('underscore');
/**
 * Usuarios: => foaf:Person
 *  - Nombre => nombre => foaf:firstName
 *  - Apellidos => apellidos => foaf:lastName
 *  - Nick => username o id => foaf:nick
 *  - Email => email => foaf:mbox
 *  - Password => password => NO ALMACENAR EN EL VIRTUOSO, YA QUE NO SE DEBERÍA PODER CONSULTAR
 */
async function getUsers(queryParameters, fullUrl) {
    return new Promise((resolve, reject) => {

        var arg = {};
        let nextPage = undefined;
        var response = {};
        var irisUsers = [];
        var noCache = [];
        var id;
        var finalResp = {};

        arg.offset = 0; //por defecto
        arg.limit = 1000; //por defecto

        if (queryParameters.page != undefined)
            //Obtener número de página si se ha pasado por parámetro en la url. Si la página solicitada no existe (p.e es un número muy grande) devuelve status code 500, SPARQL Request Failed al hacer la consulta
            arg.offset = Number(queryParameters.page) * arg.limit;
        else
            queryParameters.page = 0;

        arg.cluri = onturis.foafPerson;
        queryInterface.getData(nameQueries.individuals, arg, sparqlClient)
            .then((data) => {
                irisUsers = Object.keys(data);

                if (irisUsers.length == 0) {
                    resolve(httpCodes.empty)
                }
                else {
                    //Si hay más páginas las incluyo
                    if (irisUsers.length >= arg.limit) {
                        nextPage = { "url": `${fullUrl}?page=${Number(queryParameters.page) + 1}` };
                    }
                    //COMPROBAR SI ESTÁN CACHEADAS
                    irisUsers.forEach(user => {
                        if (cache.users[user] != undefined) {
                            noCache = noCache.filter(e => e !== user);
                            response[user] = cache.users[user];
                        }
                        else {
                            noCache.push(user);
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
                                    cache.users[id] = cache.users[id] == undefined ? {} : cache.users[id];
                                    response[id] = response[id] == undefined ? {} : response[id];
                                    cache.users[id][element.prop.value] = element.value;
                                    response[id][element.prop.value] = cache.users[id][element.prop.value];
                                    noCache = noCache.filter(e => e !== id);
                                })
                                finalResp.code = 200;
                                finalResp.msg = {response, nextPage};
                                resolve(finalResp)
                            })
                    }
                    else {
                        finalResp.code = 200;
                        finalResp.msg = {response, nextPage};
                        resolve(finalResp)
                    }
                }
            }).catch((err) => {
                console.log("Error en conexión con endpoint");
                /*if (err.statusCode != null && err.statusCode != undefined) {
                    res.status(err.statusCode).send({ message: err });
                }
                else {
                    err = err.message;
                    res.status(500).send(err);
                }*/
                console.log("Error en conexión con endpoint: ", err);
                resolve(errorCodes.conexionVirtuoso)

            });
    });
}

async function getUser(uri) {
    return new Promise((resolve, reject) => {

        var arg = {};
        arg.uri = uri;
        var response = {};
        var finalResp = {};

        if (cache.users[arg.uri] != undefined && cache.users[arg.uri][onturis.dc_created] != undefined) {
            response[arg.uri] = (response[arg.uri] == undefined) ? {} : response[arg.uri];
            response[arg.uri] = cache.users[arg.uri];
            finalResp.code = 200;
            finalResp.msg = response;
            resolve(finalResp);
        }
        else {
            queryInterface.getData(nameQueries.detailsAll, arg, sparqlClient)
                .then((data) => {
                    if (data.results.bindings.length == 0)
                        resolve(errorCodes.userNotFound)
                    else {
                        cache.users[arg.uri] == undefined ? cache.users[arg.uri] = {} : cache.users[arg.uri];
                        response[arg.uri] = {};

                        data.results.bindings.forEach(element => {
                            cache.users[arg.uri][element.prop.value] = element.value;
                            response[arg.uri][element.prop.value] = cache.users[arg.uri][element.prop.value];
                        });
                        finalResp.code = 200;
                        finalResp.msg = response;
                        resolve(finalResp);
                    }

                })
                .catch((err) => {
                    console.log("Error en conexión con endpoint: ", err);
                    resolve(errorCodes.conexionVirtuoso)
                });
        }
    });
}

async function createUpdateUser(idUser, uri_user, bodyParameters, authorization) {
    return new Promise((resolve, reject) => {
        var password = bodyParameters.password;
        checkAuth(authorization, idUser).then((auth) => {
            if (auth === httpCodes.authorized) {
                console.log("Usuario autenticado, actualización de datos");
                //No se implementa
                resolve(errorCodes.notAllowedUpdate)
            }
            else if (auth === errorCodes.badPassword)
                resolve(errorCodes.badPassword);

            else if (auth === errorCodes.badLogin)
                resolve(errorCodes.badLogin);

            else {
                //Creación. Usuario no autenticado
                console.log("Creación de usuario");
                if (password == undefined || bodyParameters.nombre == undefined || bodyParameters.apellidos == undefined || bodyParameters.email == undefined) {
                    resolve(errorCodes.emptyRequiredFields);
                }
                else {
                    //Comprobar que el login no esté siendo usado
                    if (cache.users[uri_user] != undefined)
                        resolve(errorCodes.usedLogin)
                    else {
                        getUserVirtuoso(uri_user).then((user) => {
                            if (user == null) {
                                password = password.toString();
                                bcrypt.hash(password, config.saltRounds).then((hashPass) => {
                                    //Consigo el hash de la contraseña recibida en la autenticación básica para almacenarlo en el fichero de .passwd
                                    var credentials = idUser + ":" + hashPass;
                                    let buf = Buffer.from(credentials + "\r\n", 'utf8');

                                    //Escribo fichero
                                    fs.appendFile(path.resolve(config.filenamePasswd), buf, function (error) {
                                        if (error) {
                                            console.log(error)
                                            throw error;
                                        } else {
                                            console.log('Fichero escrito correctamente');
                                            return true;
                                        }
                                    })
                                }).catch((err) => {
                                    resolve(errorCodes.hashPasswd);
                                    return;
                                })

                                //Creo usuario en virtuoso y en caché
                                var arg = {};
                                arg.uri = uri_user;
                                arg.id = idUser; // es igual al id
                                arg.name = bodyParameters.nombre + " " + bodyParameters.apellidos;
                                arg.email = bodyParameters.email;
                                arg.date = helpers.getDateCreated();
                                sparqlClient.setDefaultGraph(config.defaultGraph);

                                queryInterface.getData(nameQueries.createUser, arg, sparqlClient).then(function () {
                                    return cache.putNewCreationInCache(idUser, onturis.user, cache.users);
                                })//Cachear usuario
                                    .then((id) => {
                                        console.log("Usuario " + id + " cacheado");
                                        let httpcode = httpCodes.userCreated;
                                        httpcode.msg += ": " + id;
                                        resolve(httpcode)
                                    })
                                    .catch((err) => {
                                        if (err.code == errorCodes.badRequest.code) {
                                            let httpcode = httpCodes.badRequest;
                                            httpcode.msg += ": " + "Error creando usuario en Virtuoso";
                                            resolve(httpcode)
                                        }
                                        else {
                                            // Al frontend le da igual este error realmente. Es interno (quizá no debería mandarlo)
                                            let httpcode = httpCodes.internalError;
                                            httpcode.msg += ": " + "Error cacheando usuario";
                                            resolve(httpcode)
                                        }
                                    });
                            }
                            else {
                                resolve(errorCodes.usedLogin)
                            }
                        })
                    }
                }
            }
        });
    });
}

async function getUserVirtuoso(id) {
    sparqlClient.setDefaultGraph();
    var arg = {};
    arg.uri = id;
    var existe = false;

    return new Promise((resolve, reject) => {
        queryInterface.getData("details_allprop", arg, sparqlClient)
            .then((data) => {
                if (data.results.bindings.length == 0) {
                    resolve(null);
                }
                else {
                    cache.users[arg.uri] == undefined ? cache.users[arg.uri] = {} : cache.users[arg.uri];

                    data.results.bindings.forEach(element => {
                        if (cache.users[arg.uri][element.prop.value] != undefined) //para cachear un objeto que tiene una propiedad repetida- Por ejemplo un árbol con múltiples hasImgeAnnotation
                        {
                            exite = false;
                            if (!Array.isArray(cache.users[arg.uri][element.prop.value])) {
                                //No está creado el array
                                if (Object.is(cache.users[arg.uri][element.prop.value], element.value)) {
                                    //console.log("existe")
                                    existe = true;
                                }
                                if (!existe) {
                                    cache.users[arg.uri][element.prop.value] = [cache.users[arg.uri][element.prop.value]];
                                    cache.users[arg.uri][element.prop.value].push(element.value);
                                }
                            }
                            else {
                                // Si ya existe el elemento en el array no lo añado
                                for (var i = 0; i < cache.users[arg.uri][element.prop.value].length; i++) {
                                    if (element.value.value == cache.users[arg.uri][element.prop.value][i].value) {
                                        existe = true;
                                    }
                                }
                                if (!existe)
                                    cache.users[arg.uri][element.prop.value].push(element.value);
                            }
                        }
                        else {
                            cache.users[arg.uri][element.prop.value] = element.value;
                        }
                    });
                    resolve(cache.users[arg.uri]);
                }
            })
            .catch((err) => {
                reject(err.statusCode);
            });
    });
}

async function processLineByLine(login, password) {
    return new Promise((resolve, reject) => {
        const fileStream = fs.createReadStream(path.resolve(config.filenamePasswd));
        var user;
        var exist = false
        const rl = readline.createInterface({
            input: fileStream,
            crlfDelay: Infinity
        });
        rl.on('line', (line) => {
            //for await (const line of rl) {
            user = line.split(":")[0];
            hash = line.split(":")[1];

            if (user == login) {
                //console.log("El usuario con nick " + login + " ya existe en el sistema");
                bcrypt.compare(password, hash, function (err, result) {
                    if (result == true) {
                        resolve(httpCodes.authorized)
                    }
                    else {
                        resolve(errorCodes.badPassword)
                    }
                });
                exist = true;
            }
        });
        //Si no hay ningún usuario coindicente
        rl.on('close', function () {
            if (!exist)
                resolve(errorCodes.badLogin);
        });
    })
}

async function loginUser(login, password) {
    return new Promise((resolve, reject) => {
        if (login != undefined && password != undefined)
            processLineByLine(login, password).then((userValidate) => resolve(userValidate));
        else
            resolve(errorCodes.emptyUserPass);
    });
}

function checkAuth(auth_header, idUser) {
    return new Promise((resolve, reject) => {
        //Comprobar si la petición lleva la Caberecera de autenticación básica de http
        if (auth_header != undefined) {
            // parse login and password from headers
            const b64auth = (auth_header || '').split(' ')[1] || ''
            const [login, password] = Buffer.from(b64auth, 'base64').toString().split(':');

            if (login == idUser)
                //Comprobar que el login coindice con idUser para modificaciones del usuario y el password con el hash almacenado en el fichero .passwd
                processLineByLine(login, password).then((userValidate) => resolve(userValidate))
            else
                //Login de autenticación básica no coincide con el id de la url
                resolve(errorCodes.badLogin)
        }
        else
            resolve(errorCodes.notAuthorized)
    });
}

module.exports = {
    getUsers,
    getUser,
    createUpdateUser,
    processLineByLine,
    loginUser
}