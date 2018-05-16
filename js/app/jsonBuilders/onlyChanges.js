/* 
    Class onlyChanges 
*/
var HistoryDelete = require( '../history/delete.js' );
var $ = require( 'jquery' );

module.exports = (function() {
    "use strict";
    
    var buildEmptyDataToSend = function(){
        
        return {
            existingRecords: {},
            newRecords: [],
            recordsToRemove: []
        };
    };
    
    var buildActionsObject = function( records, history ){

        var actionsObject = history.buildEmptyActionsObject();
        var items = history.getActiveItems();
        
        for ( var c = 0; c < items.length; ++c ){
            var historyItem = items[ c ];
            historyItem.doAction( actionsObject, records );
        }

        return actionsObject;
    };
    
    var buildDataToSendForRemoving = function( recordsToRemove ){
        
        var data = buildEmptyDataToSend();
        data.recordsToRemove = recordsToRemove;
        return data;
    };

    var build1RowDataToSend = function( actionsObject, records, sendOnlyModified, keyField, fields ){
        
        var dataToSend = buildEmptyDataToSend();
        
        // Build modified
        for ( var rowIndex in actionsObject.modified ){
            var row = actionsObject.modified[ rowIndex ];
            var record = records[ rowIndex ];
            var key = record[ keyField ];

            if ( actionsObject.deleted.indexOf( key ) != -1 ){
                continue;
            }

            if ( ! sendOnlyModified ){
                row = $.extend( true, {}, record, row );
            }
            dataToSend.existingRecords[ key ] = row;
            
            buildSubformsRowDataToSend( row, record, sendOnlyModified, fields );
        }

        // Build new
        for ( rowIndex in actionsObject.new ){
            row = actionsObject.new[ rowIndex ];
            key = row[ keyField ];

            dataToSend.newRecords.push( row );
            
            buildNewSubformsRowDataToSend( row, sendOnlyModified, fields );
        }
        
        // Build delete
        dataToSend.recordsToRemove = actionsObject.deleted;
        
        return dataToSend;
    };
    
    var buildNewSubformsRowDataToSend = function( row, sendOnlyModified, fields ){

        for ( var c = 0; c < fields.length; c++ ) {
            var field = fields[ c ];
            if ( field.type == 'subform' && row[ field.id ] ){
                var subformDataToSend = build1RowDataToSend( 
                    row[ field.id ], 
                    {}, 
                    sendOnlyModified, 
                    field.subformKey, 
                    buildFieldArrayFromMap( field.fields ) );
                row[ field.id ] = subformDataToSend;
            }
        }
    };
    
    var buildSubformsRowDataToSend = function( row, record, sendOnlyModified, fields ){
    
        for ( var c = 0; c < fields.length; c++ ) {
            var field = fields[ c ];
            if ( field.type == 'subform' && record[ field.id ] && row[ field.id ] ){
                var subformDataToSend = build1RowDataToSend( 
                    row[ field.id ], 
                    buildRecordsMap( 
                        record[ field.id ], 
                        field.subformKey ), 
                    sendOnlyModified, 
                    field.subformKey, 
                    buildFieldArrayFromMap( field.fields ) );
                row[ field.id ] = subformDataToSend;
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
    
    var buildDataToSend = function( keyField, dataToSendOption, records, fields, forcedActionsObject, history ){
        
        var actionsObject = forcedActionsObject || buildActionsObject( records, history );
        
        // Get sendOnlyModified
        var sendOnlyModified = undefined;
        switch( dataToSendOption ){
            case 'all':
                sendOnlyModified = false;
                break;
            case 'modified':
                sendOnlyModified = true;
                break;
            default:
                alert( 'Unknown dataToSend option in history: ' + dataToSendOption );
                return false;
        }

        // Build dataToSend now
        var dataToSend = build1RowDataToSend( 
            actionsObject, 
            records, 
            sendOnlyModified, 
            keyField, 
            fields );

        // Return false if there is no record to modify, to create or to delete
        if ( Object.keys( dataToSend.existingRecords ).length == 0 
            && dataToSend.newRecords.length == 0 
            && dataToSend.recordsToRemove == 0 ){
            return false;
        }
        return dataToSend;
    };
    
    var buildDataToSendForAddRecordMethod = function( record ){

        var data = buildEmptyDataToSend();
        data.newRecords.push( record );
        return data;
    };
    
    var buildDataToSendForUpdateRecordMethod = function( keyField, dataToSendOption, currentRecord, editedRecord, fieldsMap, fields, history ){

        // Build actionsObject
        var records = [ currentRecord ];
        var actionsObject = history.buildEmptyActionsObject();
        
        $.each( editedRecord, function ( id, newValue ) {
            
            var currentValue = currentRecord[ id ];
            if ( newValue != currentValue ){
                var field = fieldsMap[ id ];
                
                if ( field.type == 'subform' ){
                    buildSubformDataToSend( actionsObject, records, field, currentValue, newValue, field.subformKey, history );
                    
                } else {
                    var historyItem = history.instanceChange( 
                        newValue, 
                        0,
                        field );
                    historyItem.doAction( actionsObject, records );
                }
            }
        });
        
        return buildDataToSend( 
            keyField, 
            dataToSendOption, 
            records, 
            fields,
            actionsObject );
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
    
    var buildSubformDataToSend = function( actionsObject, records, field, currentRows, newRows, keyField, history ){
        
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
                buildSubformDataToSend_creates( actionsObject, records, newRow, rowIndex, field.fields, history );

            } else {
                // update row
                buildSubformDataToSend_updates( actionsObject, records, newRow, currentRow, rowIndex, field.fields, field, history );
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
                    0, 
                    key, 
                    undefined,
                    field.elementName );
                historyItem.doAction( actionsObject, records );
            }
        }
    };
    
    var buildSubformDataToSend_creates = function( actionsObject, records, newRow, rowIndex, fields, history ){

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
    
    var buildSubformDataToSend_updates = function( actionsObject, records, newRow, currentRow, rowIndex, fields, parentField, history ){
        
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
    
    var getRegisterFromDataToSend = function( dataToSend, formType ){

        switch ( formType ) {
            case 'create':
                return dataToSend.newRecords[ 0 ];
            case 'update':
                return dataToSend.existingRecords[ Object.keys( dataToSend.existingRecords )[ 0 ] ];
            case 'delete':
                return dataToSend.recordsToRemove[ 0 ];
            default:
                throw "Unknown FormPage type: " + formType;
        }
    };
    
    var self = {
        buildDataToSendForRemoving: buildDataToSendForRemoving,
        buildDataToSend: buildDataToSend,
        buildDataToSendForAddRecordMethod: buildDataToSendForAddRecordMethod,
        buildDataToSendForUpdateRecordMethod: buildDataToSendForUpdateRecordMethod,
        getRegisterFromDataToSend: getRegisterFromDataToSend
    };
    
    return self;
})();

