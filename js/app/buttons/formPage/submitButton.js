/*
    SubmitButton class
*/
"use strict";

var Button = require( '../button.js' );

var SubmitButton = function( properties, parent ) {
    Button.call( this, properties, parent );
};
Button.doSuperClassOf( SubmitButton );

SubmitButton.prototype.id = 'form_submit';

SubmitButton.prototype.cssClass = 'zcrud-form-submit-command-button';

SubmitButton.prototype.selector = '.' + SubmitButton.prototype.cssClass;

SubmitButton.prototype.bindableIn = {
    formToolbar: true
};

SubmitButton.prototype.getTextsBundle = function(){

    return {
        title: undefined,
        content: {
            translate: true,
            text: this.parent.getType() == 'delete'? 'Delete': 'Save' 
        }
    }
};

SubmitButton.prototype.run = function( event, formPage, $form ){
    
    event.preventDefault();
    event.stopPropagation();
    
    formPage.getSubmitFunction()( event, $form );
};

module.exports = SubmitButton;
