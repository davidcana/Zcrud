/*
    CancelButton class
*/

//var Button = require( '../button.js' );
import { Button }  from '../button.js';

export const CancelButton = function( properties, parent ) {
    Button.call( this, properties, parent );
};

Button.doSuperClassOf( CancelButton );

CancelButton.prototype.type = 'form_cancel';

CancelButton.prototype.cssClass = 'zcrud-form-cancel-command-button';

//CancelButton.prototype.selector = '.' + CancelButton.prototype.cssClass;

CancelButton.prototype.bindableIn = {
    formToolbar: true
};

CancelButton.prototype.getTextsBundle = function(){

    return {
        title: undefined,
        content: {
            translate: true,
            text: 'button_cancel'
        }
    };
};

CancelButton.prototype.run = function( event, formPage, $form ){
    
    event.preventDefault();
    event.stopPropagation();
    
    formPage.cancelForm( event, $form );
};

//module.exports = CancelButton;
