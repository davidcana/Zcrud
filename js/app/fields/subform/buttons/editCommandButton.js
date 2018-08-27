/*
    EditCommandButton class
*/
"use strict";

var Button = require( '../../../button.js' );

//var EditCommandButton = function() {};
var EditCommandButton = function( properties, parent ) {
    Button.call( this, properties, parent );
};
Button.doSuperClassOf( EditCommandButton );

EditCommandButton.prototype.selector = '.zcrud-edit-command-button';

EditCommandButton.prototype.bindableIn = {
    subformRow: true
};

EditCommandButton.prototype.getTextsBundle = function(){

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

EditCommandButton.prototype.run = function( event, subformInstance ){
    
    event.preventDefault();
    event.stopPropagation();
    
    subformInstance.showNewFormUsingRecordFromServer( 'update', event );
};

module.exports = EditCommandButton;
