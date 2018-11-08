/* 
    Page class
*/
"use strict";

var $ = require( 'jquery' );
var context = require( '../context.js' );
var pageUtils = require( './pageUtils.js' );
var buttonUtils = require( '../buttons/buttonUtils.js' );

var Page = function( optionsToApply, userDataToApply ) {
    
    this.options = optionsToApply;
    
    this.fieldsMap = {};
    this.fields = [];
    this.toolbarButtons = undefined;
    this.componentsMap = undefined;
};

Page.prototype.initFromOptions = function(){
    throw 'initFromOptions method not implemented in Page class!';
};

Page.prototype.configure = function(){
    throw 'configure method not implemented in Page class!';
};

Page.prototype.processConfirm = function( callback ){

    if ( ! this.parent.isDirty() ){
        callback();
        return;
    }

    // Page is dirty!
    var instance = this;
    context.confirm(
        this.options,
        {
            title: context.translate( 'dirtyPagingTitle' ),
            text: context.translate( 'dirtyPagingText' ),
            className: 'wideConfirm',
            buttons: {
                cancel: context.translate( 'dirtyPagingCancel' ),
                discard: {
                    text: context.translate( 'dirtyPagingDiscard' ),
                    value: 'discard',
                }
            }
        },
        function( value ){
            if ( value == 'discard' ) {
                instance.parent.removeChanges();
                callback();
            }
        }
    );
};

Page.prototype.getOptions = function(){
    return this.options;
};

Page.prototype.getThisOptions = function(){
    return this.thisOptions;
};

Page.prototype.show = function(){
    throw 'show method not implemented in Page class!';
};

Page.prototype.getDictionary = function(){
    return this.dictionary;
};

Page.prototype.getType = function(){
    throw 'getType method not implemented in Page class!';
};

Page.prototype.getId = function(){
    return this.id;
};

Page.prototype.getFields = function(){
    return this.fields;
};
Page.prototype.getField = function(){
    throw 'getField method not implemented in Page class!';
};
Page.prototype.getFieldByName = function(){
    throw 'getFieldByName method not implemented in Page class!';
};

Page.prototype.get$form = function(){
    throw 'get$form method not implemented in Page class!';
};

Page.prototype.getKey = function(){
    return this.thisOptions.key || this.options.key;
};

Page.prototype.get$ = function(){
    return $( '#' + this.id );
};

Page.prototype.isReadOnly = function(){
    throw 'isReadOnly method not implemented in Page class!';
};

Page.prototype.getPageToolbarButtons = function( type ){

    if ( this.toolbarButtons == undefined ){
        this.toolbarButtons = buttonUtils.getButtonList( 
            this.thisOptions.buttons.toolbar, 
            type,
            this,
            this.options );
    }

    return this.toolbarButtons;
};

Page.prototype.getComponentMap = function(){
    return this.componentsMap;
};
Page.prototype.getComponent = function( id ){
    return this.componentsMap.getComponent( id );
};
Page.prototype.getSecureComponent = function( id ){
    return this.componentsMap.getSecureComponent( id );
};

Page.prototype.getName = function(){
    return this.options.entityId;     
};

Page.prototype.getField = function(){
    throw 'getField method not implemented in Page class!';
};
Page.prototype.getFieldByName = function(){
    throw 'getFieldByName method not implemented in Page class!';
};
Page.prototype.getFieldsSource = function(){
    return this.options.fields;
};

Page.prototype.isDirty = function(){

    var history = context.getHistory();
    return history? history.isDirty(): false;
};

Page.prototype.update = function(){
    throw 'update method not implemented in Page class!';
};

Page.prototype.removeChanges = function(){
    throw 'removeChanges method not implemented in Page class!';
};

Page.prototype.goToFirstPage = function(){
    throw 'goToFirstPage method not implemented in Page class!';
};

Page.prototype.showStatusMessage = function( dictionaryExtension ){
    
    pageUtils.showStatusMessage( 
        this.get$(), 
        this.dictionary, 
        dictionaryExtension, 
        context 
    );
};

Page.doSuperClassOf = function( ChildClass ){

    ChildClass.prototype = new Page();
    ChildClass.prototype.constructor = ChildClass;
};

module.exports = Page;
