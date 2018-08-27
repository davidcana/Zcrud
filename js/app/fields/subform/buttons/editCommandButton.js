/*
    EditCommandButton class
*/
"use strict";

var EditCommandButton = function() {};

EditCommandButton.prototype.selector = '.zcrud-edit-command-button';

EditCommandButton.prototype.run = function( event, subformInstance ){
    
    event.preventDefault();
    event.stopPropagation();
    
    subformInstance.showNewFormUsingRecordFromServer( 'update', event );
};

module.exports = EditCommandButton;
