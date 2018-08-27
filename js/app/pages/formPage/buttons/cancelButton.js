/*
    CancelButton class
*/
"use strict";

//var Button = require( '../../../button.js' );
var context = require( '../../../context.js' );

var CancelButton = function() {};
/*
var CancelButton = function( properties ) {
    Button.call( this, properties );
};
CancelButton.prototype = new Button();
CancelButton.prototype.constructor = CancelButton;
*/
CancelButton.prototype.selector = '.zcrud-form-cancel-command-button';

CancelButton.prototype.bindableIn = {
    formMain: true
};

CancelButton.prototype.run = function( event, formPage, $form ){
    
    event.preventDefault();
    event.stopPropagation();
    
    formPage.cancelForm( event, $form );
};

module.exports = CancelButton;
