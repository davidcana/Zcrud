/*
    ShowCreateFormButton class
*/
"use strict";

var ShowCreateFormButton = function() {};

ShowCreateFormButton.prototype.selector = '.zcrud-new-command-button';

ShowCreateFormButton.prototype.run = function( event, listPage ){
    
    event.preventDefault();
    event.stopPropagation();
    
    listPage.showCreateForm( event );
};

module.exports = ShowCreateFormButton;
