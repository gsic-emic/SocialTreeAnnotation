# Variables
idTree="http://timber.gsic.uva.es/sta/data/tree/20200601-e9058"
image="/home/ubuntu/SocialTreeAnnotation/Cristina/complementos/icons.png"
creator="http://timber.gsic.uva.es/sta/data/user/cmayo"
species="http://crossforest.eu/ifn/ontology/Species20"
lat="41.34"
long="-2.32"
depicts="http://timber.gsic.uva.es/sta/ontology/Flower"
title="Foto cactus"
description="Foto de test"
idTreeNoexiste="http://timber.gsic.uva.es/sta/data/tree/20200601-e9052"
creatorNoexiste="http://timber.gsic.uva.es/sta/data/user/cmayso"


## Crear árbol completo
echo ------------------------------------- Crear árbol completo ---------------------------------------
(echo -n '{"creator": "'$creator'", "lat": "'$lat'", "long":"'$long'", "species":"'$species'", "depicts":"'$depicts'","title":"'$title'", "description":"'$description'", "image": "'; base64 "$image"; echo '"}')  | curl -H "Content-Type: application/json"  --user cmayo:cmayo -d @-  http://timber.gsic.uva.es/sta/data/tree/
echo -e "\n------------------------------------------------------------------------------------"

echo ------------------------------------- Crear árbol completo - error user---------------------------------------
(echo -n '{"creator": "'$creator'", "lat": "'$lat'", "long":"'$long'", "species":"'$species'", "depicts":"'$depicts'","title":"'$title'", "description":"'$description'", "image": "'; base64 "$image"; echo '"}')  | curl -H "Content-Type: application/json"  --user cmay3o:cmayo -d @-  http://timber.gsic.uva.es/sta/data/tree/
echo -e "\n------------------------------------------------------------------------------------"

echo ------------------------------------- Crear árbol completo - error passwd---------------------------------------
(echo -n '{"creator": "'$creator'", "lat": "'$lat'", "long":"'$long'", "species":"'$species'", "depicts":"'$depicts'","title":"'$title'", "description":"'$description'", "image": "'; base64 "$image"; echo '"}')  | curl -H "Content-Type: application/json"  --user cmayo:cmyo -d @-  http://timber.gsic.uva.es/sta/data/tree/
echo -e "\n------------------------------------------------------------------------------------"

echo ------------------------------------- Crear árbol completo - sin autenticación ---------------------------------------
(echo -n '{"creator": "'$creator'", "lat": "'$lat'", "long":"'$long'", "species":"'$species'", "depicts":"'$depicts'","title":"'$title'", "description":"'$description'", "image": "'; base64 "$image"; echo '"}')  | curl -H "Content-Type: application/json" -d @-  http://timber.gsic.uva.es/sta/data/tree/
echo -e "\n------------------------------------------------------------------------------------"

## Crear anotación tipo imagen
echo ------------------------------------- Crear anotación imagen ---------------------------------------
image="/home/ubuntu/SocialTreeAnnotation/Cristina/complementos/forest.png"
type="image"
(echo -n '{"creator": "'$creator'", "id":"'$idTree'", "type":"'$type'", "image": "'; base64 "$image"; echo '"}')  | curl -v -H "Content-Type: application/json" --user cmayo:cmayo  -d @-  http://timber.gsic.uva.es/sta/data/annotation
echo -e "\n------------------------------------------------------------------------------------"

echo ------------------------------------- Crear anotación - error user ---------------------------------------
(echo -n '{"creator": "'$creator'", "id":"'$idTree'", "type":"'$type'", "image": "'; base64 "$image"; echo '"}')  | curl -v -H "Content-Type: application/json" --user cmeayo:cmayo  -d @-  http://timber.gsic.uva.es/sta/data/annotation
image="/home/ubuntu/SocialTreeAnnotation/Cristina/complementos/forest.png"
echo -e "\n------------------------------------------------------------------------------------"

echo ------------------------------------- Crear anotación - error passwd ---------------------------------------
(echo -n '{"creator": "'$creator'", "id":"'$idTree'", "type":"'$type'", "image": "'; base64 "$image"; echo '"}')  | curl -v -H "Content-Type: application/json" --user cmayo:cmadyo  -d @-  http://timber.gsic.uva.es/sta/data/annotation
image="/home/ubuntu/SocialTreeAnnotation/Cristina/complementos/forest.png"
echo -e "\n------------------------------------------------------------------------------------"

