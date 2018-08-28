/*
    DeleteRowButton class
*/
"use strict";

var Button = require( '../button.js' );

var DeleteRowButton = function( properties, parent ) {
    Button.call( this, properties, parent );
};
Button.doSuperClassOf( DeleteRowButton );

DeleteRowButton.prototype.id = 'subform_deleteRowButton';

DeleteRowButton.prototype.selector = '.zcrud-delete-row-command-button';

DeleteRowButton.prototype.bindableIn = {
    subformRow: true
};

DeleteRowButton.prototype.getTextsBundle = function(){

    return {
        title: {
            translate: false,
            text: 'Delete record'
        },
        content: {
            translate: false,
            text: ''
        }
    };
};

DeleteRowButton.prototype.run = function( event, subformInstance ){
    
    event.preventDefault();
    event.stopPropagation();
    
    subformInstance.deleteRow( event );
};

module.exports = DeleteRowButton;
