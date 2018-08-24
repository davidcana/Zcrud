/*
    DeleteRowButton class
*/
"use strict";

var DeleteRowButton = function() {};

DeleteRowButton.prototype.selector = '.zcrud-delete-row-command-button';

DeleteRowButton.prototype.run = function( event, listPage ){
    
    event.preventDefault();
    event.stopPropagation();
    
    listPage.getComponent( 'editing' ).deleteRow( event );
};

module.exports = DeleteRowButton;
