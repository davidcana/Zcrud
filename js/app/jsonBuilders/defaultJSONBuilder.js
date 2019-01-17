/* 
    Class defaultJSONBuilder 
*/
var HistoryDelete = require( '../history/delete.js' );
var $ = require( 'jquery' );
var context = require( '../context.js' );

module.exports = (function() {
    "use strict";
    
    var buildEmpty = function(){
        
        return {
            existingRecords: {},
            newRecords: [],
            recordsToRemove: []
        };
    };
    
    var buildJSONForRemoving = function( recordsToRemove ){
        
        var data = buildEmpty();
        data.recordsToRemove = recordsToRemove;
        return data;
    };
    /*
    var getFieldFromFieldsArray = function( fields, id ){
        
        for ( var c = 0; c < fields.length; c++ ) {
            var field = fields[ c ];
            if ( field.id == id ){
                return field;
            }
        }
        
        return null;
    };
    */
    var filterSubforms = function( row, fields, options ){
        
        var result = $.extend( true, {}, row );
        
        for ( var c = 0; c < fields.length; c++ ) {
            var field = fields[ c ];
            if ( field.type === 'subform' ){
                var fieldId = buildSubformRecordsId( field, options );
                var value = row[ fieldId ];
                if ( value !== undefined ){
                    result[ fieldId ] = value;
                }
                delete result[ field.id ];
            }
        }
        
        return result;
    };
    
    var build1Row = function( actionsObject, records, sendOnlyModified, keyField, fields, options ){
        
        var jsonObject = buildEmpty();
        
        // Build modified
        for ( var rowIndex in actionsObject.modified ){
            var row = actionsObject.modified[ rowIndex ];
            var record = records[ rowIndex ];
            var key = record[ keyField ];

            if ( key == undefined ){
                throw 'Undefined key found trying to build JSON!';
            }
            
            if ( actionsObject.deleted.indexOf( key ) != -1 ){
                continue;
            }

            if ( ! sendOnlyModified ){
                row = $.extend( true, {}, record, row );
            }
            //jsonObject.existingRecords[ key ] = filterSubforms( row, fields );
            //jsonObject.existingRecords[ key ] = row;
            
            buildSubformsRow( row, record, sendOnlyModified, fields, options  );
            jsonObject.existingRecords[ key ] = filterSubforms( row, fields, options );
        }

        // Build new
        for ( rowIndex in actionsObject.new ){
            row = actionsObject.new[ rowIndex ];
            key = row[ keyField ];

            //jsonObject.newRecords.push( filterSubforms( row, fields ) );
            //jsonObject.newRecords.push( row );
            
            buildNewSubformsRow( row, sendOnlyModified, fields, options  );
            jsonObject.newRecords.push( filterSubforms( row, fields, options ) );
        }
        
        // Build delete
        jsonObject.recordsToRemove = actionsObject.deleted;
        
        return jsonObject;
    };
    
    var buildSubformRecordsId = function( field, options ){
        return context.buildSubformsRecordsIdFromFieldId( options, field.id );
    };
    
    var buildNewSubformsRow = function( row, sendOnlyModified, fields, options ){

        for ( var c = 0; c < fields.length; c++ ) {
            var field = fields[ c ];
            if ( field.type == 'subform' && row[ field.id ] ){
                var subform = build1Row( 
                    row[ field.id ], 
                    {}, 
                    sendOnlyModified, 
                    field.subformKey, 
                    buildFieldArrayFromMap( field.fields ),
                    options
                );
                row[ buildSubformRecordsId( field, options ) ] = subform;
            }
        }
    };
    
    var buildSubformsRow = function( row, record, sendOnlyModified, fields, options ){
    
        for ( var c = 0; c < fields.length; c++ ) {
            var field = fields[ c ];
            if ( field.type == 'subform' && record[ field.id ] && row[ field.id ] ){
                var subform = build1Row( 
                    row[ field.id ], 
                    buildRecordsMap( 
                        record[ field.id ], 
                        field.subformKey ), 
                    sendOnlyModified, 
                    field.subformKey, 
                    buildFieldArrayFromMap( field.fields ),
                    options
                );
                row[ buildSubformRecordsId( field, options ) ] = subform;
            }
        }
    };
    
    var buildFieldArrayFromMap = function( fieldMap ){
        
        var result = [];
        for ( var index in fieldMap ){
            var field = fieldMap[ index ];
            result.push( field );
        }
        return result;
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
    
    var buildJSONForAll = function( sendOnlyModified, keyField, records, fields, forcedActionsObject, history ){
        
        var actionsObject = forcedActionsObject || history.buildActionsObject( records );

        // Build jsonObject now
        var jsonObject = build1Row( 
            actionsObject, 
            records, 
            sendOnlyModified, 
            keyField, 
            fields,
            history.getOptions()
        );

        // Return false if there is no record to modify, to create or to delete
        if ( Object.keys( jsonObject.existingRecords ).length == 0 
            && jsonObject.newRecords.length == 0 
            && jsonObject.recordsToRemove.length == 0 ){
            return false;
        }
        return jsonObject;
    };
    
    var buildJSONForAddRecordMethod = function( record ){

        var data = buildEmpty();
        data.newRecords.push( record );
        return data;
    };
    
    var buildJSONForUpdateRecordMethod = function( sendOnlyModified, keyField, currentRecord, editedRecord, fieldsMap, fields, history ){

        // Build actionsObject
        var records = [ currentRecord ];
        var actionsObject = history.buildEmptyActionsObject();
        
        $.each( editedRecord, function ( id, newValue ) {
            
            var currentValue = currentRecord[ id ];
            if ( newValue != currentValue ){
                var field = fieldsMap[ id ];
                
                if ( field.type == 'subform' ){
                    buildSubform( actionsObject, records, field, currentValue, newValue, field.subformKey, history );
                    
                } else {
                    var historyItem = history.instanceChange( 
                        newValue, 
                        0,
                        field );
                    historyItem.doAction( actionsObject, records );
                }
            }
        });
        
        return buildJSONForAll( 
            sendOnlyModified,
            keyField,  
            records, 
            fields,
            actionsObject,
            history
        );
    };
    
    var buildMap = function( rows, keyField ){
        
        var object = {};
        for ( var rowIndex = 0; rowIndex < rows.length; ++rowIndex ){
            var row = rows[ rowIndex ];
            var key = row[ keyField ];
            object[ key ] = row;
        }
        return object;
    };
    
    var buildSubform = function( actionsObject, records, field, currentRows, newRows, keyField, history ){
        
        var currentRowsMap = buildMap( currentRows, keyField );
        var newRowsMap = buildMap( newRows, keyField );
        var historyItem = undefined;
        var rowIndex = undefined;
        var newRow = undefined;
        var currentRow = undefined;
        var key = undefined;
        
        for ( rowIndex = 0; rowIndex < newRows.length; ++rowIndex ){
            newRow = newRows[ rowIndex ];
            key = newRow[ keyField ];
            currentRow = currentRowsMap[ key ];
            
            if ( currentRow === undefined ){
                // new row
                buildSubform_creates( actionsObject, records, newRow, rowIndex, field.fields, history );

            } else {
                // update row
                buildSubform_updates( actionsObject, records, newRow, currentRow, rowIndex, field.fields, field, history );
            }
        }
        
        for ( rowIndex = 0; rowIndex < currentRows.length; ++rowIndex ){
            currentRow = currentRows[ rowIndex ];
            key = currentRow[ keyField ];
            newRow = newRowsMap[ key ];
            
            if ( newRow === undefined ){
                // delete row
                historyItem = new HistoryDelete( 
                    self, 
                    rowIndex,
                    0, 
                    key, 
                    undefined,
                    field.name );
                historyItem.doAction( actionsObject, records );
            }
        }
    };
    
    var buildSubform_creates = function( actionsObject, records, newRow, rowIndex, fields, history ){

        var id = undefined;
        var idsDone = {};

        for ( id in newRow ){
            if( newRow.hasOwnProperty( id ) ){
                var historyItem = history.instanceChange( 
                    newRow[ id ], 
                    0, 
                    fields[ id ], 
                    rowIndex, 
                    undefined );
                historyItem.doAction( actionsObject, records );
                idsDone[ id ] = true;
            }
        }
    };
    
    var buildSubform_updates = function( actionsObject, records, newRow, currentRow, rowIndex, fields, parentField, history ){
        
        var id = undefined;
        var historyItem = undefined;
        var idsDone = {};
        
        for ( id in newRow ){
            if( newRow.hasOwnProperty( id ) ){
                if( newRow[ id ] !== currentRow[ id ] ){
                    historyItem = history.instanceChange( 
                        newRow[ id ], 
                        0, 
                        fields[ id ], 
                        rowIndex, 
                        newRow[ parentField.subformKey ] );
                    historyItem.doAction( actionsObject, records );
                    idsDone[ id ] = true;
                }
            }
        }
    };
    
    var getRecordFromJSON = function( jsonObject, formType, record, history, options ){

        switch ( formType ) {
            case 'create':
                return jsonObject.newRecords[ 0 ];
            case 'update':
                return jsonObject.existingRecords[ Object.keys( jsonObject.existingRecords )[ 0 ] ];
            case 'delete':
                return jsonObject.recordsToRemove[ 0 ];
            case 'list':
                history.updateRecord( 
                    record, 
                    jsonObject.newRecords[ 0 ] || jsonObject.existingRecords[ Object.keys( jsonObject.existingRecords )[ 0 ] ],
                    options
                );
                return record;
            default:
                throw "Unknown FormPage type: " + formType;
        }
    };
    
    var self = {
        buildJSONForAll: buildJSONForAll,
        buildJSONForRemoving: buildJSONForRemoving,
        buildJSONForAddRecordMethod: buildJSONForAddRecordMethod,
        buildJSONForUpdateRecordMethod: buildJSONForUpdateRecordMethod,
        getRecordFromJSON: getRecordFromJSON
    };
    
    return self;
})();

