const onturis = require('../config/onturis');
const queryInterface = require('../helpers/queryInterface');
const errorCodes = require('../config/errorCodes');
var cacheTEST = require('memory-cache');
var os = require('os');
const config = require('../config/config');

var trees = {};
var annotations = {};
var images = {};
var species = {};
var users = {};

// configure cache middleware. Solo para los GET. Ahora sí se crea un árbol o anotación tarda 30 segundos en actualizar pero el servicio funciona mucho más fluído. Se puede configurar a 5 segundos o un valor razonable para evitar hacer tantas request. Comentar en la reunión. Las especies o las partes del árbol que no van a cambiar se pueden dejar cacheadas 30 minutos por ejemplo ya que es "estático" (a menos por el momento).
let memCache = new cacheTEST.Cache();

var cacheMiddleware = (duration) => {
    return (req, res, next) => {
        let key =  req.originalUrl || req.url
        let cacheContent = memCache.get(key);
        res.setHeader('Content-Type', 'application/json');

        if(cacheContent){
            res.status(cacheContent.code).send( cacheContent.msg );
            return
        }else{
            res.sendResponse = res.send
            res.send = (body) => {
                memCache.put(key,{"code":res.statusCode, "msg":body},duration);
                res.sendResponse(body)
            }
            next()
        }
    }
}

function putNewCreationInCache(id, type, object){
    var arg = {};
    var string_url="";
    var message = "";
    var existe = false;
    if (type == onturis.annotation){
        string_url="annotation";
        message = "La anotación";
    }
    else if (type == onturis.tree){
        string_url="tree";
        message="El árbol";
    }
    else if (type == onturis.image){
        string_url="image";
        message="La imagen";
    }
    else if (type == onturis.user){
        string_url="user";
        message="El usuario";
    }

    arg.uri = onturis.data + string_url + "/"+ id;

    var getInfo = function (resolve,reject){
        queryInterface.getData("details_allprop", arg, sparqlClient)
        .then((data) => {
            if (data.results.bindings.length == 0) {
                //res.status(404).send({ response: message + "no existe" });
                reject(errorCodes.notFound);
            }
            else {
                object[arg.uri] == undefined ? object[arg.uri] = {} : object[arg.uri];

                data.results.bindings.forEach(element => {
                    existe = false;
                    if (type == onturis.tree && [element.prop.value]==onturis.dc_creator ){
                        object[arg.uri].creator = element.value.value;
                    }
                    else if (type == onturis.tree && [element.prop.value]==onturis.geo_lat ){
                        object[arg.uri].lat = element.value;
                    }
                    if (type == onturis.tree && [element.prop.value]==onturis.geo_long ){
                        object[arg.uri].long = element.value;
                    }
                    else{
                        if (object[arg.uri][element.prop.value] != undefined) //para cachear un objeto que tiene una propiedad repetida- Por ejemplo un árbol con múltiples hasImgeAnnotation
                        {
                            if(!Array.isArray(object[arg.uri][element.prop.value]))
                            {
                                //No está creado el array
                                if(object[arg.uri][element.prop.value].value==element.value.value){
                                    existe = true;
                                }
                                if(!existe){
                                    object[arg.uri][element.prop.value] = [object[arg.uri][element.prop.value]];
                                    object[arg.uri][element.prop.value].push(element.value);
                                }                               
                            }
                            else{
                                // Si ya existe el elemento en el array no lo añado
                                for (var i=0; i<object[arg.uri][element.prop.value].length;i++){
                                    if(element.value.value == object[arg.uri][element.prop.value][i].value){
                                        existe = true;
                                    }
                                }
                                if(!existe)
                                     object[arg.uri][element.prop.value].push(element.value);
                            }
                        }
                        else{
                            object[arg.uri][element.prop.value] = element.value;
                        }
                    }
                });
                resolve(arg.uri);
            }
        })
    }
    return new Promise (getInfo);
}

function clearCache() {
    console.log("\n#################################################################################################\n")
    console.log("Limpieza de la caché: \n", Object.keys(trees).length, " árboles" + "\n" , Object.keys(annotations).length, " anotaciones"+ "\n" , Object.keys(images).length, " imágenes" + "\n" , Object.keys(users).length, " usuarios"+ "\n" , Object.keys(species).length, " especies");
    console.log("\n#################################################################################################\n")
    trees = {};
    annotations = {};
    images = {};
    users = {}; 
}

function getFreeMemory(){
    console.log("Free: ", os.freemem()/Math.pow(1024,3), "GB\n","Total: ",os.totalmem()/Math.pow(1024,3), "GB\n")
    //En bytes
    if(os.freemem() <= config.limitFreeMemory*1024*1024){
        clearCache();
    }
}
module.exports = {
    trees,
    annotations,
    images,
    species,
    users,
    putNewCreationInCache,
    getFreeMemory,
    cacheMiddleware
}