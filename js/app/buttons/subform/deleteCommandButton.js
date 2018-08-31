/*
    DeleteCommandButton class
*/
"use strict";

var Button = require( '../button.js' );

var DeleteCommandButton = function( properties, parent ) {
    Button.call( this, properties, parent );
};
Button.doSuperClassOf( DeleteCommandButton );

DeleteCommandButton.prototype.id = 'subform_deleteCommand';

DeleteCommandButton.prototype.cssClass = 'zcrud-delete-command-button';

//DeleteCommandButton.prototype.selector = '.' + DeleteCommandButton.prototype.cssClass;

DeleteCommandButton.prototype.bindableIn = {
    subformRow: true
};

DeleteCommandButton.prototype.getTextsBundle = function(){

    return {
        title: {
            translate: false,
            text: 'Delete record'
        },
        content: undefined
    };
};

DeleteCommandButton.prototype.run = function( event, subformInstance ){
    
    event.preventDefault();
    event.stopPropagation();
    
    subformInstance.showNewFormUsingRecordFromServer( 'delete', event );
};

module.exports = DeleteCommandButton;
