/*
    fieldUtils singleton class
*/
"use strict";

var context = require( '../context.js' );
var $ = require( 'jquery' );

var FieldUtils = function() {
    
    var buildRecord = function( fieldsArray, $selection ){

        var record = {};

        for ( var c = 0; c < fieldsArray.length; c++ ) {
            var field = fieldsArray[ c ];
            var value = field.getValueFromForm( $selection );

            if ( value != undefined && value != '' ){
                record[ field.id ] = value;
            }
        }

        return record;
    };
    
    var buildDefaultValuesRecord = function( fieldsArray ){

        var defaultRecord = {};

        for ( var c = 0; c < fieldsArray.length; c++ ) {
            var field = fieldsArray[ c ];
            if ( field.defaultValue !== undefined ){
                defaultRecord[ field.id ] = field.defaultValue;
            }
        }

        return defaultRecord;
    };
    
    var buildRecordsMap = function( recordsArray, keyField ){

        var recordsMap = {};

        for ( var c = 0; c < recordsArray.length; c++ ) {
            var record = recordsArray[ c ];
            var key = record[ keyField ];
            recordsMap[ key ] = record;
        }

        return recordsMap;
    };
    
    return {
        buildRecord: buildRecord,
        buildDefaultValuesRecord: buildDefaultValuesRecord,
        buildRecordsMap: buildRecordsMap
    };
}();

module.exports = FieldUtils;