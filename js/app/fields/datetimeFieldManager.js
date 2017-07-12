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
    
    var addJavascript = function( field, elementId ){
    
        init();
        
        switch( field.type ) {
        case 'date':
                $( '#' + elementId ).datetimepicker({
                    //inline: false,

                    timepicker: false,

                    format: 'd/m/Y',
                    formatDate:'d/m/Y'
                    //value:'2015/04/15 05:03'
                });
                break;
        case 'datetime':
                $( '#' + elementId ).datetimepicker({
                    inline: false,

                    formatTime:'H:i',
                    formatDate:'d/m/Y'
                });
                break;
        case 'time':
                $( '#' + elementId ).datetimepicker({
                    inline: false,

                    datepicker: false,

                    format: 'H:i',
                    step: 5
                });
            break;
        default:
            throw 'Unknown type in DatetimeFieldManager: ' + field.type;
        }
    };

    return {
        addJavascript: addJavascript
    };
}();

DatetimeFieldManager.types = [ 'date', 'datetime', 'time' ];

module.exports = DatetimeFieldManager;