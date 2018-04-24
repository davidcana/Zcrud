/* 
    Class History 
*/
var HistoryChange = require( './change.js' );
var HistoryCreate = require( './create.js' );
var HistoryDelete = require( './delete.js' );
var crudManager = require( '../crudManager.js' );
var context = require( '../context.js' );
var $ = require( 'jquery' );

var History = function( optionsToApply, editableOptionsToApply, dictionaryProviderToApply, formModeToApply ) {
    "use strict";
    
    //var options = optionsToApply;
    var editableOptions = editableOptionsToApply;
    var dictionaryProvider = dictionaryProviderToApply;
    var formMode = formModeToApply;
    
    var isFormMode = function(){
        return formMode === true;
    };
    
    var items = [];
    var current = 0;
    var modified = {};
    
    var getModified = function(){
        return modified;
    };
    
    var isVoid = function( value ){
        return value == undefined || value == '';
    };
    
    var areEquivalent = function( value1, value2 ){
        
        var value1IsVoid = isVoid( value1 );
        var value2IsVoid = isVoid( value2 );
        
        return value1IsVoid || value2IsVoid? value1IsVoid && value2IsVoid: value1 === value2;
    };
    
    var isRepeated = function( newValue, rowIndex, name, subformName, subformRowIndex ){

        var previousItem = getPreviousItem( rowIndex, name, subformName, subformRowIndex );
        return previousItem? 
               newValue === previousItem.newValue: 
        areEquivalent( newValue, getValueFromRecord( rowIndex, name, subformName, subformRowIndex ) );
    };
    
    var putChange = function( $this, newValue, rowIndex, id, field, subformRowIndex, subformRowKey ) {
        
        // Get names
        var fullName = field.elementName;
        var subformSeparatorIndex = fullName.indexOf( context.subformSeparator );
        var subformName = subformSeparatorIndex === -1? null: fullName.substring( 0, subformSeparatorIndex );
        var name = subformSeparatorIndex === -1? fullName: fullName.substring( 1 + subformSeparatorIndex );
        
        // If repeated do nothing
        if ( isRepeated( newValue, rowIndex, name, subformName, subformRowIndex ) ){
            return undefined;
        }
        
        // Instance, put and return historyItem
        var historyItem = new HistoryChange(
            self,
            editableOptions,
            rowIndex,
            name,
            newValue,
            getPreviousValue( rowIndex, name, subformName, subformRowIndex ),
            $this,
            field,
            subformName,
            subformRowIndex,
            subformRowKey );
        
        put( id, historyItem );
        
        return historyItem;
    };
    
    var instanceChange = function( newValue, rowIndex, field, subformRowIndex, subformRowKey ) {

        // Get names
        var fullName = field.elementName;
        var subformSeparatorIndex = fullName.indexOf( context.subformSeparator );
        var subformName = subformSeparatorIndex === -1? null: fullName.substring( 0, subformSeparatorIndex );
        var name = subformSeparatorIndex === -1? fullName: fullName.substring( 1 + subformSeparatorIndex );

        // Instance and return historyItem
        var $this = undefined;
        var historyItem = new HistoryChange(
            self,
            editableOptions,
            rowIndex,
            name,
            newValue,
            getPreviousValue( rowIndex, name, subformName, subformRowIndex ),
            $this,
            field,
            subformName,
            subformRowIndex,
            subformRowKey );

        return historyItem;
    };
    
    var putCreate = function( id, thisDictionary, $selection ) {
        
        var historyItem = new HistoryCreate( 
            self,
            editableOptions,
            thisDictionary,
            $selection );

        put( id, historyItem );
        
        return historyItem;
    };
    
    var putDelete = function( id, options, rowIndex, key, $tr, field ) {

        var historyItem = new HistoryDelete( 
            self, 
            rowIndex, 
            key, 
            $tr,
            field? field.elementName: undefined );

        put( id, historyItem );
        
        return historyItem;
    };
    
    var put = function( id, historyItem ) {

        // Add to items
        items[ current++ ] = historyItem;
        
        // Remove non accesible history items
        if ( isRedoEnabled() ){
            items.splice( current, items.length - current );
        }
        
        // Add history item to modified object
        historyItem.register( modified );
        
        // Update CSS and HTML
        updateHTML( id );
    };
    
    var reset = function( id ){
        items = [];
        current = 0;
        modified = {};
        
        resetCSS( id );
        updateHTML( id, true );
    };
    
    var resetCSS = function( id ){
        
        var $list = $( '#' + id );
        
        HistoryChange.resetCSS( $list, editableOptions );
        HistoryCreate.resetCSS( $list, editableOptions );
        HistoryDelete.resetCSS( $list, editableOptions );
    };
    
    /*
    var getValueFromRecord =  function( rowIndex, name, subformName, subformRowIndex ){

        var dictionary = dictionaryProvider.getDictionary();
        var record = rowIndex? dictionary.records[ rowIndex ]: dictionary.record;

        if ( ! record ){
            return '';
        }

        if ( subformRowIndex ){
            record = record[ subformName ][ subformRowIndex ];
        }

        return record? record[ name ]: undefined;
    };*/
    var getValueFromRecord =  function( rowIndex, name, subformName, subformRowIndex ){
        
        var dictionary = dictionaryProvider.getDictionary();

        // Try to get the record
        try {
            var record = rowIndex? dictionary.records[ rowIndex ]: dictionary.record;
            
            if ( ! record ){
                return '';
            }
            
            if ( subformRowIndex ){
                record = record[ subformName ][ subformRowIndex ];
            }
        }
        catch ( error ) {
            // Nothing to do
        }
        
        return record? record[ name ]: undefined;
    };
    
    var getPreviousValue = function( rowIndex, name, subformName, subformRowIndex ){
        
        var previousItem = getPreviousItem( rowIndex, name, subformName, subformRowIndex );
        return previousItem? previousItem.newValue: getValueFromRecord( rowIndex, name, subformName, subformRowIndex  );
    };
    
    var getPreviousItem = function( rowIndex, name, subformName, subformRowIndex ){

        for ( var c = current - 1; c >= 0; --c ){
            var historyItem = items[ c ];
            if ( historyItem.isRelatedToField( rowIndex, name, subformName, subformRowIndex ) ){
                return historyItem;
            }
        }

        return undefined;
    };
    
    var getPreviousRecordItem = function( rowIndex, subformName, subformRowIndex ){

        for ( var c = current - 1; c >= 0; --c ){
            var historyItem = items[ c ];
            if ( historyItem.isRelatedToRow( rowIndex, subformName, subformRowIndex ) ){
                return historyItem;
            }
        }

        return undefined;
    };
    
    var isUndoEnabled = function(){
        return current > 0;
    };
    var undo = function( id ){
        
        var historyItem = isUndoEnabled()? items[ --current ]: undefined;
        if ( ! historyItem ){
            alert( 'Unable to undo!' );
            return;
        }

        historyItem.undo();
        
        updateHTML( id );
    };
    
    var isRedoEnabled = function(){
        return current < items.length;
    };
    var redo = function( id ){
        
        var historyItem = isRedoEnabled()? items[ current++ ]: undefined;
        if ( ! historyItem ){
            alert( 'Unable to redo!' );
            return;
        }

        historyItem.redo();
        
        updateHTML( id );
    };
    
    var getNumberOfUndo = function(){
        return current;
    };
    
    var getNumberOfRedo = function(){
        return items.length - current;
    };
    
    var getFixedPartOfButtonText = function( text, prefix ){
        
        var i = text.indexOf( prefix );
        return i == -1? text: text.substring( 0, i );
    };
    
    var updateButton = function( $list, selector, newNumber ){
        
        var $buttton = $list.find( selector );
        var text = $buttton.text();
        var fixedPart = getFixedPartOfButtonText( text, ' (' );
        
        $buttton.text( 
            newNumber == 0?
            fixedPart:
            fixedPart + ' (' + newNumber + ')');
        $buttton.prop( 'disabled', newNumber == 0 );
    };
    
    var updateHTML = function( id, removeHidden ){
        
        var $list = $( '#' + id );
        
        // Update numbers
        updateButton( $list, '.zcrud-undo-command-button', getNumberOfUndo() );
        updateButton( $list, '.zcrud-redo-command-button', getNumberOfRedo() );
        
        // Set disabled of save button
        $list.find( '.zcrud-save-command-button' ).prop( 'disabled', ! isSaveEnabled() );
        
        // Remove hidden trs
        if ( removeHidden ){
            $list.find( 'tr.zcrud-data-row:hidden' ).remove();
        }
    };
    
    var isSaveEnabled = function(){
        
        if ( current == 0 ){
            return false;
        }
        
        for ( var c = 0; c < current; ++c ){
            var historyItem = items[ c ];
            if ( historyItem.saveEnabled() ){
                //return validationManager.formIsValid( options );
                return true;
            }
        }
        
        return false;
    };
    
    var buildEmptyActionsObject = function(){
        
        return {
            modified: {},
            new: {},
            deleted: []
        };
    };
    
    var buildActionsObject = function( records ){
        
        var actionsObject = buildEmptyActionsObject();
        
        for ( var c = 0; c < current; ++c ){
            var historyItem = items[ c ];
            historyItem.doAction( actionsObject, records );
        }
        
        return actionsObject;
    };
    
    var buildEmptyDataToSend = function(){
        
        return {
            existingRecords: {},
            newRecords: [],
            recordsToRemove: []
        };
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
    
    var buildDataToSend = function( keyField, dataToSendOption, records, fields, forcedActionsObject ){
        
        var actionsObject = forcedActionsObject || buildActionsObject( records );
        
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
    
    var hideTr = function( $tr ){
        $tr.addClass( 'zcrud-hidden' );
        editableOptions.hideTr( $tr );
    };
    
    var showTr = function( $tr ){
        $tr.removeClass( 'zcrud-hidden' );
        editableOptions.showTr( $tr );
    };
    
    // Function: createNestedObject( base, names[, value] )
    //   base: the object on which to create the hierarchy
    //   names: an array of strings contaning the names of the objects
    //   value (optional): if given, will be the last object in the hierarchy
    // Returns: the last object in the hierarchy
    var createNestedObject = function( base, names, value ) {
        // If a value is given, remove the last name and keep it for later:
        var lastName = arguments.length === 3 ? names.pop() : false;

        // Walk the hierarchy, creating new objects where needed.
        // If the lastName was removed, then the last object is not set yet:
        for( var i = 0; i < names.length; i++ ) {
            base = base[ names[i] ] = base[ names[i] ] || {};
        }

        // If a value was given, set it to the last name:
        if( lastName ) base = base[ lastName ] = value;

        // Return the last object in the hierarchy:
        return base;
    };
    
    var buildDataToSendForAddRecordMethod = function( record ){

        var data = buildEmptyDataToSend();
        data.newRecords.push( record );
        return data;
    };
    
    var buildDataToSendForUpdateRecordMethod = function( keyField, dataToSendOption, currentRecord, editedRecord, fieldsMap, fields ){

        // Build actionsObject
        var records = [ currentRecord ];
        var actionsObject = buildEmptyActionsObject();
        
        $.each( editedRecord, function ( id, newValue ) {
            
            var currentValue = currentRecord[ id ];
            if ( newValue != currentValue ){
                var field = fieldsMap[ id ];
                
                if ( field.type == 'subform' ){
                    buildSubformDataToSend( actionsObject, records, field, currentValue, newValue, field.subformKey );
                    
                } else {
                    var historyItem = instanceChange( 
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
    
    var buildSubformDataToSend = function( actionsObject, records, field, currentRows, newRows, keyField ){
        
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
                buildSubformDataToSend_creates( actionsObject, records, newRow, rowIndex, field.fields );

            } else {
                // update row
                buildSubformDataToSend_updates( actionsObject, records, newRow, currentRow, rowIndex, field.fields, field );
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
    
    var buildSubformDataToSend_creates = function( actionsObject, records, newRow, rowIndex, fields ){

        var id = undefined;
        var idsDone = {};

        for ( id in newRow ){
            if( newRow.hasOwnProperty( id ) ){
                var historyItem = instanceChange( 
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
    
    var buildSubformDataToSend_updates = function( actionsObject, records, newRow, currentRow, rowIndex, fields, parentField ){
        
        var id = undefined;
        var historyItem = undefined;
        var idsDone = {};
        
        for ( id in newRow ){
            if( newRow.hasOwnProperty( id ) ){
                if( newRow[ id ] !== currentRow[ id ] ){
                    historyItem = instanceChange( 
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
        /*
        for ( id in currentRow ){
            if( currentRow.hasOwnProperty( id ) ){
                if( newRow[ id ] !== currentRow[ id ] && ! idsDone[ id ] ){
                    historyItem = instanceChange( 
                        undefined, 
                        0, 
                        fields[ id ], 
                        rowIndex, 
                        fields[ id ].subformKey, 
                        parentField );
                    historyItem.doAction( actionsObject, records );
                }
            }
        }*/
    };
    
    var getAllTr$FromCreateItems = function(){
        
        var result = [];
        
        for ( var c = 0; c < current; ++c ){
            var historyItem = items[ c ];
            if ( historyItem.type === 'create' ){
                result.push( historyItem.get$Tr() );
            }
        }
        
        return result;
    };
    
    var self = {
        putChange: putChange,
        putCreate: putCreate,
        putDelete: putDelete,
        undo: undo,
        redo: redo,
        isUndoEnabled: isUndoEnabled,
        isRedoEnabled: isRedoEnabled,
        //isSaveEnabled: isSaveEnabled,
        buildDataToSendForRemoving: buildDataToSendForRemoving,
        buildDataToSend: buildDataToSend,
        getNumberOfUndo: getNumberOfUndo,
        getNumberOfRedo: getNumberOfRedo,
        getModified: getModified,
        reset: reset,
        getPreviousItem: getPreviousItem,
        getPreviousRecordItem: getPreviousRecordItem,
        hideTr: hideTr,
        showTr: showTr,
        isFormMode: isFormMode,
        //buildEmptyDataToSend: buildEmptyDataToSend,
        buildEmptyActionsObject: buildEmptyActionsObject,
        createNestedObject: createNestedObject,
        getRegisterFromDataToSend: getRegisterFromDataToSend,
        buildDataToSendForAddRecordMethod: buildDataToSendForAddRecordMethod,
        buildDataToSendForUpdateRecordMethod: buildDataToSendForUpdateRecordMethod,
        getAllTr$FromCreateItems: getAllTr$FromCreateItems
    };
    
    return self;
};

History.updateRecordsMap = function( records, dataToSend, keyField ){

    var diff = 0;
    
    $.each( dataToSend.existingRecords, function ( id, record ) {
        var currentRecord = records[ id ];
        records[ id ] = $.extend( true, {}, currentRecord, record );
    });

    for ( var c = 0; c < dataToSend.newRecords.length; ++c ){
        var currentRecord = dataToSend.newRecords[ c ];
        var key = currentRecord[ keyField ];
        records[ key ] = currentRecord;
        ++diff;
    }

    for ( c = 0; c < dataToSend.recordsToRemove.length; ++c ){
        delete records[ dataToSend.recordsToRemove[ c ] ];
        --diff;
    }
    
    return diff;
};

module.exports = History;
