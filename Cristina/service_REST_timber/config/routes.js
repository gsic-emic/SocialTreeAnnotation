//'use strict'

const express = require('express');
const queryInterface = require('../helpers/queryInterface');
const userController = require('../controllers/userController');
const treeController = require('../controllers/treeController');
const annotationController = require('../controllers/annotationController');
const imageController = require('../controllers/imageController');

const api = express.Router();

var urls = {
    root: '/',
    users: '/user',
    user: '/user/:userId',
    trees: '/data/tree',
    tree: '/data/tree/:treeId',
    annotations: '/data/annotation',
    annotation: '/data/annotation/:annotationId',
    images: '/data/image',
    image: '/data/image/:imagesId'
};

//Root
api.get(urls.root, (req, res) => {
    queryInterface.getData("test", {}, sparqlClient)
        .then(() => {
            res.status(200).send(urls);
        })
        .catch((err) => {
            console.log("Error en conexión con endpoint");
            console.log(err.statusCode)
            if (err.statusCode != null && err.statusCode != undefined) {
                res.status(err.statusCode).send({ message: err });
            }
            else {
                res.status(500).send({ message: err });
            }
        });
});

//Usuarios
/*api.get('/users', auth, userController.getUsers)
api.get('/users/:userId', userController.getUser)
api.put('/users/:userId', auth, userController.createUpdateUser) //Si existe se actualiza
api.delete('/users/:userId', auth, userController.deleteUser)*/

//Árboles
api.get(urls.trees, treeController.getTrees);
//api.post(urls.trees, treeController.createTree);
api.get(urls.tree, treeController.getTree);
/*api.put(urls.tree, treeController.updateTree);
api.delete(urls.tree, treeController.deleteTree); 
*/

//Anotaciones
api.get(urls.annotations, annotationController.getAnnotations);
/* api.post(urls.annotations, annotationController.createAnnotation);
api.get(urls.annotation, annotationController.getAnnotation);
api.put(urls.annotation, annotationController.updateAnnotation);
api.delete(urls.annotation, annotationController.deleteAnnotation);

//Imágenes y partes
api.get(urls.images, imageController.getImages);
api.post(urls.images, imageController.createImage);
api.get(urls.image, imageController.getImage);
api.put(urls.image, imageController.updateImage);
api.delete(urls.image, imageController.deleteImage);
api.get('/images/:imagesId/parts', imageController.getImageParts);
api.post('/images/:imagesId/parts', imageController.createImagePart);
api.get('/images/:imagesId/parts/:partId', imageController.getImagePart);
api.put('/images/:imagesId/parts/:partId', imageController.updateImagePart);
api.delete('/images/:imagesId/parts/:partId', imageController.deleteImagePart);
 */
module.exports = api