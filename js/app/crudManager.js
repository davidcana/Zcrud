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
    
    /* 
    data format:
        - ajaxPreFilterOff: a function that makes a before sending data filtering
        - ajaxPostFilterOff: a function that makes an after receiving data filtering
        - clientOnly: if true the command is not send to the server
        - error: a function executed whenever there is some error
        - success: a function executed whenever the operation is OK
        - url: an url that overwrite the default one
        
        - search: the data to send to the server
            - filter: an array of expressions to filter records
            - records: use this records. Use clientOnly = true to use these values
            - sortFieldId: the field id to sort records
            - sortType: the type of sort
            - pageNumber: the page number to retrive
            - pageSize: the number of records per page
            - search: the data to send to the server
    */
    var listRecords = function( data, options ){
        
        var dataToSend = data.search;
        
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
        
        var thisOptions = {
            url    : data.url || options.pageConf.pages.list.url,
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
        - error: a function executed whenever there is some error
        - success: a function executed whenever the operation is OK
        - url: the url to retrieve data from server
         
        - existingRecords: the list of modified records
        - newRecords: the list of new records
        - recordsToRemove: the list of the ids of the records to remove
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
            context.showError( options, false, 'invalidFormData', true );
        }
    };
    
    /* 
    data format:
        - ajaxPreFilterOff: a function that makes a before sending data filtering
        - ajaxPostFilterOff: a function that makes an after receiving data filtering
        - error: a function executed whenever there is some error
        - success: a function executed whenever the operation is OK
        - url: the url to retrieve data from server
        
        - search: the data to send to the server
            - key: the key of the record to retrieve
            - fieldsConf: an object with configuration of fields (use the id of the field as key)
                - [ id of field ]
                    - filter: an array of expressions to filter records
                    - sortFieldId: the field id to sort records
                    - sortType: the type of sort
                    - pageNumber: the page number to retrive
                    - pageSize: the number of records per page
        
    */
    var getRecord = function( data, options ){

        var dataToSend = data.search;

        var successFunction = function( dataFromServer ){
            generalSuccessFunction( data, options, dataFromServer );
        };

        var errorFunction = function( dataFromServer ){
            generalErrorFunction( data, options, dataFromServer );
        };

        var thisOptions = {
            url    : data.url,
            data   : data.ajaxPreFilterOff? dataToSend: options.ajax.ajaxPreFilter( dataToSend ),
            success: successFunction,
            error  : errorFunction
        };

        options.ajax.ajaxFunction(
            $.extend( {}, options.ajax.defaultFormAjaxOptions, thisOptions ) );
    };
    
    return {
        listRecords: listRecords,
        batchUpdate: batchUpdate,
        getRecord: getRecord
    };
})();
