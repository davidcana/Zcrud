/*
    RedoButton class
*/
"use strict";

var context = require( '../context.js' );
var Button = require( './button.js' );

var RedoButton = function( properties, parent ) {
    Button.call( this, properties, parent );
};
Button.doSuperClassOf( RedoButton );

RedoButton.prototype.id = 'redoButton';

RedoButton.prototype.selector = '.zcrud-redo-command-button';

RedoButton.prototype.bindableIn = {
    formToolbar: true,
    listToolbar: true
};

RedoButton.prototype.getTextsBundle = function(){

    return {
        title: {
            translate: false,
            text: ''
        },
        content: {
            translate: true,
            text: 'Redo'
        }
    };
};

RedoButton.prototype.run = function( event, page ){
    
    event.preventDefault();
    event.stopPropagation();
    
    context.getHistory().redo( page.getId() );
};

module.exports = RedoButton;
