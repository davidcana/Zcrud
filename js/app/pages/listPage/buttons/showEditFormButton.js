/*
    ShowEditFormButton class
*/
"use strict";

var ShowEditFormButton = function() {};

ShowEditFormButton.prototype.selector = '.zcrud-edit-command-button';

ShowEditFormButton.prototype.bindableIn = {
    listRow: true
};

ShowEditFormButton.prototype.run = function( event, listPage ){
    
    event.preventDefault();
    event.stopPropagation();
    
    listPage.showEditForm( event );
};

module.exports = ShowEditFormButton;
