/*
    CheckboxFieldManager singleton class
*/
"use strict";

//var context = require( '../context.js' );
var $ = require( 'jquery' );

var CheckboxFieldManager = function() {
    
    var getValueFromForm = function( field, $this ){
        return $( '#' + field.elementId ).is( ":checked" );
        //return $this.is( ":checked" );
    };
    
    var setValueToForm = function( field, value, $this ){
        //return $( '#' + field.elementId ).prop( 'checked', value );
        return $this.prop( 'checked', value );
    };
    
    return {
        getValueFromForm: getValueFromForm,
        setValueToForm: setValueToForm
    };
}();

CheckboxFieldManager.types = [ 'checkbox' ];

module.exports = CheckboxFieldManager;