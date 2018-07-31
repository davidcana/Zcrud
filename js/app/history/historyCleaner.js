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
            var items = historyItem.getAtomicItems();
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
        
        for ( var recordId in data ){
            var recordItems = data[ recordId ];
            
            var firstItemIsCreate = recordItems[ 0 ].type == 'create';
            var lastItemIsDelete = recordItems[ recordItems.length - 1 ].type == 'delete';
            
            if ( lastItemIsDelete ){
                offBeforeDeleteItems( recordItems, firstItemIsCreate );
            } else if ( firstItemIsCreate ){
                offChangeItems( recordItems );
            }
        }
    };
    
    var offBeforeDeleteItems = function( recordItems, firstItemIsCreate ){
        
        // Don't include last item in loop!
        for ( var c = 0; c < recordItems.length - 1; c++ ){
            var item = recordItems[ c ];
            offItems[ item.getId() ] = true;
        }
        
        // If the first item is a create item the delete item (the last one) must also be off
        if ( firstItemIsCreate ){
            item = recordItems[ recordItems.length - 1 ];
            offItems[ item.getId() ] = true;
        }
    };
    
    var offChangeItems = function( recordItems ){
        
        var createItem = recordItems[ 0 ];
        
        // Update createItem and off the change
        // Don't include first item in loop! (it is the create item)
        for ( var c = 1; c < recordItems.length; c++ ){
            var item = recordItems[ c ];
            createItem.updateFromChange( item );
            offItems[ item.getId() ] = true;
        }
    };
    
    var historyItemIsOff = function( historyItem ){
        return ! offItems[ historyItem.getId() ];
    };
    
    return {
        run: run,
        historyItemIsOff: historyItemIsOff
    };
};

module.exports = HistoryCleaner;