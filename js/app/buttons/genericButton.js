/*
    GenericButton class
*/

import { Button }  from './button.js';

export const GenericButton = function( properties, parent ) {
    Button.call( this, properties, parent );
};
Button.doSuperClassOf( GenericButton );

Button.prototype.isBindable = function(){
    return true;
};

