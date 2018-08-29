/*
    ShowDeleteFormButton class
*/
"use strict";

var Button = require( '../button.js' );

var ShowDeleteFormButton = function( properties, parent ) {
    Button.call( this, properties, parent );
};
Button.doSuperClassOf( ShowDeleteFormButton );

ShowDeleteFormButton.prototype.id = 'list_showDeleteForm';

ShowDeleteFormButton.prototype.cssClass = 'zcrud-delete-command-button';

ShowDeleteFormButton.prototype.selector = '.' + ShowDeleteFormButton.prototype.cssClass;

ShowDeleteFormButton.prototype.bindableIn = {
    listRow: true
};

ShowDeleteFormButton.prototype.getTextsBundle = function(){

    return {
        title: {
            translate: false,
            text: 'Delete record'
        },
        content: undefined
    };
};

ShowDeleteFormButton.prototype.run = function( event, listPage ){
    
    event.preventDefault();
    event.stopPropagation();
    
    listPage.showDeleteForm( event );
};

module.exports = ShowDeleteFormButton;
