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
    
    var beforeProcessTemplate = function( field, elementId, options, record ){
    };
    
    var afterProcessTemplate = function( field, elementId, options, record ){
    
        init();
        
        var defaultFieldOptions = undefined;
        switch( field.type ) {
        case 'date':
            defaultFieldOptions = options.defaultFieldOptions.date;
            break;
        case 'datetime':
            defaultFieldOptions = options.defaultFieldOptions.datetime;
            break;
        case 'time':
            defaultFieldOptions = options.defaultFieldOptions.time;
            break;
        default:
            throw 'Unknown type in DatetimeFieldManager: ' + field.type;
        }
        
        $( '#' + elementId ).datetimepicker(
            field.customOptions? $.extend( {}, defaultFieldOptions, field.customOptions ): defaultFieldOptions
        );
    };
    
    return {
        beforeProcessTemplate: beforeProcessTemplate,
        afterProcessTemplate: afterProcessTemplate
    };
}();

DatetimeFieldManager.types = [ 'date', 'datetime', 'time' ];

module.exports = DatetimeFieldManager;