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
        }
        else {
            data.results.bindings.forEach((element) => {
                if (response[element.sup.value] == undefined) {
                    response[element.sup.value] = { "subclasses": [] };
                }
                response[element.sup.value].subclasses.push(element.sub.value);
            })
            finalResp.code = 200;
            finalResp.msg = response;
            resolve(finalResp);
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
    });
}

module.exports = {
    getTreeParts,
}