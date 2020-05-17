#!/bin/env node

var onturis = {
	//CLASES
    tree: 'http://timber.gsic.uva.es/sta/ontology/Tree',
	treePart: 'http://timber.gsic.uva.es/sta/ontology/TreePart',
	leaf: 'http://timber.gsic.uva.es/sta/ontology/Leaf',
	fruit: 'http://timber.gsic.uva.es/sta/ontology/Fruit',
	trunk: 'http://timber.gsic.uva.es/sta/ontology/Trunk',
	branch: 'http://timber.gsic.uva.es/sta/ontology/Branch',
	crown: 'http://timber.gsic.uva.es/sta/ontology/Crown',
	generalView: 'http://timber.gsic.uva.es/sta/ontology/GeneralView',
	flower: 'http://timber.gsic.uva.es/sta/ontology/Flower',
	otherPart: 'http://timber.gsic.uva.es/sta/ontology/OtherPart',
	image: 'http://timber.gsic.uva.es/sta/ontology/Image',
    annotation: 'http://timber.gsic.uva.es/sta/ontology/Annotation',
    speciesAnnotation: 'http://timber.gsic.uva.es/sta/ontology/SpeciesAnnotation',
    positionAnnotation: 'http://timber.gsic.uva.es/sta/ontology/PositionAnnotation',
    imageAnnotation: 'http://timber.gsic.uva.es/sta/ontology/ImageAnnotation',
	assertedAnnotation: 'http://timber.gsic.uva.es/sta/ontology/AssertedAnnotation', 
	primaryAnnotation: 'http://timber.gsic.uva.es/sta/ontology/PrimaryAnnotation',
	primaryPosition: 'http://timber.gsic.uva.es/sta/ontology/PrimaryPosition',
	primarySpecies: 'http://timber.gsic.uva.es/sta/ontology/PrimarySpecies',
	assertedPosition: 'http://timber.gsic.uva.es/sta/ontology/AssertedPosition',
	assertedSpecies: 'http://timber.gsic.uva.es/sta/ontology/AssertedSpecies',


	//PROPIEDADES
	prHasImage: 'http://timber.gsic.uva.es/sta/ontology/hasImage',
	prHasTaxon: 'http://timber.gsic.uva.es/sta/ontology/hasTaxon',

	//Imagen
	prHasPart: 'http://timber.gsic.uva.es/sta/ontology/hasPart',
	//Árbol
	prHasAnnotation: 'http://timber.gsic.uva.es/sta/ontology/hasAnnotation',
	prHasSpeciesAnnotation: 'http://timber.gsic.uva.es/sta/ontology/hasSpeciesAnnotation',
	prHasPositionAnnotation: 'http://timber.gsic.uva.es/sta/ontology/hasPositionAnnotation',
	prHasImageAnnotation: 'http://timber.gsic.uva.es/sta/ontology/hasImageAnnotation',
	prHasPrimaryAnnotation: 'http://timber.gsic.uva.es/sta/ontology/hasPrimaryAnnotation',
	prHasPrimaryPosition: 'http://timber.gsic.uva.es/sta/ontology/hasPrimaryPosition',
	prHasPrimarySpecies: 'http://timber.gsic.uva.es/sta/ontology/hasPrimarySpecies',
	prHasAssertedAnnotation: 'http://timber.gsic.uva.es/sta/ontology/hasAssertedAnnotation',
	prHasAssertedSpecies: 'http://timber.gsic.uva.es/sta/ontology/hasAssertedSpecies',
	prHasAssertedPosition: 'http://timber.gsic.uva.es/sta/ontology/hasAssertedPosition',


	geo_lat: "http://www.w3.org/2003/01/geo/wgs84_pos#lat",
	geo_long: "http://www.w3.org/2003/01/geo/wgs84_pos#long",
	dc_creator: "http://purl.org/dc/elements/1.1/creator",
	ifn_ontology: "http://crossforest.eu/ifn/ontology/",
	ifn_species: "http://crossforest.eu/ifn/ontology/Species",
	ifn_especiesTop: ['http://crossforest.eu/ifn/ontology/Class2', 'http://crossforest.eu/ifn/ontology/Class1'],
	// especies
	prifnScientificName: 'http://crossforest.eu/ifn/ontology/hasAcceptedName>/<http://crossforest.eu/ifn/ontology/name',
	prifnVulgarName: 'http://crossforest.eu/ifn/ontology/vulgarName',
	prifnWikipediaPage: 'http://crossforest.eu/ifn/ontology/hasWikipediaPage',
	prifnSameAs: 'http://schema.org/sameAs',


	users: "http://timber.gsic.uva.es/sta/data/user/",


};

module.exports = onturis;