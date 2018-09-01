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

RedoButton.prototype.type = 'redo';

RedoButton.prototype.cssClass = 'zcrud-redo-command-button';

//RedoButton.prototype.selector = '.' + RedoButton.prototype.cssClass;

RedoButton.prototype.bindableIn = {
    formToolbar: true,
    listToolbar: true
};

RedoButton.prototype.disabled = true;

RedoButton.prototype.getTextsBundle = function(){

    return {
        title: undefined,
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