echo ------------------------------------- Crear anotación - sin autenticación ---------------------------------------
(echo -n '{"creator": "'$creator'", "id":"'$idTree'", "type":"'$type'", "image": "'; base64 "$image"; echo '"}')  | curl -v -H "Content-Type: application/json" -d @-  http://timber.gsic.uva.es/sta/data/annotation
echo -e "\n------------------------------------------------------------------------------------"

echo ------------------------------------- Crear anotación - árbol no existe ---------------------------------------
(echo -n '{"creator": "'$creator'", "id":"'$idTreeNoexiste'", "type":"'$type'", "image": "'; base64 "$image"; echo '"}')  | curl -v -H "Content-Type: application/json" -d @-  http://timber.gsic.uva.es/sta/data/annotation
echo -e "\n------------------------------------------------------------------------------------"

echo ------------------------------------- Crear anotación - creador no existe ---------------------------------------
#No debería darse nunca este caso ya que el creador se supone que es el mismo que el usuario autenticado (el front-end debería encargarse de esto). El backend lo podría validar también para asegurarse (como el caso del árbol)
(echo -n '{"creator": "'$creatorNoexiste'", "id":"'$idTree'", "type":"'$type'", "image": "'; base64 "$image"; echo '"}')  | curl -v -H "Content-Type: application/json" -d @-  http://timber.gsic.uva.es/sta/data/annotation
echo -e "\n------------------------------------------------------------------------------------"

## Crear anotación tipo especie
echo ------------------------------------- Crear anotación especie ---------------------------------------
species="http://crossforest.eu/ifn/ontology/Species20"
type="species"
(echo -n '{"creator": "'$creator'", "id":"'$idTree'", "type":"'$type'", "species": "'$species'"}')  | curl -v -H "Content-Type: application/json" --user cmayo:cmayo -d @-  http://timber.gsic.uva.es/sta/data/annotation
echo -e "\n------------------------------------------------------------------------------------"

echo ------------------------------------- Crear anotación - error user ---------------------------------------
(echo -n '{"creator": "'$creator'", "id":"'$idTree'", "type":"'$type'", "species": "'$species'"}')  | curl -v -H "Content-Type: application/json" --user cdmayo:cmayo -d @-  http://timber.gsic.uva.es/sta/data/annotation
echo -e "\n------------------------------------------------------------------------------------"

echo ------------------------------------- Crear anotación - error passwd ---------------------------------------
(echo -n '{"creator": "'$creator'", "id":"'$idTree'", "type":"'$type'", "species": "'$species'"}')  | curl -v -H "Content-Type: application/json" --user cmayo:cmadyo -d @-  http://timber.gsic.uva.es/sta/data/annotation
echo -e "\n------------------------------------------------------------------------------------"

echo ------------------------------------- Crear anotación - sin autenticación ---------------------------------------
(echo -n '{"creator": "'$creator'", "id":"'$idTree'", "type":"'$type'", "species": "'$species'"}')  | curl -v -H "Content-Type: application/json" -d @-  http://timber.gsic.uva.es/sta/data/annotation
echo -e "\n------------------------------------------------------------------------------------"

echo ------------------------------------- Crear anotación - árbol no existe ---------------------------------------
(echo -n '{"creator": "'$creator'", "id":"'$idTreeNoexiste'", "type":"'$type'", "species": "'$species'"}')  | curl -v -H "Content-Type: application/json" --user cmayo:cmayo -d @-  http://timber.gsic.uva.es/sta/data/annotation
echo -e "\n------------------------------------------------------------------------------------"
#No autenticado
(echo -n '{"creator": "'$creator'", "id":"'$idTreeNoexiste'", "type":"'$type'", "species": "'$species'"}')  | curl -v -H "Content-Type: application/json" -d @-  http://timber.gsic.uva.es/sta/data/annotation

echo -e "\n------------------------------------------------------------------------------------"

