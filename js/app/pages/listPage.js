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
var fieldBuilder = require( '../fields/fieldBuilder' );
var $ = require( 'jquery' );
var zpt = require( 'zpt' );
var log = zpt.logHelper;

var ListPage = function ( optionsToApply, filterToApply ) {
    "use strict";
    
    var options = optionsToApply;
    var getOptions = function(){
        return options;
    };
    
    var filter = filterToApply || {};
    
    var thisOptions = options.pages.list;
    var getThisOptions = function(){
        return thisOptions;
    };
    
    var dictionary = undefined;
    var records = {};
    var id = thisOptions.id;
    var components = {};
    
    var fieldsMap = {};
    var getField = function( fieldId ){
        return fieldsMap[ fieldId ];
    };
    var getFieldByName = function( fieldName ){
        // Must remove [] and its contents
        var index = fieldName.indexOf( '[' );
        return getField( index === -1? fieldName: fieldName.substring( 0, index ) );
    };
    var fields = undefined;
    var getFields = function(){
        return fields;
    };
    
    // Initial configuration
    var configure = function(){

        buildFields();
        
        registerComponent( 
            'paging',
            function(){
                return new PagingComponent( options, thisOptions.components.paging, self );
            }
        );
        registerComponent( 
            'sorting',
            function(){
                return new SortingComponent( options, thisOptions.components.sorting, self );
            }
        );
        registerComponent( 
            'selecting',
            function(){
                return new SelectingComponent( options, thisOptions.components.selecting, self );
            }
        );
        registerComponent( 
            'filtering',
            function(){
                return new FilteringComponent( options, thisOptions.components.filtering, self );
            }
        );
        registerComponent( 
            'editing',
            function(){
                return new EditingComponent( options, thisOptions.components.editing, self );
            }
        );
    };
    
    var registerComponent = function( componentId, constructorFunction ){
        
        var thisComponent = thisOptions.components[ componentId ].isOn? constructorFunction(): undefined;
        if ( thisComponent ){
            components[ componentId ] = thisComponent;
        }
    };
    
    var buildFields = function(){
        
        fields = [];
        fieldsMap = {};
        
        $.each( options.fields, function ( fieldId, field ) {
            if ( field.list == false ) {
                return;
            }
            fields.push( field );
            fieldsMap[ fieldId ] = field;
        });
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
    
    /*
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
                context.showError( options, options.messages.serverCommunicationError );
                if ( callback ){
                    callback( false );
                }
            }
        };

        crudManager.listRecords( listData, options );
    };*/
    
    // Main method
    var show = function ( showBusyFull, dictionaryExtension, root, callback ) {
        
        // TODO Uncomment this when ZPT uses promises 
        //context.showBusy( options, showBusyFull );
        
        var listData = {
            search: buildDataToSend(),
            success: function( data ){
                dataFromServer( data );
                beforeProcessTemplate( data, dictionaryExtension );
                context.hideBusy( options, showBusyFull );
                buildHTMLAndJavascript( root );
                if ( callback ){
                    callback( true );
                }
            },
            error: function(){
                context.hideBusy( options, showBusyFull );
                context.showError( options, options.messages.serverCommunicationError );
                if ( callback ){
                    callback( false );
                }
            }
        };

        crudManager.listRecords( listData, options );
    };
    
    var beforeProcessTemplate = function( data, dictionaryExtension ){

        updateDictionary( data, dictionaryExtension );
        buildRecords();
        
        for ( var id in components ){
            var component = components[ id ];
            if ( component && $.isFunction( component.beforeProcessTemplate ) ){
                component.beforeProcessTemplate();
            }
        }
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
            pageUtils.configureTemplate( options, "'" + thisOptions.template + "'" );
            
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
        $( '.zcrud-new-command-button' )
            .off()
            .click( function ( event ) {
                event.preventDefault();
                event.stopPropagation();
                showCreateForm( event );
            });
        $( '.zcrud-edit-command-button' )
            .off()
            .click( function ( event ) {
                event.preventDefault();
                event.stopPropagation();
                showEditForm( event );
            });
        $( '.zcrud-delete-command-button' )
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
        var formPage =  new FormPage( options, type, record );
        
        /*
        if ( record ){
            formPage.setRecord( record );
        } else {
            formPage.updateRecordFromDefaultValues();
        }*/
        
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
    
    var filterRecordProperties = function( record ){
        
        var filtered = {};
        
        for ( var propertyId in record ){
            if ( ! propertyId.startsWith( '_' ) ){
                filtered[ propertyId ] = record[ propertyId ];
            }
        }
        
        return filtered;
    };
    
    var getRecordByKey = function( key, full ){
        
        var record = records[ key ];
        return full || ! record? record: filterRecordProperties( record );
        //return records[ key ];
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
        getThisOptions: getThisOptions,
        selectRows: selectRows,
        selectedRows: selectedRows,
        selectedRecords: selectedRecords,
        getComponent: getComponent,
        showStatusMessage: showStatusMessage,
        getRecords: getRecords,
        getDictionary: getDictionary,
        getField: getField,
        getFieldByName: getFieldByName,
        getFields: getFields
    };
    
    configure();
    //options.currentList.instance = self;
    
    return self;
};

module.exports = ListPage;
