const Buffer = require('buffer').Buffer;
const path = require('path');
const fs = require('fs');
const generateId = require('../helpers/helpers').generateId;
const dirname = require('../config/config').directoryImage;

/* Para crear una anotación de tipo imagen, 1º creo la imagen en el sistema de ficheros, así tengo la uri y posteriormente creo la anotación de tipo imagen en el Virtuoso
*/
function uploadImage2SF(req, res) {
    let bodyParameters = req.body;

    var idTree = bodyParameters.id;// Me  tiene que mandar Jimena en la petición el id del árbol
    var id_image = idTree + "-" + generateId().id + ".jpg";

    decode_base64(bodyParameters.image, id_image);

    res.status(200).send(id_image);
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

function createImageAnnotation(req,res){

}




module.exports = {
    createImageAnnotation,
}