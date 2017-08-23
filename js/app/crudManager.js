/* 
    crudManager singleton class
*/
module.exports = (function() {
    "use strict";
    
    var $ = require( 'jquery' );
    var context = require( './context.js' );
    var validationManager = require( './validationManager.js' );
    
    /* 
    data format:
     - record
     - url
     - clientOnly
     - success
     - error
     - ajaxPreFilterOff
     - ajaxPostFilterOff
     - validationOff
     
     - search
     - records
    */
    var createRecord = function( data, options, event ){
        
        createOrUpdateRecord( 
            data,
            options,
            event,
            options.events.recordAdded,
            data.url || options.actions.createAction,
            'create' );
    };
    
    var updateRecord = function( data, options, event ){
        
        createOrUpdateRecord( 
            data,
            options,
            event,
            options.events.recordUpdated,
            data.url || options.actions.updateAction,
            'update' );
    };
    
    var generalSuccessFunction = function( data, options, dataFromServer, event, eventToThrow ){
        
        if ( ! data.ajaxPostFilterOff ) {
            dataFromServer = options.ajaxPostFilter( dataFromServer );
        }
        
        if ( eventToThrow ){
            eventToThrow( event, options, data.record );
        }
        
        if ( data.success ){
            data.success( dataFromServer );
        }
    };
    
    var generalErrorFunction = function( data, options, dataFromServer, event, eventToThrow ){
        
        if ( ! data.ajaxPostFilterOff ) {
            dataFromServer = options.ajaxPostFilter( dataFromServer );
        }
        if ( data.error ){
            data.error( dataFromServer );
        }
    };
    
    var createOrUpdateRecord = function( data, options, event, eventToThrow, url, command ){
        
        var dataToSend = {
            command: command,
            records: [ data.record ]
        };
        
        var successFunction = function( dataFromServer ){
            generalSuccessFunction( data, options, dataFromServer, event, eventToThrow );
        };
        
        var errorFunction = function( dataFromServer ){
            generalErrorFunction( data, options, dataFromServer, event, eventToThrow );
        };
        
        if ( data.clientOnly ){
            if ( authIsOK( data, options, dataToSend ) ){
                successFunction(
                    data.ajaxPreFilterOff? dataToSend: options.ajaxPreFilter( dataToSend ) );
            } else {
                errorFunction(
                    data.ajaxPreFilterOff? dataToSend: options.ajaxPreFilter( dataToSend ) );
            }
            return;
        }
        
        var thisOptions = {
            url    : url,
            data   : data.ajaxPreFilterOff? dataToSend: options.ajaxPreFilter( dataToSend ),
            success: successFunction,
            error  : errorFunction
        };
        
        if ( authIsOK( data, options, dataToSend ) ){
            options.ajax(
                $.extend( {}, options.defaultFormAjaxOptions, thisOptions ) );
        }
    };
    
    var authIsOK = function( data, options, dataToSend ){
        return data.formValidationOff? true: validationManager.formIsValid( options, dataToSend );
    };
    
    var deleteRecord = function( data, options, event ){

        var dataToSend = {
            command: 'delete',
            keys: [ data.key ]
        };

        var successFunction = function( dataFromServer ){
            generalSuccessFunction( data, options, dataFromServer, event, options.events.recordDeleted );
        };

        var errorFunction = function( dataFromServer ){
            generalErrorFunction( data, options, dataFromServer, event, options.events.recordDeleted );
        };
        
        if ( data.clientOnly ){
            successFunction(
                data.ajaxPreFilterOff? dataToSend: options.ajaxPreFilter( dataToSend ) );
            return;
        }
        
        var thisOptions = {
            url    : data.url || options.actions.deleteAction,
            data   : data.ajaxPreFilterOff? dataToSend: options.ajaxPreFilter( dataToSend ),
            success: successFunction,
            error  : errorFunction
        };

        if ( false != options.events.formSubmitting( options, dataToSend ) ){
            options.ajax(
                $.extend( {}, options.defaultFormAjaxOptions, thisOptions ) );
        }
    };
    
    var listRecords = function( data, options ){
        
        var dataToSend = data.search;
        
        // Trigger loadingRecords event
        //options.events.loadingRecords( options, loadUrl );
        
        var successFunction = function( dataFromServer ){
            generalSuccessFunction( data, options, dataFromServer );
        };

        var errorFunction = function( dataFromServer ){
            generalErrorFunction( data, options, dataFromServer );
        };
        
        if ( data.clientOnly ){
            successFunction(
                data.ajaxPreFilterOff? data.records: options.ajaxPreFilter( data.records ) );
            return;
        }
        
        //Load data from server using AJAX
        var thisOptions = {
            url    : data.url || options.actions.listAction,
            data   : data.ajaxPreFilterOff? dataToSend: options.ajaxPreFilter( dataToSend ),
            success: successFunction,
            error  : errorFunction
        };
        
        options.ajax(
            $.extend( {}, options.defaultFormAjaxOptions, thisOptions ) );
    };
    
    return {
        createRecord: createRecord,
        updateRecord: updateRecord,
        deleteRecord: deleteRecord,
        listRecords: listRecords
    };
})();
