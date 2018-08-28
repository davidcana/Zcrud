/*
    SaveButton class
*/
"use strict";

var Button = require( '../button.js' );

var SaveButton = function( properties, parent ) {
    Button.call( this, properties, parent );
};
Button.doSuperClassOf( SaveButton );

SaveButton.prototype.id = 'list_save';

SaveButton.prototype.selector = '.zcrud-save-command-button';

SaveButton.prototype.bindableIn = {
    listToolbar: true
};

SaveButton.prototype.getTextsBundle = function(){

    return {
        title: {
            translate: false,
            text: ''
        },
        content: {
            translate: true,
            text: 'Save'
        }
    };
};

SaveButton.prototype.run = function( event, listPage ){
    
    event.preventDefault();
    event.stopPropagation();
    
    listPage.getComponent( 'editing' ).save( event );
};

module.exports = SaveButton;
