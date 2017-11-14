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
var EditingComponent = require( './editingComponent.js' );
var crudManager = require( '../crudManager.js' );
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
    
    // Initial configuration
    var configure = function(){
        
        // TODO Refactorize this, remove options.currentList
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
        registerComponent( 
            'editing',
            function(){
                return new EditingComponent( options, self );
            }
        );
    };
    
    var registerComponent = function( componentId, constructorFunction ){
        
        var thisComponent = options.pages.list.components[ componentId ].isOn? constructorFunction(): undefined;
        if ( thisComponent ){
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
    
    // Reset all components
    var resetPage = function(){
        
        for ( var id in components ){
            var component = components[ id ];
            if ( component && $.isFunction( component.resetPage ) ){
                component.resetPage();
            }
        }
    };
    
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

        // Bind events of create, edit and delete buttons
        var createButtons = $( '.zcrud-new-command-button' )
            .off()
            .click( function ( event ) {
                event.preventDefault();
                event.stopPropagation();
                showCreateForm( event );
            });
        var editButtons = $( '.zcrud-edit-command-button' )
            .off()
            .click( function ( event ) {
                event.preventDefault();
                event.stopPropagation();
                showEditForm( event );
            });
        var deleteButtons = $( '.zcrud-delete-command-button' )
            .off()
            .click( function ( event ) {
                event.preventDefault();
                event.stopPropagation();
                showDeleteForm( event );
            });
        
        // Bind events of components
        for ( var id in components ){
            var component = components[ id ];
            component.bindEvents();
        }
    };
    
    var showCreateForm = function( event ){
        showForm( options, 'create' );
    };
    
    var showEditForm = function( event ){
        var key = getKeyFromButton( event );
        showForm( options, 'update', records[ key ] );
    };
    
    var showDeleteForm = function( event ){
        var key = getKeyFromButton( event );
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
    
    var showStatusMessage = function( dictionaryExtension ){
        
        var thisDictionary = $.extend( {}, dictionary, dictionaryExtension );
        
        context.getZPTParser().run({
            root: $( '#' + id ).find( '.zcrud-status' )[0],
            dictionary: thisDictionary
        });
    };
    
    var getRecords = function(){
        return records;
    };
    
    var getDictionary = function(){
        return dictionary;
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
        showStatusMessage: showStatusMessage,
        getRecords: getRecords,
        getDictionary: getDictionary
    };
    
    configure();
    //options.currentList.instance = self;
    
    return self;
};

module.exports = ListPage;