echo ------------------------------------- Crear anotación - creador no existe ---------------------------------------
(echo -n '{"creator": "'$creatorNoexiste'", "id":"'$idTree'", "type":"'$type'", "species": "'$species'"}')  | curl -v -H "Content-Type: application/json" --user cmayo:cmayo -d @-  http://timber.gsic.uva.es/sta/data/annotation
echo -e "\n------------------------------------------------------------------------------------"



echo ------------------------------------- Crear anotación posición ---------------------------------------
lat=50
long=-0.5
type="position"
(echo -n '{"creator": "'$creator'", "id":"'$idTree'", "type":"'$type'", "lat": '$lat', "long": '$long'}')  | curl -v -H "Content-Type: application/json" --user cmayo:cmayo -d @-  http://timber.gsic.uva.es/sta/data/annotation
echo -e "\n------------------------------------------------------------------------------------"

echo ------------------------------------- Crear anotación - error user ---------------------------------------
(echo -n '{"creator": "'$creator'", "id":"'$idTree'", "type":"'$type'", "lat": '$lat', "long": '$long'}')  | curl -v -H "Content-Type: application/json" --user cmadyo:cmayo -d @-  http://timber.gsic.uva.es/sta/data/annotation
echo -e "\n------------------------------------------------------------------------------------"

echo ------------------------------------- Crear anotación - error passwd ---------------------------------------
(echo -n '{"creator": "'$creator'", "id":"'$idTree'", "type":"'$type'", "lat": '$lat', "long": '$long'}')  | curl -v -H "Content-Type: application/json" --user cmayo:cemayo -d @-  http://timber.gsic.uva.es/sta/data/annotation
echo -e "\n------------------------------------------------------------------------------------"

echo ------------------------------------- Crear anotación - sin autenticación y creador no existe ---------------------------------------
(echo -n '{"creator": "'$creator'", "id":"'$idTree'", "type":"'$type'", "lat": '$lat', "long": '$long'}')  | curl -v -H "Content-Type: application/json"  -d @-  http://timber.gsic.uva.es/sta/data/annotation

(echo -n '{"creator": "'$creatorNoexiste'", "id":"'$idTree'", "type":"'$type'", "lat": '$lat', "long": '$long'}')  | curl -v -H "Content-Type: application/json"  -d @-  http://timber.gsic.uva.es/sta/data/annotation
echo -e "\n------------------------------------------------------------------------------------"

echo ------------------------------------- Crear anotación - árbol no existe ---------------------------------------
(echo -n '{"creator": "'$creator'", "id":"'$idTreeNoexiste'", "type":"'$type'", "lat": '$lat', "long": '$long'}')  | curl -v -H "Content-Type: application/json"  --user cmayo:cmayo -d @-  http://timber.gsic.uva.es/sta/data/annotation
echo -e "\n------------------------------------------------------------------------------------"

echo ------------------------------------- Crear anotación - creador no existe ---------------------------------------
(echo -n '{"creator": "'$creatorNoexiste'", "id":"'$idTreeNoexiste'", "type":"'$type'", "lat": '$lat', "long": '$long'}')  | curl -v -H "Content-Type: application/json"  --user cmayo:cmayo -d @-  http://timber.gsic.uva.es/sta/data/annotation
echo -e "\n------------------------------------------------------------------------------------"

# Crear usuario
idUser="user_""$RANDOM"
nombre="Usuario"
apellidos="Curl"
email="curl_$idUser@gmail.com"
password="pass"

echo ------------------------------------- Crear usuario ---------------------------------------
(echo -n '{"nombre":"'$nombre'", "apellidos":"'$apellidos'", "email":"'$email'", "password": "'$password'"}')  | curl -X PUT -H "Content-Type: application/json" -i http://timber.gsic.uva.es/sta/data/user/$idUser --data @-
echo -e "\n------------------------------------------------------------------------------------"
echo ------------------------------------- Crear usuario - login ya existe ---------------------------------------
(echo -n '{"nombre":"'$nombre'", "apellidos":"'$apellidos'", "email":"'$email'", "password": "'$password'"}')  | curl -X PUT -H "Content-Type: application/json" -i http://timber.gsic.uva.es/sta/data/user/cmayo --data @-
echo -e "\n------------------------------------------------------------------------------------"


echo -e "\n"

## FALTAN PETICIONES CUANDO FALTAN CAMPOS OBLIGATORIOS Y/O OPTATIVOS
