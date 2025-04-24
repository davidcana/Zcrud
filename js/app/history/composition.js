/*
    Composition class
*/
'use strict';

var context = require( '../context.js' );
var AbstractHistoryAction = require( './abstractHistoryAction.js' );

var Composition = function( historyToApply ) {
    
    AbstractHistoryAction.call( this, historyToApply );
    
    this.items = [];
};

Composition.prototype = new AbstractHistoryAction();
Composition.prototype.constructor = Composition;

Composition.prototype.add = function( item ){
    this.items.push( item );
};

Composition.prototype.runMethodForAll = function( name /*, args */ ){

    var args = Array.prototype.slice.call( arguments, 1 )[ 0 ];

    for ( var c = 0; c < this.items.length; ++c ){
        var thisItem = this.items[ c ];
        thisItem[ name ].apply( thisItem, args );
    }
};

Composition.prototype.runMethodForAllUsingOr = function( name /*, args */ ){

    var args = Array.prototype.slice.call( arguments, 1 )[ 0 ];

    for ( var c = 0; c < this.items.length; ++c ){
        var thisItem = this.items[ c ];
        var value = thisItem[ name ].apply( thisItem, args );
        if ( value ){
            return true;
        }
    }

    return false;
};

Composition.prototype.runMethodForAllUsingNotUndefined = function( name /*, args */ ){

    var args = Array.prototype.slice.call( arguments, 1 )[ 0 ];

    for ( var c = 0; c < this.items.length; ++c ){
        var thisItem = this.items[ c ];
        var value = thisItem[ name ].apply( thisItem, args );
        if ( value != undefined ){
            return value;
        }
    }

    return undefined;
};

Composition.prototype.undo = function(){
    this.runMethodForAll.apply( this, [ 'undo' ] );
};

Composition.prototype.redo = function(){
    this.runMethodForAll.apply( this, [ 'redo' ] );
};

/*
Composition.prototype.getNewValue = function( name ){
    return this.runMethodForAllUsingNotUndefined.apply( this, [ 'getNewValue', arguments ] );
};*/
Composition.prototype.getNewValue = function( rowIndexToGet, nameToGet, subformNameToGet, subformRowIndexToGet ){
    
    for ( var c = 0; c < this.items.length; ++c ){
        var item = this.items[ c ];
        if ( item.isRelatedToField( rowIndexToGet, nameToGet, subformNameToGet, subformRowIndexToGet ) ){
            return item.getNewValue( rowIndexToGet, nameToGet, subformNameToGet, subformRowIndexToGet );
        }
    }
    
    return undefined;
};

Composition.prototype.isRelatedToField = function(){
    return this.runMethodForAllUsingOr.apply( this, [ 'isRelatedToField', arguments ] );
};

Composition.prototype.isRelatedToRow = function(){
    return this.runMethodForAllUsingOr.apply( this, [ 'isRelatedToRow', arguments ] );
};

Composition.prototype.doAction = function(){
    this.runMethodForAll.apply( this, [ 'doAction', arguments ] );
};

Composition.prototype.doActionIfNotOff = function(){
    this.runMethodForAll.apply( this, [ 'doActionIfNotOff', arguments ] );
};

Composition.prototype.saveEnabled = function(){
    return true;
};

Composition.prototype.isDirty = function(){
    return this.runMethodForAllUsingOr.apply( this, [ 'isDirty', arguments ] );
};

Composition.prototype.getAtomicItems = function(){
    
    var result = [];
    
    for ( var c = 0; c < this.items.length; ++c ){
        var item = this.items[ c ];
        result = result.concat( item.getAtomicItems() );
    }
    
    return result;
};

Composition.prototype.getCreationItems = function( subformId ){
    
    var result = [];

    for ( var c = 0; c < this.items.length; ++c ){
        var item = this.items[ c ];
        result = result.concat( item.getCreationItems( subformId ) );
    }

    return result;
};

Composition.prototype.type = 'composition';

module.exports = Composition;