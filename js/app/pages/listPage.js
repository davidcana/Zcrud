/* 
    Class ListPage 
*/
var context = require( '../context.js' );
var pageUtils = require( './pageUtils.js' );
var FormPage = require( './formPage.js' );
var PagingComponent = require( './pagingComponent.js' );
var SortingComponent = require( './sortingComponent.js' );
var SelectingComponent = require( './selectingComponent.js' );
var FilteringComponent = require( './filteringComponent.js' );
var crudManager = require( '../crudManager.js' );
var History = require( '../history/history.js' );
var $ = require( 'jquery' );
var zpt = require( 'zpt' );
var log = zpt.logHelper;

var ListPage = function ( optionsToApply, filterToApply ) {
    "use strict";
    
    //var self = undefined;
    var options = optionsToApply;
    var filter = filterToApply || {};
    
    var thisOptions = options.pages.list;
    var dictionary = undefined;
    var records = {};
    var id = options.listId;
    var components = {};
    var history = undefined;
    
    //
    var configure = function(){
        
        //self = this;
        options.currentList = {};
        options.currentList.id = id;
        options.currentList.tableId = options.listTableId;
        options.currentList.tbodyId = options.listTbodyId;
        options.currentList.thisOptions = thisOptions;
        options.currentList.fields = buildFields();
        
        registerComponent( 
            'paging',
            function(){
                return new PagingComponent( options, self );
            }
        );
        registerComponent( 
            'sorting',
            function(){
                return new SortingComponent( options, self );
            }
        );
        registerComponent( 
            'selecting',
            function(){
                return new SelectingComponent( options, self );
            }
        );
        registerComponent( 
            'filtering',
            function(){
                return new FilteringComponent( options, self );
            }
        );
    };
    
    var registerComponent = function( componentId, constructorFunction ){
        
        //var thisComponent = options[ componentId ].isOn? constructorFunction(): undefined;
        var thisComponent = options.pages.list.components[ componentId ].isOn? constructorFunction(): undefined;
        if ( thisComponent ){
            //options[ componentId ].component = thisComponent;
            components[ componentId ] = thisComponent;
        }
    };
    
    var buildFields = function(){
        var fields = [];
        
        $.each( options.fields, function ( fieldId, field ) {
            if ( field.list == false ) {
                return;
            }
            fields.push( field );
        });
        
        return fields;
    };
    
    var buildDataToSend = function(){
        
        var data = {};  
        data.filter = filter;
        
        for ( var id in components ){
            var component = components[ id ];
            if ( component && $.isFunction( component.addToDataToSend ) ){
                component.addToDataToSend( data );
            }
        }
        
        return data;
    };
    
    var dataFromServer = function( data ){
        
        for ( var id in components ){
            var component = components[ id ];
            if ( component && $.isFunction( component.dataFromServer ) ){
                component.dataFromServer( data );
            }
        }
    };
    
    // Main method
    var show = function ( showBusyFull, dictionaryExtension, root, callback ) {
        
        // TODO Uncomment this when ZPT uses promises 
        //context.showBusy( options, showBusyFull );
        
        var listData = {
            search: buildDataToSend(),
            success: function( data ){
                dataFromServer( data );
                updateDictionary( data, dictionaryExtension );
                buildRecords();
                context.hideBusy( options, showBusyFull );
                buildHTMLAndJavascript( root );
                if ( callback ){
                    callback( true );
                }
            },
            error: function(){
                context.hideBusy( options, showBusyFull );
                context.showError( options.messages.serverCommunicationError );
                if ( callback ){
                    callback( false );
                }
            }
        };

        crudManager.listRecords( listData, options );
    };
    
    var updateDictionary = function( data, dictionaryExtension ){

        var thisDictionary = $.extend( {
                options: options,
                records: data.records
            }, options.dictionary );
        
        if ( dictionaryExtension ){
            dictionary = $.extend( {}, thisDictionary, dictionaryExtension );
        } else {
            dictionary = thisDictionary;
        }
        
        dictionary.instance = self;
    };
    
    //
    var resetPage = function(){
        
        for ( var id in components ){
            var component = components[ id ];
            if ( component && $.isFunction( component.resetPage ) ){
                component.resetPage();
            }
        }
    };
    
    //
    var buildHTMLAndJavascript = function( root ){
        
        if ( ! root ){
            pageUtils.configureTemplate( options, "'" + options.pages.list.template + "'" );
            
        } else {
            resetPage();
        }
        
        context.getZPTParser().run({
            //root: options.target[0],
            root: root || options.body,
            dictionary: dictionary,
            notRemoveGeneratedTags: false
        });
        
        bindEvents();
    };
    
    var bindEvents = function() {

        // Add events of create, edit and delete buttons
        var createButtons = $( '.zcrud-new-command-button' )
            .click(function ( event ) {
                event.preventDefault();
                event.stopPropagation();
                showCreateForm( event );
            });
        var editButtons = $( '.zcrud-edit-command-button' )
            .click(function ( event ) {
                event.preventDefault();
                event.stopPropagation();
                showEditForm( event );
            });
        var deleteButtons = $( '.zcrud-delete-command-button' )
            .click(function ( event ) {
                event.preventDefault();
                event.stopPropagation();
                showDeleteForm( event );
            });
        
        // Add events of components
        for ( var id in components ){
            var component = components[ id ];
            component.bindEvents();
        }
        
        // Add events of an editable list
        if ( thisOptions.editable.isOn ){
            bindEditableListEvents( thisOptions.editable );
        }
    };
    
    var bindEditableListEvents = function( editableOptions ){
        
        //alert( 'bindEditableListEvents' );
        history = new History( thisOptions.editable, dictionary );
        
        var editableEvent = editableOptions.event;
        switch ( editableEvent ){
            case 'fieldChange':
                // Send change of the field data to server
                break;
            case 'batch':
                // Register change of the field
                registerEventForEditableFields(
                    $( '#' + id ));
                break;
            default:
                alert( 'Unknown event in editable list: ' + editableEvent );
        }
        
        // Buttons
        var $this = $( '#' + id );
        $this.find( '.zcrud-undo-command-button' ).click( function ( event ) {
            undo( event );
        });
        $this.find( '.zcrud-redo-command-button' ).click( function ( event ) {
            redo( event );
        });
        $this.find( '.zcrud-save-command-button' ).click( function ( event ) {
            save( event );
        });
        $this.find( '.zcrud-new-row-command-button' ).click( function ( event ) {
            addNewRow( event );
        });
        $this.find( '.zcrud-delete-row-command-button' ).click( function ( event ) {
            deleteRow( event );
        });
    };
    
    var registerEventForEditableFields = function( $preselection ){
        
        $preselection
            .find( '.zcrud-column-data input' )
            .off() // Remove previous event handlers
            .change( function ( event ) {
                var $this = $( this );
                history.putChange( 
                    $this, 
                    $this.val(), 
                    $this.closest( 'tr' ).attr( 'data-record-index' ),
                    id );
        });
    };
    
    var deleteRow = function( event ){
        if ( ! checkHistory() ){
            return false;
        }

        var $tr =  $( event.target ).closest( 'tr' );
        var key = $tr.attr( 'data-record-key' );
        var rowIndex = $tr.attr( 'data-record-index' );
        /*
        alert( 'deleteRow' 
              + '\nkey: ' + key
              + '\nrowIndex: ' + rowIndex 
              + '\ndeleteRow: ' + records[ key ].name);
        */
        history.putDelete( id, options, rowIndex, key, $tr );
    };
    
    var addNewRow = function( event ){
        if ( ! checkHistory() ){
            return false;
        }

        //var newRecord = {};
        var thisDictionary = $.extend( {}, dictionary, {} );
        //thisDictionary.records = [ newRecord ];
        thisDictionary.records = [{}];
        
        var createHistoryItem = history.putCreate( id, options, thisDictionary );
        registerEventForEditableFields( 
            createHistoryItem.get$Tr() );
    };
    
    var showCreateForm = function( event ){
        //alert( 'showCreateForm' );
        showForm( options, 'create' );
    };
    
    var showEditForm = function( event ){
        var key = getKeyFromButton( event );
        //alert( 'showEditForm: ' + records[ key ].name );
        showForm( options, 'update', records[ key ] );
    };
    
    var showDeleteForm = function( event ){
        var key = getKeyFromButton( event );
        //alert( 'showDeleteForm: ' + records[ key ].name );
        showForm( options, 'delete', records[ key ] );
    };
    
    var showForm = function( options, type, record ){
        var formPage =  new FormPage( options, type, getId() );
        
        if ( record ){
            formPage.setRecord( record );
        } else {
            formPage.updateRecordFromDefaultValues();
        }
        
        formPage.show();
    };
    
    var getKeyFromButton = function( event ){
        return $( event.target ).parent().parent().attr( 'data-record-key' );
    };
    
    // Iterate dictionary.records (an array) and put them into records (a map) using the id of each record as the key
    var buildRecords = function(){
        records = {};
        for ( var c = 0; c < dictionary.records.length; c++ ) {
            var record = dictionary.records[ c ];
            records[ record[ options.key ] ] = record;
        }
    };
    
    var getId = function(){
        return id;      
    };
    
    var getRecordByKey = function( key ){
        return records[ key ];
    };
    
    var getOptions = function(){
        return options;
    };
    
    var selectRows = function( rows ){
        var selectionComponent = components[ 'selecting' ];
        if ( ! selectionComponent ){
            return;
        }
        selectionComponent.selectRows( rows );
    };

    var selectedRows = function(){
        var selectionComponent = components[ 'selecting' ];
        if ( ! selectionComponent ){
            return;
        }
        return selectionComponent.selectedRows();
    };

    var selectedRecords = function(){
        var selectionComponent = components[ 'selecting' ];
        if ( ! selectionComponent ){
            return;
        }
        return selectionComponent.selectedRecords();
    };
    
    var getComponent = function( id ){
        return components[ id ];
    };
    
    // History methods
    var checkHistory = function(){
        if ( ! history ){
            alert( 'History not initialized!' );
            return false;
        }
        return true;
    };
    var undo = function(){
        if ( ! checkHistory() ){
            return;
        }
        history.undo( id );
    };
    var redo = function(){
        if ( ! checkHistory() ){
            return;
        }
        history.redo( id );
    };
    var isRedoEnabled = function(){
        if ( ! checkHistory() ){
            return false;
        }
        return history.isRedoEnabled();
    };
    var isUndoEnabled = function(){
        if ( ! checkHistory() ){
            return false;
        }
        return history.isUndoEnabled();
    };
    
    var showStatusMessage = function( dictionaryExtension ){
        
        var thisDictionary = $.extend( {}, dictionary, dictionaryExtension );
        
        context.getZPTParser().run({
            root: $( '#' + id ).find( '.zcrud-status' )[0],
            dictionary: thisDictionary
        });
    };
    
    var save = function( event ){
        if ( ! checkHistory() ){
            return false;
        }
        /*
        var actionsObject = history.buildActionsObject( dictionary.records );
        if ( Object.keys( actionsObject.modified ).length == 0 
            && actionsObject.new.length == 0 
            && actionsObject.deleted.length == 0){
            alert( 'No operations done!' );
            return false;
        }
        
        var transformed = processActionsObject( actionsObject );
        */
        var dataToSend = history.buildDataToSend( options, thisOptions, dictionary.records );
        if ( dataToSend.existingRecords && Object.keys( dataToSend.existingRecords ).length == 0 
            && dataToSend.newRecords && dataToSend.newRecords.length == 0 
            && dataToSend.deleted && dataToSend.deleted.recordsToRemove == 0){
            alert( 'No operations done!!!' );
            return false;
        }

        if ( dataToSend ){
            var data = {
                existingRecords: dataToSend.existingRecords,
                newRecords: dataToSend.newRecords,
                recordsToRemove: dataToSend.recordsToRemove,
                success: function( dataFromServer ){
                    showStatusMessage({
                        status:{
                            message: 'listUpdateSuccess',
                            date: new Date().toLocaleString()   
                        }
                    });
                    history.reset( id );
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
            alert( thisOptions.editable.dataToSend + '\n' + JSON.stringify( data ) );
            crudManager.listBatchUpdate( data, options, event );
        }
        
        return dataToSend;
    };
    /*
    var processActionsObject = function( actionsObject ){
        
        // 
        var sendOnlyModified = undefined;
        switch( thisOptions.editable.dataToSend ){
            case 'all':
                sendOnlyModified = false;
                break;
            case 'modified':
                sendOnlyModified = true;
                break;
            default:
                alert( 'Unknown dataToSend option in editable list: ' + editableOptions.dataToSend );
                return false;
        }
        
        var dataToSend = {
            existingRecords: {},
            newRecords: [],
            recordsToRemove: []
        };
        for ( var rowIndex in actionsObject.modified ){
            var row = actionsObject.modified[ rowIndex ];
            var record = dictionary.records[ rowIndex ];
            var key = record[ options.key ];
            
            if ( actionsObject.deleted.indexOf( key ) != -1 ){
                continue;
            }
            
            if ( ! sendOnlyModified ){
                var previousRecord = records[ key ];
                row = $.extend( true, {}, previousRecord, row );
            }
            dataToSend.existingRecords[ key ] = row;
        }
        for ( rowIndex in actionsObject.new ){
            row = actionsObject.new[ rowIndex ];
            key = row[ options.key ];

            dataToSend.newRecords.push( row );
        }
        dataToSend.recordsToRemove = actionsObject.deleted;

        return dataToSend;
    };*/
    
    var updateRecords = function( data ){
        
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
    
    var self = {
        show: show,
        getId: getId,
        showCreateForm: showCreateForm,
        getRecordByKey: getRecordByKey,
        getOptions: getOptions,
        selectRows: selectRows,
        selectedRows: selectedRows,
        selectedRecords: selectedRecords,
        getComponent: getComponent,
        undo: undo,
        redo: redo,
        isRedoEnabled: isRedoEnabled,
        isUndoEnabled: isUndoEnabled,
        save: save
    };
    
    configure();
    //options.currentList.instance = self;
    
    return self;
};

module.exports = ListPage;
