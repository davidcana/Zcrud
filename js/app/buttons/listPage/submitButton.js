/*
    SubmitButton class
*/
'use strict';

var Button = require( '../button.js' );

var SubmitButton = function( properties, parent ) {
    Button.call( this, properties, parent );
};
Button.doSuperClassOf( SubmitButton );

SubmitButton.prototype.type = 'list_submit';

SubmitButton.prototype.cssClass = 'zcrud-save-command-button';

//SubmitButton.prototype.selector = '.' + SubmitButton.prototype.cssClass;

SubmitButton.prototype.bindableIn = {
    listToolbar: true
};

SubmitButton.prototype.getTextsBundle = function(){

    return {
        title: undefined,
        content: {
            translate: true,
            text: 'button_save'
        }
    };
};

SubmitButton.prototype.run = function( event, listPage ){
    
    event.preventDefault();
    event.stopPropagation();
    
    listPage.getComponent( 'editing' ).submit( event );
};

module.exports = SubmitButton;
