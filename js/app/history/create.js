/*
    Create class
*/
"use strict";

var $ = require( 'jquery' );
var context = require( '../context.js' );

var Create = function( historyToApply, thisDictionaryToApply, $tbodyToApply, recordToApply, subformNameToApply ) {
    
    var history = historyToApply;
    var thisDictionary = thisDictionaryToApply;
    var $tbody = $tbodyToApply;
    var record = recordToApply;
    var subformName = subformNameToApply;
    var isSubform = subformName !== undefined;
    
    var $tr = undefined;
    var rowIndex = 0;
    var subformRowIndex = undefined;
    
    var buildDictionary = function( dictionary ){
        
        var result = $.extend( true, {}, dictionary );
        result[ 'omitKey' ] = true;
        
        return result;
    };
    thisDictionary = buildDictionary( thisDictionary );
    
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
        
        var recordIndex = $tr.attr( 'data-record-index' );
        if ( isSubform ){
            subformRowIndex = recordIndex;
        } else {
            rowIndex = recordIndex;
        }
    };
    
    var register = function(){
        updateCSS( true );
    };
    
    var updateCSS = function( visible ){

        if ( visible ){
            $tr.addClass( history.getEditableOptions().modifiedRowsClass );
        } else {
            $tr.removeClass( history.getEditableOptions().modifiedRowsClass );
        }
    };
    
    var getNewValue = function( nameToGet ){
        return record[ nameToGet ];
    };
    
    var isRelatedToField = function( rowIndexToCheck, nameToCheck, subformNameToCheck, subformRowIndexToCheck ){
        
        return rowIndex == rowIndexToCheck 
            && subformName == subformNameToCheck && subformRowIndex == subformRowIndexToCheck;
    };
    
    var isRelatedToRow = function( rowIndexToCheck, subformNameToCheck, subformRowIndexToCheck ){
        
        return rowIndex == rowIndexToCheck
        && subformName == subformNameToCheck && subformRowIndex == subformRowIndexToCheck;
    };

    var doAction = function( actionsObject, records ){

        // Build or get row and then attach it to actionsObject
        history.buildAndAttachRowForDoAction( 
            actionsObject, 
            records, 
            rowIndex, 
            subformName, 
            subformRowIndex,
            undefined,
            record,
            false );
    };
    
    var get$Tr = function(){
        return $tr;
    };
    
    var saveEnabled = function(){
        return false;
    };
    
    var isDirty = function(){
        return false;
    };
    
    addRow();
    register();
    
    return {
        undo: undo,
        redo: redo,
        isRelatedToField: isRelatedToField,
        isRelatedToRow: isRelatedToRow,
        doAction: doAction,
        getNewValue: getNewValue,
        get$Tr: get$Tr,
        saveEnabled: saveEnabled,
        getSubformName: getSubformName,
        isDirty: isDirty,
        type: 'create'
    };
};

Create.resetCSS = function( $list, editableOptions ){

    /*
    $list.find( '.' + editableOptions.addedRowsClass ).removeClass( editableOptions.addedRowsClass );
    */
};

module.exports = Create;