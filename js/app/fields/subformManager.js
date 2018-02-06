/*
    SubformManager singleton class
*/
"use strict";

var $ = require( 'jquery' );
//var validationManager = require( '../validationManager.js' );

var SubformManager = function() {
    
    /*
    var setValueToForm = function( field, value, $this ){
        $this.val( value );
    };*/
    
    var afterProcessTemplateForField = function( params, $selection ){
        
        bindEventsInRows( params, $selection );
        
        $selection
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
    };
    
    var bindEventsInRows = function( params, $preselection ){
        
        var formPage = params.formPage;
        var fieldBuilder = params.fieldBuilder; // To avoid circular refs

        $preselection
            .find( 'input, textarea, select' )
            //.off()
            .change( function ( event ) {
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
        
        $preselection
            .find( '.zcrud-subform-delete-row-command-button' )
            .off()
            .click( function ( event ) {
            event.preventDefault();
            event.stopPropagation();
            
            deleteRow( params, event );
        });
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
            
            fields.push( subfield );
        });
        
        field.getFields = function(){
            return fields;
        };
    };
    
    return {
        //setValueToForm: setValueToForm,
        afterProcessTemplateForField: afterProcessTemplateForField,
        getTemplate: getTemplate,
        buildFields: buildFields
    };
}();

SubformManager.types = [ 'subform' ];

module.exports = SubformManager;