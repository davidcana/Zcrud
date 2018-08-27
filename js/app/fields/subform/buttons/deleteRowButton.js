/*
    DeleteRowButton class
*/
"use strict";

var DeleteRowButton = function() {};

DeleteRowButton.prototype.selector = '.zcrud-delete-row-command-button';

DeleteRowButton.prototype.run = function( event, subformInstance ){
    
    event.preventDefault();
    event.stopPropagation();
    
    subformInstance.deleteRow( event );
};

module.exports = DeleteRowButton;
