/* 
    Class ListPage 
*/
var context = require( '../context.js' );
var pageUtils = require( './pageUtils.js' );
var FormPage = require( './formPage.js' );
var crudManager = require( '../crudManager.js' );
var History = require( '../history/history.js' );
var fieldListBuilder = require( '../fields/fieldListBuilder.js' );
var ComponentsMap = require( '../components/componentsMap.js' );
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
    
    var currentFormPage = undefined;
    var getCurrentFormPage = function(){
        return currentFormPage;
    };
    
    var componentsMap = undefined;
    
    // Initial configuration
    var configure = function(){

        buildFields();
        componentsMap = new ComponentsMap( options, thisOptions.components, self, self );
    };

    var buildFields = function(){

        var fieldsCache = fieldListBuilder.get( 'list', options, undefined, self );
        fields = fieldsCache.fieldsArray;
        fieldsMap = fieldsCache.fieldsMap;
    };
    
    var buildDataToSend = function(){
        
        var data = {};
        
        data.filter = filter;
        componentsMap.addToDataToSend( data );
        
        return data;
    };
    
    var buildDataFromClient = function( dataToSendToServer, recordsDiff ) {
        
        var data = {};
        
        data.result = 'OK';
        data.message = '';
        data.records = buildRecordsArray();
        data.totalNumberOfRecords = recordsDiff + getTotalNumberOfRecords();
        
        return data;
    };
    
    var showFromClientOnly = function ( dictionaryExtension, dataToSendToServer ) {
        
        var recordsDiff = History.updateRecordsMap( records, dataToSendToServer, options.key );
        
        clientAndServerSuccessFunction( 
            buildDataFromClient( dataToSendToServer, recordsDiff ),
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
    
    var showUsingRecords = function ( dictionaryExtension, root, callback ) {
        
        clientAndServerSuccessFunction( 
            buildDataUsingUserRecords(),
            dictionaryExtension, 
            root, 
            callback );
    };
    
    var clientAndServerSuccessFunction = function( data, dictionaryExtension, root, callback ){
        
        componentsMap.dataFromServer( data );
        beforeProcessTemplate( data, dictionaryExtension );
        buildHTMLAndJavascript( root );
        if ( callback ){
            callback( true );
        }
    };
    
    var show = function ( dictionaryExtension, root, callback ) {

        if ( userRecords ){
            showUsingRecords( dictionaryExtension, root, callback );
            return;
        }
        
        crudManager.listRecords( 
            {
                search: buildDataToSend(),
                success: clientAndServerSuccessFunction,
                error: function(){
                    context.showError( options, false, 'Server communication error!' );
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
    
    var buildHTMLAndJavascript = function( root ){
        
        if ( ! root ){
            pageUtils.configureTemplate( options, "'" + thisOptions.template + "'" );
            
        } else {
            componentsMap.resetPage();
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
        componentsMap.bindEvents();
    };
    
    var showCreateForm = function( event ){
        showForm( 'create' );
    };

    var showFormUsingAjax = function( type, event, forcedKey ){

        // Get the key of the record to get
        var key = forcedKey || getKeyFromButton( event );
        if ( key == undefined ){
            throw 'Error trying to load record in listPage: key is null!';
        }
        
        // Build the form instance
        currentFormPage =  new FormPage( options, type, undefined, self ); 
        
        // Build the data to send to the server
        var search = {
            key: key
        };
        currentFormPage.addToDataToSend( search );
        
        // Get the record from the server and show the form
        crudManager.getRecord( 
            {
                url: thisOptions.getRecordURL,
                search: search,
                success: function( dataFromServer ){
                    currentFormPage.setRecord( dataFromServer.record );
                    currentFormPage.show();
                    //showForm( type, dataFromServer.record );
                },
                error: function(){
                    context.showError( options, false, 'Server communication error!' );
                }
            }, 
            options );
    };
    
    var showEditForm = function( event, forcedKey ){
        showFormUsingAjax( 'update', event, forcedKey );
    };
    /*
    var showEditForm = function( event, forcedKey ){

        var key = forcedKey || getKeyFromButton( event );
        var record = records[ key ];
        showForm( 'update', record );
    };*/
    
    var showDeleteForm = function( event, forcedKey ){
        showFormUsingAjax( 'delete', event, forcedKey );
    };
    /*
    var showDeleteForm = function( event, forcedKey ){
        
        var key = forcedKey || getKeyFromButton( event );
        var record = records[ key ];
        showForm( 'delete', record );
    };*/
    
    var showForm = function( type, record ){
        currentFormPage =  new FormPage( options, type, record, self );        
        currentFormPage.show();
    };
    
    var instanceNewForm = function( type, record ){
        return new FormPage( options, type, record, self );        
    }
    
    var getKeyFromButton = function( event ){
        
        if ( ! event ){
            return;
        }
        
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
        return get$().find( "[data-record-key='" + key + "']" );
    };
    
    var getComponent = function( id ){
        return componentsMap.getComponent( id );
    };
    var getSecureComponent = function( id ){
        return componentsMap.getSecureComponent( id );
    };
    
    var showStatusMessage = function( dictionaryExtension ){
        
        var thisDictionary = $.extend( {}, dictionary, dictionaryExtension );
        
        context.getZPTParser().run({
            root: get$().find( '.zcrud-status' )[0],
            dictionary: thisDictionary
        });
    };
    
    var updateBottomPanel = function( dictionaryExtension ){
        
        var thisDictionary = $.extend( {}, dictionary, dictionaryExtension );

        context.getZPTParser().run({
            root: getComponent( 'paging' ).get$()[0],
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

    var get$form = function(){
        return $( '#' + thisOptions.formId );
    };
    var get$ = function(){
        return $( '#' + id );
    };
    
    var getTotalNumberOfRecords = function(){
        
        var pagingComponent = getComponent( 'paging' );
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
    
    var isEditable = function(){
        return getComponent( 'editing' )? true: false;
    };
    var isReadOnly = function(){
        return ! isEditable();
    };
    
    var getKey = function(){
        return options.key;
    };
    
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
        getComponent: getComponent,
        getSecureComponent: getSecureComponent,
        showStatusMessage: showStatusMessage,
        updateBottomPanel: updateBottomPanel,
        getRecords: getRecords,
        getRecordsArray: getRecordsArray,
        getDictionary: getDictionary,
        getField: getField,
        getFieldByName: getFieldByName,
        getFields: getFields,
        get$form: get$form,
        get$: get$,
        instanceNewForm: instanceNewForm,
        addRecord: addRecord,
        updateRecord: updateRecord,
        deleteRecord: deleteRecord,
        isEditable: isEditable,
        getKey: getKey,
        getCurrentFormPage: getCurrentFormPage,
        isReadOnly: isReadOnly
    };
    
    configure();
    
    return self;
};

module.exports = ListPage;
