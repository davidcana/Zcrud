/*
    AddNewRowButton class
*/
"use strict";

var AddNewRowButton = function() {};

AddNewRowButton.prototype.selector = '.zcrud-new-row-command-button';

AddNewRowButton.prototype.run = function( event, listPage ){
    
    event.preventDefault();
    event.stopPropagation();
    
    listPage.getComponent( 'editing' ).addNewRow( event );
};

module.exports = AddNewRowButton;
