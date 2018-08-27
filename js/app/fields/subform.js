/*
    Subform class
*/
"use strict";

var Field = require( './field.js' );
var context = require( '../context.js' );
var $ = require( 'jquery' );
var validationManager = require( '../validationManager.js' );
var ComponentsMap = require( '../components/componentsMap.js' );
var fieldUtils = require( './fieldUtils.js' );
var HistoryCreate = require( '../history/create.js' );
var HistoryDelete = require( '../history/delete.js' );
var HistoryComposition = require( '../history/composition.js' );
var crudManager = require( '../crudManager.js' );
var pageUtils = require( '../pages/pageUtils.js' );
var FormPage = require( '../pages/formPage.js' );

var Subform = function( properties ) {
    Field.call( this, properties );
    
    this.fieldsArray = [];
    this.fieldsMap = {};
    this.filter = undefined;
    this.currentFormPage = undefined;
    this.addedRecords = {};
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

Subform.prototype.getValueFromRecord = function( record, params ){
    
    var dictionary = this.page.getDictionary();
    var subformRecords = record[ this.id ] || [];
    var subformFields = this.fields;

    for ( var i = 0; i < subformRecords.length; i++ ) {
        var subformRecord = subformRecords[ i ];
        for ( var c in subformFields ){
            var subformField = subformFields[ c ];
            subformRecord[ subformField.id ] = subformField.getValueFromRecord(  
                subformRecord, 
                this.buildProcessTemplateParams( subformField, subformRecord, dictionary, params ) );
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
    
    var subformInstance = this;
    var $subform = this.get$();
    this.bindEventsInRows( params, $subform, undefined );
    
    var options = this.page.getOptions();
    var addNewRowButton = new options.buttons.subform.addNewRowButton();
    this.bindButtonEvent( $subform, addNewRowButton, subformInstance, params );
    /*
    $subform
        .find( '.zcrud-new-row-command-button' )
        .off()
        .click( 
            function ( event ) {
                event.preventDefault();
                event.stopPropagation();
                subformInstance.addNewRow( params );
            }
        );*/
    var showCreateFormButton = new options.buttons.subform.showCreateFormButton();
    this.bindButtonEvent( $subform, showCreateFormButton, subformInstance );
    /*
    $subform
        .find( '.zcrud-new-command-button' )
        .off()
        .click( 
            function ( event ) {
                event.preventDefault();
                event.stopPropagation();
                subformInstance.showCreateForm( event );
            }
        );*/
    
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
    
    var thisDictionary = $.extend( {}, this.page.getDictionary(), {} );
    
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

    $selection
        .find( button.selector )
        .off()
        .click(
            function( event ){
                button.run( event, subformInstance, params );   
            }
        );
};

Subform.prototype.bindEventsInRows = function( params, $subform, $tr ){
    
    var subformInstance = this;
    var $selection = $subform || $tr;
    var page = this.page;
    var options = this.page.getOptions();
    
    $selection
        .find( 'input.historyField, textarea.historyField, select.historyField' )
        //.off()
        .change( 
            function ( event, disableHistory ) {
                if ( disableHistory ){
                    return;
                }
                var $this = $( this );
                var fullName = $this.prop( 'name' );
                var field = page.getFieldByName( fullName );
                var $tr = $tr || $this.closest( 'tr' );
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
    
    var deleteRowButton = new options.buttons.subform.deleteRowButton();
    this.bindButtonEvent( $selection, deleteRowButton, subformInstance );
    /*
    $selection
        .find( '.zcrud-delete-row-command-button' )
        .off()
        .click( 
            function ( event ) {
                event.preventDefault();
                event.stopPropagation();
                subformInstance.deleteRow( event );
            }
        );*/
    
    var deleteCommandButton = new options.buttons.subform.deleteCommandButton();
    this.bindButtonEvent( $selection, deleteCommandButton, subformInstance );
    /*
    $selection
        .find( '.zcrud-delete-command-button' )
        .off()
        .click( 
            function ( event ) {
                event.preventDefault();
                event.stopPropagation();
                subformInstance.showNewFormUsingRecordFromServer( 'delete', event );
            }
        );*/

    var editCommandButton = new options.buttons.subform.editCommandButton();
    this.bindButtonEvent( $selection, editCommandButton, subformInstance );
    /*
    $selection
        .find( '.zcrud-edit-command-button' )
        .off()
        .click( 
            function ( event ) {
                event.preventDefault();
                event.stopPropagation();
                subformInstance.showNewFormUsingRecordFromServer( 'update', event );
            }
        );*/
    
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

    var $tr = $( event.target ).closest( 'tr' );

    context.getHistory().putDelete( 
        this.page.getId(), 
        $tr.attr( 'data-record-id' ),
        0, 
        $tr.attr( 'data-record-key' ), 
        $tr,
        this );
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
    
    $.each( this.fields, function ( subfieldId, subfield ) {
        //if ( subfield.subformKey ){
        //    subformInstance.subformKey = subfieldId;
        //}
        subformInstance.fieldsArray.push( subfield );
        subformInstance.fieldsMap[ subfieldId ] = subfield;
        subfield.setParentField( subformInstance );
    });
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
/*
Subform.prototype.getRecordByKey = function( key, $row ){

    return this.readOnly?
        this.buildMapValue()[ key ]:
    fieldUtils.buildRecord( this.fieldsArray, $row );
};*/

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
            var $tr = $( $selectedRows.get( c ) );
            composition.add( 
                new HistoryDelete( 
                    context.getHistory(), 
                    $tr.attr( 'data-record-id' ),
                    0, 
                    $tr.attr( 'data-record-key' ), 
                    $tr,
                    subformToDeleteFrom.name )
            );
        }
    }

    context.getHistory().put( this.page.getId(), composition );
    
    return records;
};

Subform.prototype.addNewRows = function( records ){
    return this.addNewRows_common( records );
};

Subform.prototype.buildDataToSend = function(){
    
    var dataToSend = {};
    
    this.componentsMap.addToDataToSend( dataToSend );
    
    return Object.keys( dataToSend ).length? dataToSend: undefined;
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
    //return this.getPagingComponent().getRecords();
    return this.page.getFieldValue( this.id );
};
/*
Subform.prototype.addRecords = function( recordsToAdd ){
    
    var records = this.page.getFieldValue( this.id );
    records = records.concat( recordsToAdd );
    
    this.page.updateRecordProperty( this.id, records );
};*/

Subform.prototype.dataFromServer = function( data ){
    
    this.componentsMap.dataFromServer(
        {
            totalNumberOfRecords: data.fieldsData[ this.id ]? data.fieldsData[ this.id ].totalNumberOfRecords: 0,
            records: data.record? data.record[ this.id ]: []
        }
    );
};

Subform.prototype.update = function ( root, dictionaryExtension, callback ) {

    var subformInstance = this;
    
    crudManager.listRecords( 
        {
            url: this.url,
            search: this.buildDataToSendForUpdate(),
            success: function( data ){
                subformInstance.clientAndServerSuccessFunction.call( subformInstance, data, root, dictionaryExtension );
            },
            error: function(){
                context.showError( 
                    subformInstance.page.getOptions(), 
                    false, 
                    'Server communication error!' );
                if ( callback ){
                    callback( false );
                }
            }
        }, 
        this.page.getOptions()
    );
};

Subform.prototype.buildDataToSendForUpdate = function(){

    var data = {
        key: this.page.getKey(),
        filter: this.filter
    };

    this.componentsMap.addToDataToSend( data );

    return data;
};

Subform.prototype.buildDataToSend = function(){

    var data = {
        filter: this.filter
    };

    this.componentsMap.addToDataToSend( data );

    return data;
};

Subform.prototype.beforeProcessTemplate = function( data ){
    
    this.componentsMap.dataFromServer( data );
    this.updateRecords( data.records );    
};

Subform.prototype.clientAndServerSuccessFunction = function( data, root, dictionaryExtension, callback ){

    this.beforeProcessTemplate( data );
    
    context.getZPTParser().run({
        root: root || [ 
                this.get$().find( 'tbody' )[0], 
                this.getPagingComponent()? this.getPagingComponent().get$()[0]: undefined
        ],
        dictionary: this.buildDictionaryForUpdate( dictionaryExtension ),
        notRemoveGeneratedTags: false
    });
    
    this.afterProcessTemplateForField(
        this.page.buildProcessTemplateParams( this )
    );
    
    if ( callback ){
        callback( true );
    }
};

Subform.prototype.buildDictionaryForUpdate = function( dictionaryExtension ){

    var options = this.page.getOptions();
    
    var dictionary = $.extend( true, options.dictionary, {} );
    
    if ( dictionaryExtension ){
        dictionary = $.extend( {}, dictionary, dictionaryExtension );
    }
    
    dictionary.options = options;
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

module.exports = Subform;