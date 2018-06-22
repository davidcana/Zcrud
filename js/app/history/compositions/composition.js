/*
    Composition class
*/
"use strict";

var $ = require( 'jquery' );
var context = require( '../../context.js' );

var Composition = function( itemsArray ) {
    
    var items = itemsArray || [];
    
    var add = function( item ){
        items.push( item );
    };
    
    /*
    var runMethod = function ( object, name ) {
        
        var args = Array.prototype.slice.call( arguments, 2 );
        return object[ name ].apply( object, args );
    }*/
    
    var runMethodForAll = function( name /*, args */ ){
        
        var args = Array.prototype.slice.call( arguments, 1 )[ 0 ];
        
        for ( var c = 0; c < items.length; ++c ){
            var thisItem = items[ c ];
            thisItem[ name ].apply( thisItem, args );
        }
    };
    
    var runMethodForAllUsingOr = function( name /*, args */ ){

        var args = Array.prototype.slice.call( arguments, 1 )[ 0 ];
        
        for ( var c = 0; c < items.length; ++c ){
            var thisItem = items[ c ];
            var value = thisItem[ name ].apply( thisItem, args );
            if ( value ){
                return true;
            }
        }
        
        return false;
    };

    var runMethodForAllUsingNotUndefined = function( name /*, args */ ){

        var args = Array.prototype.slice.call( arguments, 1 )[ 0 ];

        for ( var c = 0; c < items.length; ++c ){
            var thisItem = items[ c ];
            var value = thisItem[ name ].apply( thisItem, args );
            if ( value != undefined ){
                return value;
            }
        }

        return undefined;
    };
    
    var undo = function(){
        runMethodForAll.apply( this, [ 'undo' ] );
    };
    
    var redo = function(){
        runMethodForAll.apply( this, [ 'redo' ] );
    };
    
    var getNewValue = function(){
        return runMethodForAllUsingNotUndefined.apply( null, [ 'getNewValue', arguments ] );
    };
    
    var isRelatedToField = function(){
        return runMethodForAllUsingOr.apply( null, [ 'isRelatedToField', arguments ] );
    };
    
    var isRelatedToRow = function(){
        return runMethodForAllUsingOr.apply( null, [ 'isRelatedToRow', arguments ] );
    };
    
    var doAction = function(){
        runMethodForAll.apply( null, [ 'doAction', arguments ] );
    };
    
    var saveEnabled = function(){
        return true;
    };
    
    var isDirty = function(){
        return runMethodForAllUsingOr.apply( null, [ 'isDirty', arguments ] );
    };
    
    return {
        undo: undo,
        redo: redo,
        isRelatedToField: isRelatedToField,
        isRelatedToRow: isRelatedToRow,
        doAction: doAction,
        getNewValue: getNewValue,
        saveEnabled: saveEnabled,
        isDirty: isDirty,
        type: 'composition',
        add: add
    };
};

module.exports = Composition;