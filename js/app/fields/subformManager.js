/*
    SubformManager singleton class
*/
"use strict";

var $ = require( 'jquery' );
var validationManager = require( '../validationManager.js' );
var context = require( '../context.js' );

var SubformManager = function() {
    
    var filterValue = function( record, field ){
        
        var newRecords = [];
        var subformRecords = record[ field.id ];
        var subformFields = field.fields;
        
        for ( var i = 0; i < subformRecords.length; i++ ) {
            var subformRecord = subformRecords[ i ];
            var newRecord = {};
            newRecords.push( newRecord );
            for ( var c in subformFields ){
                var subformField = subformFields[ c ];
                var value = subformRecord[ subformField.id ];
                if ( value != undefined ){
                    newRecord[ subformField.id ] = context.getFieldBuilder().filterValue( subformRecord, subformField );
                }
            }
        }
        
        return newRecords;
    };
    
    var getValueFromRecord = function( field, record, params ){
        
        //var fieldBuilder = params.fieldBuilder; 
        var dictionary = params.formPage.getDictionary();
        var subformRecords = record[ field.id ] || [];
        var subformFields = field.fields;
        
        for ( var i = 0; i < subformRecords.length; i++ ) {
            var subformRecord = subformRecords[ i ];
            for ( var c in subformFields ){
                var subformField = subformFields[ c ];
                subformRecord[ subformField.id ] = context.getFieldBuilder().getValueFromRecord( 
                    subformField, 
                    subformRecord, 
                    buildProcessTemplateParams( subformField, subformRecord, dictionary, params ) );
            }
        }
        
        return subformRecords;
    };
    
    var get$subform = function( formPage, field ){
        //return $form.find( '.zcrud-field-' + field.id );
        return $( '#' + formPage.getId() + ' .zcrud-field-' + field.id );
    };
    
    var afterProcessTemplateForField = function( params, $form ){
        
        var $subform = get$subform( params.formPage, params.field );
        
        bindEventsInRows( params, $subform, undefined );
        
        $subform
            .find( '.zcrud-subform-new-row-command-button' )
            .off()
            .click( function ( event ) {
                event.preventDefault();
                event.stopPropagation();
                addNewRow( params );
        });

    };
    
    var addNewRow = function( params ){
        
        var formPage = params.formPage;
        var options = params.options;
        var field = params.field;
        
        var thisDictionary = $.extend( {}, formPage.getDictionary(), {} );
        thisDictionary.subformRecords = [ {} ];
        thisDictionary.subformField = field;
        
        var createHistoryItem = formPage.getHistory().putCreate( 
            formPage.getId(), 
            thisDictionary,
            $( '#' + formPage.getId() + ' .zcrud-field-' + field.id + ' tbody') );
        var $tr = createHistoryItem.get$Tr(); 

        // Bind events
        bindEventsInRows( params, undefined, $tr );
        
        // Configure form validation
        //validationManager.addAttributes( $tr, options );
        validationManager.initFormValidation( formPage.getId(), $tr, options );
    };
    
    var bindEventsInRows = function( params, $subform, $tr ){
        
        var formPage = params.formPage;
        //var fieldBuilder = params.fieldBuilder; 
        var $selection = $subform || $tr;
        //var $selection = $subform || $tr.parents( '.zcrud-data-entity' ).first();
        
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
                    context.getFieldBuilder().getValue( field, $this ), 
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
            
            deleteRow( params, event );
        });
        
        if ( $tr ){
            bindEventsForFieldsIn1Row( 
                $tr, 
                params.field.fields, 
                [], 
                formPage.getDictionary(), 
                params );
        } else {
            bindEventsForFields(
                $subform,
                params.field.fields,
                formPage.getDictionary(),
                params
            );
        }
    };
    
    var bindEventsForFields = function( $subform, fields, dictionary, params ){
        
        var records = params.value || [];
        var $rows = $subform.find( 'tbody' ).children().filter( '.zcrud-data-row' );
        for ( var i = 0; i < records.length; i++ ) {
            var record = records[ i ];
            var $row = $rows.filter( ":eq(" + i + ")" );
            bindEventsForFieldsIn1Row( $row, fields, record, dictionary, params );
        }
    };
    
    var bindEventsForFieldsIn1Row = function( $row, fields, record, dictionary, params ){

        for ( var c in fields ){
            var field = fields[ c ];
            context.getFieldBuilder().afterProcessTemplateForField(
                buildProcessTemplateParams( field, record, dictionary, params ),
                $row
            );
        }
    };
    
    var buildProcessTemplateParams = function( field, record, dictionary, params ){

        return {
            //id: 'optionListProviderManager',
            field: field, 
            value: record[ field.id ],
            options: params.options,
            record: record,
            source: params.source,
            dictionary: dictionary,
            formPage: params.formPage
            //fieldBuilder: params.fieldBuilder
        };
    };
    
    var deleteRow = function( params, event ){
        
        var formPage = params.formPage;
        //var options = params.options;
        var field = params.field;
        
        var $tr =  $( event.target ).closest( 'tr' );
        
        formPage.getHistory().putDelete( 
            formPage.getId(), 
            //options, 
            0, 
            $tr.attr( 'data-subform-record-key' ), 
            $tr,
            field,
            $tr.attr( 'data-subform-record-index' ) );
    };
    
    var getTemplate = function(){
        return 'subform@templates/fields/subforms.html';   
    };
    
    var getViewTemplate = function(){
        return 'view@templates/fields/subforms.html';   
    };
    
    var buildFields = function( field ){

        var fields = [];

        $.each( field.fields, function ( subfieldId, subfield ) {
            
            if ( subfield.subformKey ){
                field.subformKey = subfieldId;
            }
            subfield.name = field.id + context.subformSeparator + subfieldId;

            fields.push( subfield );
        });
        
        field.getFields = function(){
            return fields;
        };
    };
    
    var mustHideLabel = function( field ){
        return true;
    };
    
    return {
        id: 'subformManager',
        addToDictionary: false,
        getValueFromRecord: getValueFromRecord,
        afterProcessTemplateForField: afterProcessTemplateForField,
        getTemplate: getTemplate,
        getViewTemplate: getViewTemplate,
        buildFields: buildFields,
        mustHideLabel: mustHideLabel,
        filterValue: filterValue
    };
}();

//SubformManager.types = [ 'subform' ];

module.exports = SubformManager;