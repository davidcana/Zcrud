/*
    GenericButton class
*/

//var Button = require( './button.js' );
import { Button }  from './button.js';

export const GenericButton = function( properties, parent ) {
    Button.call( this, properties, parent );
};
Button.doSuperClassOf( GenericButton );

Button.prototype.isBindable = function(){
    return true;
};

//module.exports = GenericButton;
