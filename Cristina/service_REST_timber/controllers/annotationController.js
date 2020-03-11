//POSIBLEMENTE LO BORRE Y LO HAGA DESDE TREECONTROLLER

const _ = require('underscore');

function getAnnotations (req, res) {
    /*let queryParam = {};
    queryParam = req.query;
    if (! _.isEmpty(queryParam)){
        console.log(queryParam)
    }*/
    res.status(200).send({ message: `Hola Anotaciones` });
}

module.exports = {
    getAnnotations
}