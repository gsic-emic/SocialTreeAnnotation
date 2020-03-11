const config = require('./config/config');
const {Client}  = require('virtuoso-sparql-client');

function initSPARQL () {
    var sparqlClient = {};
    sparqlClient = new Client(config.endpoint);
    sparqlClient.setOptions("application/json");
    sparqlClient.setQueryGraph(config.defaultGraph);
    return sparqlClient;
};
module.exports = { initSPARQL }