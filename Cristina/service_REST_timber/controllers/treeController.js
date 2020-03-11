const _ = require('underscore');
/**
 * 
 * @param {*} req 
 * @param {*} res 
 */
function getTrees(req, res){
    let queryParameters = {};

    queryParameters = req.query;

    //Si hay query, leer los parámetros. 
    if (! _.isEmpty(queryParameters)) {
        // Para recuperar los árboles en un área se necesitan 4 puntos (2 coordenadas) => lat0,long0,lat1,long1 
        if (Object.keys(queryParameters).length == 4){
            let coordenadas = [];
            Object.entries(queryParameters).forEach(
                ([, value]) => coordenadas.push(value));
            console.log(coordenadas);
        }
        //Se haría un SELECT al SPARQL para todos los árboles en el sistema con lat0 <= lat <= lat1 && long0 <= long <= long1

    }
    res.status(200).send({ message: "Árboles" });


}


module.exports = {
    getTrees
}
