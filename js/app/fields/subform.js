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
var HistoryComposition = require( '../history/compositions/composition.js' );

var Subform = function( properties ) {
    Field.call( this, properties );
    
    this.fieldsArray = [];
};

Subform.prototype = new Field();
Subform.prototype.constructor = Subform;

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

Subform.prototype.afterProcessTemplateForField = function( params, $form ){
    
    var subformInstance = this;
    var $subform = this.get$();
    this.bindEventsInRows( params, $subform, undefined );
    $subform
        .find( '.zcrud-new-row-command-button' )
        .off()
        .click( 
            function ( event ) {
                event.preventDefault();
                event.stopPropagation();
                subformInstance.addNewRow( params );
            }
        );
    
    // Bind events of components
    this.componentsMap.bindEvents();
};

Subform.prototype.buildDictionary = function( newRecord ){
    
    var thisDictionary = $.extend( {}, this.page.getDictionary(), {} );
    
    thisDictionary.editable = true;
    thisDictionary.instance = this;
    thisDictionary.records = [ newRecord ];
    
    return thisDictionary;
};

Subform.prototype.addNewRow = function( params ){
    
    var createHistoryItem = this.buildHistoryItemForNewRow( params );
    context.getHistory().put( 
        this.page.getId(), 
        createHistoryItem );
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
/*
Subform.prototype.addNewRow = function( params ){

    var newRecord = params.defaultRecord?
        params.defaultRecord:
    fieldUtils.buildDefaultValuesRecord( this.fieldsArray );

    var thisDictionary = $.extend( {}, this.page.getDictionary(), {} );
    thisDictionary.editable = true;
    thisDictionary.instance = this;
    thisDictionary.records = [ newRecord ];

    var createHistoryItem = context.getHistory().putCreate( 
        this.page.getId(), 
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
};
*/
Subform.prototype.bindEventsInRows = function( params, $subform, $tr ){
    
    var subformInstance = this;
    var $selection = $subform || $tr;
    var page = this.page;

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
                    page.getId(),
                    field,
                    $tr.attr( 'data-record-index' ),
                    $tr.attr( 'data-record-key' ) );
            }
        );

    $selection
        .find( '.zcrud-delete-row-command-button' )
        .off()
        .click( 
            function ( event ) {
                event.preventDefault();
                event.stopPropagation();
                subformInstance.deleteRow( event );
            }
        );

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
        value: record[ field.id ],
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
        0, 
        $tr.attr( 'data-record-key' ), 
        $tr,
        this );
        //$tr.attr( 'data-record-index' ) );
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
    
    $.each( this.fields, function ( subfieldId, subfield ) {
        if ( subfield.subformKey ){
            subformInstance.subformKey = subfieldId;
        }
        subformInstance.fieldsArray.push( subfield );
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

Subform.prototype.getRecordByKey = function( key, $row ){
    return fieldUtils.buildRecord( this.fieldsArray, $row );
};
/*
Subform.prototype.addNewRowsFromSubform = function( fromSubformId, useSelection, deleteFrom ){

    // Get records from selection or get all
    var records = useSelection?
        this.page.getField( fromSubformId ).getComponent( 'selecting' ).getSelectedRecords():
    this.page.getFieldValue( fromSubformId );

    var composition = new HistoryComposition();

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

        // Add deletion if needed
        if ( deleteFrom ){
            var $tr = createHistoryItem.get$Tr(); 
            composition.add( 
                new HistoryDelete( 
                    context.getHistory(), 
                    0, 
                    $tr.attr( 'data-record-key' ), 
                    $tr,
                    this.name )
            );
        }
    }

    context.getHistory().put( this.page.getId(), composition );
};*/

Subform.prototype.addNewRowsFromSubform = function( fromSubformId, useSelection, deleteFrom ){
    
    // Get records from selection or get all
    var records = useSelection?
        this.page.getField( fromSubformId ).getComponent( 'selecting' ).getSelectedRecords():
        this.page.getFieldValue( fromSubformId );
    
    return this.addNewRows_common( 
        records, 
        deleteFrom? 
            this.page.getField( fromSubformId ): 
            undefined,
        useSelection? 
            this.page.getField( fromSubformId ).getComponent( 'selecting' ).getSelectedRows(): 
            undefined );
};


Subform.prototype.addNewRows_common = function( records, subformToDeleteFrom, $selectedRows ){

    if ( ! records || records.length == 0 ){
        return [];
    }
    
    var composition = new HistoryComposition();

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

        // Add deletion if needed
        if ( subformToDeleteFrom ){
            var $tr = $( $selectedRows.get( c ) );
            composition.add( 
                new HistoryDelete( 
                    context.getHistory(), 
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
/*
Subform.prototype.addNewRows = function( records ){
    
    var composition = new HistoryComposition();
    
    for ( var c = 0; c < records.length; ++c ){
        var currentRecord = records[ c ];        
        var createHistoryItem = this.buildHistoryItemForNewRow(
            {
                field: this, 
                defaultRecord: currentRecord
            }
        );
        composition.add( createHistoryItem );
    }
    
    context.getHistory().put( this.page.getId(), composition );
};*/
/*
Subform.prototype.addNewRows = function( records ){

    for ( var c = 0; c < records.length; ++c ){
        var currentRecord = records[ c ];        
        var createHistoryItem = this.buildHistoryItemForNewRow(
            {
                field: this, 
                defaultRecord: currentRecord
            }
        );
        context.getHistory().put( 
            this.page.getId(), 
            createHistoryItem );
    }
};*/
/*
Subform.prototype.addNewRows = function( records ){

    for ( var c = 0; c < records.length; ++c ){
        var currentRecord = records[ c ];
        this.addNewRow(
            {
                field: this, 
                defaultRecord: currentRecord
            }
        );
    }
};
*/
module.exports = Subform;