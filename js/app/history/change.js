/*
    Change class
*/
"use strict";

var $ = require( 'jquery' );

var Change = function( historyToApply, editableOptionsToApply, rowIndexToApply, nameToApply, newValueToApply, previousValueToApply, $thisToApply ) {
    
    var history = historyToApply;
    var editableOptions = editableOptionsToApply;
    var rowIndex = rowIndexToApply;
    var name = nameToApply;
    var newValue = newValueToApply;
    var previousValue = previousValueToApply;
    var $this = $thisToApply;
                    
    var undo = function(){
        
        $this.val( previousValue );
        updateCSS( 
            history.getPreviousItem( rowIndex, name ), 
            history.getPreviousRecordItem( rowIndex ) );
        $this.blur();
    };
    
    var redo = function(){
        
        $this.val( newValue );
        updateCSS( true, true );
        $this.blur();
    };
    
    var updateCSS = function( fieldChanged, registerChanged ){

        if ( history.isFormMode() ){
            $this.closest( '.zcrud-field' ).addClass( editableOptions.modifiedFieldsClass );
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
    
    var isRelatedToField = function( rowIndexToCheck, nameToCheck ){
        return rowIndex == rowIndexToCheck && name == nameToCheck;
    };
    
    var isRelatedToRow = function( rowIndexToCheck ){
        return rowIndex == rowIndexToCheck;
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