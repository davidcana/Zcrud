/*
    UndoButton class
*/
"use strict";

var context = require( '../context.js' );
var Button = require( '../button.js' );

//var UndoButton = function() {};
var UndoButton = function( properties, parent ) {
    Button.call( this, properties, parent );
};
Button.doSuperClassOf( UndoButton );

UndoButton.prototype.selector = '.zcrud-undo-command-button';

UndoButton.prototype.bindableIn = {
    formToolbar: true,
    listToolbar: true
};

UndoButton.prototype.getTextsBundle = function(){

    return {
        title: {
            translate: false,
            text: ''
        },
        content: {
            translate: true,
            text: 'Undo'
        }
    };
};

UndoButton.prototype.run = function( event, page ){
    
    event.preventDefault();
    event.stopPropagation();
    
    context.getHistory().undo( page.getId() );
};

module.exports = UndoButton;
