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

//Root
api.get(urls.root, (req, res) => {
    /*imageController.getExifData("//home/ubuntu/SocialTreeAnnotation/Cristina/complementos/forest.png")
    imageController.getExifData("/home/ubuntu/SocialTreeAnnotation/Cristina/complementos/20200527_134437.jpg")
    */
    queryInterface.getData("test", {}, sparqlClient)
        .then(() => {
            res.status(200).send(urls);
        })
        .catch((err) => {
            console.log(err.statusCode)
            if (err.statusCode != null && err.statusCode != undefined) {
                errorHandler.sendError(res, errorCode.queryVirtuoso);
            }
            else {
                errorHandler.sendError(res, errorCode.conexionVirtuoso);
            }
        });
});

// Para el login:
api.post(urls.root, (req, res) => {
    var login = req.body.idUser;
    var password = req.body.password;

    if(login != undefined && password != undefined){
        userController.processLineByLine(login, password).then((userValidate) => {
            if (userValidate) {
                res.status(200).send('Authorized')
            }
            else {
                res.status(401).send('Unauthorized: Contraseña incorrecta')
            }
        });
    }
    else {
        res.status(401).send('Unauthorized')
    }
});

//Usuarios
api.put(urls.user, userController.createUpdateUser) //Si existe se actualizaría. De momento solo creación
api.get(urls.user, userController.getUser)
api.get(urls.users, userController.getUsers)


/*api.delete('/users/:userId', auth, userController.deleteUser)*/

//Árboles
api.get(urls.trees, treeController.getTrees);
api.post(urls.trees, treeController.createTree);
api.get(urls.tree, treeController.getTree);
//api.delete(urls.tree, treeController.deleteTree);

// Partes de árbol para identificar en la imagen
api.get(urls.treePart, treePartController.getTreeParts);


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