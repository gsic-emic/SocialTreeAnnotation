const Buffer = require('buffer').Buffer;
const path = require('path');
const fs = require('fs');
const generateId = require('../helpers/helpers').generateId;
const dirname = require('../config/config').directorySaveImages;
const uri_images = require('../config/config').uri_images;
var ExifImage = require('exif').ExifImage;
const helpers = require('../helpers/helpers')
const queryInterface = require('../helpers/queryInterface');



function getImage(req, res) {
  var arg = {};
  var id = req.params.imageId;
  arg.uri = req.protocol + '://' + req.get('host').split(":")[0] + req.originalUrl;

  console.log(arg)
  var response = {};

  queryInterface.getData("details_allprop", arg, sparqlClient)
    .then((data) => {
      if (data.results.bindings.length == 0) {
        res.status(404).send({ response: "La imagen no existe" });
      }
      else {
        response[arg.uri] = {};
        data.results.bindings.forEach(element => {
          response[arg.uri][element.prop.value] = element.value;
        });
        res.status(200).send({ response });
      }

    })
    .catch((err) => {
      console.log("Error en conexión con endpoint");
      if (err.statusCode != null && err.statusCode != undefined) {
        res.status(err.statusCode).send({ message: err });
      }
      else {
        err = err.message;
        res.status(500).send(err);
      }
    });
}

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
  fs.writeFile(path.join(dirname, filename), buf, function (error) {
    if (error) {
      throw error;
    } else {
      console.log('Imagen base64 decodificada correctamente');
      return true;
    }
  });
}


/**
 * @param  {string} filename
 */
function encode_base64(filename) {
  return new Promise((resolve, reject) => {
    fs.readFile(path.join(filename), function (error, data) {
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
function createImageAnnotation(req, res) {

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

function setDataImage(idImage, arg) {
  return new Promise((resolve, reject) => {
    var image_path = dirname + idImage;
    console.log(image_path)
    getExifData(image_path).then((exif) => {
      //Aqui va en forma de promise o callbak 
      resolve(exif);
    })
  });
}
function getExifData(image_path) {
  var exif_metadata = {};
  return new Promise((resolve, reject) => {
    //try {
    new ExifImage({ image: image_path }, function (error, exifData) {
      if (error)
        console.log('Error: ' + error.message);
      else
        //console.log(exifData)
        //Esto no rellenar coon 0s, dejar vacío.
        exif_metadata.width = (exifData.exif.ExifImageWidth != undefined) ? exifData.exif.ExifImageWidth : 0;
      exif_metadata.height = (exifData.exif.ExifImageHeight != undefined) ? exifData.exif.ExifImageHeight : 0;
      exif_metadata.date = (exifData.exif.DateTimeOriginal != undefined) ? exifData.exif.DateTimeOriginal : 0;
      var parseDate = exif_metadata.date.split(' ')[0].replace(":", "-");
      var date = parseDate + "T" + exif_metadata.date.split(' ')[1] + "Z";
      parseDate = new Date(parseISOString(date));
      exif_metadata.date = parseDate.toISOString().slice(0, -1);
      exif_metadata.latImg = 0;
      exif_metadata.longImg = 0;

      //Realmente en la ontología de exif hay metadatos de coordenadas gps como las que se recogen de la imagen. No hace falta convertirlas ni usar geo:lat y geo:long (sería mas correcto usar exif directamente ya que son metadatos estándar). De momento lo dejo implementado así, pero estaría bien modificarlo en el futuro.
      if (Object.keys(exifData.gps).length > 0) {
        var coordenadas = [];
        coordenadas = helpers.getCoordinates(exifData.gps);
        exif_metadata.latImg = coordenadas[0];
        exif_metadata.longImg = coordenadas[1];
      }
      resolve(exif_metadata);


      /** Parámetros interesantes de los metadatos de una imagen. Las coordenadas gps habría que convertirlas a decimal
       * image.ImageWidth
       * image.ImageHeight
       * image.ModifyDate
       * exif.DateTimeOriginal
       * exif.ExifImageWidth
       * ExifImageHeight
       * gps.GPSLatitudeRef: 'N'
       * gps.GPSLatitude: [ 41, 38, 11 ]
       * gps.GPSLongitudeRef: 'W'
       * gps.GPSLongitude: [ 4, 43, 20 ] 
       * */

      /*});
    } catch (error) {
      console.log('Error: ' + error.message);
    }*/
    });
  });
}

function parseISOString(s) {
  var b = s.split(/\D+/);
  return new Date(Date.UTC(b[0], --b[1], b[2], b[3], b[4], b[5], b[6]));
}
module.exports = {
  createImageAnnotation,
  uploadImage2SF,
  setDataImage,
  getImage
}