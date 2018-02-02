/*
    Delete class
*/
"use strict";

var $ = require( 'jquery' );
var context = require( '../context.js' );

var Delete = function( historyToApply, editableOptionsToApply, optionsToApply, rowIndexToApply, keyToApply, $trToApply, subformNameToApply, subformRowIndexToApply) {
    
    var history = historyToApply;
    var editableOptions = editableOptionsToApply;
    var options = optionsToApply;
    var rowIndex = rowIndexToApply;
    var key = keyToApply;
    var $tr = $trToApply;
    var subformName = subformNameToApply;
    var subformRowIndex = subformRowIndexToApply;
    
    var getSubformName = function(){
        return undefined;
    };
    
    var undo = function(){
        history.showTr( $tr );
    };
    
    var redo = function(){
        history.hideTr( $tr );
    };
    
    var hideRow = function(){
        history.hideTr( $tr );
    };
    
    var register = function(){
        // Nothing to do
    };

    var isRelatedToField = function( rowIndexToCheck, nameToCheck ){
        return false;
    };
    
    var isRelatedToRow = function( rowIndexToCheck ){
        return rowIndex == rowIndexToCheck;
    };
    /*
    var doAction = function( actionsObject, records ){

        if ( actionsObject.deleted.indexOf( key ) == -1 ){
            actionsObject.deleted.push( key );
        }
    };
    */
    var getDeletedMap = function( actionsObject, records ){

        var record = records[ rowIndex ];
        var map = record? actionsObject.modified: actionsObject.new;
        
        if ( ! map[ rowIndex ] || ! map[ rowIndex ][ subformName ] ){
            history.createNestedObject( 
                map, 
                [ rowIndex, subformName ], 
                history.buildEmptyActionsObject() );
        }
        
        return map[ rowIndex ][ subformName ].deleted;
    };
    
    var doAction = function( actionsObject, records ){
        
        var deletedMap = 
            subformName? 
            getDeletedMap( actionsObject, records ):
            actionsObject.deleted;
        
        if ( deletedMap.indexOf( key ) == -1 ){
            deletedMap.push( key );
        }
    };
    
    var get$Tr = function(){
        return $tr;
    };
    
    var getKey = function(){
        return key;
    };
    
    var saveEnabled = function(){
        //return true;
        return key !== undefined;
    };
    
    hideRow();
    
    return {
        undo: undo,
        redo: redo,
        register: register,
        isRelatedToField: isRelatedToField,
        isRelatedToRow: isRelatedToRow,
        doAction: doAction,
        get$Tr: get$Tr,
        getKey: getKey,
        saveEnabled: saveEnabled,
        getSubformName: getSubformName
    };
};

Delete.resetCSS = function( $list, editableOptions ){};

module.exports = Delete;