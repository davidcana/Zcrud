/*
    SaveButton class
*/
"use strict";

var Button = require( '../button.js' );

var SaveButton = function( properties, parent ) {
    Button.call( this, properties, parent );
};
Button.doSuperClassOf( SaveButton );

SaveButton.prototype.type = 'list_save';

SaveButton.prototype.cssClass = 'zcrud-save-command-button';

//SaveButton.prototype.selector = '.' + SaveButton.prototype.cssClass;

SaveButton.prototype.bindableIn = {
    listToolbar: true
};

SaveButton.prototype.getTextsBundle = function(){

    return {
        title: undefined,
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
