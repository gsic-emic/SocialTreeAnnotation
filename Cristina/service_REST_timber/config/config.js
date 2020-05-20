module.exports = {
    port: process.env.PORT || 8888,
    endpoint: process.env.SPARQL_URI || 'http://timber.gsic.uva.es:8890/sparql-auth/',
    //defaultGraph: 'http://timber.gsic.uva.es',
    user: "demo",
    pwd: "d0Niq2VWmI",
    authType: "Basic",
    lenghtId: 5
  }