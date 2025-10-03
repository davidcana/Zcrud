/*
    AddNewRowButton class
*/

import { Button }  from '../button.js';

export const AddNewRowButton = function( properties, parent ) {
    Button.call( this, properties, parent );
};
Button.doSuperClassOf( AddNewRowButton );

AddNewRowButton.prototype.type = 'list_addNewRow';

AddNewRowButton.prototype.cssClass = 'zcrud-new-row-command-button';

//AddNewRowButton.prototype.selector = '.' + AddNewRowButton.prototype.cssClass;

AddNewRowButton.prototype.bindableIn = {
    listToolbar: true
};

AddNewRowButton.prototype.getTextsBundle = function(){

    return {
        title: {
            translate: true,
            text: 'button_addNewRow'
        },
        content: {
            translate: false,
            text: '+'
        }
    };
};

AddNewRowButton.prototype.run = function( event, listPage ){
    
    event.preventDefault();
    event.stopPropagation();
    
    listPage.getComponent( 'editing' ).addNewRow( event );
};

