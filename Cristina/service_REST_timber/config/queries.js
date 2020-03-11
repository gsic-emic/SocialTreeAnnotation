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
    //'sta': 'http://timber.gsic.uva.es/sta/ontology/',
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

// árboles en unas posiciones
queriesArray.push({
    'name': 'treesinArea',
    'query': 'SELECT DISTINCT ?tree ?lat ?lng \n \
WHERE { \n \
	?tree a <'+ onturis.tree + '> ; \n \
}'
});

module.exports = {
    queriesArray,
    queryPrefixes
};