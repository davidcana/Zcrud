/* 
    SortingComponent class
*/
'use strict';

var Component = require( './component.js' );
//var zzDOM = require( '../../../lib/zzDOM-closures-full.js' );
var zzDOM = require( 'zzdom' );
var $ = zzDOM.zz;

var SortingComponent = function( optionsToApply, thisOptionsToApply, parentToApply ) {

    Component.call( this, optionsToApply, thisOptionsToApply, parentToApply );
    
    this.localStorage = localStorage;
    this.sortFieldId = this.thisOptions.default.fieldId;
    this.sortType = this.thisOptions.default.type;
    this.sortFieldIdLocalStorageId = 'sort-field-id';
    this.sortTypeLocalStorageId = 'sort-type';
    
    this.loadSettings();
};
Component.doSuperClassOf( SortingComponent );

SortingComponent.prototype.loadSettings = function(){

    if ( ! this.options.saveUserPreferences || ! this.thisOptions.loadFromLocalStorage ) {
        return;
    }

    var sortFieldIdLocalStorage = this.localStorage.getItem( this.sortFieldIdLocalStorageId );
    if ( sortFieldIdLocalStorage ) {
        this.sortFieldId = sortFieldIdLocalStorage;
    }

    var sortTypeLocalStorage = this.localStorage.getItem( this.sortTypeLocalStorageId );
    if ( sortTypeLocalStorage ) {
        this.sortType = sortTypeLocalStorage;
    }
};

SortingComponent.prototype.saveSettings = function() {

    if ( ! this.options.saveUserPreferences ) {
        return;
    }

    this.localStorage.setItem( this.sortFieldIdLocalStorageId, this.sortFieldId );
    this.localStorage.setItem( this.sortTypeLocalStorageId, this.sortType );
};

SortingComponent.prototype.bindEvents = function(){

    var instance = this;
    this.parent.get$()
        .find( '.zcrud-column-header-sortable' )
        .off() // Remove previous event handlers
        .on(
            'click',  
            function ( e ) {
                e.preventDefault();
                instance.changeSort( 
                    $( this ).attr( 'data-sort-field-id' ),
                    $( this ).attr( 'data-sort-type' )
                );
            }
    );
};

SortingComponent.prototype.changeSort = function ( formFieldId, formType ) {

    var instance = this;
    this.processDirty(
        function(){
            instance.doChangeSort( formFieldId, formType );
        }
    );
};

SortingComponent.prototype.doChangeSort = function ( formFieldId, formType ) {

    // Update sortFieldId
    this.sortFieldId = formFieldId;

    // Update sortType
    if ( ! formType ){
        this.sortType = 'asc';
    } else {
        this.sortType = formType == 'asc'? 'desc': 'asc';
    }

    this.saveSettings();
    this.updateParent();
};

SortingComponent.prototype.updateParent = function(){

    if ( this.parent.type == 'subform' ){
        this.parent.update(
            [
                this.parent.get$().find( 'thead' )[ 0 ],
                this.parent.get$().find( 'tbody' )[ 0 ],
                this.parent.getPagingComponent().get$()[ 0 ]
            ]
        );
        return;
    }

    this.parent.show( 
        {
            root: [ $( '#' + this.parent.getThisOptions().tableId )[ 0 ] ] 
        }
    );
};

SortingComponent.prototype.addToDataToSend = function( dataToSend ){

    if ( this.sortFieldId ){
        dataToSend.sortFieldId = this.sortFieldId;
    }

    if ( this.sortType ){
        dataToSend.sortType = this.sortType;
    }
};

SortingComponent.prototype.getSortFieldId = function(){
    return this.sortFieldId;
};

SortingComponent.prototype.getSortType = function(){
    return this.sortType;
};

SortingComponent.prototype.getTypeForFieldId = function( fieldId ){
    return fieldId !== this.sortFieldId? null: this.sortType;
};

module.exports = SortingComponent;
