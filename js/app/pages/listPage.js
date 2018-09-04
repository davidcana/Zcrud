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
var buttonUtils = require( '../buttons/buttonUtils.js' );
var $ = require( 'jquery' );
var zpt = require( 'zpt' );
var log = zpt.logHelper;

var ListPage = function ( optionsToApply, userDataToApply ) {
    "use strict";
    
    var options = optionsToApply;
    var getOptions = function(){
        return options;
    };
    
    var filter,
        userRecords,
        loadAtFirstExecution;
    var isFirstExecution = true;
    var initFromOptions = function( userData ){
        
        userData = userData || {};
        filter = userData.filter || {};
        userRecords = userData.records;
        loadAtFirstExecution = userData.load == undefined? true: userData.load;
    };
    initFromOptions( userDataToApply || {} );
    
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

        var fieldsCache = fieldListBuilder.getForPage( 'list', options, undefined, self );
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
    
    var buildDataUsingRecords = function( recordsToUse ) {
        
        var data = {};

        data.result = 'OK';
        data.message = '';
        data.records = getRecordsPaging( recordsToUse, buildDataToSend() );
        data.totalNumberOfRecords = recordsToUse.length;

        return data;
    };
    
    var showUsingRecords = function ( recordsToUse, dictionaryExtension, root, callback ) {
        
        clientAndServerSuccessFunction( 
            buildDataUsingRecords( recordsToUse ),
            dictionaryExtension, 
            root, 
            callback );
    };
    
    var clientAndServerSuccessFunction = function( data, dictionaryExtension, root, callback ){
        
        beforeProcessTemplate( data, dictionaryExtension );
        buildHTMLAndJavascript( root );
        if ( callback ){
            callback( true );
        }
    };
    
    var show = function( params ){
        
        // Init params
        params = params || {};
        var dictionaryExtension = params.dictionaryExtension;
        var root = params.root;
        var callback = params.callback;
        
        // Show list using user records
        if ( userRecords ){
            showUsingRecords( userRecords, dictionaryExtension, root, callback );
            isFirstExecution = false;
            return;
        }
        
        // Show list using no records
        if ( isFirstExecution && ! loadAtFirstExecution ){
            showUsingRecords( [], dictionaryExtension, root, callback );
            isFirstExecution = false;
            return;
        }
        
        // Show list using records from server
        showUsingServer( dictionaryExtension, root, callback );
        isFirstExecution = false;
    };
    
    var showUsingServer = function( dictionaryExtension, root, callback ) {

        var listInstance = self;
        crudManager.listRecords( 
            {
                search: buildDataToSend(),
                success: function( data ){
                    listInstance.clientAndServerSuccessFunction.call( 
                        listInstance, 
                        data, 
                        dictionaryExtension, 
                        root, 
                        callback );
                },
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
        
        componentsMap.dataFromServer( data );
        updateRecords( data.records );
        updateDictionary( data.records, dictionaryExtension );
    };
    
    var updateDictionary = function( newRecordsArray, dictionaryExtension ){

        var thisDictionary = $.extend(
            {
                options: options,
                records: newRecordsArray
            }, 
            options.dictionary );
        
        if ( dictionaryExtension ){
            dictionary = $.extend( {}, thisDictionary, dictionaryExtension );
        } else {
            dictionary = thisDictionary;
        }
        
        dictionary.instance = self;
        dictionary.editable = self.isEditable();
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
    
    var bindButtonEvent = function( button ){

        // Return if the button does not implement run method
        if ( ! $.isFunction( button.run ) ){
            return;    
        }
        
        $( button.getSelector() )
            .off()
            .click(
                function( event ){
                    button.run( event, self, this );   
                }
            );
    };
    
    var bindButtonsEvent = function( buttons ){
        
        for ( var c = 0; c < buttons.length; ++c ){
            var button = buttons[ c ];
            bindButtonEvent( button );
        }
    };
    
    var bindEvents = function() {

        // Bind events of buttons
        bindButtonsEvent( getToolbarButtons() );
        bindButtonsEvent( getByRowButtons() );
        /*
        var showCreateFormButton = new options.buttons.list_showCreateForm();
        bindButtonEvent( showCreateFormButton );
        
        var showEditFormButton = new options.buttons.list_showEditForm();
        bindButtonEvent( showEditFormButton );
        
        var showDeleteFormButton = new options.buttons.list_showDeleteForm();
        bindButtonEvent( showDeleteFormButton );
        */
        
        // Bind events of components
        componentsMap.bindEvents();
    };
    
    var showCreateForm = function( event ){
        showNewForm( 'create' );
    };

    var showNewFormUsingRecordFromServer = function( type, event, forcedKey ){

        // Get the key of the record to get
        var key = forcedKey || pageUtils.getKeyFromButton( event );
        if ( key == undefined ){
            throw 'Error trying to load record in listPage: key is null!';
        }

        // Build the form instance
        currentFormPage = new FormPage( 
            options, 
            {
                type: type, 
                parentPage: self
            }
        ); 
        
        // Update form retrieving record from server
        currentFormPage.show( 
            {
                key: key, 
                getRecordURL: thisOptions.getRecordURL 
            }
        );
    };
    
    var showEditForm = function( event, forcedKey ){
        showNewFormUsingRecordFromServer( 'update', event, forcedKey );
    };
    
    var showDeleteForm = function( event, forcedKey ){
        showNewFormUsingRecordFromServer( 'delete', event, forcedKey );
    };
    
    var showNewForm = function( type, record ){

        currentFormPage = new FormPage( 
            options, 
            {
                type: type, 
                parentPage: self,
                record: record
            }
        ); 
        
        currentFormPage.show();
    };
    
    var instanceNewForm = function( type, key ){
        
        return new FormPage( 
            options, 
            {
                type: type, 
                parentPage: self,
                record: getRecordByKey( key )
            }
        );
    }
    
    // Iterate dictionary.records (an array) and put them into records (a map) using the id of each record as the key
    /*
    var updateRecords = function(){
        
        records = {};
        for ( var c = 0; c < dictionary.records.length; c++ ) {
            var record = dictionary.records[ c ];
            records[ record[ options.key ] ] = record;
        }
    };*/
    var updateRecords = function( newRecordsArray ){

        records = {};
        for ( var c = 0; c < newRecordsArray.length; c++ ) {
            var record = newRecordsArray[ c ];
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
    
    var getName = function(){
        return options.entityId;      
    };
    
    var getRecordByKey = function( key, mustUpdateRecordFromSelection ){
        
        var record = records[ key ];
        
        if ( mustUpdateRecordFromSelection && ! this.readOnly ){
            // TODO Implement fieldUtils.updateRecordFromListSelection
            //fieldUtils.updateRecordFromListSelection( record, this.fieldsArray, $row );
        }

        return record;
    };
    /*
    var getRecordByKey = function( key ){
        return records[ key ];
    };*/
    
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
        pageUtils.showStatusMessage( get$(), dictionary, dictionaryExtension, context );
    };
    
    var updateBottomPanel = function( dictionaryExtension ){
        
        var thisDictionary = $.extend( {}, dictionary, dictionaryExtension );

        context.getZPTParser().run({
            root: getComponent( 'paging' ).get$()[0],
            dictionary: thisDictionary,
            notRemoveGeneratedTags: false
        });
        
        bindEvents();
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
    
    var isFiltered = function(){

        var filterComponent = getComponent( 'filtering' );
        return filterComponent && filterComponent.filterIsOn();
    };
    
    var getFieldsSource = function(){
        return options.fields;
    };
    
    var generateId = function(){
        return pageUtils.generateId();
    };

    var isDirty = function(){
        
        var history = context.getHistory();
        return history? history.isDirty(): false;
    };

    var byRowButtons = undefined;
    var getByRowButtons = function(){
        
        if ( byRowButtons == undefined ){
            byRowButtons = buttonUtils.getButtonList( 
                thisOptions.buttons.byRo2, 
                'listRow', 
                self,
                options );
        }
        
        return byRowButtons;
    };
    
    var toolbarButtons = undefined;
    var getToolbarButtons = function(){

        if ( toolbarButtons == undefined ){
            toolbarButtons = buttonUtils.getButtonList( 
                thisOptions.buttons.toolba2, 
                'listToolbar', 
                self,
                options );
        }

        return toolbarButtons;
    };
    
    var self = {
        show: show,
        showFromClientOnly: showFromClientOnly,
        showUsingRecords: showUsingRecords,
        getId: getId,
        getName: getName,
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
        isReadOnly: isReadOnly,
        clientAndServerSuccessFunction: clientAndServerSuccessFunction,
        isFiltered: isFiltered,
        getFieldsSource: getFieldsSource,
        generateId: generateId,
        updateRecords: updateRecords,
        isDirty: isDirty,
        getByRowButtons: getByRowButtons,
        getToolbarButtons: getToolbarButtons,
        bindButtonsEvent: bindButtonsEvent
    };
    
    configure();
    
    return self;
};

module.exports = ListPage;
