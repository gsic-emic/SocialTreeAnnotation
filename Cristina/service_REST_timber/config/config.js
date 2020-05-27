module.exports = {
    port: process.env.PORT || 8888,
    endpoint: process.env.SPARQL_URI || 'http://localhost:8890/sparql/',
    defaultGraph: 'http://timber.gsic.uva.es',
    user: "demo",
    pwd: "demo",
    authType: "Basic",
    lenghtId: 5,
    timeClearCache_ms: 24*3600*1000,
    //directorySaveImages: '/home/ubuntu/nginx/html/data/images/',
    directorySaveImages: '/Users/usuario/Desktop/Imagenes Timber',
    uri_images: 'http://timber.gsic.uva.es/data/images/'
  }