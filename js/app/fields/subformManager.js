/*
    SubformManager singleton class
*/
"use strict";

var $ = require( 'jquery' );
var validationManager = require( '../validationManager.js' );

var SubformManager = function() {
    
    var filterValue = function( record, field, fieldBuilder ){
        
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
                    newRecord[ subformField.id ] = fieldBuilder.filterValue( subformRecord, subformField );
                }
            }
        }
        
        return newRecords;
    };
    
    var getValueFromRecord = function( field, record, params ){
        
        var fieldBuilder = params.fieldBuilder; // To avoid circular refs
        var dictionary = params.formPage.getDictionary();
        var subformRecords = record[ field.id ];
        var subformFields = field.fields;
        
        for ( var i = 0; i < subformRecords.length; i++ ) {
            var subformRecord = subformRecords[ i ];
            for ( var c in subformFields ){
                var subformField = subformFields[ c ];
                subformRecord[ subformField.id ] = fieldBuilder.getValueFromRecord( 
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
        
        bindEventsInRows( params, $subform );
        
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
            formPage, 
            thisDictionary,
            $( '#' + formPage.getId() + ' .zcrud-field-' + field.id + ' tbody') );
        var $tr = createHistoryItem.get$Tr(); 

        // Bind events
        bindEventsInRows( params, $tr );
        
        // Configure form validation
        //validationManager.addAttributes( $tr, options );
        validationManager.initFormValidation( formPage.getId(), $tr, options );
    };
    
    var bindEventsInRows = function( params, $subform ){
        
        var formPage = params.formPage;
        var fieldBuilder = params.fieldBuilder; // To avoid circular refs
        
        $subform
            .find( 'input.historyField, textarea.historyField, select.historyField' )
            //.off()
            .change( function ( event, disableHistory ) {
                if ( disableHistory ){
                    return;
                }
                var $this = $( this );
                var fullName = $this.prop( 'name' );
                var field = formPage.getFieldByName( fullName );
                var $tr = $this.closest( 'tr' );
                formPage.getHistory().putChange( 
                    $this, 
                    fieldBuilder.getValue( field, $this ), 
                    0,
                    formPage.getId(),
                    field,
                    $tr.attr( 'data-subform-record-index' ),
                    $tr.attr( 'data-subform-record-key' ),
                    formPage.getParentFieldByName( fullName ));
        });
        
        $subform
            .find( '.zcrud-subform-delete-row-command-button' )
            .off()
            .click( function ( event ) {
            event.preventDefault();
            event.stopPropagation();
            
            deleteRow( params, event );
        });
        
        bindEventsForFields(
            $subform,
            params.field.fields,
            formPage,
            fieldBuilder,
            params
        );
    };
    
    var bindEventsForFields = function( $subform, fields, formPage, fieldBuilder, params ){
        
        var dictionary = formPage.getDictionary();
        var records = params.value || [];
        var $rows = $subform.find( 'tbody' ).children().filter( '.zcrud-data-row' );
        for ( var i = 0; i < records.length; i++ ) {
            var record = records[ i ];
            for ( var c in fields ){
                var field = fields[ c ];
                fieldBuilder.afterProcessTemplateForField(
                    buildProcessTemplateParams( field, record, dictionary, params ),
                    $rows.filter( ":eq(" + i + ")" )
                );
            }
        }
    };
    
    var buildProcessTemplateParams = function( field, record, dictionary, params ){

        return {
            id: 'optionListProviderManager',
            field: field, 
            value: record[ field.id ],
            options: params.options,
            record: record,
            source: params.source,
            dictionary: dictionary,
            formPage: params.formPage,
            fieldBuilder: params.fieldBuilder
        };
    };
    
    var deleteRow = function( params, event ){
        
        var formPage = params.formPage;
        var options = params.options;
        var field = params.field;
        
        var $tr =  $( event.target ).closest( 'tr' );
        
        formPage.getHistory().putDelete( 
            formPage.getId(), 
            options, 
            0, 
            $tr.attr( 'data-subform-record-key' ), 
            $tr,
            field,
            $tr.attr( 'data-subform-record-index' ) );
    };
    
    var getTemplate = function(){
        return 'subform@templates/fields/subforms.html';   
    };
    
    var buildFields = function( field ){

        var fields = [];

        $.each( field.fields, function ( subfieldId, subfield ) {
            
            if ( subfield.subformKey ){
                field.subformKey = subfieldId;
            }
            subfield.name = field.id + "/" + subfieldId;

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
        //setValueToForm: setValueToForm,
        getValueFromRecord: getValueFromRecord,
        afterProcessTemplateForField: afterProcessTemplateForField,
        getTemplate: getTemplate,
        buildFields: buildFields,
        mustHideLabel: mustHideLabel,
        filterValue: filterValue
    };
}();

SubformManager.types = [ 'subform' ];

module.exports = SubformManager;