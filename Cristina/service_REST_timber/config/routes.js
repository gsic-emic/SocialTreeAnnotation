//'use strict'

const express = require('express');
const queryInterface = require('../helpers/queryInterface');
const userController = require('../controllers/userController');
const treeController = require('../controllers/treeController');
const annotationController = require('../controllers/annotationController');
const imageController = require('../controllers/imageController');
const speciesController = require('../controllers/speciesController');


const api = express.Router();

var urls = {
    root: '/',
    users: '/data/user',
    user: '/data/user/:userId',
    trees: '/data/tree',
    tree: '/data/tree/:treeId',
    annotations: '/data/annotation',
    annotation: '/data/annotation/:annotationId',
    images: '/data/image',
    image: '/data/image/:imageId',
    species: '/data/species'
};

//Root
api.get(urls.root, (req, res) => {
    /*imageController.getExifData("//home/ubuntu/SocialTreeAnnotation/Cristina/complementos/flor_exif.jpg")
    imageController.getExifData("/home/ubuntu/SocialTreeAnnotation/Cristina/complementos/20200527_134437.jpg")
    */

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
api.post(urls.trees, treeController.createTree);
api.get(urls.tree, treeController.getTree);
api.delete(urls.tree, treeController.deleteTree); 



//Anotaciones
api.get(urls.annotations, annotationController.getAnnotations);
api.get(urls.annotation, annotationController.getAnnotation);
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
api.get(urls.image, imageController.getImage);
/*api.put(urls.image, imageController.updateImage);
api.delete(urls.image, imageController.deleteImage);
api.get('/images/:imagesId/parts', imageController.getImageParts);
api.post('/images/:imagesId/parts', imageController.createImagePart);
api.get('/images/:imagesId/parts/:partId', imageController.getImagePart);
api.put('/images/:imagesId/parts/:partId', imageController.updateImagePart);
api.delete('/images/:imagesId/parts/:partId', imageController.deleteImagePart);
 */

//Especies
api.get(urls.species, speciesController.getSpecies);


module.exports = api