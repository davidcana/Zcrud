/* 
    Class ListPage 
*/
"use strict";

var context = require( '../context.js' );
var pageUtils = require( './pageUtils.js' );
var Page = require( './page.js' );
var FormPage = require( './formPage.js' );
var crudManager = require( '../crudManager.js' );
var History = require( '../history/history.js' );
var fieldListBuilder = require( '../fields/fieldListBuilder.js' );
var ComponentsMap = require( '../components/componentsMap.js' );
var buttonUtils = require( '../buttons/buttonUtils.js' );
var $ = require( 'jquery' );
var zpt = require( 'zpt' );
var utils = require( '../utils.js' );

var ListPage = function ( optionsToApply, userDataToApply ) {
    
    Page.call( this, optionsToApply, userDataToApply );
    
    this.isFirstExecution = true;
    this.thisOptions = this.options.pageConf.pages.list;
    this.records = {};
    this.id = this.thisOptions.id;
    this.currentFormPage = undefined;
    this.byRowButtons = undefined;
    
    this.initFromOptions( userDataToApply || {} );
    this.configure();
}
Page.doSuperClassOf( ListPage );
    
ListPage.prototype.initFromOptions = function( userData ){

    userData = userData || {};
    this.filter = userData.filter || {};
    this.userRecords = userData.records;
    this.loadAtFirstExecution = userData.load == undefined? true: userData.load;
};

ListPage.prototype.getField = function( fieldId ){
    return this.fieldsMap[ fieldId ];
};
ListPage.prototype.getFieldByName = function( fieldName ){

    // Must remove [] and its contents
    var index = fieldName.indexOf( '[' );
    return this.getField( index === -1? fieldName: fieldName.substring( 0, index ) );
};

ListPage.prototype.getCurrentFormPage = function(){
    return this.currentFormPage;
};
    
// Initial configuration
ListPage.prototype.configure = function(){

    this.buildFields();
    this.componentsMap = new ComponentsMap( this.options, this.thisOptions.components, this, this );
};

ListPage.prototype.buildFields = function(){

    var fieldsCache = fieldListBuilder.getForPage( 'list', this.options, undefined, this );
    this.fields = fieldsCache.fieldsArray;
    this.fieldsMap = fieldsCache.fieldsMap;
};
    
ListPage.prototype.buildDataToSend = function(){

    var data = {};

    data.filter = this.filter;
    this.componentsMap.addToDataToSend( data );

    return data;
};
    
ListPage.prototype.buildDataFromClient = function( dataToSendToServer, recordsDiff ) {

    var data = {};

    data.result = 'OK';
    data.message = '';
    data.records = this.buildRecordsArray();
    data.totalNumberOfRecords = recordsDiff + this.getTotalNumberOfRecords();

    return data;
};
    
ListPage.prototype.showFromClientOnly = function ( dictionaryExtension, dataToSendToServer ) {

    var recordsDiff = History.updateRecordsMap( this.records, dataToSendToServer, this.options.key );

    this.clientAndServerSuccessFunction( 
        this.buildDataFromClient( dataToSendToServer, recordsDiff ),
        dictionaryExtension );
};
    
ListPage.prototype.getRecordsPaging = function( recordsArray, data ){

    if ( data.pageNumber && data.pageSize ){
        var firstElementIndex = ( data.pageNumber - 1 ) * data.pageSize;
        return recordsArray.slice(
            firstElementIndex, 
            firstElementIndex + data.pageSize ); 
    }

    return recordsArray;
};
    
ListPage.prototype.buildDataUsingRecords = function( recordsToUse ) {

    var data = {};

    data.result = 'OK';
    data.message = '';
    data.records = this.getRecordsPaging( recordsToUse, this.buildDataToSend() );
    data.totalNumberOfRecords = recordsToUse.length;

    return data;
};
    
ListPage.prototype.showUsingRecords = function ( recordsToUse, dictionaryExtension, root, callback ) {

    this.clientAndServerSuccessFunction( 
        this.buildDataUsingRecords( recordsToUse ),
        dictionaryExtension, 
        root, 
        callback );
};

ListPage.prototype.clientAndServerSuccessFunction = function( data, dictionaryExtension, root, callback ){

    this.beforeProcessTemplate( data, dictionaryExtension );
    this.processTemplate( root );
    this.afterProcessTemplate( this.get$form() );

    if ( callback ){
        callback( true );
    }
};
    
