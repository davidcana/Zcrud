/*
    ShowDeleteFormButton class
*/
"use strict";

var ShowDeleteFormButton = function() {};

ShowDeleteFormButton.prototype.selector = '.zcrud-delete-command-button';

ShowDeleteFormButton.prototype.bindableIn = {
    listRow: true
};

ShowDeleteFormButton.prototype.run = function( event, listPage ){
    
    event.preventDefault();
    event.stopPropagation();
    
    listPage.showDeleteForm( event );
};

module.exports = ShowDeleteFormButton;
