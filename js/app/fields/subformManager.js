/*
    SubformManager singleton class
*/
"use strict";

var $ = require( 'jquery' );

var SubformManager = function() {
    
    var setValueToForm = function( field, value, $this ){
        $this.val( value );
    };
    
    var afterProcessTemplateForField = function( params, $selection ){
        
        var formPage = params.formPage;
        var fieldBuilder = params.fieldBuilder; // To avoid circular refs
        
        $selection
            .find( 'input, textarea, select' )
            .off()
            .change( function ( event ) {
                var $this = $( this );
                var fullName = $this.prop( 'name' );
                var field = formPage.getFieldByName( fullName );
                formPage.getHistory().putChange( 
                    $this, 
                    fieldBuilder.getValue( field, $this ), 
                    0,
                    formPage.getId(),
                    field,
                    $this.closest( 'tr' ).attr( 'data-subform-record-index' ) );
            });
    };
    
    var getTemplate = function(){
        return 'subform@templates/fields/subforms.html';   
    };
    
    var buildFields = function( field ){

        var fields = [];

        $.each( field.fields, function ( subfieldId, subfield ) {
            fields.push( subfield );
        });
        
        field.getFields = function(){
            return fields;
        };
    };
    
    return {
        setValueToForm: setValueToForm,
        afterProcessTemplateForField: afterProcessTemplateForField,
        getTemplate: getTemplate,
        buildFields: buildFields
    };
}();

SubformManager.types = [ 'subform' ];

module.exports = SubformManager;