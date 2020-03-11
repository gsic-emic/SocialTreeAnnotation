'use strict'

const express = require('express');
const userController = require('../controllers/userController');
const treeController = require('../controllers/treeController');
const annotationController = require('../controllers/annotationController');
const imageController = require('../controllers/imageController');

const api = express.Router();


//Usuarios
/*api.get('/users', auth, userController.getUsers)
api.get('/users/:userId', userController.getUser)
api.put('/users/:userId', auth, userController.createUpdateUser) //Si existe se actualiza
api.delete('/users/:userId', auth, userController.deleteUser)
*/

//Árboles
api.get('/trees', treeController.getTrees);
/*api.post('/trees', treeController.createTree);
api.get('/trees/:treeId', treeController.getTree);
api.put('/trees/:treeId', treeController.updateTree);
api.delete('/trees/:treeId', treeController.deleteTree);
*/

//Anotaciones
api.get('/annotations', annotationController.getAnnotations);
/* api.post('/annotations', annotationController.createAnnotation);
api.get('/annotations/:annotationId', annotationController.getAnnotation);
api.put('/annotations/:annotationId', annotationController.updateAnnotation);
api.delete('/annotations/:annotationId', annotationController.deleteAnnotation);

//Imágenes y partes
api.get('/images', imageController.getImages);
api.post('/images', imageController.createImage);
api.get('/images/:imagesId', imageController.getImage);
api.put('/images/:imagesId', imageController.updateImage);
api.delete('/images/:imagesId', imageController.deleteImage);
api.get('/images/:imagesId/parts', imageController.getImageParts);
api.post('/images/:imagesId/parts', imageController.createImagePart);
api.get('/images/:imagesId/parts/:partId', imageController.getImagePart);
api.put('/images/:imagesId/parts/:partId', imageController.updateImagePart);
api.delete('/images/:imagesId/parts/:partId', imageController.deleteImagePart);
 */
module.exports = api