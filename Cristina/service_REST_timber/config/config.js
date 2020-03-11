module.exports = {
    port: process.env.PORT || 8888,
    endpoint: process.env.SPARQL_URI || 'http://timber.gsic.uva.es:8890/sparql/',
    defaultGraph: 'http://timber.gsic.uva.es'
  }