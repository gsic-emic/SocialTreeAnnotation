<<<<<<< HEAD
'use strict'
const onturis = require('../config/onturis');
const queryInterface = require('../helpers/queryInterface');

async function getTreeParts(req, res) {
    var nameQuery = "subclasses";
    var arg = {};
    var response = {};
    arg.uri = onturis.treePartPhoto;
    queryInterface.getData(nameQuery, arg, sparqlClient).then((data) => {
        if (data.results.bindings.length == 0) {
            res.status(204);
=======
const onturis = require('../config/onturis');
const queryInterface = require('../helpers/queryInterface');
const { nameQueries } = require('../config/queries');
const httpCodes = require('../config/httpCodes');
const errorCodes = require('../config/errorCodes');

async function getTreeParts() {
    return new Promise((resolve, reject) => {
    var arg = {};
    var response = {};
    arg.uri = onturis.treePartPhoto;
    var finalResp = {};

    queryInterface.getData(nameQueries.subclasses, arg, sparqlClient).then((data) => {
        if (data.results.bindings.length == 0) {
            resolve(httpCodes.empty);
>>>>>>> rest_service_nodeJS
        }
        else {
            data.results.bindings.forEach((element) => {
                if (response[element.sup.value] == undefined) {
                    response[element.sup.value] = { "subclasses": [] };
                }
                response[element.sup.value].subclasses.push(element.sub.value);
            })
<<<<<<< HEAD
            res.status(200).send({ response })
        }
    })
        .catch((err) => {
            console.log("Error en conexión con endpoint");
            if (err.statusCode != null && err.statusCode != undefined) {
=======
            finalResp.code = 200;
            finalResp.msg = response;
            resolve(finalResp);
        }
    })
        .catch((err) => {
            console.log("Error en conexión con endpoint ", err);
            /*if (err.statusCode != null && err.statusCode != undefined) {
>>>>>>> rest_service_nodeJS
                res.status(err.statusCode).send({ message: err });
            }
            else {
                err = err.message;
                res.status(500).send(err);
<<<<<<< HEAD
            }
        });

=======
            }*/
            resolve(errorCodes.conexionVirtuoso);
        });
    });
>>>>>>> rest_service_nodeJS
}

module.exports = {
    getTreeParts,
}