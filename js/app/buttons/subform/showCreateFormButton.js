/*
    ShowCreateFormButton class
*/

//var Button = require( '../button.js' );
import { Button }  from '../button.js';

export const ShowCreateFormButton = function( properties, parent ) {
    Button.call( this, properties, parent );
};
Button.doSuperClassOf( ShowCreateFormButton );

ShowCreateFormButton.prototype.type = 'subform_showCreateForm';

ShowCreateFormButton.prototype.cssClass = 'zcrud-new-command-button';

//ShowCreateFormButton.prototype.selector = '.' + ShowCreateFormButton.prototype.cssClass;

ShowCreateFormButton.prototype.bindableIn = {
    subformToolbar: true
};
ShowCreateFormButton.prototype.notUseInPages = [ 'delete' ];

ShowCreateFormButton.prototype.getTextsBundle = function(){

    return {
        title: {
            translate: true,
            text: 'button_showCreateForm'
        },
        content: {
            translate: false,
            text: '+'
        }
    };
};

ShowCreateFormButton.prototype.run = function( event, subformInstance ){
    
    event.preventDefault();
    event.stopPropagation();
    
    subformInstance.showCreateForm( event );
};

//module.exports = ShowCreateFormButton;
