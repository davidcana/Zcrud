/*
    Change class
*/
"use strict";

var $ = require( 'jquery' );
var context = require( '../../../js/app/context.js' );

var Change = function( historyToApply, optionsToApply, editableOptionsToApply, rowIndexToApply, nameToApply, newValueToApply, previousValueToApply, $thisToApply, fieldToApply, subformNameToApply, subformRowIndexToApply, subformRowKeyToApply ) {
    
    var history = historyToApply;
    var options = optionsToApply;
    var editableOptions = editableOptionsToApply;
    var rowIndex = rowIndexToApply;
    var name = nameToApply;
    var newValue = newValueToApply;
    var previousValue = previousValueToApply;
    var $this = $thisToApply;
    var field = fieldToApply;
    var subformName = subformNameToApply;
    var subformRowIndex = subformRowIndexToApply;
    var subformRowKey = subformRowKeyToApply;
    
    var getSubformName = function(){
        return subformName;
    };
    
    var setValue = function( value ){
        
        field.setValueToForm(  
            value, 
            $this, 
            ! history.isFormMode(), 
            options );
    };
    
    var undo = function(){
        
        setValue( previousValue );
        
        var previousItem = history.getPreviousItem( rowIndex, name, subformName, subformRowIndex );
        updateCSS(
            previousItem? previousItem.isDirty(): false, 
            history.getPreviousRecordItem( rowIndex, subformName, subformRowIndex ) );
        /*
        if ( ! history.isFormMode() ){
            $this.blur();
        }*/
    };
    
    var redo = function(){
        
        setValue( newValue );
        updateCSS( true, true );
        /*
        if ( ! history.isFormMode() ){
            $this.blur();
        }*/
    };
    
    var updateCSS = function( fieldChanged, registerChanged ){

        if ( history.isFormMode() && ! subformName ){
            if ( fieldChanged ){
                $this.closest( '.zcrud-field' ).addClass( editableOptions.modifiedFieldsClass );
            } else {
                $this.closest( '.zcrud-field' ).removeClass( editableOptions.modifiedFieldsClass );   
            }
            return;    
        }
        
        if ( fieldChanged ){
            $this.closest( 'td' ).addClass( editableOptions.modifiedFieldsClass );
        } else {
            $this.closest( 'td' ).removeClass( editableOptions.modifiedFieldsClass );
        }

        if ( registerChanged ){
            $this.closest( 'tr' ).addClass( editableOptions.modifiedRowsClass );
        } else {
            $this.closest( 'tr' ).removeClass( editableOptions.modifiedRowsClass );
        }
    };
    
    var register = function(){
        updateCSS( true, true );
    };
    
    var getNewValue = function(){
        return newValue;
    };
    
    var isRelatedToField = function( rowIndexToCheck, nameToCheck, subformNameToCheck, subformRowIndexToCheck ){
        
        return rowIndex == rowIndexToCheck && name == nameToCheck
            && subformName == subformNameToCheck && subformRowIndex == subformRowIndexToCheck;
    };
    
    var isRelatedToRow = function( rowIndexToCheck, subformNameToCheck, subformRowIndexToCheck ){
        
        return rowIndex == rowIndexToCheck
            && subformName == subformNameToCheck && subformRowIndex == subformRowIndexToCheck;
    };
    
    var getMap = function( actionsObject, records ){
        
        var record = records[ rowIndex ];
        return record? actionsObject.modified: actionsObject.new;
    };

    var getSubformMapKey = function(){
        return subformRowKey? 'modified': 'new';
    };
    
    var getSubformRow = function( row, subformMapKey, isNew ){
        
        var lastKey = isNew? subformRowIndex: subformRowKey;
        
        if ( row && row[ subformName ] && row[ subformName ][ subformMapKey ] && row[ subformName ][ subformMapKey ][ lastKey ] ){
            row = row[ subformName ][ subformMapKey ][ lastKey ];
        } else {
            row = undefined;
        }
        
        return row;
    };
    
    var pushNewSubformRow = function( map, row, subformMapKey, isNew ){
        
        var subformRows = undefined;
        if ( ! map[ rowIndex ] || ! map[ rowIndex ][ subformName ] ){
            var subformActionObject = history.createNestedObject( 
                map, 
                [ rowIndex, subformName ], 
                history.buildEmptyActionsObject() );
            subformRows = subformActionObject[ subformMapKey ];
        } else {
            subformRows = map[ rowIndex ][ subformName ][ subformMapKey ];
        }
        subformRows[ isNew? subformRowIndex: subformRowKey ] = row;
    };
    
    var doAction = function( actionsObject, records ){
        
        var map = getMap( actionsObject, records );
        var subformMapKey = subformName? getSubformMapKey(): undefined;
        var subformElementIsNew = 'new' === subformMapKey;
        
        // Search row
        var row = map[ rowIndex ];
        if ( subformName ){
            row = getSubformRow( row, subformMapKey, subformElementIsNew );
        }
        
        // Build empty row if not found
        if ( ! row ){
            row = {};
            if ( subformName ){
                pushNewSubformRow( map, row, subformMapKey, subformElementIsNew );
            } else {
                map[ rowIndex ] = row;
            }
        }
        
        // Set new value
        row[ name ] = newValue;
    };
                    
    var saveEnabled = function(){
        return true;
    };
    
    var isDirty = function(){
        return true;
    };
    
    return {
        undo: undo,
        redo: redo,
        register: register,
        isRelatedToField: isRelatedToField,
        isRelatedToRow: isRelatedToRow,
        doAction: doAction,
        rowIndex: rowIndex,
        subformRowIndex: subformRowIndex,
        field: field,
        name: name,
        getNewValue: getNewValue,
        previousValue: previousValue,
        $this: $this,
        saveEnabled: saveEnabled,
        getSubformName: getSubformName,
        isDirty: isDirty,
        type: 'change'
    };
};

Change.resetCSS = function( $list, editableOptions ){

    $list.find( '.' + editableOptions.modifiedFieldsClass ).removeClass( editableOptions.modifiedFieldsClass );
    $list.find( '.' + editableOptions.modifiedRowsClass ).removeClass( editableOptions.modifiedRowsClass );
};

module.exports = Change;