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
    
    var getModified = function(){
        return modified;
    };
    
    var putChange = function( $this, newValue, rowIndex, id ) {

        var name = $this.attr( 'name' );
        var historyItem = new HistoryChange(
            self,
            editableOptions,
            rowIndex,
            name,
            newValue,
            getPreviousValue( rowIndex, name ),
            $this );
        
        put( id, historyItem );
        
        return historyItem;
    };
    
    var putCreate = function( id, options, thisDictionary ) {

        var historyItem = new HistoryCreate( 
            self,
            editableOptions,
            options, 
            thisDictionary );

        put( id, historyItem );
        
        return historyItem;
    };
    
    var putDelete = function( $this, recordToDelete, rowIndex, id ) {

        var historyItem = {};

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
        updateHTML( id );
    };
    
    var resetCSS = function( id ){
        
        var $list = $( '#' + id );
        
        HistoryChange.resetCSS( $list, editableOptions );
        HistoryCreate.resetCSS( $list, editableOptions );
    };
    /*
    var getValueFromRecord =  function( rowIndex, name ){
        return dictionary.records[ rowIndex ][ name ];
    };
    */
    var getValueFromRecord =  function( rowIndex, name ){
        var record = dictionary.records[ rowIndex ];
        return record? record[ name ]: '';
    };
    var getPreviousValue = function( rowIndex, name ){
        
        var previousItem = getPreviousItem( rowIndex, name );
        return previousItem? previousItem.newValue: getValueFromRecord( rowIndex, name );
    };
    
    var getPreviousItem = function( rowIndex, name ){

        for ( var c = current - 1; c >= 0; --c ){
            var historyItem = items[ c ];
            if ( historyItem.isRelatedToField( rowIndex, name ) ){
                return historyItem;
            }
        }

        return undefined;
    };
    
    var getPreviousRecordItem = function( rowIndex ){

        for ( var c = current - 1; c >= 0; --c ){
            var historyItem = items[ c ];
            if ( historyItem.isRelatedToRow( rowIndex ) ){
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
    
    var buildActionsObject = function( records ){
        
        var actionsObject = {
            modified: {},
            new: {},
            deleted: []
        };
        
        for ( var c = 0; c < items.length; ++c ){
            var historyItem = items[ c ];
            historyItem.doAction( actionsObject, records );
        }
        
        return actionsObject;
    };
    
    var self = {
        putChange: putChange,
        putCreate: putCreate,
        putDelete: putDelete,
        undo: undo,
        redo: redo,
        isUndoEnabled: isUndoEnabled,
        isRedoEnabled: isRedoEnabled,
        isSaveEnabled: isSaveEnabled,
        buildActionsObject: buildActionsObject,
        getNumberOfUndo: getNumberOfUndo,
        getNumberOfRedo: getNumberOfRedo,
        getModified: getModified,
        reset: reset,
        getPreviousItem: getPreviousItem,
        getPreviousRecordItem: getPreviousRecordItem
    };
    
    return self;
};