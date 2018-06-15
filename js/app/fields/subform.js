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

Subform.prototype.addNewRow = function( params ){
    
    var thisDictionary = $.extend( {}, this.page.getDictionary(), {} );
    thisDictionary.subformRecords = [ {} ]; // To remove
    thisDictionary.subformField = this;     // To remove
    thisDictionary.editable = true;
    thisDictionary.instance = this;
    thisDictionary.records = [ params.defaultRecord || {} ];
    //thisDictionary.records = [ {} ];
    
    var createHistoryItem = this.page.getHistory().putCreate( 
        this.page.getId(), 
        thisDictionary,
        $( '#' + this.page.getId() + ' .zcrud-field-' + this.id + ' tbody') );
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
                page.getHistory().putChange( 
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

    var $tr =  $( event.target ).closest( 'tr' );

    this.page.getHistory().putDelete( 
        this.page.getId(), 
        //options, 
        0, 
        $tr.attr( 'data-record-key' ), 
        $tr,
        this,
        $tr.attr( 'data-record-index' ) );
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
/*
Subform.prototype.configure = function( formPage ){
    //this.componentsMap = new ComponentsMap( formPage.getOptions(), this.components, this, formPage );
};*/

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
Subform.prototype.getRecordByKey = function( key, $row ){

    var record = {};

    for ( var c = 0; c < this.fieldsArray.length; c++ ) {
        var field = this.fieldsArray[ c ];
        var value = field.getValueFromForm( $row );

        if ( value != undefined && value != '' ){
            record[ field.id ] = value;
        }
    }

    return record;
};*/

Subform.prototype.addNewRows = function( records ){
    
    for ( var c = 0; c < records.length; ++c ){
        var currentRecord = records[ c ];
        /*
        alert( 
            JSON.stringify( currentRecord )
        );*/
        this.addNewRow(
            {
                field: this, 
                //value: record[ field.id ],
                //options: options,
                defaultRecord: currentRecord,
                //source: type,
                //dictionary: dictionary,
                //formPage: self
            }
        );
    }
};

module.exports = Subform;