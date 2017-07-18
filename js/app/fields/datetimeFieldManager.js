/*
    DatetimeFieldManager singleton class
*/
"use strict";

//var context = require( '../context.js' );
var $ = require( 'jquery' );
require( '../../../lib/datetimepicker/jquery.datetimepicker.js' );

var DatetimeFieldManager = function() {
    
    var initDone = false;
    
    var init = function(){
        if ( ! initDone ){
            $.datetimepicker.setLocale( 'en' );
            
            initDone = true;
        }
    };
    
    var beforeProcessTemplateForField = function( params ){
    };
    
    var afterProcessTemplateForField = function( params ){
    
        init();
        
        var defaultFieldOptions = undefined;
        switch( params.field.type ) {
        case 'date':
            defaultFieldOptions = params.options.defaultFieldOptions.date;
            break;
        case 'datetime':
            defaultFieldOptions = params.options.defaultFieldOptions.datetime;
            break;
        case 'time':
            defaultFieldOptions = params.options.defaultFieldOptions.time;
            break;
        default:
            throw 'Unknown type in DatetimeFieldManager: ' + params.field.type;
        }
        
        $( '#' + params.field.elementId ).datetimepicker(
            params.field.customOptions? $.extend( {}, defaultFieldOptions, params.field.customOptions ): defaultFieldOptions
        );
    };
    
    return {
        beforeProcessTemplateForField: beforeProcessTemplateForField,
        afterProcessTemplateForField: afterProcessTemplateForField
    };
}();

DatetimeFieldManager.types = [ 'date', 'datetime', 'time' ];

module.exports = DatetimeFieldManager;