/*
    UndoButton class
*/
"use strict";

var context = require( '../../../context.js' );

var UndoButton = function() {};

UndoButton.prototype.selector = '.zcrud-undo-command-button';

UndoButton.prototype.run = function( event, formPage, $form ){
    
    event.preventDefault();
    event.stopPropagation();
    
    context.getHistory().undo( formPage.getId() );
};

module.exports = UndoButton;
