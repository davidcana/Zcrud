/*
    RedoButton class
*/
"use strict";

var context = require( '../../../context.js' );

var RedoButton = function() {};

RedoButton.prototype.selector = '.zcrud-redo-command-button';

RedoButton.prototype.run = function( event, formPage, $form ){
    
    event.preventDefault();
    event.stopPropagation();
    
    context.getHistory().redo( formPage.getId() );
};

module.exports = RedoButton;
