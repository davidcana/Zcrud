/*
    DeleteRowButton class
*/
"use strict";

var Button = require( '../button.js' );

var DeleteRowButton = function( properties, parent ) {
    Button.call( this, properties, parent );
};
Button.doSuperClassOf( DeleteRowButton );

DeleteRowButton.prototype.type = 'subform_deleteRow';

DeleteRowButton.prototype.cssClass = 'zcrud-delete-row-command-button';

//DeleteRowButton.prototype.selector = '.' + DeleteRowButton.prototype.cssClass;

DeleteRowButton.prototype.bindableIn = {
    subformRow: true
};
DeleteRowButton.prototype.notUseInPages = [ 'delete' ];

DeleteRowButton.prototype.getTextsBundle = function(){

    return {
        title: {
            translate: false,
            text: 'Delete record'
        },
        content: undefined
    };
};

DeleteRowButton.prototype.run = function( event, subformInstance ){
    
    event.preventDefault();
    event.stopPropagation();
    
    subformInstance.deleteRow( event );
};

module.exports = DeleteRowButton;
