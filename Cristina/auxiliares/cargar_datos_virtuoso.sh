#!/bin/bash
user="dba"
pass="93u03r3Aw"
port=1111
ruta_git_data="$HOME/SocialTreeAnnotation/Cristina/data"
ruta_git_onto="$HOME/SocialTreeAnnotation/Cristina/ontology"
fichero_datos="example.ttl"
fichero_ontologia="ontology.ttl"
fichero_ifn="ifn-core.ttl"
fichero_mfe="mfe-core.ttl"
grafo="http://timber.gsic.uva.es"
grafo_crossforest="http://timber.gsic.uva.es/crossforest"


echo -e "Copiando ficheros de git a directorio modelo_datos para el docker virtuoso"
if [ ! -f $HOME/data/modelo_datos/$fichero_datos ]; then
    echo "El fichero $HOME/data/modelo_datos/$fichero_datos no existía, se crea"
    touch $HOME/data/modelo_datos/$fichero_datos
fi
if [ ! -f touch $HOME/data/modelo_datos/$fichero_ontologia ]; then
    echo "El fichero $HOME/data/modelo_datos/$fichero_ontologia no existía, se crea"
    touch touch $HOME/data/modelo_datos/$fichero_ontologia
fi

cp $ruta_git_data/$fichero_datos $HOME/data/modelo_datos/$fichero_datos
cp $ruta_git_onto/$fichero_ontologia $HOME/data/modelo_datos/$fichero_ontologia

echo -e "----------- Borrando ficheros -----------\n"
docker exec -it virtuoso_db_1 isql-v $port $user $pass exec="RDF_GLOBAL_RESET ();" 
docker exec -it virtuoso_db_1 isql-v $port $user $pass exec="delete from DB.DBA.load_list;" 
docker exec -it virtuoso_db_1 isql-v $port $user $pass exec="checkpoint;" 
echo -e "\n Borrado completo; \n "

echo -e "\n\n----------- Cargando ficheros nuevos -----------\n"
docker exec -it virtuoso_db_1 isql-v $port $user $pass exec="ld_dir('./modelo_datos', '$fichero_datos', '$grafo');"
docker exec -it virtuoso_db_1 isql-v $port $user $pass exec="ld_dir('./modelo_datos', '$fichero_ontologia', '$grafo');"
docker exec -it virtuoso_db_1 isql-v $port $user $pass exec="ld_dir('./modelo_datos', '$fichero_ifn', '$grafo_crossforest');"
docker exec -it virtuoso_db_1 isql-v $port $user $pass exec="ld_dir('./modelo_datos', '$fichero_mfe', '$grafo_crossforest');"
docker exec -it virtuoso_db_1 isql-v $port $user $pass exec="rdf_loader_run();"
docker exec -it virtuoso_db_1 isql-v $port $user $pass exec="select * from DB.DBA.load_list";
docker exec -it virtuoso_db_1 isql-v $port $user $pass exec="checkpoint;"

docker exec -it virtuoso_db_1 isql-v $port $user $pass exec="exit;" 
echo -e "\n----------- Fin recarga ficheros -----------\n"