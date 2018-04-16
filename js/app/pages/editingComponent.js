/* 
    editingComponent class
*/
module.exports = function( optionsToApply, thisOptionsToApply, listPageToApply ) {
    "use strict";
    
    var context = require( '../context.js' );
    var $ = require( 'jquery' );
    var pageUtils = require( './pageUtils.js' );
    var fieldBuilder = require( '../fields/fieldBuilder' );
    var History = require( '../history/history.js' );
    var crudManager = require( '../crudManager.js' );
    var validationManager = require( '../validationManager.js' );
    
    var options = optionsToApply;
    var listPage = listPageToApply;
    
    var thisOptions = thisOptionsToApply;
    var getThisOptions = function(){
        return thisOptions;
    };
    
    var history = new History( options, thisOptions, listPage );
    var autoSaveMode = undefined;
    
    var bindEvents = function(){

        var $this = $( '#' + listPage.getId() );

        // Init autoSaveMode
        //var autoSaveMode = undefined;
        var editableEvent = thisOptions.event;
        switch ( editableEvent ){
            case 'fieldChange':
                autoSaveMode = true;
                break;
            case 'batch':
                autoSaveMode = false;
                break;
            default:
                alert( 'Unknown event in editable list: ' + editableEvent );
                return;
        }

        // Register change of the field
        bindEventsInRows( $this );

        // Bottom buttons
        $this
            .find( '.zcrud-undo-command-button' )
            .off()
            .click( 
                function ( event ) {
                    event.preventDefault();
                    event.stopPropagation();
                    undo( event );
                });
        $this
            .find( '.zcrud-redo-command-button' )
            .off()
            .click( 
                function ( event ) {
                    event.preventDefault();
                    event.stopPropagation();
                    redo( event );
                });
        $this
            .find( '.zcrud-save-command-button' )
            .off()
            .click( 
                function ( event ) {
                    event.preventDefault();
                    event.stopPropagation();
                    save( event );
                });
        $this
            .find( '.zcrud-new-row-command-button' )
            .click( 
                function ( event ) {
                    event.preventDefault();
                    event.stopPropagation();
                    addNewRow( event );
                });
        
        // Setup validation
        var formId = listPage.getThisOptions().formId;
        validationManager.initFormValidation( formId, $( '#' + formId ), options );
    };
    
    var bindEventsInRows = function( $preselection, record ){

        $preselection
            .find( '.zcrud-column-data input.historyField, .zcrud-column-data textarea.historyField, .zcrud-column-data select.historyField' )
            .change( function ( event, disableHistory ) {
                if ( disableHistory ){
                    return;
                }
                var $this = $( this );
                var field = listPage.getFieldByName( $this.prop( 'name' ) );
                history.putChange( 
                    $this, 
                    fieldBuilder.getValue( field, $this ),
                    $this.closest( 'tr' ).attr( 'data-record-index' ),
                    listPage.getId(),
                    field );
                if ( autoSaveMode ){
                    save( event );
                }
        });

        $preselection
            .find( '.zcrud-delete-row-command-button' )
            .off()
            .click( function ( event ) {
                event.preventDefault();
                event.stopPropagation();
                deleteRow( event );
        });
        
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
            fieldBuilder.afterProcessTemplateForField(
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
        var key = $tr.attr( 'data-record-key' );
        var rowIndex = $tr.attr( 'data-record-index' );

        history.putDelete( listPage.getId(), options, rowIndex, key, $tr );

        if ( autoSaveMode ){
            save( event );
        }
    };

    var addNewRow = function( event ){

        var newRecord = {};  // TODO Build new record with default values
        var thisDictionary = $.extend( {}, listPage.getDictionary(), {} );
        thisDictionary.records = [ newRecord ];

        var createHistoryItem = history.putCreate( 
            listPage.getId(), 
            thisDictionary,
            $( '#' + listPage.getThisOptions().tbodyId ) );
        var $tr = createHistoryItem.get$Tr();
        
        // Bind events
        bindEventsInRows( $tr, newRecord );
        validationManager.initFormValidation( listPage.getThisOptions().formId, $tr, options );
    };

    // History methods
    var undo = function( event ){

        history.undo( listPage.getId() );
        if ( autoSaveMode ){
            save( event );
        }
    };
    var redo = function( event ){

        history.redo( listPage.getId() );
        if ( autoSaveMode ){
            save( event );
        }
    };

    var save = function( event ){

        var dataToSend = history.buildDataToSend(  
            options.key, 
            thisOptions.dataToSend, 
            listPage.getDictionary().records,
            listPage.getFields() );
        
        if ( dataToSend.existingRecords && Object.keys( dataToSend.existingRecords ).length == 0 
            && dataToSend.newRecords && dataToSend.newRecords.length == 0 
            && dataToSend.deleted && dataToSend.deleted.recordsToRemove == 0){
            alert( 'No operations done!' );
            return false;
        }

        if ( dataToSend ){
            var data = {
                existingRecords: dataToSend.existingRecords,
                newRecords: dataToSend.newRecords,
                recordsToRemove: dataToSend.recordsToRemove,
                success: function( dataFromServer ){
                    listPage.showStatusMessage({
                        status:{
                            message: 'listUpdateSuccess',
                            date: new Date().toLocaleString()   
                        }
                    });
                    history.reset( listPage.getId() );
                    updateRecords( dataToSend, dataFromServer );
                },
                error: function( dataFromServer ){
                    if ( dataFromServer.message ){
                        context.showError( options, dataFromServer.message, false );
                    } else {
                        context.showError( options, 'serverCommunicationError', true );
                    }
                },
                url: thisOptions.batchUpdateAction
            };
            //alert( thisOptions.dataToSend + '\n' + JSON.stringify( data ) );
            crudManager.batchUpdate( 
                data, 
                options, 
                event,
                {
                    $form: listPage.get$form(),
                    formType: 'list',
                    dataToSend: data,
                    options: options
                }
            );
        }

        return dataToSend;
    };

    var updateRecords = function( dataToSend, dataFromServer ){

        var records = listPage.getRecords();
        
        // Update all existing records
        for ( var key in dataToSend.existingRecords ) {
            var modifiedRegister = dataToSend.existingRecords[ key ];
            var currentRegister = records[ key ];
            var newKey = modifiedRegister[ options.key ];
            var extendedRegister = $.extend( true, {}, currentRegister, modifiedRegister );

            if ( newKey && key !== newKey ){
                delete records[ key ];
                key = newKey;
            }
            //records[ key ] = extendedRegister;
            listPage.updateRecord( key, extendedRegister );
            triggerEvent( options.events.recordUpdated, records[ key ], dataFromServer );
        }

        // Add all new records
        for ( key in dataToSend.newRecords ) {
            //records[ key ] = dataToSend.newRecords[ key ];
            listPage.addRecord( key, dataToSend.newRecords[ key ] );
            triggerEvent( options.events.recordAdded, records[ key ], dataFromServer );
        }

        // Remove all records to remove
        for ( var c = 0; c < dataToSend.recordsToRemove.length; c++ ) {
            key = dataToSend.recordsToRemove[ c ];
            var deletedRecord = $.extend( true, {}, records[ key ] );
            //delete records[ key ];
            listPage.deleteRecord( key );
            triggerEvent( options.events.recordDeleted, deletedRecord, dataFromServer );
        }
    };
    
    var triggerEvent = function( eventFunction, record, dataFromServer ){
        
        eventFunction({
            record: record,
            serverResponse: dataFromServer,
            options: options
        });
    };
    
    return {
        bindEvents: bindEvents,
        getThisOptions: getThisOptions
    };
};
