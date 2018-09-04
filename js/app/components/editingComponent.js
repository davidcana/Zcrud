/* 
    editingComponent class
*/
module.exports = function( optionsToApply, thisOptionsToApply, listPageToApply ) {
    "use strict";
    
    var context = require( '../context.js' );
    var $ = require( 'jquery' );
    var pageUtils = require( '../pages/pageUtils.js' );
    var History = require( '../history/history.js' );
    var crudManager = require( '../crudManager.js' );
    var validationManager = require( '../validationManager.js' );
    var fieldUtils = require( '../fields/fieldUtils.js' );
    
    var options = optionsToApply;
    var listPage = listPageToApply;
    
    var thisOptions = thisOptionsToApply;
    var getThisOptions = function(){
        return thisOptions;
    };
    
    //var history = new History( options, thisOptions, listPage );
    context.setHistory( 
        new History( options, thisOptions, listPage ) );
    var autoSaveMode = false;
    
    /*
    var bindButtonEvent = function( $this, button ){

        $this
            .find( button.getNewSelector() )
            //.find( button.getSelector() )
            .off()
            .click(
                function( event ){
                    button.run( event, listPage );   
                }
            );
    };*/
    
    var bindEvents = function(){

        var $this = $( '#' + listPage.getId() );

        // Init autoSaveMode
        /*
        var editableEvent = thisOptions.event;
        switch ( editableEvent ){
            case 'fieldChange':
                autoSaveMode = true;
                break;
            case 'batch':
                autoSaveMode = false;
                break;
            default:
                context.showError( options, true, 'Unknown event in editable list: ' + editableEvent );
                return;
        }*/

        // Register change of the field
        bindEventsInRows( $this );

        // Bottom buttons
        /*
        var undoButton = new options.buttons.undo();
        bindButtonEvent( $this, undoButton );

        var redoButton = new options.buttons.redo();
        bindButtonEvent( $this, redoButton );

        var saveButton = new options.buttons.list_save();
        bindButtonEvent( $this, saveButton );

        var addNewRowButton = new options.buttons.list_addNewRow();
        bindButtonEvent( $this, addNewRowButton );*/
        
        // Setup validation
        var formId = listPage.getThisOptions().formId;
        validationManager.initFormValidation( 
            formId, 
            $( '#' + formId ), 
            options );
    };
    
    var bindEventsInRows = function( $preselection, record ){

        $preselection
            .find( '.zcrud-column-data input.historyField, .zcrud-column-data textarea.historyField, .zcrud-column-data select.historyField' )
            .change( 
                function ( event, disableHistory ) {
                    if ( disableHistory ){
                        return;
                    }
                    var $this = $( this );
                    var field = listPage.getFieldByName( $this.prop( 'name' ) );
                    var $tr = $this.closest( 'tr' );
                    context.getHistory().putChange( 
                        $this, 
                        field.getValue( $this ),
                        $tr.attr( 'data-record-index' ),
                        $tr.attr( 'data-record-id' ),
                        listPage.getId(),
                        field );
                    if ( autoSaveMode ){
                        save( event );
                    }
                }
            );

        listPage.bindButtonsEvent( listPage.getByRowButtons() );
        /*
        var deleteRowButton = new options.buttons.list_deleteRow();
        bindButtonEvent( $preselection, deleteRowButton );*/
        
        // Bind events for fields
        var dictionary = listPage.getDictionary();
        var fields = listPage.getFields();
        
        if ( record ){
            bindEventsForFieldsAnd1Record( 
                fields, 
                dictionary, 
                record, 
                $preselection );
        } else {
            bindEventsForFieldsAndAllRecords( 
                fields, 
                dictionary,
                dictionary.records );
        }
    };
    
    var bindEventsForFieldsAndAllRecords = function( fields, dictionary, records ){
        
        var $rows = $( '#' + listPage.getThisOptions().tbodyId ).children().filter( '.zcrud-data-row' );
        for ( var i = 0; i < records.length; i++ ) {
            var record = records[ i ];
            bindEventsForFieldsAnd1Record( 
                fields, 
                dictionary, 
                record, 
                $rows.filter( ":eq(" + i + ")" ) );
        }
    };
    
    var bindEventsForFieldsAnd1Record = function( fields, dictionary, record, $row ){

        for ( var c = 0; c < fields.length; c++ ) {
            var field = fields[ c ];
            field.afterProcessTemplateForField(
                buildProcessTemplateParams( field, record, dictionary ),
                $row
            );
        }
    };
    
    var buildProcessTemplateParams = function( field, record, dictionary ){

        return {
            field: field, 
            value: record[ field.id ],
            options: options,
            record: record,
            source: 'update',
            dictionary: dictionary
        };
    };
    
    var deleteRow = function( event ){

        var $tr =  $( event.target ).closest( 'tr' );

        context.getHistory().putDelete( 
            listPage.getId(), 
            $tr.attr( 'data-record-id' ),
            $tr.attr( 'data-record-index' ), 
            $tr.attr( 'data-record-key' ), 
            $tr );

        if ( autoSaveMode ){
            save( event );
        }
    };

    var addNewRow = function( event ){

        var newRecord = fieldUtils.buildDefaultValuesRecord( listPage.getFields() );
        var thisDictionary = buildDictionaryForNewRow( newRecord );
        
        var createHistoryItem = context.getHistory().putCreate( 
            listPage.getId(), 
            thisDictionary,
            $( '#' + listPage.getThisOptions().tbodyId ),
            newRecord );
        var $tr = createHistoryItem.get$Tr();
        
        // Bind events
        bindEventsInRows( $tr, newRecord );
        validationManager.initFormValidation( listPage.getThisOptions().formId, $tr, options );
    };

    
    var buildDictionaryForNewRow = function( newRecord ){
        
        var thisDictionary = $.extend( true, {}, listPage.getDictionary() );
        
        thisDictionary.records = [ newRecord ];
        thisDictionary.editable = true;
        
        return thisDictionary;
    };
    
    // History methods
    var undo = function( event ){

        context.getHistory().undo( listPage.getId() );
        /*
        if ( autoSaveMode ){
            save( event );
        }*/
    };
    var redo = function( event ){

        context.getHistory().redo( listPage.getId() );
        /*
        if ( autoSaveMode ){
            save( event );
        }*/
    };

    var save = function( event ){
        
        var jsonObject = context.getJSONBuilder( options ).buildJSONForAll(
            thisOptions.key || options.key, 
            listPage.getDictionary().records,
            listPage.getFields(),
            undefined,
            context.getHistory() );
        
        // Return if there is no operation to do
        if ( ! jsonObject ){
            context.showError( options, false, 'No operation to do!' );
            return false;
        }
        /*
        if ( jsonObject.existingRecords && Object.keys( jsonObject.existingRecords ).length == 0 
            && jsonObject.newRecords && jsonObject.newRecords.length == 0 
            && jsonObject.deleted && jsonObject.deleted.recordsToRemove == 0){
            context.showError( options, false, 'No operations done!' );
            return false;
        }*/

        var newJSONObject = {
            existingRecords: jsonObject.existingRecords,
            newRecords: jsonObject.newRecords,
            recordsToRemove: jsonObject.recordsToRemove,
            success: function( dataFromServer ){

                // Check server side validation
                if ( ! dataFromServer || dataFromServer.result != 'OK' ){
                    pageUtils.serverSideError( dataFromServer, options, context, undefined );
                    return false;
                }
                listPage.showStatusMessage({
                    status:{
                        message: 'listUpdateSuccess',
                        date: new Date().toLocaleString()   
                    }
                });

                // Update records in list and update paging component
                var delta = updateRecords( jsonObject, dataFromServer );
                var pagingComponent = listPage.getSecureComponent( 'paging' );
                if ( pagingComponent ){
                    pagingComponent.dataFromClient( delta );
                }
                listPage.updateBottomPanel();

                updateKeys( 
                    context.getHistory().getAllTr$FromCreateItems(), 
                    dataFromServer.newRecords );
                context.getHistory().reset( listPage.getId() );

            },
            error: function( request, status, error ){
                pageUtils.ajaxError( request, status, error, options, context, undefined );
            },
            url: thisOptions.url
        };

        crudManager.batchUpdate( 
            newJSONObject, 
            options, 
            event,
            {
                $form: listPage.get$form(),
                formType: 'list',
                dataToSend: newJSONObject,
                options: options
            }
        );

        return jsonObject;
    };
    
    var updateRecords = function( jsonObjectToSend, dataFromServer ){

        var delta = 0;
        var records = listPage.getRecords();
        
        // Update all existing records
        for ( var key in jsonObjectToSend.existingRecords ) {
            var modifiedRecord = jsonObjectToSend.existingRecords[ key ];
            var currentRecord = records[ key ];
            var newKey = modifiedRecord[ options.key ];
            var extendedRecord = $.extend( true, {}, currentRecord, modifiedRecord );

            var currentKey = key;
            if ( newKey && key !== newKey ){
                delete records[ key ];
                key = newKey;
            }
            listPage.updateRecord( currentKey, extendedRecord );
            triggerEvent( options.events.recordUpdated, records[ key ], dataFromServer );
        }

        // Add all new records using dataFromServer
        for ( var index in dataFromServer.newRecords ) {
            ++delta;
            var newRecord = dataFromServer.newRecords[ index ];
            key = newRecord[ options.key ];
            listPage.addRecord( key, newRecord );
            triggerEvent( options.events.recordAdded, newRecord, dataFromServer );
        }

        // Remove all records to remove
        for ( var c = 0; c < jsonObjectToSend.recordsToRemove.length; c++ ) {
            --delta;
            key = jsonObjectToSend.recordsToRemove[ c ];
            var deletedRecord = $.extend( true, {}, records[ key ] );
            listPage.deleteRecord( key );
            triggerEvent( options.events.recordDeleted, deletedRecord, dataFromServer );
        }
        
        return delta;
    };
    
    var triggerEvent = function( eventFunction, record, dataFromServer ){
        
        eventFunction({
            record: record,
            serverResponse: dataFromServer,
            options: options
        });
    };
    
    var updateKeys = function( $trArray, records ){
        
        if ( $trArray.length != records.length ){
            context.showError( options, true, 'Error trying to update keys: $trArray and records length does not match!' );
            return;    
        }
        
        var field = listPage.getField( options.key );
        
        for ( var c = 0; c < records.length; ++c ){
            var record = records[ c ];
            var $tr = $trArray[ c ];
            var value = record[ options.key ];
            
            // Update key value of field
            if ( field ){
                $tr.find( "[name='" + field.id + "']").val( value );
            }
            
            // Update key value in attribute of $tr
            $tr.attr( 'data-record-key', value );
        }
    };
    
    return {
        bindEvents: bindEvents,
        getThisOptions: getThisOptions,
        save: save,
        addNewRow: addNewRow,
        deleteRow: deleteRow
    };
};
