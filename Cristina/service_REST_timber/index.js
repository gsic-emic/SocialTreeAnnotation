const config = require('./config/config');
const {Client}  = require('virtuoso-sparql-client');

function initSPARQL () {
    var sparqlClient = {};
    sparqlClient = new Client(config.endpoint);
    sparqlClient.setDefaultFormat("application/json");
    sparqlClient.setDefaultGraph(config.defaultGraph);
    return sparqlClient;
};
module.exports = { initSPARQL }