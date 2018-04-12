/* 
    testUtils singleton class
*/
module.exports = (function() {
    "use strict";
    
    var $ = require( 'jquery' );
    
    var services = {};
    var servicesSubformsFields = [ 'members' ];
    /*
    var services = {
        '1': { name: 'Service 1' },
        '2': { name: 'Service 2' },
        '3': { name: 'Service 3' },
        '4': { name: 'Service 4' },
        '5': { name: 'Service 5' },
        '6': { name: 'Service 6' },
        '7': { name: 'Service 7' },
        '8': { name: 'Service 8' },
        '9': { name: 'Service 9' },
        '10': { name: 'Service 10' },
        '11': { name: 'Service 11' },
        '12': { name: 'Service 12' }
    };*/
    var numberOfServices = 130;
    var resetServices = function( newServices ){
        
        if ( newServices ){
            services = newServices;
            return;
        }
        
        services = {};
        for ( var c = 1; c < numberOfServices; ++c ){
            services[ c ] = { name: 'Service ' + c };
        }  
    };
    resetServices();
    
    var phoneTypes = [ 'Home phone', 'Office phone', 'Cell phone' ];
    var urls = [];
    
    var ajax = function( options ){
        
        // Get file, cmd and table
        var url = options.url;
        urls.push( url );
        
        var data = options.data;
        var file = url.split( '?' )[ 0 ];
        var parameters = parseQueryString( url.split( '?' )[ 1 ] );
        var cmd = parameters.cmd;
        var table = parameters.table;
        
        // Run AJAX
        switch ( table ) {
            case "department":
                ajaxServices( options, cmd, file, data );
                break;
            case "phoneTypes":
                ajaxPhoneTypes( options );
                break;
            default:
                throw "Unknown table in ajax: " + table;
        }
    };
    
    var ajaxPhoneTypes = function( options ){
        options.success({
            result: 'OK',
            message: '',
            options: phoneTypes
        });
    };
    
    var ajaxServices = function( options, cmd, file, data ){
        
        // Run command
        var dataToSend = undefined;
        switch ( cmd ) {
            case "LIST":
                dataToSend = ajaxServicesList( file, data );
                break;
            case "BATCH_UPDATE":
                dataToSend = ajaxServicesBatchUpdate( file, data );
                break;
            default:
                throw "Unknown command in ajax: " + cmd;
        }

        if ( dataToSend.result == 'OK' ){
            options.success( dataToSend );
        } else {
            options.error( dataToSend );
        }
    };
    
    var ajaxServicesBatchUpdate = function( file, data ){

        // Init data
        var dataToSend = {};
        //dataToSend.result = 'OK';
        dataToSend.message = '';
        dataToSend.existingRecords = {};
        dataToSend.newRecords = [];
        dataToSend.recordsToRemove = [];
        var error = false;

        // Add all existing services
        for ( var id in data.existingRecords ) {
            var modifiedService = data.existingRecords[ id ];
            var currentService = services[ id ];

            if ( ! currentService ){
                error = true;
                dataToSend.message += 'Service with key "' + id + '" not found trying to update it!';
                continue;       
            }
            
            var newId = modifiedService.id;
            var newIdService = services[ newId ];
            if ( id != newId && newIdService ){
                error = true;
                dataToSend.message += 'Service with key "' + newId + '" found: duplicated key trying to update it!';
                continue;    
            }
            
            servicesSubformsListBatchUpdate( currentService, modifiedService, dataToSend );
            
            var extendedService = $.extend( true, {}, currentService, modifiedService );

            if ( newId && id !== newId ){
                delete services[ id ];
                id = newId;
            }
            services[ id ] = extendedService;
            dataToSend.existingRecords[ id ] = extendedService;     
        }
        
        // Add all new services
        for ( var c = 0; c < data.newRecords.length; c++ ) {
            var newService = data.newRecords[ c ];
            id = newService.id;
            currentService = services[ id ];

            if ( currentService ){
                error = true;
                dataToSend.message += 'Service with key "' + id + '" found trying to create it!';
                continue;
            }

            services[ id ] = newService;
            dataToSend.newRecords.push( newService );
            //dataToSend.newRecords[ id ] = newService;                
        }
        
        // Remove all services to remove
        for ( c = 0; c < data.recordsToRemove.length; c++ ) {
            id = data.recordsToRemove[ c ];
            currentService = services[ id ];

            if ( ! currentService ){
                error = true;
                dataToSend.message += 'Service with key "' + id + '" not found trying to delete it!';
                continue;
            }

            delete services[ id ];
            dataToSend.recordsToRemove.push( id );                
        }
        
        dataToSend.result = dataToSend.result || error? 'Error': 'OK';
        return dataToSend;
    };
    
    var servicesSubformsListBatchUpdate = function( currentService, modifiedService, dataToSend ){
        subformsListBatchUpdate( servicesSubformsFields, currentService, modifiedService, dataToSend );
    };
    
    var subformsListBatchUpdate = function( subformsFields, current, modified, dataToSend ){
        
        for ( var id in modified ){
            if ( subformsFields.indexOf( id ) !== -1 ){
                subformFieldBatchUpdate( 
                    modified[ id ], 
                    current[ id ], 
                    dataToSend );
                delete modified[ id ]; // Delete subform data in modified, current has been already updated
            }
        }
    };
    
    var subformFieldBatchUpdate = function( data, current, dataToSend ){
        
        // Add all existing items
        for ( var rowId in data.existingRecords ) {
            var modifiedItem = data.existingRecords[ rowId ];
            var currentItem = getSubformItem( current, rowId );
            
            if ( ! currentItem ){
                //error = true;
                dataToSend.result = 'Error';
                dataToSend.message += 'Row with index "' + rowId + '" not found trying to update it!';
                continue;       
            }
            
            $.extend( true, currentItem, modifiedItem );
        }
        
        // Add all new items
        for ( var c = 0; c < data.newRecords.length; c++ ) {
            var newItem = data.newRecords[ c ];
            current.push( newItem );
        }
        
        // Remove items
        for ( c = 0; c < data.recordsToRemove.length; c++ ) {
            rowId = data.recordsToRemove[ c ];

            if ( ! removeSubformItem( current, rowId ) ){
                //error = true;
                dataToSend.result = 'Error';
                dataToSend.message += 'Subform item with key "' + rowId + '" not found trying to delete it!';
                continue;
            }           
        }
    };

    var removeSubformItem = function( current, rowId ){

        for ( var rowIndex in current ){
            var currentRow = current[ rowIndex ];
            if ( currentRow.code ==  rowId ){
                current.splice( rowIndex, 1 );
                return true;
            }
        }
        
        return false;
    };
    
    var getSubformItem = function( current, rowId ){
        
        for ( var rowIndex in current ){
            var currentRow = current[ rowIndex ];
            if ( currentRow.code ==  rowId ){
                return currentRow;
            }
        }
        
        return undefined;
    };
    
    var ajaxServicesList = function( file, data ){
        
        // Init data
        var dataToSend = {};
        dataToSend.result = 'OK';
        dataToSend.message = '';
        //dataToSend.records = [];
        
        // Add all records to data
        var input = services;
        var allRecords = [];
        for ( var id in input ) {
            var service = input[ id ];
            if ( ! matches( service, data.filter ) ){
                continue;
            }
            service.id = id;
            allRecords.push( 
                clone( service ) );
        }
        
        // Sort them
        if ( data.sortFieldId && data.sortType ){
            allRecords.sort( 
                dynamicSort( data.sortFieldId, data.sortType ) );
        }
        
        // Page them
        if ( data.pageNumber && data.pageSize ){
            var firstElementIndex = ( data.pageNumber - 1 ) * data.pageSize;
            dataToSend.records = allRecords.slice(
                firstElementIndex, 
                firstElementIndex + data.pageSize ); 
        } else {
            dataToSend.records = allRecords;
        }
        dataToSend.totalNumberOfRecords = allRecords.length;
        
        return dataToSend;
    };
    
    var matches = function( register, filter ){
        
        for ( var filterName in filter ) {
            var filterValue = filter[ filterName ];
            var registerValue = register[ filterName ];
            if ( registerValue.indexOf( filterValue ) == -1 ){
                return false;
            }
        }
        
        return true;
    };
    
    var dynamicSort = function( property, type ) {

        var sortOrder = type && type.toLowerCase() === 'desc'? -1: 1;
        return function ( a, b ) {
            var result = ( a [property] < b [property] ) ? -1 : ( a [property] > b [property] ) ? 1 : 0;
            return result * sortOrder;
        }
    }
    
    var parseQueryString = function( query ) {
        var vars = query.split( "&" );
        var query_string = {};
        for ( var i = 0; i < vars.length; i++ ) {
            var pair = vars[ i ].split( "=" );
            // If first entry with this name
            if ( typeof query_string[ pair[ 0 ] ] === "undefined" ) {
                query_string[ pair[ 0 ] ] = decodeURIComponent( pair[ 1 ] );
                // If second entry with this name
            } else if ( typeof query_string[ pair[ 0 ] ] === "string" ) {
                var arr = [ query_string[pair[ 0 ]], decodeURIComponent( pair[ 1 ] )];
                query_string[ pair[ 0 ] ] = arr;
                // If third or later entry with this name
            } else {
                query_string[ pair[ 0 ] ].push( decodeURIComponent( pair[ 1 ] ) );
            }
        }
        return query_string;
    }
    
    var clone = function( object ){
        
        if ( ! object ){
            return object;
        }
        
        var cloned = {};

        for ( var id in object ){
            cloned[ id ] = object[ id ];
        }

        return cloned;
    };
    
    var getService = function( key ){
        return clone( services[ key ] );
    };
    
    var setService = function( key, service ){
        services[ key ] = clone( service );
    };
    
    var getUrl = function( index ){
        return urls[ index ];
    };
    
    return {
        ajax: ajax,
        getService: getService,
        setService: setService,
        resetServices: resetServices,
        getUrl: getUrl
    };
})();
