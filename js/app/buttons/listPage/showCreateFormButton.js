/*
    ShowCreateFormButton class
*/

import { Button }  from '../button.js';

export const ShowCreateFormButton = function( properties, parent ) {
    Button.call( this, properties, parent );
};
Button.doSuperClassOf( ShowCreateFormButton );

ShowCreateFormButton.prototype.type = 'list_showCreateForm';

ShowCreateFormButton.prototype.cssClass = 'zcrud-new-command-button';

//ShowCreateFormButton.prototype.selector = '.' + ShowCreateFormButton.prototype.cssClass;

ShowCreateFormButton.prototype.bindableIn = {
    listToolbar: true
};

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

ShowCreateFormButton.prototype.run = function( event, listPage ){
    
    event.preventDefault();
    event.stopPropagation();
    
    listPage.showCreateForm( event );
};

