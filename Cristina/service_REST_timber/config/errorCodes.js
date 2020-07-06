<<<<<<< HEAD
// Fichero para definir mensajes de error que se van a lanzar por el resto de la aplicación

=======
/**
 * Fichero para definir los códigos y mensajes de error que se van a lanzar
 */
>>>>>>> rest_service_nodeJS
module.exports = {
    "notFound": " no encontrado",
    "notAllowed": "no permitido",
    "conexionVirtuoso": {
        "code": 500,
        "msg": "Error de conexión con el Virtuoso"
    },
    "queryVirtuoso": {
        "code": 500,
        "msg": "Consulta SPARQL errónea"
    },
    "badRequest":{
        "code": 400,
        "msg": "Petición errónea"
    },
    "hashPasswd":{
        "code":500,
        "msg": "Error creando hash de la contraseña"
    },
    "internalError":{
        "code": 500,
        "msg":"Error interno"
    },
    "notFound":{
        "code": 404,
        "msg":"No encontrado"
    },
    "treeNoExist":{
        "code": 400,
        "msg":"El árbol no existe"
    },
<<<<<<< HEAD

=======
    "badPassword":{
        "code": 401,
        "msg":"Contraseña incorrecta"
    },
    "emptyUserPass":{
        "code": 401,
        "msg":"Falta usuario y/o contraseña"
    },
    "badLoginPassword":{
        "code": 401,
        "msg":"Login y/o contraseña incorrectos"
    },
    "badLogin":{
        "code": 401,
        "msg":"Login incorrecto"
    },
    "notAuthorized":{
        "code": 401,
        "msg":"Falta cabecera de autenticación"
    },
    "notAllowedUpdate":{
        "code": 405,
        "msg":"No se permite actualizar información de usuario"
    },
    "emptyRequiredFields":{
        "code": 400,
        "msg":"Faltan campos obligatorios"
    },
    "usedLogin":{
        "code": 400,
        "msg":"Login ya usado"
    },
    "userNotFound":{
        "code": 404,
        "msg":"El usuario no existe"
    },
    "treeNotFound":{
        "code": 404,
        "msg":"El árbol no existe"
    },
    "userNoExist":{
        "code": 400,
        "msg":"Es necesario indicar un creador"
    },
    "annotationNotFound":{
        "code": 404,
        "msg":"La anotación no existe"
    },
    "errorCache":{
        "code": 500,
        "msg":"Erro cacheando objeto"
    },
    "errorExif":{
        "code": 400,
        "msg": "Error leyendo exif imagen"

    },
>>>>>>> rest_service_nodeJS

}