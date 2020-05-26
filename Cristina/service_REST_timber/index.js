const config = require('./config/config');
const {Client}  = require('virtuoso-sparql-client');
const btoa = require('btoa');

function initSPARQL () {
    var sparqlClient = {};
    var auth = config.authType + " " + btoa(config.user + ':' + config.pwd);
    sparqlClient = new Client(config.endpoint, auth);
    sparqlClient.setDefaultFormat("application/json");
    sparqlClient.setDefaultGraph();
    return sparqlClient;
};
module.exports = { initSPARQL }