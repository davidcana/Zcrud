/* 
    Class History 
*/
module.exports = function( editableOptionsToApply, dictionaryToApply ) {
    "use strict";
    
    var editableOptions = editableOptionsToApply;
    var dictionary = dictionaryToApply;
    
    var items = [];
    var current = 0;
    
    var put = function( $this, newValue, columnIndex ) {

        var name = $this.attr( 'name' );
        
        var historyItem = {
            columnIndex: columnIndex,
            name: name,
            newValue: newValue,
            previousValue: getPreviousValue( columnIndex, name ),
            $this: $this
        };
        
        /*
        alert( 'History put'
              + '\nname: ' + historyItem.name 
              + '\ndata-record-index: ' + columnIndex 
              + '\nnew value: ' + historyItem.newValue
              + '\nprevious value: ' + historyItem.previousValue );
        */
        
        // Add to items
        items[ current++ ] = historyItem;
        
        updateCSS( $this, true, true );
    };
    
    var updateCSS = function( $this, td, tr ){
        
        if ( td ){
            $this.closest( 'td' ).addClass( editableOptions.modifiedFieldsClass );
        } else {
            $this.closest( 'td' ).removeClass( editableOptions.modifiedFieldsClass );
        }
        
        if ( tr ){
            $this.closest( 'tr' ).addClass( editableOptions.modifiedRowsClass );
        } else {
            $this.closest( 'tr' ).removeClass( editableOptions.modifiedRowsClass );
        }
    };
    
    var getDefaultValue =  function( columnIndex, name ){
        return dictionary.records[ columnIndex ][ name ];
    };
    
    var getPreviousValue = function( columnIndex, name ){
        
        var previousItem = getPreviousItem( columnIndex, name );
        return previousItem? previousItem.newValue: getDefaultValue( columnIndex, name );
    };
    
    var getPreviousItem = function( columnIndex, name ){

        for ( var c = current - 1; c >= 0; --c ){
            var historyItem = items[ c ];
            if ( historyItem.columnIndex == columnIndex && historyItem.name == name ){
                return historyItem;
            }
        }

        return undefined;
    };
    
    var getPreviousRecordItem = function( columnIndex ){

        for ( var c = current - 1; c >= 0; --c ){
            var historyItem = items[ c ];
            if ( historyItem.columnIndex == columnIndex ){
                return historyItem;
            }
        }

        return undefined;
    };
    
    var updateField = function( historyItem, value ){
        historyItem.$this.val( value );
    };
    
    var isUndoEnabled = function(){
        return current > 0;
    };
    var undo = function(){
        
        // Get historyItem
        var historyItem = isUndoEnabled()? items[ --current ]: undefined;
        if ( ! historyItem ){
            alert( 'Unable to undo!' );
            return;
        }
        
        updateCSS( 
            historyItem.$this,
            getPreviousItem( historyItem.columnIndex, historyItem.name ), 
            getPreviousRecordItem( historyItem.columnIndex ) );
        
        updateField( historyItem, historyItem.previousValue );
    };
    
    var isRedoEnabled = function(){
        return current < items.length - 1;
    };
    var redo = function(){
        var historyItem = isRedoEnabled()? items[ ++current ]: undefined;
        if ( ! historyItem ){
            alert( 'Unable to redo!' );
            return;
        }
        
        updateCSS( 
            historyItem.$this,
            true, 
            true );
        
        updateField( historyItem, historyItem.newValue );
    };
    
    return {
        put: put,
        undo: undo,
        redo: redo,
        isUndoEnabled: isUndoEnabled,
        isRedoEnabled: isRedoEnabled
    };
};