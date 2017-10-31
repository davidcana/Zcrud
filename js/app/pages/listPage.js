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
var History = require( '../history.js' );
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
                buildHTMLAndJavascript( root, callback, true );
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
            dictionary: dictionary
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
            case 'rowChange':
            case 'batch':
                // Register change of the field
                $( '#' + id )
                    .find( '.zcrud-column-data input' )
                    .off() // Remove previous event handlers
                    .change( function ( event ) {
                        var $this = $( this );
                        history.put( 
                            $this, 
                            $this.val(), 
                            $this.closest( 'tr' ).attr( 'data-record-index' ) );
                });
                break;
            default:
                alert( 'Unknown event in editable list: ' + editableEvent );
        }
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
        history.undo();
    };
    var redo = function(){
        if ( ! checkHistory() ){
            return;
        }
        history.redo();
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
        isUndoEnabled: isUndoEnabled
    };
    
    configure();
    //options.currentList.instance = self;
    
    return self;
    /*
    return {
        show: show,
        getId: getId,
        showCreateForm: showCreateForm,
        getRecordByKey: getRecordByKey,
        getOptions: getOptions,
        selectRows: selectRows,
        selectedRows: selectedRows,
        selectedRecords: selectedRecords,
        configure: configure
    };*/
};

module.exports = ListPage;
