/*
    DeleteRowButton class
*/

import { Button }  from '../button.js';

export const DeleteRowButton = function( properties, parent ) {
    Button.call( this, properties, parent );
};
Button.doSuperClassOf( DeleteRowButton );

DeleteRowButton.prototype.type = 'list_deleteRow';

DeleteRowButton.prototype.cssClass = 'zcrud-delete-row-command-button';

//DeleteRowButton.prototype.selector = '.' + DeleteRowButton.prototype.cssClass;

DeleteRowButton.prototype.bindableIn = {
    listRow: true
};

DeleteRowButton.prototype.getTextsBundle = function(){

    return {
        title: {
            translate: true,
            text: 'button_deleteRow'
            //text: 'Delete record'
        },
        content: undefined
    };
};

DeleteRowButton.prototype.run = function( event, listPage ){
    
    event.preventDefault();
    event.stopPropagation();
    
    listPage.getComponent( 'editing' ).deleteRow( event );
};

