/*
    ShowDeleteFormButton class
*/
"use strict";

var Button = require( '../button.js' );

var ShowDeleteFormButton = function( properties, parent ) {
    Button.call( this, properties, parent );
};
Button.doSuperClassOf( ShowDeleteFormButton );

ShowDeleteFormButton.prototype.type = 'subform_showDeleteForm';

ShowDeleteFormButton.prototype.cssClass = 'zcrud-delete-command-button';

//ShowDeleteFormButton.prototype.selector = '.' + ShowDeleteFormButton.prototype.cssClass;

ShowDeleteFormButton.prototype.bindableIn = {
    subformRow: true
};
ShowDeleteFormButton.prototype.notUseInPages = [ 'delete' ];

ShowDeleteFormButton.prototype.getTextsBundle = function(){

    return {
        title: {
            translate: false,
            text: 'Delete record'
        },
        content: undefined
    };
};

ShowDeleteFormButton.prototype.run = function( event, subformInstance ){
    
    event.preventDefault();
    event.stopPropagation();
    
    subformInstance.showNewFormUsingRecordFromServer( 'delete', event );
};

module.exports = ShowDeleteFormButton;
