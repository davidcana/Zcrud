/* 
    eventsManager singleton class
*/
module.exports = (function() {
    "use strict";
    
    var events = undefined;
    
    var setEvents = function( eventsToApply ){
        events = eventsToApply;
    };
    
    var checkEvents = function(){
        if ( ! events ){
            throw 'No events defined in eventManager!'
        }
    };
    
    var formClosed = function ( event, options ) {
        checkEvents();
        events.formClosed( event, options );
    };
    
    var formCreated = function ( options ) { 
        checkEvents();
        events.formCreated( options );
    };
    
    var formSubmitting = function ( options, dataToSend ) { 
        checkEvents();
        return events.formSubmitting( options, dataToSend );
    };
    
    var loadingRecords = function ( options, url ) { 
        checkEvents();
        events.loadingRecords( options, url );
    };
    
    var recordAdded = function ( event, options, record ) { 
        checkEvents();
        events.recordAdded( event, options, record );
    };
    
    var recordDeleted = function ( event, options, key ) { 
        checkEvents();
        events.recordDeleted( event, options, key );
    };
    
    var recordsLoaded = function ( data ) { 
        checkEvents();
        events.recordsLoaded( data );
    };
    
    var recordUpdated = function ( event, options, record ) { 
        checkEvents();
        events.recordUpdated( event, options, record );
    };
    
    var rowInserted = function ( data ) { 
        checkEvents();
        events.rowInserted( data );
    };
    
    var rowsRemoved = function ( data ) { 
        checkEvents();
        events.rowsRemoved( data );
    };
    
    var rowUpdated = function ( data ) { 
        checkEvents();
        events.rowUpdated( data );
    };
    
    var selectionChanged = function ( data ) { 
        checkEvents();
        events.selectionChanged( data );
    };
 
    return {
        setEvents: setEvents,
        
        formClosed: formClosed,
        formCreated: formCreated,
        formSubmitting: formSubmitting,
        loadingRecords: loadingRecords,
        recordAdded: recordAdded,
        recordDeleted: recordDeleted,
        recordsLoaded: recordsLoaded,
        recordUpdated: recordUpdated,
        rowInserted: rowInserted,
        rowsRemoved: rowsRemoved,
        rowUpdated: rowUpdated,
        selectionChanged: selectionChanged
    };
})();
