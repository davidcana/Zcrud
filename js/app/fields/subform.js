/*
    Subform class
*/
"use strict";

var Field = require( './field.js' );
var context = require( '../context.js' );
var $ = require( 'jquery' );
var zpt = require( 'zpt' );
var validationManager = require( '../validationManager.js' );
var ComponentsMap = require( '../components/componentsMap.js' );
var fieldUtils = require( './fieldUtils.js' );
var HistoryCreate = require( '../history/create.js' );
var HistoryDelete = require( '../history/delete.js' );
var HistoryComposition = require( '../history/composition.js' );
var crudManager = require( '../crudManager.js' );
var pageUtils = require( '../pages/pageUtils.js' );
var FormPage = require( '../pages/formPage.js' );
var buttonUtils = require( '../buttons/buttonUtils.js' );
var utils = require( '../utils.js' );

var Subform = function( properties ) {
    Field.call( this, properties );
    
    this.fieldsArray = [];
    this.fieldsMap = {};
    this.filter = undefined;
    this.currentFormPage = undefined;
    this.addedRecords = {};
    this.toolbarButtons = undefined;
    this.byRowButtons = undefined;
};

Subform.prototype = new Field();
Subform.prototype.constructor = Subform;

Subform.prototype.getFromAddedRecords = function( recordId ){
    return this.addedRecords[ recordId ];
};

Subform.prototype.filterValue = function( record ){
    
    var newRecords = [];
    var subformRecords = record[ this.id ];
    var subformFields = this.fields;

    for ( var i = 0; i < subformRecords.length; i++ ) {
        var subformRecord = subformRecords[ i ];
        var newRecord = {};
        newRecords.push( newRecord );
        for ( var c in subformFields ){
            var subformField = subformFields[ c ];
            var value = subformRecord[ subformField.id ];
            if ( value != undefined ){
                newRecord[ subformField.id ] = subformField.filterValue( subformRecord );
            }
        }
    }

    return newRecords;
};

Subform.prototype.getValueFromRecord = function( record ){
    
    var subformRecords = record[ this.id ] || [];
    var subformFields = this.fields;

    for ( var i = 0; i < subformRecords.length; i++ ) {
        var subformRecord = subformRecords[ i ];
        for ( var c in subformFields ){
            var subformField = subformFields[ c ];
            subformRecord[ subformField.id ] = subformField.getValueFromRecord( subformRecord );
        }
    }

    return subformRecords;
};

Subform.prototype.getViewValueFromRecord = function( record ){

    var subformRecords = record[ this.id ] || [];
    var subformFields = this.fields;

    for ( var i = 0; i < subformRecords.length; i++ ) {
        var subformRecord = subformRecords[ i ];
        for ( var c in subformFields ){
            var subformField = subformFields[ c ];
            subformRecord[ subformField.id ] = subformField.getViewValueFromRecord( subformRecord );
        }
    }

    return subformRecords;
};

Subform.prototype.afterProcessTemplateForField = function( params ){
    
    var $subform = this.get$();
    this.bindEventsInRows( params, $subform, undefined );
    
    this.bindButtonsEvent( this.getToolbarButtons(), $subform, params );

    // Bind events of components
    this.componentsMap.bindEvents();
};

Subform.prototype.showCreateForm = function(){
    this.showNewForm( 'create' );
};

Subform.prototype.showNewForm = function( type, record ){

    this.currentFormPage = new FormPage( 
        this.page.getOptions(), 
        {
            type: type, 
            parentPage: this.page,
            record: record
        }
    ); 

    this.currentFormPage.show();
};

Subform.prototype.buildDictionary = function( newRecord ){
    
    var thisDictionary = utils.extend( {}, context.getDictionary(), {} );
    
    thisDictionary.editable = true;
    thisDictionary.instance = this;
    thisDictionary.records = [ newRecord ];
    thisDictionary.hideRowButtons = this.isReadOnly();
    
    return thisDictionary;
};

Subform.prototype.addNewRow = function( params ){
    
    var createHistoryItem = this.buildHistoryItemForNewRow( params );
    context.getHistory().put( 
        this.page.getId(), 
        createHistoryItem );
    this.addToAddedRecords( createHistoryItem );
};

