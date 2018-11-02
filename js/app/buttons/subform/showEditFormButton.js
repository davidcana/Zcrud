/*
    ShowEditFormButton class
*/
"use strict";

var Button = require( '../button.js' );

var ShowEditFormButton = function( properties, parent ) {
    Button.call( this, properties, parent );
};
Button.doSuperClassOf( ShowEditFormButton );

ShowEditFormButton.prototype.type = 'subform_showEditForm';

ShowEditFormButton.prototype.cssClass = 'zcrud-edit-command-button';

//ShowEditFormButton.prototype.selector = '.' + ShowEditFormButton.prototype.cssClass;

ShowEditFormButton.prototype.bindableIn = {
    subformRow: true
};
ShowEditFormButton.prototype.notUseInPages = [ 'delete' ];

ShowEditFormButton.prototype.getTextsBundle = function(){

    return {
        title: {
            translate: false,
            text: 'Edit record'
        },
        content: undefined
    };
};

ShowEditFormButton.prototype.run = function( event, subformInstance ){
    
    event.preventDefault();
    event.stopPropagation();
    
    subformInstance.showNewFormUsingRecordFromServer( 'update', event );
};

module.exports = ShowEditFormButton;
