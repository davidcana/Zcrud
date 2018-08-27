/*
    DeleteCommandButton class
*/
"use strict";

var Button = require( '../../button.js' );

//var DeleteCommandButton = function() {};
var DeleteCommandButton = function( properties, parent ) {
    Button.call( this, properties, parent );
};
Button.doSuperClassOf( DeleteCommandButton );

DeleteCommandButton.prototype.selector = '.zcrud-delete-command-button';

DeleteCommandButton.prototype.bindableIn = {
    subformRow: true
};

DeleteCommandButton.prototype.getTextsBundle = function(){

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

DeleteCommandButton.prototype.run = function( event, subformInstance ){
    
    event.preventDefault();
    event.stopPropagation();
    
    subformInstance.showNewFormUsingRecordFromServer( 'delete', event );
};

module.exports = DeleteCommandButton;
