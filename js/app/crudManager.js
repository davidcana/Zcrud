/* 
    crudManager singleton class
*/
module.exports = (function() {
    "use strict";
    
    var $ = require( 'jquery' );
    var context = require( './context.js' );
    var validationManager = require( './validationManager.js' );
    
    var generalSuccessFunction = function( data, options, dataFromServer ){
        
        if ( ! data.ajaxPostFilterOff ) {
            dataFromServer = options.ajax.ajaxPostFilter( dataFromServer );
        }
        
        if ( data.success ){
            data.success( dataFromServer );
        }
    };
    
    var generalErrorFunction = function( data, options, dataFromServer ){
        
        if ( ! data.ajaxPostFilterOff ) {
            dataFromServer = options.ajax.ajaxPostFilter( dataFromServer );
        }
        if ( data.error ){
            data.error( dataFromServer );
        }
    };
    
    var authIsOK = function( data, options, eventData ){
        
        return data.formValidationOff? 
            true: 
            validationManager.formIsValid( options, eventData );
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
                data.ajaxPreFilterOff? data.records: options.ajax.ajaxPreFilter( data.records ) );
            return;
        }
        
        // Load data from server using AJAX
        var thisOptions = {
            url    : data.url || options.pages.list.url,
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
    var batchUpdate = function( data, options, event, eventData ){
        
        var dataToSend = data;
        dataToSend.command = 'batchUpdate';

        var successFunction = function( dataFromServer ){
            generalSuccessFunction( data, options, dataFromServer );
        };

        var errorFunction = function( dataFromServer ){
            generalErrorFunction( data, options, dataFromServer );
        };

        if ( data.clientOnly ){
            if ( authIsOK( data, options, eventData ) ){
                dataToSend.result = 'OK';
                successFunction(
                    data.ajaxPreFilterOff? dataToSend: options.ajax.ajaxPreFilter( dataToSend ) );
            } else {
                errorFunction(
                    data.ajaxPreFilterOff? dataToSend: options.ajax.ajaxPreFilter( dataToSend ) );
            }
            return;
        }

        var thisOptions = {
            url    : data.url,
            data   : data.ajaxPreFilterOff? dataToSend: options.ajax.ajaxPreFilter( dataToSend ),
            success: successFunction,
            error  : errorFunction
        };

        if ( authIsOK( data, options, eventData ) ){
            options.ajax.ajaxFunction(
                $.extend( {}, options.ajax.defaultFormAjaxOptions, thisOptions ) );
        } else {
            context.showError( options, 'invalidFormData', true );
        }
    };
    
    return {
        listRecords: listRecords,
        batchUpdate: batchUpdate
    };
})();
