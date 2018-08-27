/*
    ShowDeleteFormButton class
*/
"use strict";

var Button = require( '../../../button.js' );

//var ShowDeleteFormButton = function() {};
var ShowDeleteFormButton = function( properties, parent ) {
    Button.call( this, properties, parent );
};
Button.doSuperClassOf( ShowDeleteFormButton );

ShowDeleteFormButton.prototype.selector = '.zcrud-delete-command-button';

ShowDeleteFormButton.prototype.bindableIn = {
    listRow: true
};

ShowDeleteFormButton.prototype.getTextsBundle = function(){

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

ShowDeleteFormButton.prototype.run = function( event, listPage ){
    
    event.preventDefault();
    event.stopPropagation();
    
    listPage.showDeleteForm( event );
};

module.exports = ShowDeleteFormButton;
