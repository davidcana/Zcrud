/* 
    Button class
    
    run: a function with the code to run
*/
"use strict";

var $ = require( 'jquery' );
var pageUtils = require( '../pages/pageUtils.js' );

var Button = function( properties, parentToSet ) {
    
    if ( properties ){
        $.extend( true, this, properties );
    }
    this.parent = parentToSet;
    this.id = 'button-' + pageUtils.generateId();
};

Button.prototype.type = '"type" not set in button!';

Button.prototype.cssClass = undefined;
Button.prototype.getCssClass = function(){
    return this.cssClass? this.cssClass: this.type;
};

Button.prototype.selector = undefined;
/*
Button.prototype.getSelector = function(){
    return this.selector? this.selector: 'button.' + this.getCssClass();
};*/
Button.prototype.getSelector = function(){
    return 'button.' + this.id;
};

Button.prototype.bindableIn = {};

Button.prototype.disabled = false;

Button.prototype.textsBundle = undefined;
Button.prototype.getTextsBundle = function(){
    
    if ( this.textsBundle ){
        return this.textsBundle;
    }
    
    throw '"textsBundle" property not set in ' + this + '!';
};
/*
Button.prototype.run = function(){
    throw '"run" method not implemented in ' + this + '!';
};
*/
Button.doSuperClassOf = function( ChildButtonClass ){
    
    ChildButtonClass.prototype = new Button();
    ChildButtonClass.prototype.constructor = ChildButtonClass;
};

Button.prototype.isBindable = function( type ){
    return !! this.bindableIn[ type ];
};

Button.prototype.toString = function(){
    return this.type + ' button (' + this.id + ')';
};

module.exports = Button;
