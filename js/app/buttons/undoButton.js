/*
    UndoButton class
*/
'use strict';

var context = require( '../context.js' );
var Button = require( './button.js' );

var UndoButton = function( properties, parent ) {
    Button.call( this, properties, parent );
};
Button.doSuperClassOf( UndoButton );

UndoButton.prototype.type = 'undo';

UndoButton.prototype.cssClass = 'zcrud-undo-command-button';

//UndoButton.prototype.selector = '.' + UndoButton.prototype.cssClass;

UndoButton.prototype.bindableIn = {
    formToolbar: true,
    listToolbar: true
};

UndoButton.prototype.disabled = true;

UndoButton.prototype.getTextsBundle = function(){

    return {
        title: undefined,
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
