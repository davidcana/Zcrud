/*
    SubmitButton class
*/
"use strict";

var SubmitButton = function() {};

SubmitButton.prototype.selector = '.zcrud-form-submit-command-button';

SubmitButton.prototype.run = function( event, formPage, $form ){
    
    event.preventDefault();
    event.stopPropagation();
    
    formPage.getSubmitFunction()( event, $form );
};

module.exports = SubmitButton;
