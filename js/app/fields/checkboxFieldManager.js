/*
    CheckboxFieldManager singleton class
*/
"use strict";

//var context = require( '../context.js' );
var $ = require( 'jquery' );

var CheckboxFieldManager = function() {
    
    var getValueFromForm = function( field ){
        return $( '#' + field.elementId ).is( ":checked" );
    };
    
    return {
        getValueFromForm: getValueFromForm
    };
}();

CheckboxFieldManager.types = [ 'checkbox' ];

module.exports = CheckboxFieldManager;