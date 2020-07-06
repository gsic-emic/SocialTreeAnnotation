#!/bin/bash
############Parametros script################
<<<<<<< HEAD
uriRoot=http://timber.gsic.uva.es
=======
uriRoot=https://timber.gsic.uva.es
>>>>>>> rest_service_nodeJS
lat0=40.4
long0=-5
lat1=42.5
long1=-2
tree=47-0003-A-1-1
treeNoExiste=47-0003-A-1
species=Species23
creator=12345
annotation=p47-0003-A-1-1
annotationNoExiste=p47-0003-A-1-112
userNoExiste=pepito2020
userNoTree=user_19327
echo ------------------------------------- Recurso Raíz ---------------------------------------
<<<<<<< HEAD
curl -X GET  -i $uriRoot/
echo -e "\n------------------------------------------------------------------------------------"

echo ------------------------------------- Recurso Trees ---------------------------------------
curl -X GET  -i $uriRoot/sta/data/tree

echo -e "\n\n##################### Listar árboles en un espacio dado ########################\n"
curl -X GET  -i $uriRoot/sta/data/tree/?lat0=$lat0\&long0=$long0\&lat1=$lat1\&long1=$long1

echo -e "\n\n##################### Listar árboles en un espacio dado - error param ########################\n"
curl -X GET  -i $uriRoot/sta/data/tree/?lat0=$lat0\&long0=$long0\&lat1=$lat1

echo -e "\n\n##################### Listar árboles en un espacio dado - 204 ########################\n"
curl -X GET  -i $uriRoot/sta/data/tree/?lat0=$lat0\&long0=$long0\&lat1=-5\&long1=-5

echo -e "\n\n##################### Listar árboles de una especie ########################\n"
curl -X GET  -i $uriRoot/sta/data/tree/?species=$species

echo -e "\n\n##################### Listar árboles de una especie - error param ########################\n"
curl -X GET  -i $uriRoot/sta/data/tree/?specie=$species

echo -e "\n\n##################### Listar árboles de una especie - 204 ########################\n"
curl -X GET  -i $uriRoot/sta/data/tree/?specie=Genus213

echo -e "\n\n##################### Listar árboles de un usuario ########################\n"
curl -X GET  -i $uriRoot/sta/data/tree/?creator=$creator

echo -e "\n\n##################### Listar árboles de un usuario - usuario no existe ########################\n"
curl -X GET  -i $uriRoot/sta/data/tree/?creator=$userNoExiste

echo -e "\n\n##################### Listar árboles de un usuario - 204 ########################\n"
#usuario sin árboles creados
curl -X GET  -i $uriRoot/sta/data/tree/?creator=$userNoTree
=======
curl -k  -X GET  -i $uriRoot/
echo -e "\n------------------------------------------------------------------------------------"

echo ------------------------------------- Recurso Trees ---------------------------------------
curl -k  -X GET  -i $uriRoot/sta/data/tree

echo -e "\n\n##################### Listar árboles en un espacio dado ########################\n"
curl -k  -X GET  -i $uriRoot/sta/data/tree/?lat0=$lat0\&long0=$long0\&lat1=$lat1\&long1=$long1

echo -e "\n\n##################### Listar árboles en un espacio dado - error param ########################\n"
curl -k  -X GET  -i $uriRoot/sta/data/tree/?lat0=$lat0\&long0=$long0\&lat1=$lat1

echo -e "\n\n##################### Listar árboles en un espacio dado - 204 ########################\n"
curl -k  -X GET  -i $uriRoot/sta/data/tree/?lat0=$lat0\&long0=$long0\&lat1=-5\&long1=-5

echo -e "\n\n##################### Listar árboles de una especie ########################\n"
curl -k  -X GET  -i $uriRoot/sta/data/tree/?species=$species

echo -e "\n\n##################### Listar árboles de una especie - error param ########################\n"
curl -k  -X GET  -i $uriRoot/sta/data/tree/?specie=$species

echo -e "\n\n##################### Listar árboles de una especie - 204 ########################\n"
curl -k  -X GET  -i $uriRoot/sta/data/tree/?species=Genus213

echo -e "\n\n##################### Listar árboles de un usuario ########################\n"
curl -k  -X GET  -i $uriRoot/sta/data/tree/?creator=$creator

echo -e "\n\n##################### Listar árboles de un usuario - usuario no existe ########################\n"
curl -k  -X GET  -i $uriRoot/sta/data/tree/?creator=$userNoExiste

echo -e "\n\n##################### Listar árboles de un usuario - 204 ########################\n"
#usuario sin árboles creados
curl -k  -X GET  -i $uriRoot/sta/data/tree/?creator=$userNoTree
>>>>>>> rest_service_nodeJS

echo -e "\n------------------------------------------------------------------------------------"

