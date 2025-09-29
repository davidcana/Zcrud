/* 
    Class allJSONBuilder
*/

//var defaultJSONBuilder = require( './defaultJSONBuilder.js' );
import { defaultJSONBuilder } from './defaultJSONBuilder.js';

export const allJSONBuilder = (function() {
    
    var sendOnlyModified = false;
        
    var buildJSONForRemoving = function( recordsToRemove ){
        return defaultJSONBuilder.buildJSONForRemoving( recordsToRemove );
    };

    var buildJSONForAll = function( keyField, records, fields, forcedActionsObject, history, defaultValue, fieldsMap ){
        return defaultJSONBuilder.buildJSONForAll( sendOnlyModified, keyField, records, fields, forcedActionsObject, history, defaultValue, fieldsMap );
    };
    
    var buildJSONForAddRecordMethod = function( record ){
        return defaultJSONBuilder.buildJSONForAddRecordMethod( record );
    };
    
    var buildJSONForUpdateRecordMethod = function( keyField, currentRecord, editedRecord, fieldsMap, fields, history ){
        return defaultJSONBuilder.buildJSONForUpdateRecordMethod( sendOnlyModified, keyField, currentRecord, editedRecord, fieldsMap, fields, history );
    };
    
    var getRecordFromJSON = function( jsonObject, formType, record, history, options ){
        return defaultJSONBuilder.getRecordFromJSON( jsonObject, formType, record, history, options );
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

