/* 
    Button class
    
    run: a function with the code to run
*/
"use strict";

var $ = require( 'jquery' );
var pageUtils = require( '../pages/pageUtils.js' );
var context = require( '../context.js' );

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
Button.prototype.getSelector = function(){
    return 'button.' + this.id;
};

Button.prototype.bindableIn = {};
Button.prototype.notUseInPages = [];

Button.prototype.disabled = false;

Button.prototype.textsBundle = undefined;
Button.prototype.getTextsBundle = function(){
    
    if ( this.textsBundle ){
        return this.textsBundle;
    }
    
    throw '"textsBundle" property not set in ' + this + '!';
};

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

Button.prototype.checkComponents = function(){
    
    var page = this.parent.getPage();
    var validationData = page.componentsMap.validate();
    if ( validationData === true ){
        return true;
    }
    
    context.showError( 
        page.getOptions(), 
        false, 
        validationData.message, 
        validationData.translate 
    );
    
    return false;
};

module.exports = Button;
