/*
    CheckboxFieldManager singleton class
*/
"use strict";

var context = require( '../context.js' );
var $ = require( 'jquery' );

var CheckboxFieldManager = function() {
    
    var getValue = function( $this ){
        return $this.is( ":checked" );
    };
    
    var getValueFromForm = function( field, options, $selection ){
        return $selection.find( "[name='" + field.name + "']").is( ":checked" );
        //return $selection.find( "[name='" + field.id + "']:checked").val();
        //return $( '#' + field.elementId ).is( ":checked" );
    };
    
    var setValueToForm = function( field, value, $this ){
        return $this.prop( 'checked', value === undefined? false: value );
    };
    /*
    var getValueFromRecord = function( field, record ){
        var value = record[ field.id ];
        return value == undefined? false: value;
    };*/
    
    var getValueFromRecord = function( field, record, params ){
        
        // Get the value
        var value = record[ field.id ];
        value = value == undefined? false: value;
        
        switch( params.source ) {
            case 'create':
            case 'update':
                return value;
            case 'delete':
                return value? context.translate( 'true' ): context.translate( 'false' )
            default:
                throw "Unknown source in CheckboxFieldManager: " + params.source;
        }
    };
    
    return {
        id: 'checkboxFieldManager',
        addToDictionary: false,
        getValue: getValue,
        getValueFromForm: getValueFromForm,
        setValueToForm: setValueToForm,
        getValueFromRecord: getValueFromRecord
    };
}();

//CheckboxFieldManager.types = [ 'checkbox' ];

module.exports = CheckboxFieldManager;