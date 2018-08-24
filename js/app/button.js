/* 
    Button class
    
    cssClass: a string with the css class to find the button
    run: a function with the code to run
*/
"use strict";

var $ = require( 'jquery' );

var Button = function( properties ) {
    $.extend( true, this, properties );
};

Button.prototype.cssClass = 'cssClass not set!';

Button.prototype.run = function(){
    throw 'Run method not implemented!';
};

Button.prototype.runPrelude = function( event ){
    
    event.preventDefault();
    event.stopPropagation();
};

module.exports = Button;
