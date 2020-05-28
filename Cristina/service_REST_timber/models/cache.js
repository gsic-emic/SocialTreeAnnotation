const onturis = require('../config/onturis');
const queryInterface = require('../helpers/queryInterface');

var trees = {};
var annotations = {};
var users = { "http://timber.gsic.uva.es/sta/data/user/12345":{}};

function putNewCreationInCache(id, type, object){
    var arg = {};
    var string_url="";
    var message = "";
    if (type == onturis.annotation){
        string_url="annotation";
        message = "La anotación";
    }
    else if (type == onturis.tree){
        string_url="tree";
        message="El árbol";
    }

    arg.uri = onturis.data + string_url + "/"+ id;

    var getInfo = function (resolve,reject){
        queryInterface.getData("details_allprop", arg, sparqlClient)
        .then((data) => {
            if (data.results.bindings.length == 0) {
                //res.status(404).send({ response: message + "no existe" });
                reject(arg.uri);
            }
            else {
                object[arg.uri] == undefined ? object[arg.uri] = {} : object[arg.uri];

                data.results.bindings.forEach(element => {
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
                        object[arg.uri][element.prop.value] = element.value;
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
    console.log("Limpieza de la caché: \n", Object.keys(trees).length, " árboles" + "\n" , Object.keys(annotations).length, " anotaciones" );
    console.log("\n#################################################################################################\n")
    trees = {};
    annotations = {};
}
module.exports = {
    trees,
    annotations,
    users,
    putNewCreationInCache,
    clearCache
}