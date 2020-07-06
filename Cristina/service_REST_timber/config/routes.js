/**
 * Fichero que contiene la definición de las urls y métodos que se exponen de la API REST y cómo se responden a las peticiones del cliente
 */
const express = require('express');
const queryInterface = require('../helpers/queryInterface');
const userController = require('../controllers/userController');
const treeController = require('../controllers/treeController');
const treePartController = require('../controllers/treePartController');
const annotationController = require('../controllers/annotationController');
const imageController = require('../controllers/imageController');
const speciesController = require('../controllers/speciesController');
const errorCodes = require('./errorCodes');
const { nameQueries } = require('./queries');
const { annotation } = require('./onturis');
const { uri_images } = require('./config');
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
    species: '/data/species',
    images: '/data/image',
    image: '/data/image/:imageId',
    annotations: '/data/annotation',
    annotation: '/data/annotation/:annotationId'
};

/**
 *  Recurso Root
 */
api.get(urls.root, async (req, res) => {
    queryInterface.getData(nameQueries.test, {}, sparqlClient)
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
    return res.status(response.code).send({ "response": response.msg });
});

/**
 * Recurso Usuarios
 */
api.get(urls.users, cacheMiddleware(timeClearCache_ms), async (req, res) => {
    let fullUrl = req.protocol + '://' + req.hostname + req.originalUrl.split('?page')[0];
    const response = await userController.getUsers(req.query, fullUrl);
    if (response.code >= 400)
        return res.status(response.code).send({ "response": response.msg });
    else
        return res.status(response.code).send(response.msg);
});
/**
 * Recurso Usuario
 */
api.get(urls.user, cacheMiddleware(timeClearCache_ms), async (req, res) => {
    let uri_user = req.protocol + '://' + req.hostname + req.originalUrl;
    const response = await userController.getUser(uri_user);
    return res.status(response.code).send({ "response": response.msg });
});
api.put(urls.user, async (req, res) => {
    let uri_user = req.protocol + '://' + req.hostname + req.originalUrl;
    // No implementada modificación
    const response = await userController.createUpdateUser(req.params.userId, uri_user, req.body, req.headers.authorization);
    return res.status(response.code).send({ "response": response.msg });
});
//api.delete('/users/:userId', auth, userController.deleteUser); //No implementado

/**
 * Recurso Árboles
 */
api.get(urls.trees, cacheMiddleware(timeClearCache_ms), async (req, res) => {
    let fullUrl = req.protocol + '://' + req.hostname + req.originalUrl;
    const response = await treeController.getTrees(req.query, fullUrl);
    if (response.code >= 400)
        return res.status(response.code).send({ "response": response.msg });
    else
        return res.status(response.code).send(response.msg);
});
api.post(urls.trees, async (req, res) => {
    let uri_trees = req.protocol + '://' + req.hostname + req.originalUrl;
    const response = await treeController.createTree(uri_trees, req.body, req.headers.authorization);
    return res.status(response.code).send({ "response": response.msg });
});
/**
 * Recurso Árbol
 */
api.get(urls.tree, cacheMiddleware(timeClearCache_ms), async (req, res) => {
    let uri_tree = req.protocol + '://' + req.hostname + req.originalUrl;
    const response = await treeController.getTree(uri_tree);
    return res.status(response.code).send({ "response": response.msg });
});
//api.put(urls.tree, treeController.updateTree); // No implementado
//api.delete(urls.tree, treeController.deleteTree); // No implementado

/**
 * Recurso Partes del árbol
 */
api.get(urls.treePart, cacheMiddleware(timeClearCache_ms * 1000), async (req, res) => {
    const response = await treePartController.getTreeParts();
    return res.status(response.code).send({ "response": response.msg });
});

/**
 * Recurso Anotaciones
 */
api.get(urls.annotations, cacheMiddleware(timeClearCache_ms), async (req, res) => {
    let fullUrl = req.protocol + '://' + req.hostname + req.originalUrl;
    const response = await annotationController.getAnnotations(req.query, fullUrl);
    if (response.code >= 400)
        return res.status(response.code).send({ "response": response.msg });
    else
        return res.status(response.code).send(response.msg);
});
api.post(urls.annotations, async (req, res) => {
    let uri_annots = req.protocol + '://' + req.hostname + req.originalUrl;
    const response = await annotationController.createAnnotation(uri_annots, req.body, req.headers.authorization);
    return res.status(response.code).send({ "response": response.msg });
});
/**
 * Recurso Anotación
 */
api.get(urls.annotation, cacheMiddleware(timeClearCache_ms), async (req, res) => {
    let uri_ann = req.protocol + '://' + req.hostname + req.originalUrl;
    const response = await annotationController.getAnnotation(uri_ann);
    return res.status(response.code).send({ "response": response.msg });
});
/*api.put(urls.annotation, annotationController.updateAnnotation);
api.delete(urls.annotation, annotationController.deleteAnnotation);
*/

/**
 * Recurso Imagen
 */
//No uso cache middleware porque no es compatible con distintos formatos
api.get(urls.image, async (req, res) => {
    let uri_img = req.protocol + '://' + req.hostname + req.originalUrl;
    res.format({
        'application/json': async function () {
            const response = await imageController.getImage(uri_img, req.params.imageId, req.headers.accept);
            return res.status(response.code).send({ "response": response.msg });
        },
        'image/jpeg': function () {
            res.redirect(uri_images + req.params.imageId + ".jpg");
        },
        default: function () {
            // log the request and respond with 406
            res.status(406).send('Not Acceptable')
        }
    });
});

/**
 * Recurso Especies
 */
api.get(urls.species, cacheMiddleware(timeClearCache_ms * 1000), async (req, res) => {
    let fullUrl = req.protocol + '://' + req.hostname + req.originalUrl;
    const response = await speciesController.getSpecies(fullUrl);
    if (response.code >= 400)
        return res.status(response.code).send({ "response": response.msg });
    else
        return res.status(response.code).send(response.msg);
});

//El resto de métodos no están permitidos:
api.all(urls.root, (req, res) => res.status(405).send());
api.all(urls.users, (req, res) => res.status(405).send());
api.all(urls.user, (req, res) => res.status(405).send());
api.all(urls.trees, (req, res) => res.status(405).send());
api.all(urls.tree, (req, res) => res.status(405).send());
api.all(urls.treePart, (req, res) => res.status(405).send());
api.all(urls.annotations, (req, res) => res.status(405).send());
api.all(urls.annotation, (req, res) => res.status(405).send());
api.all(urls.images, (req, res) => res.status(405).send());
api.all(urls.image, (req, res) => res.status(405).send());
api.all(urls.species, (req, res) => res.status(405).send());

module.exports = api