/* 
    Class History 
*/
module.exports = function( editableOptionsToApply, dictionaryToApply ) {
    "use strict";
    
    var HistoryChange = require( './change.js' );
    var HistoryCreate = require( './create.js' );
    var $ = require( 'jquery' );
    
    var editableOptions = editableOptionsToApply;
    var dictionary = dictionaryToApply;
    
    var items = [];
    var current = 0;
    var modified = {};
    /*
    var putInModified = function( historyItem ){
        
        var row = modified[ historyItem.columnIndex ];
        
        if ( ! row ){
            row = {};
            modified[ historyItem.columnIndex ] = row;
        }
        
        row[ historyItem.name ] = historyItem.newValue;
    };*/
    
    var getModified = function(){
        return modified;
    };
    
    var putChange = function( $this, newValue, columnIndex, id ) {

        var name = $this.attr( 'name' );
        var historyItem = new HistoryChange(
            editableOptions,
            columnIndex,
            name,
            newValue,
            getPreviousValue( columnIndex, name ),
            $this );
        
        put( $this, id, historyItem );
    };
    
    var putCreate = function( $this, id ) {

        var historyItem = new HistoryCreate();

        put( $this, id, historyItem );
    };
    
    var putDelete = function( $this, recordToDelete, columnIndex, id ) {

        var historyItem = {};

        put( $this, id, historyItem );
    };
    
    var put = function( $this, id, historyItem ) {

        // Add to items
        items[ current++ ] = historyItem;
        
        // Remove non accesible history items
        if ( isRedoEnabled() ){
            items.splice( current, items.length - current );
        }
        
        // Add history item to modified object
        //putInModified( historyItem );
        historyItem.register( modified );
        
        // Update CSS and HTML
        //updateCSS( $this, true, true );
        updateHTML( id );
    };
    
    var reset = function( id ){
        items = [];
        current = 0;
        modified = {};
        
        resetCSS( id );
        updateHTML( id );
    };
    
    var resetCSS = function( id ){
        
        var $list = $( '#' + id );
        $list.find( '.' + editableOptions.modifiedFieldsClass ).removeClass( editableOptions.modifiedFieldsClass );
        $list.find( '.' + editableOptions.modifiedRowsClass ).removeClass( editableOptions.modifiedRowsClass );
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
    
    var isUndoEnabled = function(){
        return current > 0;
    };
    var undo = function( id ){
        
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
        
        updateCSS( 
            historyItem.$this,
            true, 
            true );
        
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
    
    var updateHTML = function( id ){
        
        var $list = $( '#' + id );
        
        // Update numbers
        updateButton( $list, '.zcrud-undo-command-button', getNumberOfUndo() );
        updateButton( $list, '.zcrud-redo-command-button', getNumberOfRedo() );
        
        // Set disabled of save button
        $list.find( '.zcrud-save-command-button' ).prop( 'disabled', getNumberOfUndo() == 0 );
    };
    
    var isSaveEnabled = function(){
        return isUndoEnabled();
    };
    
    return {
        putChange: putChange,
        putCreate: putCreate,
        putDelete: putDelete,
        undo: undo,
        redo: redo,
        isUndoEnabled: isUndoEnabled,
        isRedoEnabled: isRedoEnabled,
        isSaveEnabled: isSaveEnabled,
        getNumberOfUndo: getNumberOfUndo,
        getNumberOfRedo: getNumberOfRedo,
        getModified: getModified,
        reset: reset
    };
};