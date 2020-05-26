const Buffer = require('buffer').Buffer;
const path = require('path');
const fs = require('fs');
const generateId = require('../helpers/helpers').generateId;
const dirname = require('../config/config').directorySaveImages;

/* Para crear una anotación de tipo imagen, 1º creo la imagen en el sistema de ficheros, así tengo la uri y posteriormente creo la anotación de tipo imagen en el Virtuoso
*/
function uploadImage2SF(idTree, imageBlob) {
    var id_image = idTree + "-" + generateId().id + ".jpg";
    decode_base64(imageBlob, id_image);
    return id_image;
}


/**
 * @param  {string} base64str
 * @param  {string} filename
 */
function decode_base64(base64str, filename) {
    let buf = Buffer.from(base64str, 'base64');
  
    fs.writeFile(path.join(dirname, filename), buf, function(error) {
      if (error) {
        throw error;
      } else {
        console.log('File created from base64 string!');
        return true;
      }
    });
  }


/**
 * @param  {string} filename
 */
function encode_base64(filename) {
    return new Promise ((resolve, reject) => {
        fs.readFile(path.join(filename), function(error, data) {
            if (error) {
              reject(error);
            } else {
              let buf = Buffer.from(data);
              let base64 = buf.toString('base64');
              // console.log('Base64 ' + filename + ': ' + base64);
              resolve(base64);
            }
          });
    })
 
}

// Me  tiene que mandar Jimena en la petición el id del árbol, creator, image (que es la imagenen base64), type?
function createImageAnnotation(req,res){

    let bodyParameters = req.body;
    var idTree = bodyParameters.id.split("tree/")[1]; // No quiero la uri completa
    var creator = bodyParameters.creator;

    var base64_img = bodyParameters.image;
    var uri_image = req.protocol + '://' + req.hostname + req.originalUrl + uploadImage2SF(idTree, base64_img);


    return uri_image;

    // Esto no es necesario, Jimena me lo daría en base64 directamente.
    /*encode_base64(bodyParameters.image).then((base64_img) => {
        var id_image = uploadImage2SF(idTree, base64_img);
        res.status(200).send(id_image);
    }) */
    
}

//BORRAR
/*function encode_base64(filename) {
  fs.readFile(path.join(__dirname, '/public/', filename), function(error, data) {
    if (error) {
      throw error;
    } else {
      let buf = Buffer.from(data);
      let base64 = buf.toString('base64');
      // console.log('Base64 ' + filename + ': ' + base64);
      return base64;
    }
  });
}*/

module.exports = {
    createImageAnnotation,
    uploadImage2SF
}