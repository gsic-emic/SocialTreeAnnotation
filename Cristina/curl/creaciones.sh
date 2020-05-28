idTree="http://timber.gsic.uva.es/sta/data/tree/20200528-74c18"
image="/home/ubuntu/SocialTreeAnnotation/Cristina/complementos/icons.png"
creator="http://timber.gsic.uva.es/sta/data/user/12345"
species="http://crossforest.eu/ifn/ontology/Species20"
lat="45.34"
long="-0.32"
depicts="http://timber.gsic.uva.es/sta/ontology/Flower"
title="Foto cactus"
description="Foto de test"
#base64_img="$(base64 $image)"
#data='{"creator": "'$creator'", "lat": "'$lat'", "long":"'$long'", "species":"'$species'", "image":"'$base64_img'"}'
#data_species='{"creator": "'$creator'", "lat": "'$lat'", "long":"'$long'", "species":"'$species'"}'

#echo "$data"
#curl -H "Content-Type: application/json" -d "$data" http://timber.gsic.uva.es/sta/data/tree

#(echo -n '{"id": "'$idTree'", "creator": "'$creator'", "image": "'; base64 "$image"; echo '"}')  | curl -H "Content-Type: application/json" -d @-  http://timber.gsic.uva.es/sta/data/image 
#echo -e "\n"

## Crear árbol completo

(echo -n '{"creator": "'$creator'", "species":"'$species'", "lat": "'$lat'", "long":"'$long'", "depicts":"'$depicts'","title":"'$title'", "description":"'$description'", "image": "'; base64 "$image"; echo '"}')  | curl -H "Content-Type: application/json" -d @-  http://timber.gsic.uva.es/sta/data/tree/

## Crear antoación tipo imagen

image="/home/ubuntu/SocialTreeAnnotation/Cristina/complementos/forest.png"
type="image"
(echo -n '{"creator": "'$creator'", "id":"'$idTree'", "type":"'$type'", "image": "'; base64 "$image"; echo '"}')  | curl -H "Content-Type: application/json" -d @-  http://timber.gsic.uva.es/sta/data/annotation
echo -e "\n"