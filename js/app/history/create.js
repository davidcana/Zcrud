/*
    Create class
*/
"use strict";

var $ = require( 'jquery' );
var context = require( '../context.js' );

var Create = function( historyToApply, editableOptionsToApply, thisDictionaryToApply, $tbodyToApply ) {
    
    var history = historyToApply;
    var editableOptions = editableOptionsToApply; 
    var thisDictionary = thisDictionaryToApply;
    var $tbody = $tbodyToApply;
    
    var $tr = undefined;
    var rowIndex = undefined;
    
    var getSubformName = function(){
        return undefined;
    };
    
    var undo = function(){
        history.hideTr( $tr );
    };
    
    var redo = function(){
        history.showTr( $tr );
        updateCSS( true );
    };
    
    var addRow = function(){
        
        context.getZPTParser().run({
            root: $tbody[ 0 ],
            dictionary: thisDictionary,
            notRemoveGeneratedTags: true
        });
        
        $tr = $tbody.find( 'tr.zcrud-data-row:last' );
        rowIndex = $tr.attr( 'data-record-index' );
    };
    
    var register = function(){
        updateCSS( true );
    };
    
    var updateCSS = function( visible ){

        if ( visible ){
            //$tr.closest( 'tr' ).addClass( editableOptions.modifiedRowsClass );
            $tr.addClass( editableOptions.modifiedRowsClass );
        } else {
            //$tr.closest( 'tr' ).removeClass( editableOptions.modifiedRowsClass );
            $tr.removeClass( editableOptions.modifiedRowsClass );
        }
    };

    var isRelatedToField = function( rowIndexToCheck, nameToCheck ){
        return false;
    };
    
    var isRelatedToRow = function( rowIndexToCheck ){
        return rowIndex == rowIndexToCheck;
    };
    
    var doAction = function( actionsObject, records ){
        // Nothing to do 
    };
    
    var get$Tr = function(){
        return $tr;
    };
    
    var saveEnabled = function(){
        return false;
    };
    
    addRow();
    
    return {
        undo: undo,
        redo: redo,
        register: register,
        isRelatedToField: isRelatedToField,
        isRelatedToRow: isRelatedToRow,
        doAction: doAction,
        get$Tr: get$Tr,
        saveEnabled: saveEnabled,
        getSubformName: getSubformName,
        type: 'create'
    };
};

Create.resetCSS = function( $list, editableOptions ){

    /*
    $list.find( '.' + editableOptions.addedRowsClass ).removeClass( editableOptions.addedRowsClass );
    */
};

module.exports = Create;