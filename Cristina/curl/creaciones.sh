idTree="http://timber.gsic.uva.es/sta/data/tree/20200524-9e297"
image="/home/ubuntu/SocialTreeAnnotation/Cristina/complementos/tronco.jpg"
creator="http://http://timber.gsic.uva.es/sta/data/user/12345"
species="http://crossforest.eu/ifn/ontology/Species20"
lat="45.34"
long="-0.32"

#base64_img="$(base64 $image)"
#data='{"creator": "'$creator'", "lat": "'$lat'", "long":"'$long'", "species":"'$species'", "image":"'$base64_img'"}'
#data_species='{"creator": "'$creator'", "lat": "'$lat'", "long":"'$long'", "species":"'$species'"}'

#echo "$data"
#curl -H "Content-Type: application/json" -d "$data" http://timber.gsic.uva.es/sta/data/tree

#(echo -n '{"id": "'$idTree'", "creator": "'$creator'", "image": "'; base64 "$image"; echo '"}')  | curl -H "Content-Type: application/json" -d @-  http://timber.gsic.uva.es/sta/data/image 
#echo -e "\n"


(echo -n '{"creator": "'$creator'", "species":"'$species'", "lat": "'$lat'", "long":"'$long'", "image": "'; base64 "$image"; echo '"}')  | curl -H "Content-Type: application/json" -d @-  http://timber.gsic.uva.es/sta/data/tree/
echo -e "\n"