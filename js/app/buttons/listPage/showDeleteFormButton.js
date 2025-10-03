/*
    ShowDeleteFormButton class
*/

import { Button }  from '../button.js';

export const ShowDeleteFormButton = function( properties, parent ) {
    Button.call( this, properties, parent );
};
Button.doSuperClassOf( ShowDeleteFormButton );

ShowDeleteFormButton.prototype.type = 'list_showDeleteForm';

ShowDeleteFormButton.prototype.cssClass = 'zcrud-delete-command-button';

//ShowDeleteFormButton.prototype.selector = '.' + ShowDeleteFormButton.prototype.cssClass;

ShowDeleteFormButton.prototype.bindableIn = {
    listRow: true
};

ShowDeleteFormButton.prototype.getTextsBundle = function(){

    return {
        title: {
            translate: true,
            text: 'button_showDeleteForm'
            //text: 'Delete record'
        },
        content: undefined
    };
};

ShowDeleteFormButton.prototype.run = function( event, listPage ){
    
    event.preventDefault();
    event.stopPropagation();
    
    listPage.showDeleteForm( event );
};