Subform.prototype.addToAddedRecords = function( createHistoryItem ){
    this.addedRecords[ createHistoryItem.recordId ] = createHistoryItem.record;
};

Subform.prototype.buildHistoryItemForNewRow = function( params ){
    
    var newRecord = params.defaultRecord?
        params.defaultRecord:
        fieldUtils.buildDefaultValuesRecord( this.fieldsArray );
    
    var thisDictionary = this.buildDictionary( newRecord );
    
    var createHistoryItem = new HistoryCreate( 
        context.getHistory(),
        thisDictionary,
        $( '#' + this.page.getId() + ' .zcrud-field-' + this.id + ' tbody'),
        newRecord,
        this.id );
    var $tr = createHistoryItem.get$Tr(); 

    // Bind events
    this.bindEventsInRows( params, undefined, $tr );
    this.componentsMap.bindEventsIn1Row( $tr );
    
    // Configure form validation
    validationManager.initFormValidation( 
        this.page.getId(), 
        $tr, 
        this.page.getOptions() );
    
    return createHistoryItem;
};

Subform.prototype.bindButtonEvent = function( $selection, button, subformInstance, params ){
    
    // Return if the button does not implement run method
    if ( ! utils.isFunction( button.run ) ){
        return;    
    }
    
    $selection
        .find( button.getSelector() )
        .off()
        .on(
            'click',
            function( event ){
                button.run( event, subformInstance, params );   
            }
        );
};

Subform.prototype.bindEventsInRows = function( params, $subform, $tr ){
    
    var $selection = $subform || $tr;
    var page = this.page;
    
    $selection
        .find( 'input.historyField, textarea.historyField, select.historyField' )
        //.off()
        .on(
            'change',
            function ( event, params ) {
                var disableHistory = utils.getParam( params, 'disableHistory' );
                if ( disableHistory ){
                    return;
                }
                var $this = $( this );
                var fullName = $this.attr( 'name' );
                //var fullName = $this.prop( 'name' );
                var field = page.getFieldByName( fullName );
                var $tr = $tr || $this.parents( 'tr' ).first();
                //var $tr = $tr || $this.closest( 'tr' );
                context.getHistory().putChange( 
                    $this, 
                    field.getValue( $this ), 
                    0,
                    $tr.attr( 'data-record-id' ),
                    page.getId(),
                    field,
                    $tr.attr( 'data-record-index' ),
                    $tr.attr( 'data-record-key' ) );
            }
        );
    
    this.bindButtonsEvent( this.getByRowButtons(), $selection, params );

    if ( $tr ){
        this. bindEventsForFieldsIn1Row( 
            $tr, 
            this.fields, 
            [], 
            page.getDictionary(), 
            params );
    } else {
        this.bindEventsForFields(
            $subform,
            this.fields,
            page.getDictionary(),
            params
        );
    }
};

Subform.prototype.bindEventsForFields = function( $subform, fields, dictionary, params ){
    
    var records = params.value || [];
    var $rows = $subform.find( 'tbody' ).children().filter( '.zcrud-data-row' );
    for ( var i = 0; i < records.length; i++ ) {
        var record = records[ i ];
        var $row = $rows.filter( ":eq(" + i + ")" );
        this.bindEventsForFieldsIn1Row( $row, fields, record, dictionary, params );
    }
};

Subform.prototype.bindEventsForFieldsIn1Row = function( $row, fields, record, dictionary, params ){

    for ( var c in fields ){
        var field = fields[ c ];
        field.afterProcessTemplateForField(
            this.buildProcessTemplateParams( field, record, dictionary, params ),
            $row
        );
    }
};

Subform.prototype.buildProcessTemplateParams = function( field, record, dictionary, params ){
    
    return {
        field: field, 
        value: record? record[ field.id ]: undefined,
        options: params.options,
        record: record,
        source: params.source,
        dictionary: dictionary,
        formPage: params.formPage
    };
};

