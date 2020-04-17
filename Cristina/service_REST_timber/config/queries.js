var onturis = require('./onturis');

// query prefixes
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
    'sta': 'http://timber.gsic.uva.es/sta/ontology/',
    //'example': 'http://crossforest.eu/sta/data/example/'
};

// query array with all the queries
var queriesArray = [];

// test endpoint
queriesArray.push({
    'name': 'test',
    'query': 'SELECT * \n \
              WHERE { \n \
                   ?s ?p ?o .\n \
              } LIMIT 1'
});

// Pensar si puedo hacer querys genéricas para no tener que ir construyendo una a una...

//Árboles en un área dada por 4 puntos
queriesArray.push({
    'name': 'treesinArea_pos',
    'query':    'CONSTRUCT { \n \
                    ?tree geo:lat ?lat ; \n \
                          geo:long ?long . \n \
                }  \n \
                WHERE {  \n \
                    ?tree a <' + onturis.tree + '> ;  \n \
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
    'query':    'CONSTRUCT { \n \
                    ?tree <' + onturis.prHasTaxon + '> ?taxon . \n \
                }  \n \
                WHERE {  \n \
                    ?tree a <' + onturis.tree + '> ;  \n \
                          ?has ?annotation . \n \
                    ?has rdfs:subPropertyOf* <' + onturis.prHasPrimaryAnnotation + '> .  \n \
                    ?annotation <' + onturis.prHasTaxon + '> ?taxon . \n \
                    FILTER(?tree IN ( {{{treesArea}}} )) \n \
            } \n \
            ORDER BY (?tree)' 
});

//Todos los árboles del sistema (recupero uri, posición y especie).
//PROBLEMA: si no tiene anotación acepatada no devuelve nada... REVISAR/PEnsar como hacerlo...
// con optional se puede pero no es eficiente... mirar cómo está en el crossforest
queriesArray.push({
    'name': 'trees',
    'query':    'SELECT ?tree ?lat ?long ?species \n \
                WHERE { \n \
                    ?tree {{annotationType}} ?annot .\n \
                    ?annot a <' + onturis.assertedAnnotation + '> .\n \
                }'
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

queriesArray.push({'name': 'allTrees_pos',
	'query': 'CONSTRUCT { \n \
                ?tree geo:lat ?lat ; \n \
                geo:long ?long . \n \
              }  \n \
              WHERE {  \n \
                 ?tree a <' + onturis.tree + '> ;  \n \
                       ?has ?annotation . \n \
                 ?has rdfs:subPropertyOf* <' + onturis.prHasPrimaryAnnotation + '> .  \n \
                 ?annotation geo:lat ?lat ; \n \
                             geo:long ?long . \n \
              } \n \
              ORDER BY (?tree) \n \
              LIMIT {{limit}} \n \
              OFFSET {{offset}}'      
});

queriesArray.push({'name': 'allTrees_species',
	'query': 'CONSTRUCT { \n \
                ?tree <' + onturis.prHasTaxon + '> ?taxon . \n \
              }  \n \
              WHERE {  \n \
                 ?tree a sta:Tree ;  \n \
                 <' + onturis.prHasPrimarySpecies +'> | <' + onturis.prHasAssertedSpecies +'> ?annotation . \n \
                 ?annotation <' + onturis.prHasTaxon + '> ?taxon . \n \
                 VALUES ?tree { {{{treesArea}}} } \n \
              } \n \
              ORDER BY (?tree)'      
});
/*?has ?annotation . \n \
                ?has rdfs:subPropertyOf* <' + onturis.prHasPrimaryAnnotation + '> .  \n \
*/


/**
 * Generales
 */

// Individuos de una clase => utilizo construct en vez de select para poder devolver los datos en json-ld (como la dbpedia)
queriesArray.push({'name': 'indivs',
	'query': 'CONSTRUCT \n \
            WHERE { \n \
                ?uri a <{{{cluri}}}> . \n \
            }'
});

queriesArray.push({'name': 'details',
	'query': 'SELECT * \n \
            WHERE { \n \
                ?s ?p ?o . \n \
                VALUES ?s { <{{{uri}}}> }. \n \
            }'
});


module.exports = {
    queriesArray,
    queryPrefixes
};