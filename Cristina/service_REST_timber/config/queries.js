/**
 * Fichero que contiene todo lo relacionado con las consultas SPARQL 
 */
var onturis = require('./onturis');

// Prefijos
var queryPrefixes = {
    'owl': 'http://www.w3.org/2002/07/owl#',
    'rdf': 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
    //'xml': 'http://www.w3.org/XML/1998/namespace',
    'xsd': 'http://www.w3.org/2001/XMLSchema#',
    'rdfs': 'http://www.w3.org/2000/01/rdf-schema#',
    'foaf': 'http://xmlns.com/foaf/0.1/',
    //'skos': 'http://www.w3.org/2004/02/skos/core#',
    'dc': 'http://purl.org/dc/elements/1.1/',
    'geo': 'http://www.w3.org/2003/01/geo/wgs84_pos#',
    'ifn': 'http://crossforest.eu/ifn/ontology/',
    //'mfe': 'http://crossforest.eu/mfe/ontology/',
    //'spo': 'http://crossforest.eu/position/ontology/',
    //'epsg': 'http://epsg.w3id.org/ontology/',
    'exif': 'http://www.w3.org/2003/12/exif/ns#',
    'sta': 'http://timber.gsic.uva.es/sta/ontology/',
    'tree': 'http://timber.gsic.uva.es/sta/data/tree/',
    'annotation': 'http://timber.gsic.uva.es/sta/data/annotation/'
};

// Nombres de las consultas
var nameQueries = {
    'addAnnotationTree':'add_annotation_tree',
    'annotationsUrisCreator':'annotations_uris_creator',
    'createAnnotationImage': 'create_annotation_image',
    'createAnnotationPosition': 'create_annotation_position',
    'createAnnotationSpecies': 'create_annotation_species',
    'createImage': 'create_image',
    'createTree':'create_tree',
    'createUser': 'create_user',
    'details': 'details',
    'detailsAll': 'details_allprop',
    'individuals': 'indivs',
    'propvalues':'propvalues',
    'subclasses':'subclasses',
    'test': 'test',
    'treesPropAnnotation': 'trees_prop_annotation',
    'treesUris': 'trees_uris',
    'treesUrisCreator':'trees_uris_creator',
    'treesUrisSpecies': 'trees_uris_specie',
    'treesUrisZone': 'trees_uris_zone',
    'updatePrimaryAnnotation':'update_primary_annotation'
};

// Array con todas las consultas definidas
var queriesArray = [];

// test endpoint
queriesArray.push({
    'name': nameQueries.test,
    'query': 'SELECT * \n \
              WHERE { \n \
                   ?s ?p ?o .\n \
              } LIMIT 1'
});

/**
 * Árboles y anotaciones
 */
