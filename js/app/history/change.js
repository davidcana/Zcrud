/*
    Change class
*/
"use strict";

var $ = require( 'jquery' );
var fieldBuilder = require( '../fields/fieldBuilder' );

var Change = function( historyToApply, editableOptionsToApply, rowIndexToApply, nameToApply, newValueToApply, previousValueToApply, $thisToApply, fieldToApply, subformNameToApply, subformRowIndexToApply ) {
    
    var history = historyToApply;
    var editableOptions = editableOptionsToApply;
    var rowIndex = rowIndexToApply;
    var name = nameToApply;
    var newValue = newValueToApply;
    var previousValue = previousValueToApply;
    var $this = $thisToApply;
    var field = fieldToApply;
    var subformName = subformNameToApply;
    var subformRowIndex = subformRowIndexToApply;
    
    var setValue = function( value ){
        fieldBuilder.setValueToForm( field, value, $this, ! history.isFormMode()  );
    };
    
    var undo = function(){
        
        setValue( previousValue );
        updateCSS( 
            history.getPreviousItem( rowIndex, name, subformName, subformRowIndex ), 
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
    
    var isRelatedToField = function( rowIndexToCheck, nameToCheck, subformNameToCheck, subformRowIndexToCheck ){
        return rowIndex == rowIndexToCheck && name == nameToCheck
            && subformName == subformNameToCheck && subformRowIndex == subformRowIndexToCheck;
    };
    
    var isRelatedToRow = function( rowIndexToCheck, subformNameToCheck, subformRowIndexToCheck ){
        return rowIndex == rowIndexToCheck
            && subformName == subformNameToCheck && subformRowIndex == subformRowIndexToCheck;
    };
    
    var getDoActionModified = function( actionsObject, records ){
        
        var record = records[ rowIndex ];
        
        return record? actionsObject.modified: actionsObject.new;
    };
    
    var doAction = function( actionsObject, records ){
        
        var modified = getDoActionModified( actionsObject, records );
        var row = modified[ rowIndex ];

        if ( ! row ){
            row = {};
            modified[ rowIndex ] = row;
        }

        row[ name ] = newValue;
    };
    
    var saveEnabled = function(){
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
        name: name,
        newValue: newValue,
        previousValue: previousValue,
        $this: $this,
        saveEnabled: saveEnabled
    };
};

Change.resetCSS = function( $list, editableOptions ){

    $list.find( '.' + editableOptions.modifiedFieldsClass ).removeClass( editableOptions.modifiedFieldsClass );
    $list.find( '.' + editableOptions.modifiedRowsClass ).removeClass( editableOptions.modifiedRowsClass );
};

module.exports = Change;