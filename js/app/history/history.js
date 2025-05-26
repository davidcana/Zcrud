/* 
    Class History 
*/
'use strict';

var HistoryChange = require( './change.js' );
var HistoryCreate = require( './create.js' );
var HistoryDelete = require( './delete.js' );
var HistoryCleaner = require( './historyCleaner.js' );
var context = require( '../context.js' );
//var zzDOM = require( '../../../lib/zzDOM-closures-full.js' );
var zzDOM = require( 'zzdom' );
var $ = zzDOM.zz;
var utils = require( '../utils.js' );

var History = function( optionsToApply, editableOptionsToApply, dictionaryProviderToApply, formModeToApply ) {
    'use strict';
    
    var options = optionsToApply;
    var editableOptions = editableOptionsToApply;
    var dictionaryProvider = dictionaryProviderToApply;
    var formMode = formModeToApply;
    
    var getEditableOptions = function(){
        return editableOptions;
    };
    
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
               newValue === previousItem.getNewValue( rowIndex, name, subformName, subformRowIndex ):
               areEquivalent( 
                    newValue, 
                    getValueFromRecord( rowIndex, name, subformName, subformRowIndex)
                );
    };

    var buildNameObject = function( field ){

        var fullName = field.name;
        var subformSeparatorIndex = fullName.indexOf( context.subformSeparator );

        return {
            subformName: subformSeparatorIndex === -1? null: fullName.substring( 0, subformSeparatorIndex ),
            name: subformSeparatorIndex === -1? fullName: fullName.substring( 1 + subformSeparatorIndex )
        };
    };
    
    var putChange = function( $this, newValue, rowIndex, recordId, id, field, subformRowIndex, subformRowKey ) {
        
        // Build name object
        var nameObject = buildNameObject( field );
        
        // If repeated do nothing
        if ( isRepeated( newValue, rowIndex, nameObject.name, nameObject.subformName, subformRowIndex ) ){
            return undefined;
        }
        
        // Instance, put and return historyItem
        var historyItem = new HistoryChange(
            self,
            options,
            recordId,
            rowIndex,
            nameObject.name,
            newValue,
            getPreviousValue( 
                rowIndex, 
                nameObject.name, 
                nameObject.subformName, 
                subformRowIndex,
                field
            ),
            $this,
            field,
            nameObject.subformName,
            subformRowIndex,
            subformRowKey
        );
        
        put( id, historyItem );
        
        return historyItem;
    };
    
    var instanceChange = function( newValue, rowIndex, field, subformRowIndex, subformRowKey ) {

        // Build name object
        var nameObject = buildNameObject( field );
        
        // Instance and return historyItem
        var $this = undefined;
        var historyItem = new HistoryChange(
            self,
            options, 
            '1',
            rowIndex,
            nameObject.name,
            newValue,
            getPreviousValue( 
                rowIndex, 
                nameObject.name, 
                nameObject.subformName, 
                subformRowIndex
            ),
            $this,
            field,
            nameObject.subformName,
            subformRowIndex,
            subformRowKey
        );

        return historyItem;
    };
    
    var putCreate = function( id, thisDictionary, $selection, record, subformName ) {
        
        var historyItem = new HistoryCreate( 
            self,
            thisDictionary,
            $selection,
            record,
            subformName
        );

        put( id, historyItem );
        
        return historyItem;
    };
    
    var putDelete = function( id, recordId, rowIndex, key, $tr, field, subformRowIndex ) {

        var historyItem = new HistoryDelete( 
            self, 
            recordId,
            rowIndex, 
            key, 
            $tr,
            field? field.name: undefined, 
            subformRowIndex
        );

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
        
        // Update CSS and HTML
        updateHTML( id );
    };
    
    var removeSubformChanges = function( id, subformName ) {
        
        // Fill the list of historyItem to remove
        var toRemove = [];
        for ( var c = 0; c < current; ++c ){
            var historyItem = items[ c ];
            if ( historyItem.type == 'change' && historyItem.subformName == subformName ){
                toRemove.push( c );
            }
        }

        // Remove history items
        for ( var i = 0; i < toRemove.length; ++i ){
            items.splice( i );
        }
        
        // Update current
        current -= toRemove.length;
            
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
    
    var getValueFromRecord = function( rowIndex, name, subformName, subformRowIndex ){
        
        var dictionary = dictionaryProvider.getInstanceDictionaryExtension();

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
        
        var temp = record? record[ name ]: undefined;
        return temp !== undefined? temp:  '';
    };

    var getPreviousValue = function( rowIndex, name, subformName, subformRowIndex, field ){

        // If there is a previousItem in history, get the value from it
        var previousItem = getPreviousItem( rowIndex, name, subformName, subformRowIndex );
        if ( previousItem ){
            return previousItem.getNewValue( rowIndex, name, subformName, subformRowIndex );
        }

        // There is no previousItem in history
        return field && field.forceNullValueWhenNoPreviousItem?
               null:
               getValueFromRecord( rowIndex, name, subformName, subformRowIndex  );
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
            context.showError( options, false, 'Unable to undo!' );
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
            context.showError( options, false, 'Unable to redo!' );
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

        if ( ! $buttton.length ){
            return;
        }

        var text = $buttton.text();
        var fixedPart = getFixedPartOfButtonText( text, ' (' );
        
        $buttton.text( 
            newNumber == 0?
            fixedPart:
            fixedPart + ' (' + newNumber + ')'
        );

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
            $list.find( 'tr.zcrud-data-row.zcrud-hide-marker' ).remove();
            //$list.find( 'tr.zcrud-data-row:hidden' ).remove();
        }
    };
    
    var isSaveEnabled = function(){
        
        if ( current == 0 ){
            return false;
        }
        
        for ( var c = 0; c < current; ++c ){
            var historyItem = items[ c ];
            if ( historyItem.saveEnabled() ){
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
    
    var hideTr = function( $tr ){
        $tr.addClass( 'zcrud-hide-marker' );
        editableOptions.hideTr( $tr );
    };
    
    var showTr = function( $tr ){
        $tr.removeClass( 'zcrud-hide-marker' );
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
    
    var getAllTr$FromCreateItems = function( subformId ){

        var result = [];

        for ( var c = 0; c < current; ++c ){
            var historyItem = items[ c ];
            var creationHistoryItems = historyItem.getCreationItems( subformId );
            for ( var d = 0; d < creationHistoryItems.length; ++d ){
                var $tr = creationHistoryItems[ d ].get$Tr();
                if ( ! $tr.hasClass( 'zcrud-hide-marker' ) ){
                    result.push( $tr );
                }
            }
        }

        return result;
    };

    var buildActionsObject = function( records, defaultValue, fieldsMap ){
        
        var actionsObject = buildEmptyActionsObject();
        
        var historyCleaner = new HistoryCleaner();
        historyCleaner.run( buildIterator() );
        
        for ( var c = 0; c < current; ++c ){
            var historyItem = items[ c ];
            historyItem.doActionIfNotOff( actionsObject, records, historyCleaner, defaultValue, fieldsMap );
        }
        
        return actionsObject;
    };
    
    var buildAndAttachRowForDoAction = function( actionsObject, records, rowIndex, subformName, subformRowIndex, subformRowKey, record, searchRow ){

        var subformElementIsNew = subformRowKey == '' || ! subformRowKey? true: false;
        var map = getMap( actionsObject, records, rowIndex );
        var subformMapKey = subformName? getSubformMapKey( ! subformElementIsNew ): undefined;

        // Search row
        var row = undefined;
        if ( searchRow ){
            row = map[ rowIndex ];
            if ( subformName ){
                row = getSubformRow( 
                    row, 
                    subformMapKey, 
                    subformElementIsNew, 
                    subformName, 
                    subformRowIndex, 
                    subformRowKey
                );
            }
        }
        
        // Build empty row if not found
        if ( ! row ){
            row = record || {};
            if ( subformName ){
                pushNewSubformRow( 
                    map, 
                    row, 
                    subformMapKey, 
                    subformElementIsNew, 
                    subformName, 
                    rowIndex, 
                    subformRowIndex, 
                    subformRowKey
                );
            } else {
                map[ rowIndex ] = row;
            }
        }

        return row;
    };
    
    var isNew = function( records, rowIndex ){
        return ! records[ rowIndex ];
    };
    
    var getMap = function( actionsObject, records, rowIndex ){
        return isNew( records, rowIndex )? actionsObject.new: actionsObject.modified;
    };

    var getSubformMapKey = function( exists ){
        return exists? 'modified': 'new';
    };
    
    var getSubformRow = function( row, subformMapKey, isNew, subformName, subformRowIndex, subformRowKey ){

        var lastKey = isNew? subformRowIndex: subformRowKey;

        if ( row && row[ subformName ] && row[ subformName ][ subformMapKey ] && row[ subformName ][ subformMapKey ][ lastKey ] ){
            row = row[ subformName ][ subformMapKey ][ lastKey ];
        } else {
            row = undefined;
        }

        return row;
    };
    
    var pushNewSubformRow = function( map, row, subformMapKey, isNew, subformName, rowIndex, subformRowIndex, subformRowKey ){

        var subformRows = undefined;
        if ( ! map[ rowIndex ] || ! map[ rowIndex ][ subformName ] ){
            var subformActionObject = createNestedObject( 
                map, 
                [ rowIndex, subformName ], 
                buildEmptyActionsObject() 
            );
            subformRows = subformActionObject[ subformMapKey ];
        } else {
            subformRows = map[ rowIndex ][ subformName ][ subformMapKey ];
        }
        subformRows[ isNew? subformRowIndex: subformRowKey ] = row;
    };
    
    var buildIterator = function(){
        
        var c = 0;

        return {
           next: function(){
               return c < current?
                    items[ c++ ]:
                    false;
           }
        }
    }
    
    var updateRecord = function( record, items, options ){
        
        for ( var id in items ){
            
            var item = items[ id ];
            
            if ( ! utils.isPlainObject( item ) ){
                record[ id ] = item;
                continue;
            }

            var fieldId = context.buildFieldIdFromSubformsRecordsId( options, id );
            if ( record[ fieldId ] == undefined ){
                record[ fieldId ] = [];
            }
            
            // Add new records
            record[ fieldId ] = record[ fieldId ].concat( item.newRecords );
            
            // Update modified records
            var keyField = options.fields[ fieldId ].subformKey;
            for ( var modifiedId in item.existingRecords ){
                var existingRecord = item.existingRecords[ modifiedId ];
                var done = false;
                var i = 0;
                while ( ! done ){
                    var row = record[ fieldId ][ i++ ];
                    if ( ! row ){
                        throw 'Error trying to update record: row not found!';
                    } else if ( row[ keyField ] == modifiedId ){
                        utils.extend( true, row, existingRecord );
                        done = true;
                    }
                }
            }
            
            // Delete removed records
            for ( var c = 0; c < item.recordsToRemove.length; ++c ){
                record[ fieldId ].splice( c, 1 );
            }
        } 
    };
    
    var isDirty = function(){
        return current > 0;
    };
    
    var isSubformDirty = function( subformName ){

        for ( var c = 0; c < current; ++c ){
            var historyItem = items[ c ];
            if ( historyItem.subformName == subformName ){
                return true;
            }
        }
        
        return false;
    };
    
    var getOptions = function(){
        return options;
    };
    
    var self = {
        putChange: putChange,
        putCreate: putCreate,
        putDelete: putDelete,
        put: put,
        removeSubformChanges: removeSubformChanges,
        undo: undo,
        redo: redo,
        isUndoEnabled: isUndoEnabled,
        isRedoEnabled: isRedoEnabled,
        getNumberOfUndo: getNumberOfUndo,
        getNumberOfRedo: getNumberOfRedo,
        getModified: getModified,
        reset: reset,
        getPreviousItem: getPreviousItem,
        getPreviousRecordItem: getPreviousRecordItem,
        hideTr: hideTr,
        showTr: showTr,
        isFormMode: isFormMode,
        buildEmptyActionsObject: buildEmptyActionsObject,
        createNestedObject: createNestedObject,
        getAllTr$FromCreateItems: getAllTr$FromCreateItems,
        instanceChange: instanceChange,
        buildActionsObject: buildActionsObject,
        getSubformMapKey: getSubformMapKey,
        getMap: getMap,
        pushNewSubformRow: pushNewSubformRow,
        buildAndAttachRowForDoAction: buildAndAttachRowForDoAction,
        getEditableOptions: getEditableOptions,
        buildIterator: buildIterator,
        updateRecord: updateRecord,
        isDirty: isDirty,
        isSubformDirty: isSubformDirty,
        getOptions: getOptions,
        isNew: isNew
    };
    
    return self;
};

History.updateRecordsMap = function( records, jsonObject, keyField ){

    var diff = 0;
    
    for ( var id in jsonObject.existingRecords ){
        var record = jsonObject.existingRecords[ id ];
        var currentRecord = records[ id ];
        records[ id ] = utils.extend( true, {}, currentRecord, record );
    }
   
    for ( var c = 0; c < jsonObject.newRecords.length; ++c ){
        var currentRecord = jsonObject.newRecords[ c ];
        var key = currentRecord[ keyField ];
        records[ key ] = currentRecord;
        ++diff;
    }

    for ( c = 0; c < jsonObject.recordsToRemove.length; ++c ){
        delete records[ jsonObject.recordsToRemove[ c ] ];
        --diff;
    }
    
    return diff;
};

module.exports = History;
