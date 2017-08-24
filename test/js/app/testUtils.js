/* 
    testUtils singleton class
*/
module.exports = (function() {
    "use strict";
    
    var services = {};
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
    for ( var c = 1; c < numberOfServices; ++c ){
        services[ c ] = { name: 'Service ' + c };
    } 
    
    var phoneTypes = [ 'Home phone', 'Office phone', 'Cell phone' ];
    
    
    var ajax = function( options ){
        
        // Get file, cmd and table
        var url = options.url;
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
            case "CREATE":
                dataToSend = ajaxServicesCreate( file, data );
                break;
            case "UPDATE":
                dataToSend = ajaxServicesUpdate( file, data );
                break;
            case "DELETE":
                dataToSend = ajaxServicesDelete( file, data );
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
            allRecords.push( service );
        }
        
        // Sort them
        allRecords.sort( 
            dynamicSort( data.sortFieldId, data.sortType ) );
        
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
    
    var ajaxServicesCreate = function( file, data ){
        return ajaxServicesCreateAndUpdate( file, data, false );
    };
    
    var ajaxServicesUpdate = function( file, data ){
        return ajaxServicesCreateAndUpdate( file, data, true );
    };
    
    var ajaxServicesCreateAndUpdate = function( file, data, mustExists ){
        
        // Init data
        var dataToSend = {};
        dataToSend.result = 'OK';
        dataToSend.message = '';
        dataToSend.records = [];
        
        // Add all services to the map of services and to the dataToSend
        for ( var c = 0; c < data.records.length; c++ ) {
            var service = data.records[ c ];
            
            var exists = services[ service.id ];
            if ( exists && ! mustExists ){
                dataToSend.result = 'Error';
                dataToSend.message += 'Service with key "' + service.id + '" found trying to create it!';
                continue;
            } else if ( ! exists && mustExists ){
                dataToSend.result = 'Error';
                dataToSend.message += 'Service with key "' + service.id + '" not found trying to update it!';
                continue;       
            }
            
            services[ service.id ] = service;
            dataToSend.records.push( service );
        }
        
        return dataToSend;
    };
    
    var ajaxServicesDelete = function( file, data ){
        
        // Init data
        var dataToSend = {};
        dataToSend.result = 'OK';
        dataToSend.message = '';
        dataToSend.records = [];
        
        // Add all services to the map of services and to the dataToSend
        for ( var c = 0; c < data.keys.length; c++ ) {
            var key = data.keys[ c ];
            var service = services[ key ];
            
            if ( ! service ){
                dataToSend.result = 'Error';
                dataToSend.message += 'Service with key "' + key + '" not found!';
            } else {
                delete services[ key ];
                dataToSend.records.push( service );
            }
        }
        return dataToSend;
    };
    
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
    
    return {
        ajax: ajax
    };
})();
