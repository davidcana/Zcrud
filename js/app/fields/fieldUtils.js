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
    

    
    return {
        buildRecord: buildRecord
    };
}();

module.exports = FieldUtils;