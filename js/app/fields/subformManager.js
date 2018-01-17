/*
    SubformManager singleton class
*/
"use strict";

var $ = require( 'jquery' );
var context = require( '../context.js' );

var SubformManager = function() {
    
    var setValueToForm = function( field, value, $this ){
        //$this.val( value );
    };
    
    var afterProcessTemplateForField = function( params, $selection ){
        /*
        defaultFieldOptions.format = getI18nFormat( params.field );
        $selection.find( "[name='" + params.field.id + "']").datetimepicker( 
            buildDatetimepickerOptions( params, defaultFieldOptions ) );
        */
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