Subform.prototype.deleteRow = function( event ){

    var $tr = $( event.target ).parents( 'tr' ).first();
    //var $tr = $( event.target ).closest( 'tr' );

    context.getHistory().putDelete( 
        this.page.getId(), 
        $tr.attr( 'data-record-id' ),
        0, 
        $tr.attr( 'data-record-key' ), 
        $tr,
        this,
        $tr.attr( 'data-record-index' )
    );
};

Subform.prototype.getTemplate = function(){
    return 'subform@templates/fields/subforms.html';   
};

Subform.prototype.getViewTemplate = function(){
    return 'view@templates/fields/subforms.html';   
};

Subform.prototype.buildFields = function(){
    
    var subformInstance = this;
    this.fieldsArray = [];
    this.fieldsMap = {};
    
    for ( var subfieldId in this.fields ){
        var subfield = this.fields[ subfieldId ];
        subformInstance.fieldsArray.push( subfield );
        subformInstance.fieldsMap[ subfieldId ] = subfield;
        subfield.setParentField( subformInstance );
    }
    /*
    $.each( 
        this.fields, 
        function ( subfieldId, subfield ) {
            subformInstance.fieldsArray.push( subfield );
            subformInstance.fieldsMap[ subfieldId ] = subfield;
            subfield.setParentField( subformInstance );
        }
    );
    */
};

Subform.prototype.getFields = function(){
    return this.fieldsArray;
};

Subform.prototype.mustHideLabel = function(){
    return true;
};

Subform.prototype.getComponent = function( id ){
    return this.componentsMap.getComponent( id );
};

Subform.prototype.getSecureComponent = function( id ){
    return this.componentsMap.getSecureComponent( id );
};

Subform.prototype.getKey = function(){
    return this.subformKey;
};

Subform.prototype.setPage = function( pageToApply ){
    
    this.page = pageToApply;
    this.componentsMap = new ComponentsMap( this.page.getOptions(), this.components, this, this.page );
    
    for ( var c = 0; c < this.fieldsArray.length; ++c ){
        this.fieldsArray[ c ].setPage( this.page );
    }
};

Subform.prototype.buildMapValue = function(){
    
    return fieldUtils.buildRecordsMap( 
        this.page.getFieldValue( this.id ), 
        this.getKey() );
};

Subform.prototype.getRecordByKey = function( key, $row, mustUpdateRecordFromSelection ){
    
    var record = this.buildMapValue()[ key ];
    
    if ( mustUpdateRecordFromSelection && ! this.readOnly ){
        fieldUtils.updateRecordFromFormSelection( record, this.fieldsArray, $row );
    }
    
    return record;
};

Subform.prototype.addNewRowsFromSubform = function( fromSubformId, useSelection, deleteFrom, deselect ){
    
    // Get the selectingComponent if needed
    var selectingComponent = useSelection? this.page.getField( fromSubformId ).getComponent( 'selecting' ): undefined;
    
    // Get records from selection or get all
    var records = useSelection?
        selectingComponent.getSelectedRecords():
        this.page.getFieldValue( fromSubformId );
    
    var result = this.addNewRows_common( 
        records, 
        deleteFrom? 
            this.page.getField( fromSubformId ): 
            undefined,
        useSelection? 
            selectingComponent.getSelectedRows(): 
            undefined );
    
    if ( ! deleteFrom && useSelection && deselect ){
        selectingComponent.deselectAll();
    }
    
    return result;
};

Subform.prototype.addNewRows_common = function( records, subformToDeleteFrom, $selectedRows ){

    if ( ! records || records.length == 0 ){
        return [];
    }
    
    var composition = new HistoryComposition( context.getHistory() );

    for ( var c = 0; c < records.length; ++c ){
        var currentRecord = records[ c ];        

        // Add creation
        var createHistoryItem = this.buildHistoryItemForNewRow(
            {
                field: this, 
                defaultRecord: currentRecord
            }
        );
        composition.add( createHistoryItem );
        
        this.addToAddedRecords( createHistoryItem );
        
        // Add deletion if needed
        if ( subformToDeleteFrom ){
            var $tr = $selectedRows[ c ];
            //var $tr = $( $selectedRows.get( c ) );
            composition.add( 
                new HistoryDelete( 
                    context.getHistory(), 
                    $tr.attr( 'data-record-id' ),
                    0, 
                    $tr.attr( 'data-record-key' ), 
                    $tr,
                    subformToDeleteFrom.name 
                )
            );
        }
    }

    context.getHistory().put( this.page.getId(), composition );
    
    return records;
};

