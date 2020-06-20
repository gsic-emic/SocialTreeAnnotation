/**
 * Fichero que contiene las uris de las clases y propiedades de las ontologías utilizadas
 */
var onturis = {
	/**
	 * Clases ontología diseñada para Timber
	 */
	annotation: 'http://timber.gsic.uva.es/sta/ontology/Annotation',
    assertedAnnotation: 'http://timber.gsic.uva.es/sta/ontology/AssertedAnnotation', 
    assertedPosition: 'http://timber.gsic.uva.es/sta/ontology/AssertedPosition',
    assertedSpecies: 'http://timber.gsic.uva.es/sta/ontology/AssertedSpecies',
    branch: 'http://timber.gsic.uva.es/sta/ontology/Branch',
    crown: 'http://timber.gsic.uva.es/sta/ontology/Crown',
    flower: 'http://timber.gsic.uva.es/sta/ontology/Flower',
    fruit: 'http://timber.gsic.uva.es/sta/ontology/Fruit',
    generalView: 'http://timber.gsic.uva.es/sta/ontology/GeneralView',
    image: 'http://timber.gsic.uva.es/sta/ontology/Image',
    imageAnnotation: 'http://timber.gsic.uva.es/sta/ontology/ImageAnnotation',
    leaf: 'http://timber.gsic.uva.es/sta/ontology/Leaf',
    otherPart: 'http://timber.gsic.uva.es/sta/ontology/OtherPart',
    positionAnnotation: 'http://timber.gsic.uva.es/sta/ontology/PositionAnnotation',
    primaryAnnotation: 'http://timber.gsic.uva.es/sta/ontology/PrimaryAnnotation',
    primaryPosition: 'http://timber.gsic.uva.es/sta/ontology/PrimaryPosition',
    primarySpecies: 'http://timber.gsic.uva.es/sta/ontology/PrimarySpecies',
    speciesAnnotation: 'http://timber.gsic.uva.es/sta/ontology/SpeciesAnnotation',
	tree: 'http://timber.gsic.uva.es/sta/ontology/Tree',
    treePartPhoto: 'http://timber.gsic.uva.es/sta/ontology/TreePartPhoto',
    trunk: 'http://timber.gsic.uva.es/sta/ontology/Trunk',

	/**
	 * Propiedades de la ontología 
	 */
	prHasImage: 'http://timber.gsic.uva.es/sta/ontology/hasImage',
	prHasTaxon: 'http://timber.gsic.uva.es/sta/ontology/hasTaxon',

	//Imagen
	prHasPart: 'http://timber.gsic.uva.es/sta/ontology/hasPart',
	prResource: 'http://timber.gsic.uva.es/sta/ontology/resource',

	//Árbol
    prHasAnnotation: 'http://timber.gsic.uva.es/sta/ontology/hasAnnotation',
    prHasAssertedAnnotation: 'http://timber.gsic.uva.es/sta/ontology/hasAssertedAnnotation',
    prHasAssertedPosition: 'http://timber.gsic.uva.es/sta/ontology/hasAssertedPosition',
    prHasAssertedSpecies: 'http://timber.gsic.uva.es/sta/ontology/hasAssertedSpecies',
    prHasImageAnnotation: 'http://timber.gsic.uva.es/sta/ontology/hasImageAnnotation',
    prHasPositionAnnotation: 'http://timber.gsic.uva.es/sta/ontology/hasPositionAnnotation',
    prHasPrimaryAnnotation: 'http://timber.gsic.uva.es/sta/ontology/hasPrimaryAnnotation',
    prHasPrimaryPosition: 'http://timber.gsic.uva.es/sta/ontology/hasPrimaryPosition',
    prHasPrimarySpecies: 'http://timber.gsic.uva.es/sta/ontology/hasPrimarySpecies',
    prHasSpeciesAnnotation: 'http://timber.gsic.uva.es/sta/ontology/hasSpeciesAnnotation',

	/**
	 * IFN y CrossForest
	 */
    ifn_especiesTop: ['http://crossforest.eu/ifn/ontology/Class2', 'http://crossforest.eu/ifn/ontology/Class1'],
    ifn_ontology: "http://crossforest.eu/ifn/ontology/",
    ifn_species: "http://crossforest.eu/ifn/ontology/Species",
	prifnScientificName: 'http://crossforest.eu/ifn/ontology/hasAcceptedName>/<http://crossforest.eu/ifn/ontology/name',
    prifnVulgarName: 'http://crossforest.eu/ifn/ontology/vulgarName',
    prifnWikipediaPage: 'http://crossforest.eu/ifn/ontology/hasWikipediaPage',

	/**
	 * General
	 */
	data: "http://timber.gsic.uva.es/sta/data/",
	dc_created: "http://purl.org/dc/elements/1.1/created",
	dc_creator: "http://purl.org/dc/elements/1.1/creator",
	foafPerson: 'http://xmlns.com/foaf/0.1/Person',
	geo_lat: "http://www.w3.org/2003/01/geo/wgs84_pos#lat",
	geo_long: "http://www.w3.org/2003/01/geo/wgs84_pos#long",
	prifnSameAs: 'http://schema.org/sameAs',
	user: "http://timber.gsic.uva.es/sta/data/user/"

};

module.exports = onturis;