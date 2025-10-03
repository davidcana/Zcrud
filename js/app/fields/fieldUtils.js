/*
    fieldUtils singleton class
*/

export const fieldUtils = function() {
    
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
    
    var updateRecordFromFormSelection = function( record, fieldsArray, $selection ){

        for ( var c = 0; c < fieldsArray.length; c++ ) {
            var field = fieldsArray[ c ];
            var value = field.isReadOnly()?
                undefined:
                field.getValueFromForm( $selection );

            if ( value != undefined && value != '' ){
                record[ field.id ] = value;
            }
        }
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

        recordsArray = recordsArray || [];
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
        updateRecordFromFormSelection: updateRecordFromFormSelection,
        buildDefaultValuesRecord: buildDefaultValuesRecord,
        buildRecordsMap: buildRecordsMap
    };
}();

