/*
    ShowCreateFormButton class
*/
"use strict";

var ShowCreateFormButton = function() {};

ShowCreateFormButton.prototype.selector = '.zcrud-new-command-button';

ShowCreateFormButton.prototype.run = function( event, subformInstance ){
    
    event.preventDefault();
    event.stopPropagation();
    
    subformInstance.showCreateForm( event );
};

module.exports = ShowCreateFormButton;
