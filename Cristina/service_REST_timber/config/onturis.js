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
    assertedAnnotation: 'http://timber.gsic.uva.es/sta/ontology/AssertedAnnotation', //modificar a asserted annotation y resubir ontology

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
};

module.exports = onturis;