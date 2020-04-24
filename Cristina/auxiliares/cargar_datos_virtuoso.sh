#!/bin/bash
user="dba"
pass="93u03r3Aw"
port=1111
ruta_git_data="$HOME/SocialTreeAnnotation/Cristina/data"
ruta_git_onto="$HOME/SocialTreeAnnotation/Cristina/ontology"
ruta_virtuoso="/usr/local/virtuoso-opensource/var/lib/virtuoso/db/modelo_datos"
#fichero_ifn="ifn-core.ttl"
#fichero_mfe="mfe-core.ttl"
grafo="http://timber.gsic.uva.es"
grafo_crossforest="http://timber.gsic.uva.es/crossforest"
grafo_crossforestTrees="http://timber.gsic.uva.es/crossforestTrees"

echo -e "----------- Borrando ficheros -----------\n"
/usr/local/bin/isql $port $user $pass exec="RDF_GLOBAL_RESET ();"
/usr/local/bin/isql $port $user $pass exec="delete from DB.DBA.load_list;"
/usr/local/bin/isql  $port $user $pass exec="checkpoint;"
echo -e "----------- Borrado completo -----------\n "

echo -e "Copiando ficheros de git a directorio modelo_datos del virtuoso y cargando ficheros nuevos a Virtuoso "

for file_fullpath in "$ruta_git_data"/*; do
    fichero_datos=${file_fullpath##*/}
    if [ ! -f $ruta_virtuoso/$fichero_datos ]; then
        echo "El fichero $ruta_virtuoso/$fichero_datos no existía, se crea"
        touch $ruta_virtuoso/$fichero_datos
    fi
    cp $file_fullpath $ruta_virtuoso/$fichero_datos

    echo -e "\t ######### Cargando $ruta_virtuoso/$fichero_datos"
    # Si el fichero tiene ifn en el nombre lo cargo a otro grafo
    if [[ $fichero_datos =~ (.*ifn.*) ]]; then
        /usr/local/bin/isql $port $user $pass exec="ld_dir('$ruta_virtuoso', '$fichero_datos', '$grafo_crossforestTrees');"
    else
        /usr/local/bin/isql $port $user $pass exec="ld_dir('$ruta_virtuoso', '$fichero_datos', '$grafo');"
    fi
done

for file_onto_fullpath in "$ruta_git_onto"/*; do
    fichero_ontologia=${file_onto_fullpath##*/}
    if [ ! -f $ruta_virtuoso/$fichero_ontologia ]; then
        echo "El fichero $HOME/data/modelo_datos/$fichero_ontologia no existía, se crea"
        touch $ruta_virtuoso/$fichero_ontologia
    fi
    echo -e "\t ######### Cargando $ruta_virtuoso/$fichero_ontologia"
    cp $file_onto_fullpath $ruta_virtuoso/$fichero_ontologia
    /usr/local/bin/isql $port $user $pass exec="ld_dir('./modelo_datos', '$fichero_ontologia', '$grafo');"
done

#/usr/local/bin/isql $port $user $pass exec="ld_dir('./modelo_datos', '$fichero_ifn', '$grafo_crossforest');"
#/usr/local/bin/isql $port $user $pass exec="ld_dir('./modelo_datos', '$fichero_mfe', '$grafo_crossforest');"
/usr/local/bin/isql $port $user $pass exec="rdf_loader_run();"
/usr/local/bin/isql $port $user $pass exec="select * from DB.DBA.load_list"
/usr/local/bin/isql $port $user $pass exec="checkpoint;"

/usr/local/bin/isql $port $user $pass exec="exit;"
echo -e "\n----------- Fin recarga ficheros -----------\n"