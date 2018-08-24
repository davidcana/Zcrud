/*
    SaveButton class
*/
"use strict";

var SaveButton = function() {};

SaveButton.prototype.selector = '.zcrud-save-command-button';

SaveButton.prototype.run = function( event, listPage ){
    
    event.preventDefault();
    event.stopPropagation();
    
    listPage.getComponent( 'editing' ).save( event );
};

module.exports = SaveButton;
