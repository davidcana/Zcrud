/*
    CheckboxFieldManager singleton class
*/
"use strict";

//var context = require( '../context.js' );
var $ = require( 'jquery' );

var CheckboxFieldManager = function() {
  
    var beforeProcessTemplateForField = function( params ){
    };
    
    var afterProcessTemplateForField = function( params ){
    };
    
    var getValue = function( field ){
        return $( '#' + field.elementId ).is( ":checked" );
    };
    
    return {
        beforeProcessTemplateForField: beforeProcessTemplateForField,
        afterProcessTemplateForField: afterProcessTemplateForField,
        getValue: getValue
    };
}();

CheckboxFieldManager.types = [ 'checkbox' ];

module.exports = CheckboxFieldManager;