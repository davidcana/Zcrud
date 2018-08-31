/*
    GenericButton class
*/
"use strict";

var Button = require( './button.js' );

var GenericButton = function( properties, parent ) {
    Button.call( this, properties, parent );
};
Button.doSuperClassOf( GenericButton );

module.exports = GenericButton;
