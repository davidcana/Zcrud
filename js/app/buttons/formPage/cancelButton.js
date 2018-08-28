/*
    CancelButton class
*/
"use strict";

var Button = require( '../button.js' );

var CancelButton = function( properties, parent ) {
    Button.call( this, properties, parent );
};

Button.doSuperClassOf( CancelButton );

CancelButton.prototype.id = 'form_cancel';

CancelButton.prototype.selector = '.zcrud-form-cancel-command-button';

CancelButton.prototype.bindableIn = {
    formToolbar: true
};

CancelButton.prototype.getTextsBundle = function(){

    return {
        title: {
            translate: false,
            text: ''
        },
        content: {
            translate: true,
            text: 'Cancel'
        }
    };
};

CancelButton.prototype.run = function( event, formPage, $form ){
    
    event.preventDefault();
    event.stopPropagation();
    
    formPage.cancelForm( event, $form );
};

module.exports = CancelButton;
