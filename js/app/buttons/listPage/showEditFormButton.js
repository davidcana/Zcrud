/*
    ShowEditFormButton class
*/
"use strict";

var Button = require( '../button.js' );

var ShowEditFormButton = function( properties, parent ) {
    Button.call( this, properties, parent );
};
Button.doSuperClassOf( ShowEditFormButton );

ShowEditFormButton.prototype.id = 'list_showEditFormButton';

ShowEditFormButton.prototype.selector = '.zcrud-edit-command-button';

ShowEditFormButton.prototype.bindableIn = {
    listRow: true
};

ShowEditFormButton.prototype.getTextsBundle = function(){
    
    return {
        title: {
            translate: false,
            text: 'Edit record'
        },
        content: {
            translate: false,
            text: ''
        }
    };
};

ShowEditFormButton.prototype.run = function( event, listPage ){
    
    event.preventDefault();
    event.stopPropagation();
    
    listPage.showEditForm( event );
};

module.exports = ShowEditFormButton;
