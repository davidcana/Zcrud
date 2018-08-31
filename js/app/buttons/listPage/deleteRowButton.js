/*
    DeleteRowButton class
*/
"use strict";

var Button = require( '../button.js' );

var DeleteRowButton = function( properties, parent ) {
    Button.call( this, properties, parent );
};
Button.doSuperClassOf( DeleteRowButton );

DeleteRowButton.prototype.id = 'list_deleteRow';

DeleteRowButton.prototype.cssClass = 'zcrud-delete-row-command-button';

//DeleteRowButton.prototype.selector = '.' + DeleteRowButton.prototype.cssClass;

DeleteRowButton.prototype.bindableIn = {
    listRow: true
};

DeleteRowButton.prototype.getTextsBundle = function(){

    return {
        title: {
            translate: false,
            text: 'Delete record'
        },
        content: undefined
    };
};

DeleteRowButton.prototype.run = function( event, listPage ){
    
    event.preventDefault();
    event.stopPropagation();
    
    listPage.getComponent( 'editing' ).deleteRow( event );
};

module.exports = DeleteRowButton;