Subform.prototype.addNewRows = function( records ){
    return this.addNewRows_common( records );
};

Subform.prototype.getPagingComponent = function(){
    return this.componentsMap.getComponent( 'paging' );
};

Subform.prototype.getTotalNumberOfRecords = function(){
    
    var paging = this.getPagingComponent();
    
    return paging?
        paging.getTotalNumberOfRecords():
        this.getRecords().length;
};

Subform.prototype.getRecords = function(){
    return this.page.getFieldValue( this.id );
};

Subform.prototype.dataFromServer = function( data ){
    
    this.componentsMap.dataFromServer(
        {
            totalNumberOfRecords: data.fieldsData && data.fieldsData[ this.id ]? data.fieldsData[ this.id ].totalNumberOfRecords: 0,
            records: data.record? data.record[ this.id ]: []
        }
    );
};

Subform.prototype.update = function ( root, dictionaryExtension, callback ) {

    var subformInstance = this;
    
    crudManager.listRecords( 
        {
            url: this.getGroupOfRecordsURL,
            search: this.buildDataToSendForUpdate(),
            success: function( data ){
                subformInstance.clientAndServerSuccessFunction.call( subformInstance, data, root, dictionaryExtension );
            },
            error: function( dataFromServer ){
                context.showError( 
                    subformInstance.page.getOptions(), 
                    false, 
                    dataFromServer.message || 'Server communication error!'
                );
                if ( callback ){
                    callback( false );
                }
            }
        }, 
        this.page.getOptions()
    );
};

Subform.prototype.buildDataToSendForUpdate = function(){
    
    var data = this.buildDataToSend();

    // Add key only if needed
    var key = this.page.getKeyValue()
    if ( key ){
        data.key = key;
    }

    return data;
};

Subform.prototype.buildDataToSend = function(){
    
    var data = {};
    
    if ( ! utils.isEmptyObject( this.filter ) ){
        data.filter = this.filter;
    }

    this.componentsMap.addToDataToSend( data );
    this.page.getComponentMap().addToDataToSend( data );

    return data;
};

Subform.prototype.beforeProcessTemplate = function( data ){
    
    this.componentsMap.dataFromServer( data );
    this.page.filterArrayOfRecordsFromServerData( data.records, this.fieldsArray );
    this.updateRecords( data.records );
};

Subform.prototype.clientAndServerSuccessFunction = function( data, root, dictionaryExtension, callback ){

    this.beforeProcessTemplate( data );
    this.processTemplate( root, dictionaryExtension );
    this.afterProcessTemplate();
    
    if ( callback ){
        callback( true );
    }
};

Subform.prototype.processTemplate = function( root, dictionaryExtension ){
    
    zpt.run({
        root: root || [ 
            this.get$().find( 'tbody' )[0], 
            this.getPagingComponent()? this.getPagingComponent().get$()[0]: undefined
        ],
        dictionaryExtension: this.buildDictionaryForUpdate( dictionaryExtension )
    });
};

Subform.prototype.afterProcessTemplate = function(){
    
    this.afterProcessTemplateForField(
        this.page.buildProcessTemplateParams( this )
    );
};

Subform.prototype.buildDictionaryForUpdate = function( dictionaryExtension ){

    var dictionary = {};
    
    if ( dictionaryExtension ){
        utils.extend( dictionary, dictionaryExtension );
    }
    
    dictionary.records = this.getRecords();
    dictionary.field = this;
    dictionary.editable = ! this.isReadOnly();
    dictionary.instance = this;
    
    return dictionary;
};

Subform.prototype.isFiltered = function(){
    
    var filterComponent = this.getComponent( 'filtering' );
    return filterComponent && filterComponent.filterIsOn();
};

