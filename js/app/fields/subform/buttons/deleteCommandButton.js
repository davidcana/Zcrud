/*
    DeleteCommandButton class
*/
"use strict";

var DeleteCommandButton = function() {};

DeleteCommandButton.prototype.selector = '.zcrud-delete-command-button';

DeleteCommandButton.prototype.bindableIn = {
    subformRow: true
};

DeleteCommandButton.prototype.run = function( event, subformInstance ){
    
    event.preventDefault();
    event.stopPropagation();
    
    subformInstance.showNewFormUsingRecordFromServer( 'delete', event );
};

module.exports = DeleteCommandButton;
