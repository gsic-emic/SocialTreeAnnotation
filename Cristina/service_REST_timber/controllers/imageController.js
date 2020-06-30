const Buffer = require('buffer').Buffer;
const path = require('path');
const fs = require('fs');
const generateId = require('../helpers/helpers').generateId;
const dirname = require('../config/config').directorySaveImages;
const uri_images = require('../config/config').uri_images;
var ExifImage = require('exif').ExifImage;
const helpers = require('../helpers/helpers');
const queryInterface = require('../helpers/queryInterface');
var cache = require('../models/cache');
const onturis = require('../config/onturis');
const { nameQueries } = require('../config/queries');
const errorCodes = require('../config/errorCodes');
const { reject } = require('underscore');

function getImage(uri, id,) {
  //Devuelve info triplas
  return new Promise((resolve, reject) => {
    let finalResp = {};
    queryInterface.getIndiv(uri, cache.images).then((data) => {
      if (data == null) {
        resolve(errorCodes.annotationNotFound);
      }
      else {
        finalResp.code = 200;
        finalResp.msg = data;
        resolve(finalResp);
      }
    });
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
  fs.writeFile(path.join(dirname, filename), buf, {mode: 0444}, function (error) {
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
function createImage(req, res) {

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

function setDataImage(idImage) {
  return new Promise((resolve, reject) => {
    var image_path = dirname + idImage;
    //console.log(image_path)
    getExifData(image_path).then((exif) => {
      //Aqui va en forma de promise o callbak 
      resolve(exif);
    })
      .catch((err) => {
        reject(err);
      })
  });
}
function getExifData(image_path) {
  var exif_metadata = {};
  return new Promise((resolve, reject) => {
    //try {
    new ExifImage({ image: image_path }, function (error, exifData) {
      if (error) {
        console.log('Error: ' + error.message);//Las imagenes solo pueden ser jpeg para recuperar sus exif data
        //reject("Error en getExifData " + error.message)
      }
      else {
        //console.log(exifData)
        //Esto no rellenar coon 0s, dejar vacío.
        if (exifData.exif != undefined) {
          exif_metadata.width = (exifData.exif.ExifImageWidth != undefined) ? exifData.exif.ExifImageWidth : 0;
          exif_metadata.height = (exifData.exif.ExifImageHeight != undefined) ? exifData.exif.ExifImageHeight : 0;
          exif_metadata.date = (exifData.exif.DateTimeOriginal != undefined) ? exifData.exif.DateTimeOriginal : 0;

          if (exif_metadata.date == 0) {
            exif_metadata = helpers.getDateCreated();
          }
          else {
            var parseDate = exif_metadata.date.split(' ')[0].replace(":", "-");
            var date = parseDate + "T" + exif_metadata.date.split(' ')[1] + "Z";
            parseDate = new Date(parseISOString(date));
            exif_metadata.date = parseDate.toISOString().slice(0, -1);
          }

          exif_metadata.latImg = 0;
          exif_metadata.longImg = 0;

          //Realmente en la ontología de exif hay metadatos de coordenadas gps como las que se recogen de la imagen. No hace falta convertirlas ni usar geo:lat y geo:long (sería mas correcto usar exif directamente ya que son metadatos estándar). De momento lo dejo implementado así, pero estaría bien modificarlo en el futuro.
          if (Object.keys(exifData.gps).length > 0) {
            var coordenadas = [];
            coordenadas = helpers.getCoordinates(exifData.gps);
            exif_metadata.latImg = coordenadas[0];
            exif_metadata.longImg = coordenadas[1];
          }
        }
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

function createImageVirtuoso(arg, imageBlob, idTree, title, description, depicts) {
  return new Promise((resolve, reject) => {


    //const annotationController = require('./annotationController'); // dependencia circular, si se coloca arriba no funciona
    var idImage = uploadImage2SF(idTree, imageBlob);
    arg.image = uri_images + idImage;
    arg.imageId = onturis.data + "image/" + idImage.split('.')[0];//quito la extensión
    arg.varTriplesImg = "";
    if (title != undefined) {
      arg.varTriplesImg = "dc:title \"" + title + "\";";
    }
    if (description != undefined) {
      arg.varTriplesImg += "dc:description \"" + description + "\";";
    }
    if (depicts != undefined) {
      arg.varTriplesImg += "rdf:type <" + depicts + ">;";
    }

    setDataImage(idImage, arg).then((exif) => {
      Object.keys(exif).forEach((prop) => {
        if (prop != undefined)
          arg[prop] = exif[prop];
      });
      if (arg.width != 0 && arg.width != undefined) {
        arg.varTriplesImg += "exif:imageWidth " + arg.width + ";";
      }
      if (arg.height != 0 && arg.width != undefined) {
        arg.varTriplesImg += "exif:imageLength " + arg.height + ";";
      }
      if (arg.latImg != 0 && arg.width != undefined) {
        arg.varTriplesImg += "geo:lat " + arg.latImg + ";";
      }
      if (arg.longImg != 0 && arg.width != undefined) {
        arg.varTriplesImg += "geo:long " + arg.longImg + ";";
      }

      //Si la imagen no tiene fecha de creación en los metadatos le pongo la actual
      if (arg.date == undefined) {
        arg.date = helpers.getDateCreated();
      }

      //elimiar arg.varTriplesImg si esta vacio
      //console.log(arg)
      queryInterface.getData(nameQueries.createImage, arg, sparqlClient)
        .then((data) => {
          if (data.results.bindings.length > 0) {
            //console.log("Imagen creada correctamente en Virtuoso")
            //Falta cachear imágenes
            //Cachéo la anotación recién creada
            cache.putNewCreationInCache(idImage.split('.')[0], onturis.image, cache.images).then((id) => {
              //console.log("Imagen " + id + " cacheada");
              resolve(true);
            }).catch((err) => {
              console.log("Error cacheando imagen ", err);
              /*if (err.statusCode != null && err.statusCode != undefined) {
                  res.status(err.statusCode).send({ message: err });
              }
              else {
                  err = err.message;
                  res.status(500).send(err);
              }*/
              reject(errorCodes.errorCache)
            });
          }
        }).catch((err) => {
          console.log("Error creando imagen en virtuoso ", err);
          /*if (err.statusCode != null && err.statusCode != undefined) {
              res.status(err.statusCode).send({ message: err });
          }
          else {
              err = err.message;
              res.status(500).send(err);
          }*/
          reject(errorCodes.conexionVirtuoso);
        });
    });
  });
}
module.exports = {
  createImage,
  uploadImage2SF,
  setDataImage,
  getImage,
  createImageVirtuoso
  //getExifData
}