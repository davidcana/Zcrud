/*
    GenericButton class
*/
"use strict";

var Button = require( './button.js' );

var GenericButton = function( properties, parent ) {
    Button.call( this, properties, parent );
};
Button.doSuperClassOf( GenericButton );

Button.prototype.isBindable = function(){
    return true;
};

module.exports = GenericButton;
