/*
    HistoryCleaner class
*/
"use strict";

var $ = require( 'jquery' );
var context = require( '../context.js' );

var HistoryCleaner = function( historyToApply ) {
    
    var history = historyToApply;
    var data;
    var offItems;

    var run = function(){
        
        data = {};
        buildData();
        analyzeData();
    };    
        
    var buildData = function(){
        
        var iterator = history.buildIterator();
        
        for ( var historyItem = iterator.next(); historyItem; iterator.next() ){
            var items = historyItem.getAtomicItems(); // TODO Add getAtomicItems method to all history classes
            for ( var c = 0; c < items.length; c++ ){
                add( items[ c ] );
            }
        }
    };
  
    var add = function( item ){
        
        var entry = data[ item.getRecordId() ]; // TODO Add getRecordId to all history classes
        
        if ( ! entry ){
            data[ item.getId() ] = [];
        }
        
        entry.push( item );
    };
    
    var analyzeData = function(){
        
        offItems = {};
        
        for( var recordId in data ){
            var recordItems = data[ recordId ];
            var lastItem = recordItems[ recordItems.length - 1 ];
            if ( lastItem.type == 'delete' ){
                offBeforeDeleteItems( recordItems );
            }
        }
    };
    
    var offBeforeDeleteItems = function( recordItems ){
        
        // Don't include last item in loop!
        for ( var c = 0; c < recordItems.length - 1; c++ ){
            var item = recordItems[ c ];
            offItems[ item.getId() ] = true;
        }
        
        // If the first item is a create item the delete item (the last one) must also be off
        if ( recordItems[ 0 ].type == 'create' ){
            item = recordItems[ recordItems.length - 1 ];
            offItems[ item.getId() ] = true;
        }
    };
    
    var historyItemIsOff = function( historyItem ){
        return ! offItems[ historyItem.getId() ]; // TODO Add getId to all history classes
    };
    
    return {
        run: run,
        historyItemIsOff: historyItemIsOff
    };
};

module.exports = HistoryCleaner;