/* 
    editingComponent class
*/
module.exports = function( optionsToApply, listPageToApply ) {
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
    
    var thisOptions = options.pages.list.components.editing;
    var getThisOptions = function(){
        return thisOptions;
    };
    
    var history = new History( options, thisOptions, listPage );
    
    var bindEvents = function(){

        var $this = $( '#' + listPage.getId() );

        // Init autoSaveMode
        var autoSaveMode = undefined;
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
        registerEventForEditableFields( $this, autoSaveMode );

        // Buttons
        $this
            .find( '.zcrud-undo-command-button' )
            .off()
            .click( function ( event ) {
            event.preventDefault();
            event.stopPropagation();
            undo( event, autoSaveMode );
        });
        $this
            .find( '.zcrud-redo-command-button' )
            .off()
            .click( function ( event ) {
            event.preventDefault();
            event.stopPropagation();
            redo( event, autoSaveMode );
        });
        $this
            .find( '.zcrud-save-command-button' )
            .off()
            .click( function ( event ) {
            event.preventDefault();
            event.stopPropagation();
            save( event );
        });
        $this
            .find( '.zcrud-new-row-command-button' )
            .off()
            .click( function ( event ) {
            event.preventDefault();
            event.stopPropagation();
            addNewRow( event );
        });
        $this
            .find( '.zcrud-delete-row-command-button' )
            .off()
            .click( function ( event ) {
            event.preventDefault();
            event.stopPropagation();
            deleteRow( event, autoSaveMode );
        });
        
        // Setup validation
        //validationManager.initFormValidation( 'form', $( '#form' ), options );
        var formId = listPage.getThisOptions().formId;
        validationManager.initFormValidation( formId, $( '#' + formId ), options );
    };

    var registerEventForEditableFields = function( $preselection, autoSaveMode ){

        $preselection
            .find( '.zcrud-column-data input' )
            .off()
            .change( function ( event ) {
            var $this = $( this );
            history.putChange( 
                $this, 
                $this.val(), 
                $this.closest( 'tr' ).attr( 'data-record-index' ),
                listPage.getId() );
            if ( autoSaveMode ){
                save( event );
            }
        });
    };

    var deleteRow = function( event, autoSaveMode ){

        var $tr =  $( event.target ).closest( 'tr' );
        var key = $tr.attr( 'data-record-key' );
        var rowIndex = $tr.attr( 'data-record-index' );
        /*
        alert( 'deleteRow' 
              + '\nkey: ' + key
              + '\nrowIndex: ' + rowIndex 
              + '\ndeleteRow: ' + records[ key ].name);
        */
        history.putDelete( listPage.getId(), options, rowIndex, key, $tr );

        if ( autoSaveMode ){
            save( event );
        }
    };

    var addNewRow = function( event ){

        var thisDictionary = $.extend( {}, listPage.getDictionary(), {} );
        thisDictionary.records = [ {} ];

        var createHistoryItem = history.putCreate( listPage.getId(), options, thisDictionary );
        registerEventForEditableFields( createHistoryItem.get$Tr() );
    };

    // History methods
    var undo = function( event, autoSaveMode ){

        history.undo( listPage.getId() );
        if ( autoSaveMode ){
            save( event );
        }
    };
    var redo = function( event, autoSaveMode ){

        history.redo( listPage.getId() );
        if ( autoSaveMode ){
            save( event );
        }
    };

    var save = function( event ){

        var dataToSend = history.buildDataToSend( options, thisOptions, listPage.getDictionary().records );
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
                    updateRecords( dataToSend );
                },
                error: function( dataFromServer ){
                    if ( dataFromServer.message ){
                        context.showError( dataFromServer.message, false );
                    } else {
                        context.showError( 'serverCommunicationError', true );
                    }
                }
            };
            //alert( thisOptions.dataToSend + '\n' + JSON.stringify( data ) );
            crudManager.listBatchUpdate( data, options, event );
        }

        return dataToSend;
    };

    var updateRecords = function( data ){

        var records = listPage.getRecords();
            
        // Update all existing records
        for ( var key in data.existingRecords ) {
            var modifiedRegister = data.existingRecords[ key ];
            var currentRegister = records[ key ];
            var newKey = modifiedRegister[ options.key ];
            var extendedRegister = $.extend( true, {}, currentRegister, modifiedRegister );

            if ( newKey && key !== newKey ){
                delete records[ key ];
                key = newKey;
            }
            records[ key ] = extendedRegister;  
        }

        // Add all new records
        for ( key in data.newRecords ) {
            records[ key ] = data.newRecords[ key ];
        }

        // Remove all records to remove
        for ( var c = 0; c < data.recordsToRemove.length; c++ ) {
            key = data.recordsToRemove[ c ];
            delete records[ key ];
        }
    };

    
    return {
        bindEvents: bindEvents,
        getThisOptions: getThisOptions
    };
};
