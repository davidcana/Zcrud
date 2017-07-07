/* 
    testUtils singleton class
*/
module.exports = (function() {
    "use strict";
    
    var services = [
        { id: '1', name: 'Service 1' },
        { id: '2', name: 'Service 2' },
        { id: '3', name: 'Service 3' },
        { id: '4', name: 'Service 4' },
        { id: '5', name: 'Service 5' }
    ];
    
    var ajax = function( options ){
        
        // Get file, cmd and table
        var url = options.url;
        var file = url.split( '?' )[ 0 ];
        var parameters = parseQueryString( url.split( '?' )[ 1 ] );
        var cmd = parameters.cmd;
        var table = parameters.table;
        
        // Run command
        var data = undefined;
        switch ( cmd ) {
            case "LIST":
                data = ajaxList( file, table, options );
                break;
            case "CREATE":
                data = ajaxCreate( file, table, options );
                break;
            case "UPDATE":
                data = ajaxUpdate( file, table, options );
                break;
            case "DELETE":
                data = ajaxDelete( file, table, options );
                break;
            default:
                throw "Unknown command in ajax: " + cmd;
        }

        /*
        listAction:   'http://localhost:8080/cerbero/CRUDManager.do?cmd=LIST&table=department',
        createAction: 'http://localhost:8080/cerbero/CRUDManager.do?cmd=CREATE&table=department',
        updateAction: 'http://localhost:8080/cerbero/CRUDManager.do?cmd=UPDATE&table=department',
        deleteAction: 'http://localhost:8080/cerbero/CRUDManager.do?cmd=DELETE&table=department'
        */
        options.success( data );
    };
    
    var ajaxList = function( file, table, options ){
        
        // Init data
        var data = {};
        data.Result = 'OK';
        data.Message = '';
        data.Records = [];
        
        // Add all records to data
        data.Records = services;
        /*
        var input = services;
        for ( var id in input ) {
            data.Records.push( input[ id ] );
        }*/
        
        return data;
    };
    
    var ajaxCreate = function( file, table, options ){
        var data = {};
        
        return data;
    };
    
    var ajaxUpdate = function( file, table, options ){
        var data = {};
        
        return data;
    };
    
    var ajaxDelete = function( file, table, options ){
        var data = {};
        
        return data;
    };
    
    var parseQueryString = function( query ) {
        var vars = query.split("&");
        var query_string = {};
        for (var i = 0; i < vars.length; i++) {
            var pair = vars[i].split("=");
            // If first entry with this name
            if (typeof query_string[pair[0]] === "undefined") {
                query_string[pair[0]] = decodeURIComponent(pair[1]);
                // If second entry with this name
            } else if (typeof query_string[pair[0]] === "string") {
                var arr = [query_string[pair[0]], decodeURIComponent(pair[1])];
                query_string[pair[0]] = arr;
                // If third or later entry with this name
            } else {
                query_string[pair[0]].push(decodeURIComponent(pair[1]));
            }
        }
        return query_string;
    }
    
    return {
        ajax: ajax
    };
})();
