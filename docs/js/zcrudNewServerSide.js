/* ZcrudServerSide singleton class */
var zcrudServerSide = (function() {

    var allowedSubformsFields = [ 'members', 'externalMembers' ];
    
    var people = {};
    var addPeople = function( peopleArray ){
        
        for ( var i = 0; i < peopleArray.length; ++i ){
            var person = peopleArray[ i ];
            people[ person.id ] = person;
        }
    };
    
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
            case "people":
                ajaxPeople( options, cmd, file, data, url );
                break;
            /*case "memberCheck":
                ajaxMembersCheck( options, cmd, file, data, url );
                break;*/
            default:
                throw "Unknown table in ajax: " + table;
        }
    };

    var ajaxPeople = function( options, cmd, file, data, url ){

        // Run command
        var dataToSend = undefined;
        switch ( cmd ) {
            case "LIST":
                dataToSend = ajaxPeopleList( file, data, url );
                break;
            case "BATCH_UPDATE":
                dataToSend = ajaxPeopleBatchUpdate( file, data, url );
                break;
            case "GET":
                dataToSend = ajaxPeopleGet( file, data, url );
                break;
            default:
                throw "Unknown command in ajax: " + cmd;
        }

        options.success( dataToSend );
    };
    
    var ajaxPeopleList = function( file, data, url ){
        return ajaxList( file, data, url, people )
    };
    
    var ajaxPeopleBatchUpdate = function( file, data, url ){
        return ajaxBatchUpdate( file, data, url, people );
    };
    
    var ajaxPeopleGet = function( file, data ){
        return ajaxGet( file, data, people, allowedSubformsFields );
    };
    
    /* Generic methods */
    var ajaxList = function( file, data, url, input ){

        // Init data
        var dataToSend = {};
        dataToSend.result = 'OK';
        dataToSend.message = '';

        // Add all records to data
        var allRecords = [];
        for ( var id in input ) {
            var service = input[ id ];
            if ( ! matches( service, data.filter ) ){
                continue;
            }
            service.id = id;
            allRecords.push( clone( service ) );
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
    
    var buildItemId = function( input ){

        var itemIndex = input.length - 1;
        var item = input[ ++itemIndex ]; 
        while ( item ) {
            item = input[ ++itemIndex ];
        }

        return '' + itemIndex;
    };
    
    var ajaxBatchUpdate = function( file, data, url, input ){

        // Init data
        var dataToSend = {};
        dataToSend.message = '';
        dataToSend.newRecords = [];
        var error = false;

        // Add all existing services
        for ( var id in data.existingRecords ) {
            var modifiedItem = data.existingRecords[ id ];
            var currentItem = input[ id ];

            if ( ! currentItem ){
                error = true;
                dataToSend.message += 'Item with key "' + id + '" not found trying to update it!';
                continue;       
            }

            var newId = modifiedItem.id;
            var newIdItem = input[ newId ];
            if ( id != newId && newIdItem ){
                error = true;
                dataToSend.message += 'Item with key "' + newId + '" found: duplicated key trying to update it!';
                continue;    
            }

            subformsListBatchUpdate( currentItem, modifiedItem, dataToSend );

            var extendedItem = $.extend( true, {}, currentItem, modifiedItem );

            if ( newId && id !== newId ){
                delete input[ id ];
                id = newId;
            }
            input[ id ] = extendedItem;  
        }

        // Add all new services
        for ( var c = 0; c < data.newRecords.length; c++ ) {
            var newItem = data.newRecords[ c ];
            if ( newItem.id == undefined ){
                newItem.id = buildItemId( input );
            }
            id = newItem.id;
            currentItem = input[ id ];

            if ( currentItem ){
                error = true;
                dataToSend.message += 'Item with key "' + id + '" found trying to create it!';
                continue;
            }

            var newItemClone = $.extend( true, {}, newItem );
            if ( newItem.members ){
                newItem.members = [];
            }
            subformsListBatchUpdate( newItem, newItemClone, dataToSend );
            input[ id ] = newItem;

            dataToSend.newRecords.push( newItem );               
        }

        // Remove all services to remove
        for ( c = 0; c < data.recordsToRemove.length; c++ ) {
            id = data.recordsToRemove[ c ];
            currentItem = input[ id ];

            if ( ! currentItem ){
                error = true;
                dataToSend.message += 'Item with key "' + id + '" not found trying to delete it!';
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

    var subformsListBatchUpdate = function( current, modified, dataToSend ){

        var subformsFields = allowedSubformsFields;

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

        var subformKey = 'code';
        
        // Add all existing items
        for ( var rowId in data.existingRecords ) {
            var modifiedItem = data.existingRecords[ rowId ];
            var currentItem = getSubformItem( current, rowId, subformKey );

            if ( ! currentItem ){
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
                newItem.code = buildItemCode( current, subformKey );
            }
            current.push( newItem );
        }

        // Remove items
        for ( c = 0; c < data.recordsToRemove.length; c++ ) {
            rowId = data.recordsToRemove[ c ];

            if ( ! removeSubformItem( current, rowId, subformKey ) ){
                dataToSend.result = 'Error';
                dataToSend.message += 'Subform item with key "' + rowId + '" not found trying to delete it!';
                continue;
            }           
        }
    };
    
    var getSubformItem = function( current, rowId, subformKey ){

        for ( var rowIndex in current ){
            var currentRow = current[ rowIndex ];
            if ( currentRow[ subformKey ] ==  rowId ){
                return currentRow;
            }
        }

        return undefined;
    };
    
    var buildItemCode = function( members, subformKey ){

        var max = 0;
        for ( var c = 0; c < members.length; ++c ){
            var currentCode = members[ c ][ subformKey ];
            if ( currentCode > max ){
                max = currentCode;
            }
        }
        return "" + ( 1 + parseInt( max ) );
    };
    
    var removeSubformItem = function( current, rowId, subformKey ){

        for ( var rowIndex in current ){
            var currentRow = current[ rowIndex ];
            if ( currentRow[ subformKey ] ==  rowId ){
                current.splice( rowIndex, 1 );
                return true;
            }
        }

        return false;
    };
    
    var ajaxGet = function( file, data, input, subformsFields ){

        // Init data
        var dataToSend = {};
        dataToSend.result = 'OK';
        dataToSend.message = '';

        // Build record
        dataToSend.record = $.extend( true, {}, input[ data.key ] );
        dataToSend.fieldsData = {};
        processSubformsInGet( data, subformsFields, dataToSend.record, dataToSend );

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
    
    return {
        addPeople: addPeople,
        ajax: ajax
    };
})();
