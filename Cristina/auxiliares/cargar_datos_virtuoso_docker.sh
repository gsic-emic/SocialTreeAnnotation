#!/bin/bash
user="dba"
pass="93u03r3Aw"
port=1111
ruta_git_data="$HOME/SocialTreeAnnotation/Cristina/data"
ruta_git_onto="$HOME/SocialTreeAnnotation/Cristina/ontology"
#fichero_ifn="ifn-core.ttl"
#fichero_mfe="mfe-core.ttl"
grafo="http://timber.gsic.uva.es"
grafo_crossforest="http://timber.gsic.uva.es/crossforest"
grafo_crossforestTrees="http://timber.gsic.uva.es/crossforestTrees"

echo -e "----------- Borrando ficheros -----------\n"
docker exec -it virtuoso_db_1 isql-v $port $user $pass exec="RDF_GLOBAL_RESET ();"
docker exec -it virtuoso_db_1 isql-v $port $user $pass exec="delete from DB.DBA.load_list;"
docker exec -it virtuoso_db_1 isql-v $port $user $pass exec="checkpoint;"
echo -e "----------- Borrado completo -----------\n "

echo -e "Copiando ficheros de git a directorio modelo_datos para el docker virtuoso y cargando ficheros nuevos a Virtuoso "

for file_fullpath in "$ruta_git_data"/*; do
    fichero_datos=${file_fullpath##*/}
    if [ ! -f $HOME/data/virtuoso/modelo_datos/$fichero_datos ]; then
        echo "El fichero $HOME/data/modelo_datos/$fichero_datos no existía, se crea"
        touch $HOME/data/virtuoso/modelo_datos/$fichero_datos
    fi
    cp $file_fullpath $HOME/data/virtuoso/modelo_datos/$fichero_datos

    echo -e "\t ######### Cargando $HOME/data/virtuoso/modelo_datos/$fichero_datos"
    # Si el fichero tiene ifn en el nombre lo cargo a otro grafo
    if [[ $fichero_datos =~ (.*ifn.*) ]]; then
        docker exec -it virtuoso_db_1 isql-v $port $user $pass exec="ld_dir('./modelo_datos', '$fichero_datos', '$grafo_crossforestTrees');"
    else
        docker exec -it virtuoso_db_1 isql-v $port $user $pass exec="ld_dir('./modelo_datos', '$fichero_datos', '$grafo');"
    fi
done

for file_onto_fullpath in "$ruta_git_onto"/*; do
    fichero_ontologia=${file_onto_fullpath##*/}
    if [ ! -f $HOME/data/virtuoso/modelo_datos/$fichero_ontologia ]; then
        echo "El fichero $HOME/data/modelo_datos/$fichero_ontologia no existía, se crea"
        touch $HOME/data/virtuoso/modelo_datos/$fichero_ontologia
    fi
    echo -e "\t ######### Cargando $HOME/data/virtuoso/modelo_datos/$fichero_ontologia"
    cp $file_onto_fullpath $HOME/data/virtuoso/modelo_datos/$fichero_ontologia
    docker exec -it virtuoso_db_1 isql-v $port $user $pass exec="ld_dir('./modelo_datos', '$fichero_ontologia', '$grafo');"
done

#docker exec -it virtuoso_db_1 isql-v $port $user $pass exec="ld_dir('./modelo_datos', '$fichero_ifn', '$grafo_crossforest');"
#docker exec -it virtuoso_db_1 isql-v $port $user $pass exec="ld_dir('./modelo_datos', '$fichero_mfe', '$grafo_crossforest');"
docker exec -it virtuoso_db_1 isql-v $port $user $pass exec="rdf_loader_run();"
docker exec -it virtuoso_db_1 isql-v $port $user $pass exec="select * from DB.DBA.load_list"
docker exec -it virtuoso_db_1 isql-v $port $user $pass exec="checkpoint;"

docker exec -it virtuoso_db_1 isql-v $port $user $pass exec="exit;"
echo -e "\n----------- Fin recarga ficheros -----------\n"
