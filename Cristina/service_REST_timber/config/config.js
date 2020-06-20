/**
 * Fichero que contiene la configuración de la aplicación
 */
module.exports = {
  //Puerto NodeJS
  port: process.env.PORT || 8888,
  /**
   * Configuración Virtuoso
   */
  endpoint: process.env.SPARQL_URI || 'http://timber.gsic.uva.es:8890/sparql-auth/',
  defaultGraph: 'http://timber.gsic.uva.es',
  user: "demo",
  //hashVirtuoso: "$2y$10$pre8NudSdkhJpo3MEH7d.O/HSglskSuRlBrbDUdoXOUYPSSUmtt/6", //Generado con Bcrypt y saltRounds=10
  pwd: "d0Niq2VWmI",
  authType: "Basic",
  limit: 1000,
  offset: 0,
  // Longitud de la parte aleatoria identificadores únicos de los elementos que se crean con POST en el sistema
  lenghtId: 5,
  // Tiempo de conservaión de los datos que se cahéan en objetos JS en memoria en ms (por defecto un día)
  timeClearCache_ms: 24 * 3600 * 1000,
  // Directorio del servidor donde se almacenan las imágenes que suben los usuarios
  directorySaveImages: '/home/ubuntu/nginx/html/data/images/',
  // Uri donde se exponen las imágenes a través de un servidor nginx
  uri_images: 'http://timber.gsic.uva.es/data/images/',
  // Fichero que almacena los usuarios y contraseñas de la aplicación
  filenamePasswd: '/home/ubuntu/SocialTreeAnnotation/Cristina/service_REST_timber/models/.passwd',
  // Factor de coste para calcular los hash de las contraseñas
  saltRounds: 10
}