ListPage.prototype.show = function( params ){

    // Init params
    params = params || {};
    var dictionaryExtension = params.dictionaryExtension;
    var root = params.root;
    var callback = params.callback;

    // Show list using user records
    if ( this.userRecords ){
        this.showUsingRecords( this.userRecords, dictionaryExtension, root, callback );
        this.isFirstExecution = false;
        return;
    }

    // Show list using no records
    if ( this.isFirstExecution && ! this.loadAtFirstExecution ){
        this.showUsingRecords( [], dictionaryExtension, root, callback );
        this.isFirstExecution = false;
        return;
    }

    // Show list using records from server
    this.showUsingServer( dictionaryExtension, root, callback );
    this.isFirstExecution = false;
};
    
ListPage.prototype.showUsingServer = function( dictionaryExtension, root, callback ) {

    var listInstance = this;
    crudManager.listRecords( 
        {
            url: this.thisOptions.getGroupOfRecordsURL,
            search: this.buildDataToSend(),
            success: function( data ){
                listInstance.clientAndServerSuccessFunction.call( 
                    listInstance, 
                    data, 
                    dictionaryExtension, 
                    root, 
                    callback );
            },
            error: function( dataFromServer ){
                context.showError( 
                    listInstance.options, 
                    false, 
                    dataFromServer.message || 'Server communication error!'
                );
                if ( callback ){
                    callback( false );
                }
            }
        }, 
        this.options );
};
    
ListPage.prototype.beforeProcessTemplate = function( data, dictionaryExtension ){

    this.componentsMap.dataFromServer( data );
    this.filterArrayOfRecordsFromServerData( data.records, this.fields );
    this.updateRecords( data.records );
    this.updateDictionary( data.records, dictionaryExtension );
};

ListPage.prototype.updateDictionary = function( newRecordsArray, dictionaryExtension ){

    this.instanceDictionaryExtension = {
        records: newRecordsArray,
        instance: this,
        editable: this.isEditable(),
        omitKey: false
    };
    
    if ( dictionaryExtension ){
        utils.extend( this.instanceDictionaryExtension, dictionaryExtension );
    }
};

ListPage.prototype.processTemplate = function( root ){

    if ( ! root ){
        pageUtils.configureTemplate( this.options, "'" + this.thisOptions.template + "'" );
    } else {
        this.componentsMap.resetPage();
    }

    // Build zptOptions
    var zptOptions = {
        root: root || ( this.options.target? this.options.target[0]: null ) || document.body,
        dictionaryExtension: this.instanceDictionaryExtension  
    };
    
    zpt.run( zptOptions );
};
    
ListPage.prototype.afterProcessTemplate = function( $form ){

    this.bindEvents();
    this.triggerListCreatedEvent( $form );
};
    
ListPage.prototype.triggerListCreatedEvent = function( $form ){

    this.options.events.listCreated(
        {
            $form: $form,
            options: this.options
        });
};
    
ListPage.prototype.bindButtonEvent = function( button ){

    // Return if the button does not implement run method
    if ( ! utils.isFunction( button.run ) ){
        return;    
    }

    var instance = this;
    $( button.getSelector() )
        .off()
        .click(
            function( event ){
                button.run( event, instance, this );   
            }
        );
};
    
ListPage.prototype.bindButtonsEvent = function( buttons ){

    for ( var c = 0; c < buttons.length; ++c ){
        var button = buttons[ c ];
        this.bindButtonEvent( button );
    }
};
    
ListPage.prototype.bindEvents = function() {

    // Bind events of buttons
    this.bindButtonsEvent( this.getToolbarButtons() );
    this.bindButtonsEvent( this.getByRowButtons() );

    // Bind events of components
    this.componentsMap.bindEvents();
};
    
ListPage.prototype.showCreateForm = function( event ){
    this.showNewForm( 'create' );
};

ListPage.prototype.showNewFormUsingRecordFromServer = function( type, event, forcedKey ){

    // Get the key of the record to get
    var key = forcedKey || pageUtils.getKeyFromButton( event );
    if ( key == undefined ){
        throw 'Error trying to load record in listPage: key is null!';
    }

    // Build the form instance
    this.currentFormPage = new FormPage( 
        this.options, 
        {
            type: type, 
            parentPage: this
        }
    ); 

    // Update form retrieving record from server
    this.currentFormPage.show( 
        {
            key: key, 
            getRecordURL: this.thisOptions.getRecordURL 
        }
    );
};
    
ListPage.prototype.showEditForm = function( event, forcedKey ){
    this.showNewFormUsingRecordFromServer( 'update', event, forcedKey );
};
    
ListPage.prototype.showDeleteForm = function( event, forcedKey ){
    this.showNewFormUsingRecordFromServer( 'delete', event, forcedKey );
};
    
ListPage.prototype.showNewForm = function( type, record ){

    this.currentFormPage = new FormPage( 
        this.options, 
        {
            type: type, 
            parentPage: this,
            record: record
        }
    ); 

    this.currentFormPage.show();
};
    
