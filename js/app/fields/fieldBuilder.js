/* 
    fieldBuilder singleton class
*/
module.exports = (function() {
    'use strict';
    
    var utils = require( '../utils.js' );

    var defaultConstructor = undefined;
    var constructors = {};
    
    var createFieldInstance = function( field ){

        var constructor = constructors[ field.type ];
        if ( ! constructor ){
            constructor = defaultConstructor;
        }
        
        var newFieldInstance = new constructor( field );
        return newFieldInstance;
    };
    
    var registerAllConstructors = function( constructorsConf ){

        defaultConstructor = constructorsConf.default;

        for ( var i = 0; i < constructorsConf.mapping.length; ++i ){
            var item = constructorsConf.mapping[ i ];
            registerConstructor( item.constructor, item.fieldTypes );
        }
    };
    
    var registerConstructor = function( constructor, fieldTypes ) {

        fieldTypes = fieldTypes || constructor.types;

        if ( utils.isArray( fieldTypes ) ){
            for ( var c = 0; c < fieldTypes.length; c++ ) {
                constructors[ fieldTypes[ c ] ] = constructor;
            }

        } else {
            constructors[ fieldTypes ] = constructor;
        }
    };
    
    var filterValues = function( record, fields ){

        var newRecord = {};

        for ( var index in fields ){
            var field = fields[ index ];
            var value = field.filterValue( record );
            if ( value != undefined ){
                newRecord[ field.id ] = value;
            }
        }

        return newRecord;
    };
    /*
    var bindEvents = function( fields ){
        
        for ( var index in fields ){
            var field = fields[ index ];

        }
    };*/
    
    var self = {
        createFieldInstance: createFieldInstance,
        registerAllConstructors: registerAllConstructors,
        filterValues: filterValues
    };
    
    return self;
})();
