/* 
    testUtils singleton class
*/
module.exports = (function() {
    "use strict";
    
    var $ = require( 'jquery' );
    
    var services = {};
    var servicesSubformsFields = [ 'members', 'externalMembers' ];
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
    var serviceIndex = numberOfServices - 1;
    var resetServices = function( newServices, addDescriptions ){
        
        if ( newServices ){
            services = newServices;
            return;
        }
        
        services = {};
        for ( var c = 1; c < numberOfServices; ++c ){
            var service = { 
                name: 'Service ' + c 
            };
            services[ c ] = service;
            if ( addDescriptions ){
                service.description = service.name + ' description';
            }
        }
        serviceIndex = numberOfServices - 1;
    };
    resetServices();
    
    var reset2SubformMembersServices = function( serviceKeys, numberOfMembers, numberOfExternalMembers ){

        resetServices();
        
        for ( var c = 0; c < serviceKeys.length; ++c ){
            var key = serviceKeys[ c ];
            var service = services[ key ];

            addToService( service , 'members', 'Member', numberOfMembers );
            addToService( service , 'externalMembers', 'External member', numberOfExternalMembers );
        }
    };
    var addToService = function( service, subformName, name, numberOfItems ){
        
        var thisArray = service[ subformName ];
        if ( ! thisArray ){
            thisArray = [];
            service[ subformName ] = thisArray;
        }
        
        for ( var c = 0; c < numberOfItems; ++c ){
            var sufix = "" + ( c + 1 );
            var thisName = name + " " + sufix;
            thisArray.push(
                {
                    "code": sufix,
                    "name": thisName,
                    "description": "Description of " + thisName
                }
            );
        }
    };
    
    var members;
    var resetOriginalAndVerifiedMembers = function( name,  numberOfItems ){

        members = {};
        members.originalMembers = [];
        members.verifiedMembers = {};

        for ( var c = 0; c < numberOfItems; ++c ){
            var sufix = "" + ( c + 1 );
            var thisName = name + " " + sufix;
            members.originalMembers.push( 
                {
                    "code": sufix,
                    "name": thisName,
                    "description": "Description of " + thisName
                }
            );
        }
    };
    /*
    var resetOriginalAndVerifiedMembers = function( name,  numberOfItems ){
        
        members = {};
        members.originalMembers = {};
        members.verifiedMembers = {};
        
        for ( var c = 0; c < numberOfItems; ++c ){
            var sufix = "" + ( c + 1 );
            var thisName = name + " " + sufix;
            members.originalMembers[ c ] = 
                {
                    "code": sufix,
                    "name": thisName,
                    "description": "Description of " + thisName
                };
        }
    };*/
    
    var phoneTypes = [ 'Home phone', 'Office phone', 'Cell phone' ];
    var urls = [];
    var lastListUrl = undefined;
    var lastBatchUpdateUrl = undefined;
    var jsonUpdatesArray = [];
    
    var reset = function(){
    
        resetServices();
        
        urls = [];
        lastListUrl = undefined;
        lastBatchUpdateUrl = undefined;
        jsonUpdatesArray = [];
    };
    
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
                ajaxServices( options, cmd, file, data, url );
                break;
            case "phoneTypes":
                ajaxPhoneTypes( options );
                break;
            case "members":
                ajaxMembersFields( 'members', options, data );
                break;
            case "externalMembers":
                ajaxMembersFields( 'externalMembers', options, data );
                break;
            case "memberCheck":
                ajaxMembersCheck( options, cmd, file, data, url );
                break;
            default:
                throw "Unknown table in ajax: " + table;
        }
    };
    
    var ajaxMembersCheck = function( options, cmd, file, data, url ){

        // Run command
        var dataToSend = undefined;
        switch ( cmd ) {
            case "BATCH_UPDATE":
                dataToSend = ajaxMembersCheckBatchUpdate( file, data, url );
                break;
            case "GET":
                dataToSend = ajaxMembersCheckGet( file, data, url );
                break;
            case "LIST":
                dataToSend = ajaxMembersCheckList( file, data, url );
                break;
            default:
                throw "Unknown command in ajax: " + cmd;
        }

        options.success( dataToSend );
    };
    
    var ajaxMembersCheckBatchUpdate = function( file, data, url ){

        lastBatchUpdateUrl = url;
        jsonUpdatesArray.push( 
            $.extend( true, {}, data ) );

        // Init data
        var dataToSend = {};
        dataToSend.message = '';
        dataToSend.verifiedMembers = {};
        dataToSend.verifiedMembers.newRecords = [];
        var error = false;
        var input = members.verifiedMembers;
        
        // Add all existing services
        for ( var id in data.existingRecords ) {
            var modifiedItem = data.existingRecords.verifiedMembers[ id ].verifiedMembers;
            var currentItem = input[ id ];

            if ( ! currentItem ){
                error = true;
                dataToSend.message += 'Verified member with key "' + id + '" not found trying to update it!';
                continue;       
            }

            var newId = modifiedItem.code;
            var newIdService = input[ newId ];
            if ( id != newId && newIdService ){
                error = true;
                dataToSend.message += 'Verified member with key "' + newId + '" found: duplicated key trying to update it!';
                continue;    
            }

            var extendedItem = $.extend( true, {}, currentItem, modifiedItem );

            if ( newId && id !== newId ){
                delete services[ id ];
                id = newId;
            }
            services[ id ] = extendedItem;  
        }

        // Add all new services
        for ( var c = 0; c < data.newRecords[ 0 ].verifiedMembers.newRecords.length; c++ ) {
            var newItem = data.newRecords[ 0 ].verifiedMembers.newRecords[ c ];
            
            if ( newItem.code == undefined ){
                newItem.code = buildVerifiedMemberId( input );
            }
            id = newItem.code;
            currentItem = input[ id ];

            if ( currentItem ){
                error = true;
                dataToSend.message += 'Verified member with key "' + id + '" found trying to create it!';
                continue;
            }
            input[ id ] = newItem;

            dataToSend.verifiedMembers.newRecords.push( newItem );               
        }

        // Remove all services to remove
        for ( c = 0; c < data.recordsToRemove.length; c++ ) {
            id = data.recordsToRemove[ c ];
            currentItem = input[ id ];

            if ( ! currentItem ){
                error = true;
                dataToSend.message += 'Verified member with key "' + id + '" not found trying to delete it!';
                continue;
            }

            delete input[ id ];                
        }

        dataToSend.result = dataToSend.result || error? 'Error': 'OK';
        if ( dataToSend.message != '' ){
            dataToSend.translateMessage = false;
        }

        return dataToSend;
    };
    
    var ajaxMembersCheckList = function( file, data, url ){

        lastListUrl = url;

        // Init data
        var dataToSend = {};
        dataToSend.result = 'OK';
        dataToSend.message = '';

        // Add all records to data
        var input = members.originalMembers;
        var allRecords = [];
        for ( var c = 0; c < input.length; ++c ) {
            var member = input[ c ];
            if ( ! matches( member, data.filter ) ){
                continue;
            }
            allRecords.push( 
                clone( member ) );
        }

        // Sort them
        if ( data.sortFieldId && data.sortType ){
            allRecords.sort( 
                dynamicSort( data.sortFieldId, data.sortType ) );
        }

        // Page them
        pageRecords( data, dataToSend, allRecords );

        return dataToSend;
    };
    
    var ajaxMembersCheckGet = function( file, data ){

        // Init data
        var dataToSend = {};
        dataToSend.result = 'OK';
        dataToSend.message = '';

        // Build record
        dataToSend.record = {};
        dataToSend.fieldsData = {};
        processMembersSubformsInGet( data, dataToSend.record, dataToSend );
        
        return dataToSend;
    };
    
    var processMembersSubformsInGet = function( data, record, dataToSend ){

        var subformsFields = [ 'originalMembers', 'verifiedMembers' ];
        
        for ( var c = 0; c < subformsFields.length; ++c ){
            var subformFieldId = subformsFields[ c ];

            var allSubformValues = members[ subformFieldId ] || {};
            var thisFieldData = data[ subformFieldId ] || {};
            
            // Filter them

            // Sort them

            // Page them
            var thisFieldDataToSend = {};
            pageRecords( thisFieldData, thisFieldDataToSend, allSubformValues );
            record[ subformFieldId ] = thisFieldDataToSend.records;
            dataToSend.fieldsData[ subformFieldId ] = {
                totalNumberOfRecords: thisFieldDataToSend.totalNumberOfRecords
            };
        }
    };
    
    var ajaxMembersFields = function( subformId, options, data ){

        // Init data
        var dataToSend = {};
        dataToSend.result = 'OK';
        dataToSend.message = '';
        var thisFieldData = data;

        // Add all records to data
        var service = services[ data.key ];
        if ( ! service ){
            dataToSend.message += 'Service with key "' + data.key + '" not found trying to get ' + subformId + ' subform!';
            options.error( dataToSend );
            return;
        }
        
        var input = service[ subformId ] || [];
        var allRecords = [];
        
        // Filter them
        for ( var id in input ) {
            var member = input[ id ];
            if ( ! matches( member, thisFieldData.filter ) ){
                continue;
            }
            member.id = id;
            allRecords.push( 
                clone( member ) );
        }

        // Sort them
        if ( thisFieldData.sortFieldId && thisFieldData.sortType ){
            allRecords.sort( 
                dynamicSort( thisFieldData.sortFieldId, thisFieldData.sortType ) );
        }

        // Page them
        pageRecords( thisFieldData, dataToSend, allRecords );

        options.success( dataToSend );
    };
    
    var ajaxPhoneTypes = function( options ){
        options.success({
            result: 'OK',
            message: '',
            options: phoneTypes
        });
    };
    
    var ajaxServices = function( options, cmd, file, data, url ){
        
        // Run command
        var dataToSend = undefined;
        switch ( cmd ) {
            case "LIST":
                dataToSend = ajaxServicesList( file, data, url );
                break;
            case "BATCH_UPDATE":
                dataToSend = ajaxServicesBatchUpdate( file, data, url );
                break;
            case "GET":
                dataToSend = ajaxServicesGet( file, data, url );
                break;
            default:
                throw "Unknown command in ajax: " + cmd;
        }
        
        options.success( dataToSend );
    };
    
    var ajaxServicesGet = function( file, data ){

        // Init data
        var dataToSend = {};
        dataToSend.result = 'OK';
        dataToSend.message = '';
        
        // Build record
        dataToSend.record = $.extend( true, {}, services[ data.key ] );
        dataToSend.fieldsData = {};
        processSubformsInGet( data, servicesSubformsFields, dataToSend.record, dataToSend );
        
        return dataToSend;
    };
    
    var processSubformsInGet = function( data, subformsFields, record, dataToSend ){
        
        for ( var c = 0; c < subformsFields.length; ++c ){
            var subformFieldId = subformsFields[ c ];
            
            // Continue if record does not contain this subform
            if ( record[ subformFieldId ] === undefined ){
                continue;
            }
            
            var allSubformValues = record[ subformFieldId ] || {};
            var thisFieldData = data[ subformFieldId ] || {};
            
            // Filter them
            
            // Sort them
            
            // Page them
            var thisFieldDataToSend = {};
            pageRecords( thisFieldData, thisFieldDataToSend, allSubformValues );
            record[ subformFieldId ] = thisFieldDataToSend.records;
            dataToSend.fieldsData[ subformFieldId ] = {
                totalNumberOfRecords: thisFieldDataToSend.totalNumberOfRecords
            };
        }
    };
    
    var pageRecords = function( data, dataToSend, allRecords ){
        
        if ( data.pageNumber && data.pageSize ){
            var firstElementIndex = ( data.pageNumber - 1 ) * data.pageSize;
            dataToSend.records = allRecords.slice(
                firstElementIndex, 
                firstElementIndex + data.pageSize ); 
        } else {
            dataToSend.records = allRecords;
        }
        dataToSend.totalNumberOfRecords = allRecords.length;
    };
    
    var ajaxServicesBatchUpdate = function( file, data, url ){

        lastBatchUpdateUrl = url;
        jsonUpdatesArray.push( 
            $.extend( true, {}, data ) );
        
        // Init data
        var dataToSend = {};
        dataToSend.message = '';
        dataToSend.newRecords = [];
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
        }
        
        // Add all new services
        for ( var c = 0; c < data.newRecords.length; c++ ) {
            var newService = data.newRecords[ c ];
            if ( newService.id == undefined ){
                newService.id = buildServiceId();
            }
            id = newService.id;
            currentService = services[ id ];

            if ( currentService ){
                error = true;
                dataToSend.message += 'Service with key "' + id + '" found trying to create it!';
                continue;
            }
            
            var newServiceClone = $.extend( true, {}, newService );
            if ( newService.members ){
                newService.members = [];
            }
            servicesSubformsListBatchUpdate( newService, newServiceClone, dataToSend );
            services[ id ] = newService;
            
            dataToSend.newRecords.push( newService );               
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
        }
        
        dataToSend.result = dataToSend.result || error? 'Error': 'OK';
        if ( dataToSend.message != '' ){
            dataToSend.translateMessage = false;
        }
        
        return dataToSend;
    };
    
    var buildServiceId = function(){
        
        var service = services[ ++serviceIndex ]; 
        while ( service ) {
            service = services[ ++serviceIndex ];
        }
        
        return '' + serviceIndex;
    };
    
    var buildVerifiedMemberId = function( input ){

        var thisIndex = 0;
        var item = input[ ++thisIndex ]; 
        while ( item ) {
            item = input[ ++thisIndex ];
        }

        return '' + thisIndex;
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
            if ( newItem.code == undefined ){
                newItem.code = buildItemCode( current );
            }
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

    var buildItemCode = function( members ){

        var max = 0;
        for ( var c = 0; c < members.length; ++c ){
            var currentCode = members[ c ].code;
            if ( currentCode > max ){
                max = currentCode;
            }
        }
        return "" + ( 1 + parseInt( max ) );
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
    
    var ajaxServicesList = function( file, data, url ){
        
        lastListUrl = url;
        
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
        pageRecords( data, dataToSend, allRecords );
        
        return dataToSend;
    };
    
    var matches = function( record, filter ){
        
        for ( var filterName in filter ) {
            var filterValue = filter[ filterName ];
            var recordValue = record[ filterName ];
            if ( recordValue.indexOf( filterValue ) == -1 ){
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
        //services[ key ] = clone( service );
        services[ key ] = $.extend( true, {}, service );
    };
    
    var removeService = function( key ){
        delete services[ key ];
    };
    
    var getUrl = function( index ){
        return urls[ index ];
    };
    
    var getLastListUrl = function(){
        return lastListUrl;
    };
    
    var getLastBatchUpdateUrl = function(){
        return lastBatchUpdateUrl;
    };
    
    var getJSONUpdate = function( index ){
        return jsonUpdatesArray[ index ];
    };
    
    return {
        ajax: ajax,
        getService: getService,
        setService: setService,
        removeService: removeService,
        resetServices: resetServices,
        reset2SubformMembersServices: reset2SubformMembersServices,
        resetOriginalAndVerifiedMembers: resetOriginalAndVerifiedMembers,
        getUrl: getUrl,
        getLastListUrl: getLastListUrl,
        getLastBatchUpdateUrl: getLastBatchUpdateUrl,
        getJSONUpdate: getJSONUpdate,
        reset: reset
    };
})();
