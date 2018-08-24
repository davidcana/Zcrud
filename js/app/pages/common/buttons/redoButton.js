/*
    RedoButton class
*/
"use strict";

var context = require( '../../../context.js' );

var RedoButton = function() {};

RedoButton.prototype.selector = '.zcrud-redo-command-button';

RedoButton.prototype.run = function( event, page ){
    
    event.preventDefault();
    event.stopPropagation();
    
    context.getHistory().redo( page.getId() );
};

module.exports = RedoButton;