echo ------------------------------------- Recurso Tree ---------------------------------------
<<<<<<< HEAD
curl -X GET  -i $uriRoot/sta/data/tree/$tree
echo -e "\n\n##################### Detalle árbol - no existe ########################\n"
curl -X GET  -i $uriRoot/sta/data/tree/$treeNoExiste
echo -e "\n------------------------------------------------------------------------------------\n"

echo ------------------------------------- Recurso Annotations ---------------------------------------
curl -X GET  -i $uriRoot/sta/data/annotation/$annotation
echo -e "\n\n##################### Detalle anotación - no existe ########################\n"
curl -X GET  -i $uriRoot/sta/data/annotation/$annotationNoExiste

echo -e "\n\n##################### Listar anotaciones de un usuario ########################\n"
curl -X GET  -i $uriRoot/sta/data/annotation/?creator=$creator
echo -e "\n\n##################### Listar anotaciones de un usuario - no existe ########################\n"
curl -X GET  -i $uriRoot/sta/data/annotation/?creator=$userNoExiste

echo -e "\n\n##################### Listar anotaciones de un usuario - no tiene ########################\n"
curl -X GET  -i $uriRoot/sta/data/annotation/?creator=$userNoTree
echo -e "\n------------------------------------------------------------------------------------\n"

echo ------------------------------------- Recurso Species ---------------------------------------
curl -X GET  -i $uriRoot/sta/data/species
echo -e "\n------------------------------------------------------------------------------------\n"

echo ------------------------------------- Recurso TreePart ---------------------------------------
curl -X GET  -i $uriRoot/sta/data/treePart
echo -e "\n------------------------------------------------------------------------------------\n"

echo ------------------------------------- Recurso Users ---------------------------------------
curl -X GET  -i $uriRoot/sta/data/user
echo -e "\n------------------------------------------------------------------------------------\n"

echo ------------------------------------- Recurso No Existe ---------------------------------------
curl -X GET  -i $uriRoot/sta/data/flower
curl -X GET  -i $uriRoot/sta/data/trees
echo -e "\n------------------------------------------------------------------------------------"

echo ------------------------------------- Método no permitido ---------------------------------------
curl -X DELETE -i $uriRoot/sta/data/flower
curl -X DELETE -i $uriRoot/sta/data/tree
=======
curl -k  -X GET  -i $uriRoot/sta/data/tree/$tree
echo -e "\n\n##################### Detalle árbol - no existe ########################\n"
curl -k  -X GET  -i $uriRoot/sta/data/tree/$treeNoExiste
echo -e "\n------------------------------------------------------------------------------------\n"

echo ------------------------------------- Recurso Annotations ---------------------------------------
curl -k  -X GET  -i $uriRoot/sta/data/annotation/$annotation
echo -e "\n\n##################### Detalle anotación - no existe ########################\n"
curl -k  -X GET  -i $uriRoot/sta/data/annotation/$annotationNoExiste

echo -e "\n\n##################### Listar anotaciones de un usuario ########################\n"
curl -k  -X GET  -i $uriRoot/sta/data/annotation/?creator=$creator
echo -e "\n\n##################### Listar anotaciones de un usuario - no existe ########################\n"
curl -k  -X GET  -i $uriRoot/sta/data/annotation/?creator=$userNoExiste

echo -e "\n\n##################### Listar anotaciones de un usuario - no tiene ########################\n"
curl -k  -X GET  -i $uriRoot/sta/data/annotation/?creator=$userNoTree
echo -e "\n------------------------------------------------------------------------------------\n"

echo ------------------------------------- Recurso Species ---------------------------------------
curl -k  -X GET  -i $uriRoot/sta/data/species
echo -e "\n------------------------------------------------------------------------------------\n"

echo ------------------------------------- Recurso TreePart ---------------------------------------
curl -k  -X GET  -i $uriRoot/sta/data/treePart
echo -e "\n------------------------------------------------------------------------------------\n"

echo ------------------------------------- Recurso Users ---------------------------------------
curl -k  -X GET  -i $uriRoot/sta/data/user
curl -k  -X GET  -i $uriRoot/sta/data/user/$userNoTree
echo -e "\n------------------------------------------------------------------------------------\n"

echo ------------------------------------- Recurso No Existe ---------------------------------------
curl -k  -X GET  -i $uriRoot/sta/data/flower
curl -k  -X GET  -i $uriRoot/sta/data/trees
echo -e "\n------------------------------------------------------------------------------------"

echo ------------------------------------- Método no permitido ---------------------------------------
curl -k  -X DELETE -i $uriRoot/sta/data/flower
curl -k  -X DELETE -i $uriRoot/sta/data/tree
>>>>>>> rest_service_nodeJS
echo -e "\n------------------------------------------------------------------------------------"

## FALTAN CONSULTAS a PAGE=1 y PAGE=NOTEXIST