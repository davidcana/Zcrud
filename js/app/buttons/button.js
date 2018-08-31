/* 
    Button class
    
    run: a function with the code to run
*/
"use strict";

var $ = require( 'jquery' );

var Button = function( properties, parentToSet ) {
    
    if ( properties ){
        $.extend( true, this, properties );
    }
    this.parent = parentToSet;
};

Button.prototype.id = '"id" not set!';

Button.prototype.cssClass = undefined;
Button.prototype.getCssClass = function(){
    return this.cssClass? this.cssClass: this.id;
};

Button.prototype.selector = undefined;
Button.prototype.getSelector = function(){
    return this.selector? this.selector: 'button.' + this.getCssClass();
};

Button.prototype.bindableIn = {};

Button.prototype.disabled = false;

Button.prototype.textsBundle = undefined;
Button.prototype.getTextsBundle = function(){
    
    if ( this.textsBundle ){
        return this.textsBundle;
    }
    
    throw '"textsBundle" property not set!';
};

Button.prototype.run = function(){
    throw '"Run" method not implemented!';
};

Button.doSuperClassOf = function( ChildButtonClass ){
    
    ChildButtonClass.prototype = new Button();
    ChildButtonClass.prototype.constructor = ChildButtonClass;
};

Button.prototype.isBindable = function( type ){
    return !! this.bindableIn[ type ];
};

Button.prototype.toString = function(){
    return this.id + " button";
};

module.exports = Button;