Subform.prototype.getFieldsSource = function(){
    return this.fieldsMap;
};

Subform.prototype.generateId = function(){
    return pageUtils.generateId();
};

Subform.prototype.getName = function(){
    return this.id;
};

Subform.prototype.showNewFormUsingRecordFromServer = function( type, event ){

    // Get the key of the record to get
    var key = pageUtils.getKeyFromButton( event );
    if ( key == undefined ){
        throw 'Error trying to load record in formPage: key is null!';
    }

    // Build the form instance
    this.currentFormPage = new FormPage( 
        this.page.getOptions(), 
        {
            type: type, 
            parentPage: this.page
        }
    ); 

    // Update form retrieving record from server
    this.currentFormPage.show( 
        {
            key: key, 
            getRecordURL: this.getRecordURL 
        }
    );
};

Subform.prototype.updateRecords = function( newRecordsArray ){
    this.page.updateRecordProperty( this.id, newRecordsArray );
};

Subform.prototype.isDirty = function(){
    
    var history = context.getHistory();
    return history? history.isSubformDirty( this.id ): false;
};

Subform.prototype.getToolbarButtons = function(){

    if ( this.toolbarButtons == undefined ){
        this.toolbarButtons = buttonUtils.getButtonList( 
            this.buttons.toolbar, 
            'subformToolbar', 
            this,
            this.page.getOptions() );
    }

    return this.toolbarButtons;
};

Subform.prototype.getByRowButtons = function(){

    if ( this.byRowButtons == undefined ){
        this.byRowButtons = buttonUtils.getButtonList( 
            this.buttons.byRow, 
            'subformRow', 
            this,
            this.page.getOptions() );
    }

    return this.byRowButtons;
};

Subform.prototype.bindButtonsEvent = function( buttons, $subform, params ){
    
    for ( var c = 0; c < buttons.length; ++c ){
        var button = buttons[ c ];
        this.bindButtonEvent( $subform, button, this, params );
    }
};

Subform.prototype.removeChanges = function(){
    
    context.getHistory().removeSubformChanges( 
        this.page.getId(), 
        this.id );
};

Subform.prototype.goToFirstPage = function(){

    var pagingComponent = this.getPagingComponent();
    if ( pagingComponent ){
        pagingComponent.goToFirstPage();
    }
};

Subform.prototype.getType = function(){
    return this.page.getType();
};
/*
Subform.prototype.getAsync = function( record, callback ){

    for ( var c = 0; c < this.fieldsArray.length; ++c ){
        var field = this.fieldsArray[ c ]
        if ( utils.isFunction( field.getAsync ) ){
            field.getAsync( record, callback );
        }
    }
};
*/
Subform.prototype.builNonDependentAsyncFieldList = function(){

    var result = [];

    for ( var c = 0; c < this.fieldsArray.length; ++c ){
        var field = this.fieldsArray[ c ]
        if ( utils.isFunction( field.builNonDependentAsyncFieldList ) ){
            result = result.concat(
                field.builNonDependentAsyncFieldList()
            );
        }
    }

    return result;
};

Subform.prototype.buildDependentAsyncFieldList = function( record ){

    var result = [];
    var subformRecords = this.getValueFromRecord( record );

    for ( var i = 0; i < subformRecords.length; i++ ) {
        var subformRecord = subformRecords[ i ];

        for ( var c = 0; c < this.fieldsArray.length; ++c ){
            var field = this.fieldsArray[ c ]
            if ( utils.isFunction( field.buildDependentAsyncFieldList ) ){
                result = result.concat(
                    field.buildDependentAsyncFieldList( subformRecord )
                );
            }
        }
    }

    return result;
};

/*
Subform.prototype.buildAsyncFieldList = function(){

    var result = [];

    for ( var c = 0; c < this.fieldsArray.length; ++c ){
        var field = this.fieldsArray[ c ]
        if ( utils.isFunction( field.buildAsyncFieldList ) ){
            result = result.concat(
                field.buildAsyncFieldList( subformRecord )
            );
        }
    }

    return result;
};
*/

module.exports = Subform;

