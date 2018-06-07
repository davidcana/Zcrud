/*
    Subform class
*/
"use strict";

var Field = require( './field.js' );
var context = require( '../context.js' );
var $ = require( 'jquery' );
var validationManager = require( '../validationManager.js' );

var Subform = function( properties ) {
    Field.call( this, properties );
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
                //newRecord[ subformField.id ] = context.getFieldBuilder().filterValue( subformRecord, subformField );
            }
        }
    }

    return newRecords;
};

Subform.prototype.getValueFromRecord = function( record, params ){
    var dictionary = params.formPage.getDictionary();
    var subformRecords = record[ this.id ] || [];
    var subformFields = this.fields;

    for ( var i = 0; i < subformRecords.length; i++ ) {
        var subformRecord = subformRecords[ i ];
        for ( var c in subformFields ){
            var subformField = subformFields[ c ];
            /*
            subformRecord[ subformField.id ] = context.getFieldBuilder().getValueFromRecord( 
                subformField, 
                subformRecord, 
                this.buildProcessTemplateParams( subformField, subformRecord, dictionary, params ) );*/
            subformRecord[ subformField.id ] = subformField.getValueFromRecord(  
                subformRecord, 
                this.buildProcessTemplateParams( subformField, subformRecord, dictionary, params ) );
        }
    }

    return subformRecords;
};

Subform.prototype.get$subform = function( formPage ){
    //return $form.find( '.zcrud-field-' + field.id );
    return $( '#' + formPage.getId() + ' .zcrud-field-' + this.id );
}

Subform.prototype.afterProcessTemplateForField = function( params, $form ){
    var subformInstance = this;
    var $subform = this.get$subform( params.formPage );
    this.bindEventsInRows( params, $subform, undefined );
    $subform
        .find( '.zcrud-subform-new-row-command-button' )
        .off()
        .click( 
        function ( event ) {
            event.preventDefault();
            event.stopPropagation();
            subformInstance.addNewRow( params );
        }
    );
};

Subform.prototype.addNewRow = function( params ){
    var formPage = params.formPage;
    var options = params.options;

    var thisDictionary = $.extend( {}, formPage.getDictionary(), {} );
    thisDictionary.subformRecords = [ {} ];
    thisDictionary.subformField = this;

    var createHistoryItem = formPage.getHistory().putCreate( 
        formPage.getId(), 
        thisDictionary,
        $( '#' + formPage.getId() + ' .zcrud-field-' + this.id + ' tbody') );
    var $tr = createHistoryItem.get$Tr(); 

    // Bind events
    this.bindEventsInRows( params, undefined, $tr );

    // Configure form validation
    //validationManager.addAttributes( $tr, options );
    validationManager.initFormValidation( formPage.getId(), $tr, options );
};

Subform.prototype.bindEventsInRows = function( params, $subform, $tr ){
    var subformInstance = this;
    var formPage = params.formPage;
    var $selection = $subform || $tr;

    $selection
        .find( 'input.historyField, textarea.historyField, select.historyField' )
        //.off()
        .change( function ( event, disableHistory ) {
        if ( disableHistory ){
            return;
        }
        var $this = $( this );
        var fullName = $this.prop( 'name' );
        var field = formPage.getFieldByName( fullName );
        var $tr = $tr || $this.closest( 'tr' );
        formPage.getHistory().putChange( 
            $this, 
            //context.getFieldBuilder().getValue( field, $this ), 
            field.getValue( $this ), 
            0,
            formPage.getId(),
            field,
            $tr.attr( 'data-subform-record-index' ),
            $tr.attr( 'data-subform-record-key' ) );
    });

    $selection
        .find( '.zcrud-subform-delete-row-command-button' )
        .off()
        .click( function ( event ) {
            event.preventDefault();
            event.stopPropagation();
            subformInstance.deleteRow( params, event );
        });

    if ( $tr ){
        this. bindEventsForFieldsIn1Row( 
            $tr, 
            this.fields, 
            [], 
            formPage.getDictionary(), 
            params );
    } else {
        this.bindEventsForFields(
            $subform,
            this.fields,
            formPage.getDictionary(),
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
        /*
        context.getFieldBuilder().afterProcessTemplateForField(
            this.buildProcessTemplateParams( field, record, dictionary, params ),
            $row
        );*/
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

Subform.prototype.deleteRow = function( params, event ){
    var formPage = params.formPage;
    //var options = params.options;
    //var field = params.field;

    var $tr =  $( event.target ).closest( 'tr' );

    formPage.getHistory().putDelete( 
        formPage.getId(), 
        //options, 
        0, 
        $tr.attr( 'data-subform-record-key' ), 
        $tr,
        this,
        $tr.attr( 'data-subform-record-index' ) );
};

Subform.prototype.getTemplate = function( options ){
    return 'subform@templates/fields/subforms.html';   
};

Subform.prototype.getViewTemplate = function(){
    return 'view@templates/fields/subforms.html';   
};

Subform.prototype.getViewTemplate = function(){
    return 'view@templates/fields/subforms.html';   
};

Subform.prototype.buildFields = function(){
    var subformInstance = this;
    var fields = [];

    $.each( this.fields, function ( subfieldId, subfield ) {

        if ( subfield.subformKey ){
            subformInstance.subformKey = subfieldId;
        }

        fields.push( subfield );
    });

    this.getFields = function(){
        return fields;
    };
};

Subform.prototype.mustHideLabel = function(){
    return true;
};

module.exports = Subform;