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
var optionListProviderManager = require( '../fields/optionListProviderManager.js' );
var History = require( '../history/history.js' );
var fieldListBuilder = require( '../fieldListBuilder.js' );
var $ = require( 'jquery' );
var zpt = require( 'zpt' );
var log = zpt.logHelper;

var ListPage = function ( optionsToApply, userDataToApply ) {
    "use strict";
    
    var options = optionsToApply;
    var getOptions = function(){
        return options;
    };
    
    var userData = userDataToApply || {};
    
    var filter = userData.filter || {};
    var userRecords = userData.records;
    
    var thisOptions = options.pageConf.pages.list;
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
    /*
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
    };*/
    /*
    var buildFields = function(){

        fields = fieldListBuilder.build( thisOptions.fields, options );
        fieldsMap = fieldListBuilder.buildMapFromArray( fields );
    };
    */
    var buildFields = function(){

        var fieldsCache = fieldListBuilder.get( 'list', options );
        fields = fieldsCache.fieldsArray;
        fieldsMap = fieldsCache.fieldsMap;
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
    
    var buildDataFromClient = function( dataToSendToServer, recordsDiff ) {
        
        var data = {};
        
        data.result = 'OK';
        data.message = '';
        data.records = buildRecordsArray();
        data.totalNumberOfRecords = recordsDiff + getTotalNumberOfRecords();
        
        return data;
    };
    
    var showFromClientOnly = function ( showBusyFull, dictionaryExtension, dataToSendToServer ) {
        
        var recordsDiff = History.updateRecordsMap( records, dataToSendToServer, options.key );
        
        clientAndServerSuccessFunction( 
            buildDataFromClient( dataToSendToServer, recordsDiff ),
            showBusyFull, 
            dictionaryExtension );
    };
    
    var getRecordsPaging = function( recordsArray, data ){
        
        if ( data.pageNumber && data.pageSize ){
            var firstElementIndex = ( data.pageNumber - 1 ) * data.pageSize;
            return recordsArray.slice(
                firstElementIndex, 
                firstElementIndex + data.pageSize ); 
        }
        
        return recordsArray;
    };
    
    var buildDataUsingUserRecords = function() {
        
        var data = {};

        data.result = 'OK';
        data.message = '';
        data.records = getRecordsPaging( userRecords, buildDataToSend() );
        data.totalNumberOfRecords = userRecords.length;

        return data;
    };
    
    var showUsingRecords = function ( showBusyFull, dictionaryExtension, root, callback ) {
        
        clientAndServerSuccessFunction( 
            buildDataUsingUserRecords(),
            showBusyFull, 
            dictionaryExtension, 
            root, 
            callback );
    };
    
    var clientAndServerSuccessFunction = function( data, showBusyFull, dictionaryExtension, root, callback ){
        
        dataFromServer( data );
        beforeProcessTemplate( data, dictionaryExtension );
        context.hideBusy( options, showBusyFull );
        buildHTMLAndJavascript( root );
        if ( callback ){
            callback( true );
        }
    };
    
    var show = function ( showBusyFull, dictionaryExtension, root, callback ) {

        // TODO Uncomment this when ZPT uses promises 
        //context.showBusy( options, showBusyFull );

        if ( userRecords ){
            showUsingRecords( showBusyFull, dictionaryExtension, root, callback );
            return;
        }
        
        crudManager.listRecords( 
            {
                search: buildDataToSend(),
                success: clientAndServerSuccessFunction,
                error: function(){
                    context.hideBusy( options, showBusyFull );
                    context.showError( options, 'Server communication error!' );
                    if ( callback ){
                        callback( false );
                    }
                }
            }, 
            options );
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
        
        fieldBuilder.addFieldManagersToDictionary( dictionary );
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
        showForm( 'create' );
    };
    
    var showEditForm = function( event, forcedKey ){
        var key = forcedKey || getKeyFromButton( event );
        showForm( 'update', records[ key ] );
    };
    
    var showDeleteForm = function( event, forcedKey ){
        var key = forcedKey || getKeyFromButton( event );
        showForm( 'delete', records[ key ] );
    };
    
    var showForm = function( type, record ){
        var formPage =  new FormPage( options, type, record, self );        
        formPage.show();
    };
    
    var instanceNewForm = function( type, record ){
        return new FormPage( options, type, record, self );        
    }
    
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
    var buildRecordsArray = function(){
        var recordsArray = [];
        for ( var index in records ) {
            var record = records[ index ];
            recordsArray.push( record );
        }
        return recordsArray;
    };
    
    var getId = function(){
        return id;      
    };
    
    var getRecordByKey = function( key ){
        return records[ key ];
    };
    
    var getRowByKey = function( key ){
        return $( '#' + id ).find( "[data-record-key='" + key + "']" );
    };
    
    var selectRecords = function( rows ){
        var selectionComponent = components[ 'selecting' ];
        if ( ! selectionComponent ){
            return;
        }
        selectionComponent.selectRecords( rows );
    };
    
    var deselectRecords = function( rows ){
        var selectionComponent = components[ 'selecting' ];
        if ( ! selectionComponent ){
            return;
        }
        selectionComponent.deselectRecords( rows );
    };
    
    var selectRows = function( rows ){
        var selectionComponent = components[ 'selecting' ];
        if ( ! selectionComponent ){
            return;
        }
        selectionComponent.selectRows( rows );
    };
    
    var deselectRows = function( rows ){
        var selectionComponent = components[ 'selecting' ];
        if ( ! selectionComponent ){
            return;
        }
        selectionComponent.deselectRows( rows );
    };
    
    var getSelectedRows = function(){
        var selectionComponent = components[ 'selecting' ];
        if ( ! selectionComponent ){
            return;
        }
        return selectionComponent.getSelectedRows();
    };

    var getSelectedRecords = function(){
        var selectionComponent = components[ 'selecting' ];
        if ( ! selectionComponent ){
            return;
        }
        return selectionComponent.getSelectedRecords();
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
    
    var updateBottomPanel = function( dictionaryExtension ){
        
        var thisDictionary = $.extend( {}, dictionary, dictionaryExtension );

        context.getZPTParser().run({
            root: $( '#' + id ).find( '.zcrud-bottom-panel' )[0],
            dictionary: thisDictionary,
            notRemoveGeneratedTags: false
        });
    };
    
    var getRecords = function(){
        return records;
    };
    var getRecordsArray = function(){
        return buildRecordsArray();
    };
    
    var getDictionary = function(){
        return dictionary;
    };
    
    var getPostTemplate = function( field ){
        return fieldBuilder.getPostTemplate( field );
    };

    var get$form = function(){
        return $( '#' + thisOptions.formId );
    };
    
    var getTotalNumberOfRecords = function(){
        var pagingComponent = components[ 'paging' ];
        if ( ! pagingComponent ){
            return Object.keys( records ).length;
        }
        return pagingComponent.getTotalNumberOfRecords();
    };
    
    var addRecord = function( key, record ){
        records[ key ] = record;
        dictionary.records.push( record );
    };
    var updateRecord = function( key, record ){
        records[ key ] = record;
        dictionary.records[ getIndexInDictionaryByKey( key ) ] = record;
    };
    var deleteRecord = function( key ){
        delete records[ key ];
        dictionary.records.splice( getIndexInDictionaryByKey( key ), 1 );
    };
    var getIndexInDictionaryByKey = function( key ){
        for ( var c = 0; c < dictionary.records.length; c++ ) {
            var record = dictionary.records[ c ];
            if ( key == record[ options.key ] ){
                return c;
            }
        }
        
        var message = 'Record not found in dictionary!'
        alert( message );
        throw message;
    };
    
    /*
    var update$trs = function( $trArray, records ){
        
        var thisDictionary = $.extend( {}, dictionary );
        
        for ( var c = 0; c < $trArray.length; ++c ){
            var $tr = $trArray[ c ];
            var record = records[ c ];
            
            if ( ! record ){
                continue;
            }
            
            thisDictionary.record = record;
            
            context.getZPTParser().run({
                root: $tr[0],
                dictionary: thisDictionary,
                notRemoveGeneratedTags: false
            });   
        }
    };*/
    
    var self = {
        show: show,
        showFromClientOnly: showFromClientOnly,
        showUsingRecords: showUsingRecords,
        getId: getId,
        showCreateForm: showCreateForm,
        showEditForm: showEditForm,
        showDeleteForm: showDeleteForm,
        getRecordByKey: getRecordByKey,
        getRowByKey: getRowByKey,
        getOptions: getOptions,
        getThisOptions: getThisOptions,
        selectRecords: selectRecords,
        deselectRecords: deselectRecords,
        selectRows: selectRows,
        deselectRows: deselectRows,
        getSelectedRows: getSelectedRows,
        getSelectedRecords: getSelectedRecords,
        getComponent: getComponent,
        showStatusMessage: showStatusMessage,
        updateBottomPanel: updateBottomPanel,
        getRecords: getRecords,
        getRecordsArray: getRecordsArray,
        getDictionary: getDictionary,
        getField: getField,
        getFieldByName: getFieldByName,
        getFields: getFields,
        getPostTemplate: getPostTemplate,
        get$form: get$form,
        instanceNewForm: instanceNewForm,
        addRecord: addRecord,
        updateRecord: updateRecord,
        deleteRecord: deleteRecord
        //update$trs: update$trs
    };
    
    configure();
    
    return self;
};

module.exports = ListPage;
