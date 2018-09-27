/* 
    FilteringComponent class
*/
"use strict";

var $ = require( 'jquery' );
var context = require( '../context.js' );
var Component = require( './component.js' );
var pageUtils = require( '../pages/pageUtils.js' );
var fieldUtils = require( '../fields/fieldUtils.js' );
var fieldListBuilder = require( '../fields/fieldListBuilder.js' );

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
        .click( 
        function ( e ) {
            e.preventDefault();
            instance.filter();
        }
    );
};

FilteringComponent.prototype.filter = function(){
    
    var instance = this;
    var pagingComponent = this.parent.getComponent( 'paging' );
    if ( pagingComponent ){
        pagingComponent.processDirty(
            function(){
                instance.doFilter( pagingComponent );
            }
        );
    } else {
        instance.doFilter();
    }
};

FilteringComponent.prototype.doFilter = function( pagingComponent ){

    this.filterRecord = fieldUtils.buildRecord( 
        this.getFields(), 
        this.parent.get$() 
    );

    if ( pagingComponent ){
        pagingComponent.goToFirstPage();
    }

    this.updateParent();
};

FilteringComponent.prototype.addToDataToSend = function( dataToSend ){

    this.fullFilter = $.extend( true, {}, this.filterRecord, dataToSend.filter );
    if ( ! $.isEmptyObject( this.fullFilter ) ){
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

    // Get root
    var pagingComponent = this.parent.getComponent( 'paging' );
    var root = pagingComponent?
        [ 
            $( '#' + this.parent.getThisOptions().tbodyId )[0], 
            pagingComponent.get$()[0] 
        ]:
    [ 
        $( '#' + this.parent.getThisOptions().tbodyId )[0]
    ];

    // Show list page
    this.parent.show( 
        {
            root: root
        }
    );
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

module.exports = FilteringComponent;
