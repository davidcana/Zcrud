/*
    DatetimeFieldManager singleton class
*/
"use strict";

//var context = require( '../context.js' );
var $ = require( 'jquery' );
require( '../../../lib/datetimepicker/jquery.datetimepicker.js' );
var context = require( '../context.js' );

var DatetimeFieldManager = function() {
    
    var initDone = false;
    
    var init = function( options ){
        if ( ! initDone ){
            //$.datetimepicker.setLocale( 'en' );
            $.datetimepicker.setLocale( options.i18n.language );
            
            initDone = true;
        }
    };
    
    var afterProcessTemplateForField = function( params ){
        
        switch( params.source ) {
        case 'create':
        case 'update':
            afterProcessTemplateForFieldInCreateOrUpdate( params );
            break;
        case 'delete':
            // Nothing to do
            break; 
        default:
            throw "Unknown source in DatetimeFieldManager: " + params.source;
        }
    };
    
    var afterProcessTemplateForFieldInCreateOrUpdate = function( params ){
    
        init( params.options );
        
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
            buildDatetimepickerOptions( params, defaultFieldOptions ) );
    };
    
    var buildDatetimepickerOptions = function( params, defaultFieldOptions ) {
        
        var datetimepickerOptions = 
            params.field.customOptions? 
            $.extend( {}, defaultFieldOptions, params.field.customOptions ): 
            defaultFieldOptions;
        
        //datetimepickerOptions.dayOfWeekStart = 1;
        datetimepickerOptions.dayOfWeekStart = context.translate( 'dayOfWeekStart' );
        
        return datetimepickerOptions;
    };
    
    var getTemplate = function(){
        return 'datetime@templates/fields/basic.html';   
    };
    
    return {
        afterProcessTemplateForField: afterProcessTemplateForField,
        getTemplate: getTemplate
    };
}();

DatetimeFieldManager.types = [ 'date', 'datetime', 'time' ];

module.exports = DatetimeFieldManager;