#!/bin/bash
############Parametros script################
uriRoot=http://timber.gsic.uva.es:8888/api
lat0=40.4
long0=-3
lat1=60.5
long1=-2

echo ------------------------------------- Recurso Raíz ---------------------------------------
curl -X GET  -i $uriRoot/
echo -e "\n------------------------------------------------------------------------------------"

echo ------------------------------------- Recurso Trees ---------------------------------------
curl -X GET  -i $uriRoot/trees

echo -e "\n\n##################### Listar árboles en un espacio dado ########################\n"
curl -X GET  -i $uriRoot/trees?lat0=$lat0\&long0=$long0\&lat1=$lat1\&long1=$long1

echo -e "\n------------------------------------------------------------------------------------"

echo ------------------------------------- Recurso Tree ---------------------------------------
