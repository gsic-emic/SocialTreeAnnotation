const express = require('express');
const queryInterface = require('../helpers/queryInterface');
const userController = require('../controllers/userController');
const treeController = require('../controllers/treeController');
const treePartController = require('../controllers/treePartController');
const annotationController = require('../controllers/annotationController');
const imageController = require('../controllers/imageController');
const speciesController = require('../controllers/speciesController');
const errorHandler = require('../handlers/errorHandler');
const errorCodes = require('./errorCodes');
const cacheMiddleware = require('../models/cache').cacheMiddleware;
const timeClearCache_ms = 30 * 1000;

const api = express.Router();

var urls = {
    root: '/',
    users: '/data/user',
    user: '/data/user/:userId',
    trees: '/data/tree',
    tree: '/data/tree/:treeId',
    treePart: '/data/treePart',
    annotations: '/data/annotation',
    annotation: '/data/annotation/:annotationId',
    images: '/data/image',
    image: '/data/image/:imageId',
    species: '/data/species'
};

/**
 *  Recurso Root
 */
api.get(urls.root, async (req, res) => {
    queryInterface.getData("test", {}, sparqlClient)
        .then(() => {
            res.status(200).send(urls);
        })
        .catch((err) => {
            //Develvo siempre un error 500 de conexión con el virtuoso ya que al frontend le da igual el motivo y escribo en los logs el error original.
            console.log("Error de conexión inicial con el virtuoso: ", err);
            res.status(errorCodes.conexionVirtuoso.code).send({ "response": errorCodes.conexionVirtuoso.msg });
        });
});

// Para el login:
api.post(urls.root, async (req, res) => {
   const response = await userController.loginUser(req.body.idUser, req.body.password)
    return res.status(response.code).send({"response": response.msg});
});

//Usuarios
api.put(urls.user, async (req, res) => {
    let uri_user = req.protocol + '://' + req.get('host').split(":")[0] + req.originalUrl;
    const response = await userController.createUpdateUser(req.params.userId,uri_user, req.body, req.headers.authorization);
    return res.status(response.code).send({"response": response.msg});
});
api.get(urls.user, cacheMiddleware(timeClearCache_ms), async(req, res) =>{
    let uri_user = req.protocol + '://' + req.get('host').split(":")[0] + req.originalUrl;
    const response = await userController.getUser(uri_user);
    return res.status(response.code).send({"response": response.msg});
});
api.get(urls.users, cacheMiddleware(timeClearCache_ms), async(req, res) =>{
    let fullUrl = req.protocol + '://' + req.hostname + req.originalUrl.split('?page')[0];
    const response = await userController.getUsers(req.query,fullUrl);
    return res.status(response.code).send(response.msg);
});


/*api.delete('/users/:userId', auth, userController.deleteUser)*/

//Árboles
api.get(urls.trees, cacheMiddleware(timeClearCache_ms), treeController.getTrees);
api.post(urls.trees, treeController.createTree);
api.get(urls.tree, cacheMiddleware(timeClearCache_ms), treeController.getTree);
//api.delete(urls.tree, treeController.deleteTree);

// Partes de árbol para identificar en la imagen
api.get(urls.treePart, cacheMiddleware(timeClearCache_ms * 1000), treePartController.getTreeParts);


//Anotaciones
api.get(urls.annotations, cacheMiddleware(timeClearCache_ms), annotationController.getAnnotations);
api.get(urls.annotation, cacheMiddleware(timeClearCache_ms), annotationController.getAnnotation);
api.post(urls.annotations, annotationController.createAnnotation);
/* api.post(urls.annotations, annotationController.createAnnotation);
api.put(urls.annotation, annotationController.updateAnnotation);
api.delete(urls.annotation, annotationController.deleteAnnotation);
*/

//Imágenes y partes
//api.post(urls.images, imageController.createImage);
/*
api.get(urls.images, imageController.getImages);
api.post(urls.images, imageController.createImage);*/
api.get(urls.image, cacheMiddleware(timeClearCache_ms * 1000), imageController.getImage);
/*api.put(urls.image, imageController.updateImage);
api.delete(urls.image, imageController.deleteImage);
api.get('/images/:imagesId/parts', imageController.getImageParts);
api.post('/images/:imagesId/parts', imageController.createImagePart);
api.get('/images/:imagesId/parts/:partId', imageController.getImagePart);
api.put('/images/:imagesId/parts/:partId', imageController.updateImagePart);
api.delete('/images/:imagesId/parts/:partId', imageController.deleteImagePart);
 */

//Especies
api.get(urls.species, cacheMiddleware(timeClearCache_ms * 1000), speciesController.getSpecies);

//El resto de métodos no están permitidos:
api.all(urls.root, (req, res) => errorHandler.methodNotAllow(res));
api.all(urls.users, (req, res) => errorHandler.methodNotAllow(res));
api.all(urls.user, (req, res) => errorHandler.methodNotAllow(res));
api.all(urls.trees, (req, res) => errorHandler.methodNotAllow(res));
api.all(urls.tree, (req, res) => errorHandler.methodNotAllow(res));
api.all(urls.treePart, (req, res) => errorHandler.methodNotAllow(res));
api.all(urls.annotations, (req, res) => errorHandler.methodNotAllow(res));
api.all(urls.annotation, (req, res) => errorHandler.methodNotAllow(res));
api.all(urls.images, (req, res) => errorHandler.methodNotAllow(res));
api.all(urls.image, (req, res) => errorHandler.methodNotAllow(res));
api.all(urls.species, (req, res) => errorHandler.methodNotAllow(res));

module.exports = api