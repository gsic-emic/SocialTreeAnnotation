#!/bin/bash
############Parametros script################
uriRoot=http://timber.gsic.uva.es
lat0=40.4
long0=-5
lat1=42.5
long1=-2
tree=47-0003-A-1-1
species=Species23
creator=12345
annotation=p47-0003-A-1-1

echo ------------------------------------- Recurso Raíz ---------------------------------------
curl -X GET  -i $uriRoot/
echo -e "\n------------------------------------------------------------------------------------"

echo ------------------------------------- Recurso Trees ---------------------------------------
curl -X GET  -i $uriRoot/sta/data/tree

echo -e "\n\n##################### Listar árboles en un espacio dado ########################\n"
curl -X GET  -i $uriRoot/sta/data/tree/?lat0=$lat0\&long0=$long0\&lat1=$lat1\&long1=$long1

echo -e "\n\n##################### Listar árboles de una especie ########################\n"
curl -X GET  -i $uriRoot/sta/data/tree/?species=$species

echo -e "\n\n##################### Listar árboles de un usuario ########################\n"
curl -X GET  -i $uriRoot/sta/data/tree/?creator=$creator

echo -e "\n------------------------------------------------------------------------------------"

echo ------------------------------------- Recurso Tree ---------------------------------------
curl -X GET  -i $uriRoot/sta/data/tree/$tree

echo -e "\n------------------------------------------------------------------------------------\n"

echo ------------------------------------- Recurso Annotations ---------------------------------------
curl -X GET  -i $uriRoot/sta/data/annotation/$annotation

echo -e "\n\n##################### Listar anotaciones de un usuario ########################\n"

curl -X GET  -i $uriRoot/sta/data/annotation/?creator=$creator

echo -e "\n------------------------------------------------------------------------------------\n"