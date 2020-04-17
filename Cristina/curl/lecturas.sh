#!/bin/bash
############Parametros script################
uriRoot=http://timber.gsic.uva.es
lat0=40.4
long0=-5
lat1=60.5
long1=-2

echo ------------------------------------- Recurso Raíz ---------------------------------------
curl -X GET  -i $uriRoot/
echo -e "\n------------------------------------------------------------------------------------"

echo ------------------------------------- Recurso Trees ---------------------------------------
curl -X GET  -i $uriRoot/sta/data/tree

echo -e "\n\n##################### Listar árboles en un espacio dado ########################\n"
curl -X GET  -i $uriRoot/sta/data/tree/?lat0=$lat0\&long0=$long0\&lat1=$lat1\&long1=$long1

echo -e "\n------------------------------------------------------------------------------------"

echo ------------------------------------- Recurso Tree ---------------------------------------
curl -X GET  -i $uriRoot/sta/data/tree/47-0003-A-1-1
