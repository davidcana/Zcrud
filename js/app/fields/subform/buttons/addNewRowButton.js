/*
    AddNewRowButton class
*/
"use strict";

var AddNewRowButton = function() {};

AddNewRowButton.prototype.selector = '.zcrud-new-row-command-button';

AddNewRowButton.prototype.run = function( event, subformInstance, params ){
    
    event.preventDefault();
    event.stopPropagation();
    
    subformInstance.addNewRow( params );
};

module.exports = AddNewRowButton;