// Recuperar las iris de los árboles
queriesArray.push({
    'name': nameQueries.treesUris,
    'query': 'CONSTRUCT \n \
            WHERE { \n \
                ?tree a <' + onturis.tree + '> . \n \
            } \n \
            LIMIT {{limit}} \n \
            OFFSET {{offset}}'
});
// Recuperar la propiedad concreta de un tipo de anotación concreto de un árbol
queriesArray.push({
    'name': nameQueries.treesPropAnnotation,
    'query': 'CONSTRUCT { \n \
                ?iri <{{{propiri}}}> ?value . \n \
            } \n \
            WHERE { \n \
                ?iri <{{{propiritype}}}>/<{{{propiri}}}> ?value . \n \
                FILTER ( ?iri IN ( <{{{uri}}}> )). \n \
            }'
});
// Recupera iris de los árboles de una zona
queriesArray.push({
    'name': nameQueries.treesUrisZone,
    'query': 'CONSTRUCT { \n \
                ?tree geo:lat ?lat ;  \n \
                      geo:long ?long .  \n \
                }  \n \
            WHERE { \n \
                ?tree a <' + onturis.tree + '> . \n \
                ?tree <' + onturis.prHasPrimaryPosition + '> ?ann. \n \
                ?ann geo:lat ?lat ; \n \
                     geo:long ?long . \n \
                     FILTER (?lat > {{latsouth}}) . \n \
                     FILTER (?lat < {{latnorth}}) . \n \
                     FILTER (?long > {{longwest}}) . \n \
                     FILTER (?long < {{longeast}}) . \n \
            } \n \
            LIMIT {{limit}} \n \
            OFFSET {{offset}}'
});
// Recupera iris de los árboles de una especie
queriesArray.push({
    'name': nameQueries.treesUrisSpecies,
    'query': 'CONSTRUCT { \n \
                ?tree <' + onturis.prHasTaxon + '>   ?species_iris .  \n \
                }  \n \
            WHERE { \n \
                ?tree a <' + onturis.tree + '> . \n \
                ?tree <' + onturis.prHasPrimarySpecies + '> ?ann. \n \
                ?ann  <' + onturis.prHasTaxon + '>  ?species_iris . \n \
                FILTER ( ?species_iris IN ( <{{{uri_specie}}}> )). \n \
            } \n \
            LIMIT {{limit}} \n \
            OFFSET {{offset}}'
});
// Recupera iris de los árboles creados por usuario
queriesArray.push({
    'name': nameQueries.treesUrisCreator,
    'query': 'CONSTRUCT { \n \
                ?tree dc:creator ?creator .  \n \
                }  \n \
            WHERE { \n \
                ?tree a <' + onturis.tree + '> . \n \
                ?tree dc:creator ?creator. \n \
                FILTER ( ?creator IN ( <{{{uri_creator}}}> )). \n \
            } \n \
            LIMIT {{limit}} \n \
            OFFSET {{offset}}'
});
// Crear árbol
queriesArray.push({
    'name': 'create_tree',
    'query': 'INSERT DATA \n \
            { <'+ queryPrefixes.tree + '{{id}}> a <' + onturis.tree + '> ; \n \
                                        dc:creator <{{{creator}}}> ; \n \
                                        dc:created "{{date}}"^^xsd:date ;\n \
                                        <' + onturis.prHasPrimaryPosition + '> <{{{annotation}}}> .\n \
            }'
});
// Añadir anotación a árbol
queriesArray.push({
    'name': nameQueries.addAnnotationTree,
    'query': 'INSERT DATA \n \
            { <'+ queryPrefixes.tree + '{{id}}> <{{{hasAnnotation}}}> <{{{annotation}}}> .\n \
            }'
});
// Actualizar anotación primaria de un árbol
queriesArray.push({
    'name': nameQueries.updatePrimaryAnnotation,
    'query': 'DELETE { \n \
        <{{{idTree}}}> <{{{hasPrimary}}}> ?o . \n \
        ?o a <{{{typePrimary}}}> . \n \
       } \n \
       INSERT { \n \
        <{{{idTree}}}> <{{{hasAnnot}}}> ?o . \n \
        ?o a <{{{type}}}> . \n \
       }\n \
       WHERE  {\n \
        <{{{idTree}}}> <{{{hasPrimary}}}> ?o . \n \
       }'
});

/**
 * Anotaciones
 */
// Recuperar iris de anotaciones creadas por un usuario concreto
queriesArray.push({
    'name': nameQueries.annotationsUrisCreator,
    'query': 'CONSTRUCT { \n \
                ?ann dc:creator ?creator .  \n \
        }  \n \
            WHERE { \n \
                ?types rdfs:subClassOf* <' + onturis.annotation + '> . \n \
                ?ann a ?types ; \n \
                     dc:creator ?creator . \n \
            FILTER ( ?creator IN ( <{{{uri_creator}}}> )). \n \
            } \n \
            LIMIT {{limit}} \n \
            OFFSET {{offset}}'
});
// Crear anotación de posición (del tipo que se reciba por parámetro: primaria, afirmada...)
queriesArray.push({
    'name': nameQueries.createAnnotationPosition,
    'query': 'INSERT DATA \n \
            { <'+ queryPrefixes.annotation + '{{id}}> a <{{{type}}}> ; \n \
                                        dc:creator <{{{creator}}}> ; \n \
                                        dc:created "{{date}}"^^xsd:date ;\n \
                                        geo:lat {{lat}} ; \n \
                                        geo:long {{long}} . \n \
            }'
});
// Crear anotación de imagen
queriesArray.push({
    'name': nameQueries.createAnnotationImage,
    'query': 'INSERT DATA \n \
            { <'+ queryPrefixes.annotation + '{{id}}> a <{{{type}}}> ; \n \
                                        dc:creator <{{{creator}}}> ; \n \
                                        dc:created "{{date}}"^^xsd:date ;\n \
                                        <'+ onturis.prHasImage + '> <{{{imageId}}}> . \n \
            }'
});
//Crear anotación de especie
queriesArray.push({
    'name': nameQueries.createAnnotationSpecies,
    'query': 'INSERT DATA \n \
            { <'+ queryPrefixes.annotation + '{{id}}> a <{{{type}}}> ; \n \
                                        dc:creator <{{{creator}}}> ; \n \
                                        dc:created "{{date}}"^^xsd:date ;\n \
                                        <'+ onturis.prHasTaxon + '> <{{{species}}}> . \n \
            }'
});
/**
 * Imágenes
 */
