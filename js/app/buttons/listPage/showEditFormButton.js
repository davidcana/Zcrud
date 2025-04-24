/*
    ShowEditFormButton class
*/
'use strict';

var Button = require( '../button.js' );

var ShowEditFormButton = function( properties, parent ) {
    Button.call( this, properties, parent );
};
Button.doSuperClassOf( ShowEditFormButton );

ShowEditFormButton.prototype.type = 'list_showEditForm';

ShowEditFormButton.prototype.cssClass = 'zcrud-edit-command-button';

//ShowEditFormButton.prototype.selector = '.' + ShowEditFormButton.prototype.cssClass;

ShowEditFormButton.prototype.bindableIn = {
    listRow: true
};

ShowEditFormButton.prototype.getTextsBundle = function(){
    
    return {
        title: {
            translate: false,
            text: 'Edit record'
        },
        content: undefined
    };
};

ShowEditFormButton.prototype.run = function( event, listPage ){
    
    event.preventDefault();
    event.stopPropagation();
    
    listPage.showEditForm( event );
};

module.exports = ShowEditFormButton;
