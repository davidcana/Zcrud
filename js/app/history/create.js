/*
    Create class
*/
"use strict";

var $ = require( 'jquery' );
var context = require( '../context.js' );

var Create = function( historyToApply, editableOptionsToApply, optionsToApply, thisDictionaryToApply ) {
    
    var history = historyToApply;
    var editableOptions = editableOptionsToApply; 
    var options = optionsToApply;
    var thisDictionary = thisDictionaryToApply;
    var $tr = undefined;
    var rowIndex = undefined;
    
    var undo = function(){
        $tr.remove();
    };
    
    var redo = function(){
        addRow();
        updateCSS( true );
    };
    
    var addRow = function(){
        
        context.getZPTParser().run({
            //root: $( '#' + id ).find( 'tbody' )[0],
            root: $( '#' + options.listTbodyId )[0],
            dictionary: thisDictionary,
            notRemoveGeneratedTags: true
        });
        
        $tr = $( '#' + options.listTbodyId ).find( 'tr:last' );
        rowIndex = $tr.attr( 'data-record-index' );
    };
    
    var register = function(){
        updateCSS( true );
    };
    
    var updateCSS = function( visible ){

        if ( visible ){
            $tr.closest( 'tr' ).addClass( editableOptions.modifiedRowsClass );
        } else {
            $tr.closest( 'tr' ).removeClass( editableOptions.modifiedRowsClass );
        }
    };
    
    var buildRecord = function(){
        var record = {};
        return record;
    };

    var isRelatedToField = function( rowIndexToCheck, nameToCheck ){
        return false;
    };
    
    var isRelatedToRow = function( rowIndexToCheck ){
        return rowIndex == rowIndexToCheck;
    };
    
    var get$Tr = function(){
        return $tr;
    };
    
    addRow();
    
    return {
        undo: undo,
        redo: redo,
        register: register,
        isRelatedToField: isRelatedToField,
        isRelatedToRow: isRelatedToRow,
        get$Tr: get$Tr
    };
};

Create.resetCSS = function( $list, editableOptions ){

    /*
    $list.find( '.' + editableOptions.modifiedFieldsClass ).removeClass( editableOptions.modifiedFieldsClass );
    $list.find( '.' + editableOptions.modifiedRowsClass ).removeClass( editableOptions.modifiedRowsClass );
    */
};

module.exports = Create;