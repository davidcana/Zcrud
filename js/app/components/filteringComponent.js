/* 
    FilteringComponent class
*/
'use strict';

var context = require( '../context.js' );
var Component = require( './component.js' );
var pageUtils = require( '../pages/pageUtils.js' );
var fieldUtils = require( '../fields/fieldUtils.js' );
var fieldListBuilder = require( '../fields/fieldListBuilder.js' );
var utils = require( '../utils.js' );

var FilteringComponent = function( optionsToApply, thisOptionsToApply, parentToApply ) {
    
    Component.call( this, optionsToApply, thisOptionsToApply, parentToApply );
    
    this.cssClass = 'zcrud-filter-panel';
    this.filterRecord = undefined;
    this.fullFilter = undefined;
    this.fields = undefined;
};
Component.doSuperClassOf( FilteringComponent );

FilteringComponent.prototype.getClass = function(){
    return this.cssClass;
};

FilteringComponent.prototype.getFilter = function(){
    return this.fullFilter;
};

FilteringComponent.prototype.bindEvents = function(){

    var instance = this;
    this.get$()
        .find( '.zcrud-filter-submit-button' )
        .off() // Remove previous event handlers
        .on( 
            'click',  
            function ( e ) {
                e.preventDefault();
                instance.filter();
            }
    );
};

FilteringComponent.prototype.filter = function(){
    
    var instance = this;
    this.processDirty(
        function(){
            instance.doFilter();
        }
    );
};

FilteringComponent.prototype.doFilter = function(){

    this.filterRecord = fieldUtils.buildRecord( 
        this.getFields(), 
        this.parent.get$() 
    );

    this.parent.goToFirstPage();

    this.updateParent();
};

FilteringComponent.prototype.addToDataToSend = function( dataToSend ){

    this.fullFilter = utils.extend( true, {}, this.filterRecord, dataToSend.filter );
    if ( ! utils.isEmptyObject( this.fullFilter ) ){
        dataToSend.filter = this.fullFilter;
    }
};

FilteringComponent.prototype.updateParent = function(){

    if ( this.parent.type == 'subform' ){
        this.parent.update(
            [
                this.parent.get$().find( 'thead' )[0],
                this.parent.get$().find( 'tbody' )[0],
                this.parent.getPagingComponent().get$()[0]
            ]
        );
        return;
    }
    
    this.parent.update();
};

FilteringComponent.prototype.get$ = function(){
    return this.parent.get$().find( '.' + this.cssClass );
};

FilteringComponent.prototype.getFields = function(){

    if ( ! this.fields ){
        this.fields = this.buildFields();
    }

    return this.fields;
};

FilteringComponent.prototype.buildFields = function(){

    var fieldsCache = fieldListBuilder.getForList( 
        this.thisOptions, 
        this.options, 
        this.parent.getFieldsSource() );
    return fieldsCache.fieldsArray;
};

FilteringComponent.prototype.filterIsOn = function(){

    if ( ! this.fullFilter ){
        return false;
    }

    for ( var index in this.fullFilter ){
        var filterFieldValue = this.fullFilter[ index ];
        if ( filterFieldValue != undefined ){
            return true;
        }
    }

    return false;
};

FilteringComponent.prototype.getInitialRecord = function(){
    return {};
};

FilteringComponent.prototype.getParent = function(){
    return this.parent;
};

FilteringComponent.prototype.validate = function(){
    
    if ( ! this.thisOptions.forceToFilter ){
        return true;
    }
    
    return this.filterIsOn()?
        true:
        {
            translate: true,
            message: 'forcedFilter'
        };
};

module.exports = FilteringComponent;