// Crear imagen
queriesArray.push({
    'name': nameQueries.createImage,
    'query': 'INSERT DATA \n \
            { <{{{imageId}}}> a <'+ onturis.image + '> ; \n \
            <'+ onturis.prResource + '> <{{{image}}}> ; \n \
                dc:type <http://purl.org/dc/dcmitype/Image> ; \n \
                {{{varTriplesImg}}} \n \
                dc:created "{{date}}"^^xsd:date .\n \
            }'
});

/**
 * Usuarios
 */
// Crear usuario
queriesArray.push({
    'name': nameQueries.createUser,
    'query': 'INSERT DATA \n \
            { <{{{uri}}}> a foaf:Person ;\n \
            foaf:name "{{name}}" ; \n \
            foaf:nick "{{id}}"^^rdf:langString ; \n \
            foaf:mbox "{{email}}"^^rdf:langString ; \n \
            dc:created "{{date}}"^^xsd:date .\n \
            }'
});

/**
 * Generales
 */
// Individuos de una clase => utilizo construct en vez de select para poder devolver los datos en json-ld (como la dbpedia)
queriesArray.push({
    'name': nameQueries.individuals,
    'query': 'CONSTRUCT \n \
            WHERE { \n \
                ?uri a <{{{cluri}}}> . \n \
            }\n \
            LIMIT {{limit}} \n \
            OFFSET {{offset}}'
});
// Recuperar los valores de una propiedad de un individuo
queriesArray.push({
    'name': nameQueries.details,
    'query': 'CONSTRUCT { \n \
                ?iri <{{{propiri}}}> ?value . \n \
            }  \n \
            WHERE { \n \
                ?iri <{{{propiri}}}> ?value . \n \
                FILTER (  ?iri IN ( <{{{uri}}}> )). \n \
            }'
});
// Recuperar todas las propiedades y sus valores de un indiviuo
queriesArray.push({
    'name': nameQueries.detailsAll,
    'query': 'SELECT * \n \
            WHERE { \n \
                ?iri ?prop ?value . \n \
                FILTER (  ?iri IN ( <{{{uri}}}> )). \n \
            }'
});
// Recuperar todas las relaciones de subclases a partir de una clase base
queriesArray.push({
    'name': nameQueries.subclasses,
    //	'prefixes': ['rdfs', 'ifn', 'mfe', 'epsg', 'patch', 'poly', 'plot', 'tree', 'is'],
    'query': 'SELECT DISTINCT ?sup ?sub \n \
WHERE { \n \
  ?sup rdfs:subClassOf* <{{{uri}}}> . \n \
  ?sub rdfs:subClassOf ?sup . \n \
}'
});
// Recuperar los valores de una propiedad de un individuo (con select)
queriesArray.push({
    'name': nameQueries.propvalues,
    //	'prefixes': ['ifn', 'mfe', 'epsg', 'patch', 'poly', 'plot', 'tree', 'is'],
    'query': 'SELECT DISTINCT ?uri ?value \n \
            WHERE { \n \
            ?uri <{{{propuri}}}> ?value . \n \
            FILTER (?uri IN ( {{{furis}}} )) }'
});


/**
 * Querys que no se están utilizando
 */

