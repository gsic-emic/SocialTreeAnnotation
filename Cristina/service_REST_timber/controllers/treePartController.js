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

module.exports = {
    getTreeParts,
}