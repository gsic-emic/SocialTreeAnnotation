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
    'query':    'CONSTRUCT { \n \
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

queriesArray.push({'name': 'allTrees_pos',
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

queriesArray.push({'name': 'allTrees_species',
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
/*?has ?annotation . \n \
                ?has rdfs:subPropertyOf* <' + onturis.prHasPrimaryAnnotation + '> .  \n \
*/

/* Consultas cambios que me comentó Guillermo 27/4/2020 */
queriesArray.push({
    'name': 'trees_uris',
    'query': 'CONSTRUCT \n \
            WHERE { \n \
                ?tree a <' + onturis.tree + '> . \n \
            } \n \
            LIMIT {{limit}} \n \
            OFFSET {{offset}}'
});

queriesArray.push({
    'name': 'trees_prop_annotation',
    'query': 'CONSTRUCT { \n \
                ?iri <{{{propiri}}}> ?value . \n \
            } \n \
            WHERE { \n \
                ?iri <{{{propiritype}}}>/<{{{propiri}}}> ?value . \n \
                FILTER ( ?iri IN ( <{{{uri}}}> )). \n \
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
    'name': 'trees_uris_zone',
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

queriesArray.push({
    'name': 'trees_uris_specie',
    'query': 'CONSTRUCT { \n \
                ?tree <' + onturis.prHasTaxon + '>   ?species_iris .  \n \
                }  \n \
            WHERE { \n \
                ?tree a <' + onturis.tree + '> . \n \
                ?tree <' + onturis.prHasPrimarySpecies + '> ?ann. \n \
                ?ann  <' + onturis.prHasTaxon + '>  ?species_iris . \n \
                FILTER ( ?species_iris IN ( <{{{uri_specie}}}> )). \n \            } \n \
            LIMIT {{limit}} \n \
            OFFSET {{offset}}'
});

queriesArray.push({
    'name': 'trees_uris_creator',
    'query': 'CONSTRUCT { \n \
                ?tree dc:creator ?creator .  \n \
                }  \n \
            WHERE { \n \
                ?tree a <' + onturis.tree + '> . \n \
                ?tree dc:creator ?creator. \n \
                FILTER ( ?creator IN ( <{{{uri_creator}}}> )). \n \            } \n \
            LIMIT {{limit}} \n \
            OFFSET {{offset}}'
});
/*prefix sta: <http://timber.gsic.uva.es/sta/ontology/>
SELECT DISTINCT ?ann ?value
WHERE {
?type rdfs:subClassOf* sta:PrimaryAnnotation .
?iri ?prop ?annotation .
?ann a ?type;
sta:hasTaxon ?value .
}*/

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
	'query': 'CONSTRUCT { \n \
                ?iri <{{{propiri}}}> ?value . \n \
            }  \n \
            WHERE { \n \
                ?iri <{{{propiri}}}> ?value . \n \
                FILTER (  ?iri IN ( <{{{uri}}}> )). \n \
            }'
});


queriesArray.push({'name': 'details_allprop',
	'query': 'CONSTRUCT { \n \
                ?iri ?p ?value . \n \
            }  \n \
            WHERE { \n \
                ?iri ?p ?value . \n \
                FILTER (  ?iri IN ( <{{{uri}}}> )). \n \
            }'
});

// get subclass relations from a base class
queriesArray.push({'name': 'subclasses',
//	'prefixes': ['rdfs', 'ifn', 'mfe', 'epsg', 'patch', 'poly', 'plot', 'tree', 'is'],
	'query': 'SELECT DISTINCT ?sup ?sub \n \
WHERE { \n \
  ?sup rdfs:subClassOf* <{{{uri}}}> . \n \
  ?sub rdfs:subClassOf ?sup . \n \
}'
});

// get values for properties
queriesArray.push({'name': 'propvalues',
//	'prefixes': ['ifn', 'mfe', 'epsg', 'patch', 'poly', 'plot', 'tree', 'is'],
	'query': 'SELECT DISTINCT ?uri ?value \n \
WHERE { \n \
?uri <{{{propuri}}}> ?value . \n \
FILTER (?uri IN ( {{{furis}}} )) }'
});
module.exports = {
    queriesArray,
    queryPrefixes
};