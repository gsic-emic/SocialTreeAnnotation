module.exports = {
    port: process.env.PORT || 8888,
    endpoint: process.env.SPARQL_URI || 'http://timber.gsic.uva.es:8890/sparql-auth/',
    defaultGraph: 'http://timber.gsic.uva.es',
    user: "demo",
    pwd: "d0Niq2VWmI",
    authType: "Basic",
    lenghtId: 5,
    timeClearCache_ms: 24*3600*1000,
    directorySaveImages: '/home/ubuntu/nginx/html/data/images/',
    uri_images: 'http://timber.gsic.uva.es/data/images/'
  }