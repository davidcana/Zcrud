/*
    DatetimeFieldManager singleton class
*/
"use strict";

//var context = require( '../context.js' );
var $ = require( 'jquery' );
require( '../../../lib/datetimepicker/jquery.datetimepicker.js' );
var DateFormatter = require( '../../../lib/php-date-formatter.js' );
var context = require( '../context.js' );

var DatetimeFieldManager = function() {
    
    var initDone = false;
    var dateFormatter = new DateFormatter();
    
    var init = function( options ){
        if ( ! initDone ){
            //$.datetimepicker.setLocale( 'en' );
            $.datetimepicker.setLocale( options.i18n.language );
            
            initDone = true;
        }
    };
    
    var setValueToForm = function( field, value, $this ){
        $this.val( value );
    };
    
    var afterProcessTemplateForField = function( params, $selection ){
        
        switch( params.source ) {
        case 'create':
        case 'update':
            afterProcessTemplateForFieldInCreateOrUpdate( params, $selection );
            break;
        case 'delete':
            // Nothing to do
            break; 
        default:
            throw "Unknown source in DatetimeFieldManager: " + params.source;
        }
    };
    
    var afterProcessTemplateForFieldInCreateOrUpdate = function( params, $selection ){
    
        init( params.options );
        
        var defaultFieldOptions = undefined;
        switch( params.field.type ) {
        case 'date':
            defaultFieldOptions = params.options.fieldsConfig.defaultFieldOptions.date;
            //defaultFieldOptions.format = context.translate( 'dateFormat' );
            break;
        case 'datetime':
            defaultFieldOptions = params.options.fieldsConfig.defaultFieldOptions.datetime;
            //defaultFieldOptions.format = context.translate( 'dateTimeFormat' );
            break;
        case 'time':
            defaultFieldOptions = params.options.fieldsConfig.defaultFieldOptions.time;
            //defaultFieldOptions.format = context.translate( 'timeFormat' );
            break;
        default:
            throw 'Unknown type in DatetimeFieldManager: ' + params.field.type;
        }
        
        defaultFieldOptions.format = getI18nFormat( params.field );
        //$( '#' + params.field.elementId ).datetimepicker( 
        $selection.find( "[name='" + params.field.id + "']").datetimepicker( 
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
    
    var getI18nFormat = function( field ){
        /*
        var formatI18nId = undefined;
        
        switch( field.type ) {
        case 'date':
            formatI18nId = 'dateFormat';
            break;
        case 'datetime':
            formatI18nId = 'dateTimeFormat';
            break;
        case 'time':
            formatI18nId = 'timeFormat';
            break;
        default:
            throw 'Unknown type in DatetimeFieldManager: ' + field.type;
        }*/
        var formatI18nId = field.type + 'Format';
        return context.translate( formatI18nId );
    };
    
    var getValueFromForm = function( field, options, $selection ){
 
        var datetimeString = $selection.find( "[name='" + field.id + "']").val();
        //var datetimeString = $( '#' + field.elementId ).val();

        if ( ! datetimeString || datetimeString.length == 0 ){
            return datetimeString;
        }
        
        var inputFormat = getI18nFormat( field );
        var outputFormat = options.serverDataFormat[ field.type ];
        
        return inputFormat === outputFormat? 
            datetimeString: 
            convertDate( datetimeString, inputFormat, outputFormat );
    };
    /*
    var getValue = function( datetimeString, field, options ){
        
        if ( datetimeString.length == 0 ){
            return '';
        }
        
        var inputFormat = getI18nFormat( field );
        var outputFormat = options.dateTime[ field.type + "Format" ];
        
        return inputFormat === outputFormat? 
            datetimeString: 
            convertDate( datetimeString, inputFormat, outputFormat );
    };*/
    
    var convertDate = function( datetimeString, inputFormat, outputFormat ){
                
        //alert( 'inputFormat: ' + inputFormat + '\noutputFormat: ' + outputFormat );
        
        var dateInstance = dateFormatter.parseDate( datetimeString, inputFormat );
        //alert( 'dateInstance: ' + dateInstance );
        
        var reformatted = dateFormatter.formatDate( dateInstance, outputFormat );
        //alert( 'reformatted: ' + reformatted );
        
        return reformatted;
    };
    
    var getValueFromRecord = function( field, record, params ){
        
        var options = params.options;
        
        var datetimeString = record[ field.id ];
        if ( ! datetimeString || datetimeString.length == 0 ){
            return datetimeString;
        }
        
        var inputFormat = options.serverDataFormat[ field.type ];
        var outputFormat = getI18nFormat( field );
        
        return inputFormat === outputFormat? 
            datetimeString: 
            convertDate( datetimeString, inputFormat, outputFormat );
    };
    
    return {
        setValueToForm: setValueToForm,
        afterProcessTemplateForField: afterProcessTemplateForField,
        getTemplate: getTemplate,
        getValueFromForm: getValueFromForm,
        getValueFromRecord: getValueFromRecord
    };
}();

DatetimeFieldManager.types = [ 'date', 'datetime', 'time' ];

module.exports = DatetimeFieldManager;