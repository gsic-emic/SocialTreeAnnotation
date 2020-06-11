// Fichero para definir mensajes de error que se van a lanzar por el resto de la aplicación

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


}