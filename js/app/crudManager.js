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
        - ajaxPreFilterOff: a function that makes a before sending data filtering
        - ajaxPostFilterOff: a function that makes an after receiving data filtering
        - clientOnly: if true the command is not send to the server
        - error: a function executed whenever there is some error
        - record: the record to be created
        - success: a function executed whenever the operation is OK
        - url: an url that overwrite the default one
        - validationOff: activate or deactivate record validation
    */
    var createRecord = function( data, options, event ){
        
        createOrUpdateRecord( 
            data,
            options,
            event,
            options.events.recordAdded,
            data.url || options.pages.create.action,
            'create' );
    };
    
    /* 
    data format:
         - ajaxPreFilterOff: a function that makes a before sending data filtering
         - ajaxPostFilterOff: a function that makes an after receiving data filtering
         - clientOnly: if true the command is not send to the server
         - error: a function executed whenever there is some error
         - record: the record to be created
         - success: a function executed whenever the operation is OK
         - url: an url that overwrite the default one
         - validationOff: activate or deactivate record validation
    */
    var updateRecord = function( data, options, event ){
        
        createOrUpdateRecord( 
            data,
            options,
            event,
            options.events.recordUpdated,
            data.url || options.pages.update.action,
            'update' );
    };
    
    var generalSuccessFunction = function( data, options, dataFromServer, event, eventToThrow ){
        
        if ( ! data.ajaxPostFilterOff ) {
            dataFromServer = options.ajax.ajaxPostFilter( dataFromServer );
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
            dataFromServer = options.ajax.ajaxPostFilter( dataFromServer );
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
                    data.ajaxPreFilterOff? dataToSend: options.ajax.ajaxPreFilter( dataToSend ) );
            } else {
                errorFunction(
                    data.ajaxPreFilterOff? dataToSend: options.ajax.ajaxPreFilter( dataToSend ) );
            }
            return;
        }
        
        var thisOptions = {
            url    : url,
            data   : data.ajaxPreFilterOff? dataToSend: options.ajax.ajaxPreFilter( dataToSend ),
            success: successFunction,
            error  : errorFunction
        };
        
        if ( authIsOK( data, options, dataToSend ) ){
            options.ajax.ajaxFunction(
                $.extend( {}, options.ajax.defaultFormAjaxOptions, thisOptions ) );
        }
    };
    
    var authIsOK = function( data, options, dataToSend ){
        return data.formValidationOff? true: validationManager.formIsValid( options, dataToSend );
    };
    
    /* 
    data format:
         - ajaxPreFilterOff: a function that makes a before sending data filtering
         - ajaxPostFilterOff: a function that makes an after receiving data filtering
         - clientOnly: if true the command is not send to the server
         - error: a function executed whenever there is some error
         - key: the key of the record to delete
         - success: a function executed whenever the operation is OK
         - url: an url that overwrite the default one
    */
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
                data.ajaxPreFilterOff? dataToSend: options.ajax.ajaxPreFilter( dataToSend ) );
            return;
        }
        
        var thisOptions = {
            url    : data.url || options.pages.delete.action,
            data   : data.ajaxPreFilterOff? dataToSend: options.ajax.ajaxPreFilter( dataToSend ),
            success: successFunction,
            error  : errorFunction
        };

        if ( false != options.events.formSubmitting( options, dataToSend ) ){
            options.ajax.ajaxFunction(
                $.extend( {}, options.ajax.defaultFormAjaxOptions, thisOptions ) );
        }
    };
    
    /* 
    data format:
         - ajaxPreFilterOff: a function that makes a before sending data filtering
         - ajaxPostFilterOff: a function that makes an after receiving data filtering
         - clientOnly: if true the command is not send to the server
         - error: a function executed whenever there is some error
         - records: the list of records (clientOnly must be set to true)
         - search: a filter that must be matched
         - success: a function executed whenever the operation is OK
         - url: an url that overwrite the default one
    */
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
                data.ajaxPreFilterOff? data.records: options.ajax.ajaxPreFilter( data.records ) );
            return;
        }
        
        //Load data from server using AJAX
        var thisOptions = {
            url    : data.url || options.pages.list.action,
            data   : data.ajaxPreFilterOff? dataToSend: options.ajax.ajaxPreFilter( dataToSend ),
            success: successFunction,
            error  : errorFunction
        };
        
        options.ajax.ajaxFunction(
            $.extend( {}, options.ajax.defaultFormAjaxOptions, thisOptions ) );
    };
    
    /* 
    data format:
         - ajaxPreFilterOff: a function that makes a before sending data filtering
         - ajaxPostFilterOff: a function that makes an after receiving data filtering
         - clientOnly: if true the command is not send to the server
         - existingRecords: the list of records
         - error: a function executed whenever there is some error
         - newRecords: the list of records
         - recordsToRemove: the list of records
         - success: a function executed whenever the operation is OK
         - url: an url that overwrite the default one
    */
    var listBatchUpdate = function( data, options, event ){
        
        var dataToSend = data;
        dataToSend.command = 'listBatchUpdate';

        var successFunction = function( dataFromServer ){
            generalSuccessFunction( data, options, dataFromServer, event, options.events.listBatchUpdateDone );
        };

        var errorFunction = function( dataFromServer ){
            generalErrorFunction( data, options, dataFromServer, event, options.events.listBatchUpdateDone );
        };

        if ( data.clientOnly ){
            if ( authIsOK( data, options, dataToSend ) ){
                successFunction(
                    data.ajaxPreFilterOff? dataToSend: options.ajax.ajaxPreFilter( dataToSend ) );
            } else {
                errorFunction(
                    data.ajaxPreFilterOff? dataToSend: options.ajax.ajaxPreFilter( dataToSend ) );
            }
            return;
        }

        var thisOptions = {
            url    : data.url || options.pages.list.components.editing.batchUpdateAction,
            data   : data.ajaxPreFilterOff? dataToSend: options.ajax.ajaxPreFilter( dataToSend ),
            success: successFunction,
            error  : errorFunction
        };

        if ( authIsOK( data, options, dataToSend ) ){
            options.ajax.ajaxFunction(
                $.extend( {}, options.ajax.defaultFormAjaxOptions, thisOptions ) );
        }
    };
    
    return {
        createRecord: createRecord,
        updateRecord: updateRecord,
        deleteRecord: deleteRecord,
        listRecords: listRecords,
        listBatchUpdate: listBatchUpdate
    };
})();
