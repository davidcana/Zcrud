/*
    DeleteRowButton class
*/
"use strict";

var Button = require( '../../../button.js' );

//var DeleteRowButton = function() {};
var DeleteRowButton = function( properties, parent ) {
    Button.call( this, properties, parent );
};
Button.doSuperClassOf( DeleteRowButton );

DeleteRowButton.prototype.selector = '.zcrud-delete-row-command-button';

DeleteRowButton.prototype.bindableIn = {
    listRow: true
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

DeleteRowButton.prototype.run = function( event, listPage ){
    
    event.preventDefault();
    event.stopPropagation();
    
    listPage.getComponent( 'editing' ).deleteRow( event );
};

module.exports = DeleteRowButton;
