/* 
    Component class
*/
"use strict";

var $ = require( 'jquery' );
var context = require( '../context.js' );

var Component = function( optionsToApply, thisOptionsToApply, parentToApply, pageToApply ) {
    
    this.options = optionsToApply;
    this.thisOptions = thisOptionsToApply;
    this.parent = parentToApply;
    this.page = pageToApply;
};

Component.prototype.processDirty = function( callback ){

    if ( ! this.parent.isDirty() ){
        callback();
        return;
    }

    // Component is dirty!
    var instance = this;
    context.confirm(
        this.options,
        {
            title: context.translate( 'dirtyPagingTitle' ),
            text: context.translate( 'dirtyPagingText' ),
            className: 'wideConfirm',
            buttons: {
                cancel: context.translate( 'dirtyPagingCancel' ),
                /*save: {
                        text: context.translate( 'dirtyPagingSave' ),
                        value: "save",
                    },*/
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

Component.prototype.getOptions = function(){
    return this.options;
};

Component.prototype.getThisOptions = function(){
    return this.thisOptions;
};

Component.prototype.getParent = function(){
    return this.parent;
};

Component.prototype.getPage = function(){
    return this.page;
};

Component.prototype.resetPage = function(){};
Component.prototype.addToDataToSend = function(){};
Component.prototype.dataFromServer = function(){};
Component.prototype.bindEvents = function(){};
Component.prototype.bindEventsIn1Row = function(){};

Component.doSuperClassOf = function( ChildClass ){

    ChildClass.prototype = new Component();
    ChildClass.prototype.constructor = ChildClass;
};

module.exports = Component;