ListPage.prototype.instanceNewForm = function( type, key ){

    return new FormPage( 
        this.options, 
        {
            type: type, 
            parentPage: this,
            record: this.getRecordByKey( key )
        }
    );
}
    
// Iterate dictionary.records (an array) and put them into records (a map) using the id of each record as the key
ListPage.prototype.updateRecords = function( newRecordsArray ){

    this.records = {};
    for ( var c = 0; c < newRecordsArray.length; c++ ) {
        var record = newRecordsArray[ c ];
        this.records[ record[ this.options.key ] ] = record;
    }
};
ListPage.prototype.buildRecordsArray = function(){

    var recordsArray = [];
    for ( var index in this.records ) {
        var record = this.records[ index ];
        recordsArray.push( record );
    }
    return recordsArray;
};
    
ListPage.prototype.getRecordByKey = function( key, mustUpdateRecordFromSelection ){

    var record = this.records[ key ];

    if ( mustUpdateRecordFromSelection && ! this.readOnly ){
        // TODO Implement fieldUtils.updateRecordFromListSelection
        //fieldUtils.updateRecordFromListSelection( record, this.fieldsArray, $row );
    }

    return record;
};
ListPage.prototype.getRowByKey = function( key ){
    return this.get$().find( "[data-record-key='" + key + "']" );
};
    
ListPage.prototype.updateBottomPanel = function( dictionaryExtension ){

    var thisDictionary = utils.extend( {}, this.instanceDictionaryExtension, dictionaryExtension );

    zpt.run({
        root: this.getComponent( 'paging' ).get$()[0],
        dictionaryExtension: thisDictionary
    });

    this.bindEvents();
};

ListPage.prototype.getRecords = function(){
    return this.records;
};
ListPage.prototype.getRecordsArray = function(){
    return this.buildRecordsArray();
};

ListPage.prototype.get$form = function(){
    return $( '#' + this.thisOptions.formId );
};

ListPage.prototype.getTotalNumberOfRecords = function(){

    var pagingComponent = this.getComponent( 'paging' );
    if ( ! pagingComponent ){
        return Object.keys( this.records ).length;
    }
    return pagingComponent.getTotalNumberOfRecords();
};
    
ListPage.prototype.addRecord = function( key, record ){

    this.records[ key ] = record;
    this.instanceDictionaryExtension.records.push( record );
};
ListPage.prototype.updateRecord = function( key, record ){

    this.records[ key ] = record;
    this.instanceDictionaryExtension.records[ this.getIndexInDictionaryByKey( key ) ] = record;
};
ListPage.prototype.deleteRecord = function( key ){

    delete this.records[ key ];
    this.instanceDictionaryExtension.records.splice( this.getIndexInDictionaryByKey( key ), 1 );
};
ListPage.prototype.getIndexInDictionaryByKey = function( key ){

    for ( var c = 0; c < this.instanceDictionaryExtension.records.length; c++ ) {
        var record = this.instanceDictionaryExtension.records[ c ];
        if ( key == record[ this.options.key ] ){
            return c;
        }
    }

    var message = 'Record not found in dictionary!'
    alert( message );
    throw message;
};
    
ListPage.prototype.isEditable = function(){
    return this.getComponent( 'editing' )? true: false;
};
ListPage.prototype.isReadOnly = function(){
    return ! this.isEditable();
};
    
ListPage.prototype.isFiltered = function(){

    var filterComponent = this.getComponent( 'filtering' );
    return filterComponent && filterComponent.filterIsOn();
};
    
ListPage.prototype.generateId = function(){
    return pageUtils.generateId();
};


ListPage.prototype.getByRowButtons = function(){

    if ( this.byRowButtons == undefined ){
        this.byRowButtons = buttonUtils.getButtonList( 
            this.thisOptions.buttons.byRow, 
            'listRow', 
            this,
            this.options );
    }

    return this.byRowButtons;
};
ListPage.prototype.getToolbarButtons = function(){
    return this.getPageToolbarButtons( 'listToolbar' );
};
    
ListPage.prototype.removeChanges = function(){
    this.getSecureComponent( 'editing' ).removeChanges();
};
    
ListPage.prototype.update = function(){
        
    // Get root
    var root = [ $( '#' + this.thisOptions.tbodyId )[0] ];

    // Add pagingComponent to root
    var pagingComponent = this.getComponent( 'paging' );
    if ( pagingComponent ){
        root.push( pagingComponent.get$()[0] );
    }

    // Show list page
    this.show(
        {
            root: root
        }
    );
};
    
ListPage.prototype.goToFirstPage = function(){

    var pagingComponent = this.getComponent( 'paging' );
    if ( pagingComponent ){
        pagingComponent.goToFirstPage();
    }
};
    
ListPage.prototype.getType = function(){
    return 'list';
};

module.exports = ListPage;
