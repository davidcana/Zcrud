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
    };
    
    var redo = function(){
        
        setValue( newValue );
        updateCSS( true, true );
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
    
    var doAction = function( actionsObject, records ){
        
        // Build or get row and then attach it to actionsObject
        var row = history.buildAndAttachRowForDoAction( 
            actionsObject, 
            records, 
            rowIndex, 
            subformName, 
            subformRowIndex, 
            subformRowKey,
            undefined,
            true );
        
        // Set new value
        row[ name ] = newValue;
    };
    /*
    var doAction = function( actionsObject, records ){
        
        // Build or get row
        var row = buildAndAttachRowForDoAction( actionsObject, records );

        // Set new value
        row[ name ] = newValue;
    };
    var buildAndAttachRowForDoAction = function( actionsObject, records ){

        var subformElementIsNew = subformRowKey == '' || ! subformRowKey? true: false;
        var map = history.getMap( actionsObject, records, rowIndex );
        var subformMapKey = subformName? history.getSubformMapKey( ! subformElementIsNew ): undefined;

        // Search row
        var row = map[ rowIndex ];
        if ( subformName ){
            row = getSubformRow( 
                row, 
                subformMapKey, 
                subformElementIsNew, 
                subformName, 
                subformRowIndex, 
                subformRowKey );
        }

        // Build empty row if not found
        if ( ! row ){
            row = {};
            if ( subformName ){
                history.pushNewSubformRow( 
                    map, 
                    row, 
                    subformMapKey, 
                    subformElementIsNew, 
                    subformName, 
                    rowIndex, 
                    subformRowIndex, 
                    subformRowKey );
            } else {
                map[ rowIndex ] = row;
            }
        }

        return row;
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
    */
    
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