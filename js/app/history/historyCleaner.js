/*
    HistoryCleaner class
*/
'use strict';

var HistoryCleaner = function() {
    
    var data = {};
    var offItems = {};

    var run = function( iterator ){
        
        buildData( iterator );
        analyzeData();
    };    
        
    var buildData = function( iterator ){
        
        data = {};
        
        var historyItem = iterator.next();
        
        while ( historyItem ){
            var items = historyItem.getAtomicItems();
            for ( var c = 0; c < items.length; c++ ){
                add( items[ c ] );
            }
            historyItem = iterator.next();
        }
    };
  
    var add = function( item ){
        
        var index = item.getRecordId();
        var entry = data[ index ];
        
        if ( ! entry ){
            entry = [];
            data[ index ] = entry;
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

    var historyItemIsOn = function( historyItem ){
        return ! offItems[ historyItem.getId() ];
    };
    
    return {
        run: run,
        historyItemIsOn: historyItemIsOn
    };
};

module.exports = HistoryCleaner;