/* 
//Árboles en un área dada por 4 puntos
queriesArray.push({
    'name': 'treesinArea_pos',
    'query': 'CONSTRUCT { \n \
                    ?tree geo:lat ?lat ; \n \
                          geo:long ?long ; \n \
                          dc:creator ?creator . \n \
                }  \n \
                WHERE {  \n \
                    ?tree a <' + onturis.tree + '> ;  \n \
                          dc:creator ?creator ; \n \
                          ?has ?annotation . \n \
                    ?has rdfs:subPropertyOf* <' + onturis.prHasPrimaryAnnotation + '> .  \n \
                    ?annotation geo:lat ?lat ; \n \
                                geo:long ?long . \n \
                    FILTER(xsd:decimal(?lat) >= xsd:decimal({{latsouth}}) && xsd:decimal(?lat) <= xsd:decimal({{latnorth}}) \
                        && xsd:decimal(?long) >= xsd:decimal({{longsouth}}) && xsd:decimal(?long) <= xsd:decimal({{longnorth}})) \n \
            } \n \
            ORDER BY (?tree) \n \
            LIMIT {{limit}} \n \
            OFFSET {{offset}}'
});
queriesArray.push({
    'name': 'treesinArea_species',
    'query': 'CONSTRUCT { \n \
                    ?tree <' + onturis.prHasTaxon + '> ?taxon . \n \
                }  \n \
                WHERE {  \n \
                    ?tree ?has ?annotation . \n \
                    ?has rdfs:subPropertyOf* <' + onturis.prHasPrimaryAnnotation + '> .  \n \
                    ?annotation <' + onturis.prHasTaxon + '> ?taxon . \n \
                    FILTER(?tree IN ( {{{treesArea}}} )) \n \
            } \n \
            ORDER BY (?tree)'
});
//Recuperar todos los árboles y sus anotaciones
queriesArray.push({
    'name': 'treesAndAnnotations',
    'query': 'SELECT ?tree ?annot \n \
            WHERE { \n \
                ?p rdfs:subPropertyOf+ sta:hasAnnotation . \n \
                ?tree ?p ?annot . \n \
            }'
}); 
queriesArray.push({
    'name': 'allTrees_pos',
    'query': 'CONSTRUCT { \n \
                ?tree geo:lat ?lat ; \n \
                geo:long ?long ; \n \
                dc:creator ?creator . \n \
              }  \n \
              WHERE {  \n \
                 ?tree a <' + onturis.tree + '> ;  \n \
                        dc:creator ?creator ; \n \
                       ?has ?annotation . \n \
                 ?has rdfs:subPropertyOf* <' + onturis.prHasPrimaryAnnotation + '> .  \n \
                 ?annotation geo:lat ?lat ; \n \
                             geo:long ?long . \n \
              } \n \
              LIMIT {{limit}} \n \
              OFFSET {{offset}}'
});
queriesArray.push({
    'name': 'allTrees_species',
    'query': 'CONSTRUCT { \n \
                ?tree <' + onturis.prHasTaxon + '> ?taxon . \n \
              }  \n \
              WHERE {  \n \
                    ?tree ?has ?annotation . \n \
                    ?has rdfs:subPropertyOf* <' + onturis.prHasPrimaryAnnotation + '> .  \n \
                    ?annotation <' + onturis.prHasTaxon + '> ?taxon . \n \
                 VALUES ?tree { {{{treesArea}}} } \n \
              }'
});
//NO VA BIEN SIEMPRE. A VECES SI
queriesArray.push({
    'name': 'trees_prop_primaryAnnotation',
    'query': 'CONSTRUCT { \n \
                ?iri <{{{propiri}}}> ?value . \n \
            } \n \
            WHERE { \n \
                ?iri ?prop ?ann . \n \
                ?prop rdfs:subPropertyOf* sta:hasPrimaryAnnotation . \n \
                ?ann <{{{propiri}}}> ?value . \n \
                FILTER ( ?iri IN ( <{{{uri}}}> )). \n \
            }'
});
queriesArray.push({
    'name': 'test_delete',
    'query': 'DELETE { \n \
                ?tree ?p ?o } \n \
            WHERE { \n \
                 ?tree a sta:Tree ; \n \
                dc:creator  ?creator . \n \
                FILTER ( ?creator IN (<http://timber.gsic.uva.es/sta/data/user/12345>) ) .\n \
                ?tree ?p ?o .\n \
                }'
});
queriesArray.push({
    'name': 'test_create',
    'query': 'INSERT DATA \n \
    { <http://timber.gsic.uva.es/sta/data/tree/0001414> a sta:Tree ; \n \
    dc:creator  <http://timber.gsic.uva.es/sta/data/user/12345> .\n \
    }'
});
*/


module.exports = {
    queriesArray,
    nameQueries,
    queryPrefixes
};