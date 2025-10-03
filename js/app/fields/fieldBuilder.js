/* 
    fieldBuilder singleton class
*/
  
import { utils } from '../utils.js';

export const fieldBuilder = (function() {

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
    
    var self = {
        createFieldInstance: createFieldInstance,
        registerAllConstructors: registerAllConstructors,
        filterValues: filterValues
    };
    
    return self;
})();
