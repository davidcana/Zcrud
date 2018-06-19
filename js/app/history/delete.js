/*
    Delete class
*/
"use strict";

var $ = require( 'jquery' );
var context = require( '../context.js' );

var Delete = function( historyToApply, rowIndexToApply, keyToApply, $trToApply, subformNameToApply ) {
    
    var history = historyToApply;
    var rowIndex = rowIndexToApply;
    var key = keyToApply;
    var $tr = $trToApply;
    var subformName = subformNameToApply;
    
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
        
        if ( $tr ){
            history.hideTr( $tr );
        }
    };
    
    var register = function(){
        // Nothing to do
    };
    
    var getNewValue = function(){
        return undefined;
    };
    
    var isRelatedToField = function(){
        return false;
    };
    
    var isRelatedToRow = function( rowIndexToCheck ){
        return rowIndex == rowIndexToCheck;
    };

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
    
    var isDirty = function(){
        return false;
    };
    
    hideRow();
    
    return {
        undo: undo,
        redo: redo,
        register: register,
        isRelatedToField: isRelatedToField,
        isRelatedToRow: isRelatedToRow,
        doAction: doAction,
        getNewValue: getNewValue,
        get$Tr: get$Tr,
        getKey: getKey,
        saveEnabled: saveEnabled,
        getSubformName: getSubformName,
        isDirty: isDirty,
        type: 'delete'
    };
};

Delete.resetCSS = function( $list, editableOptions ){};

module.exports = Delete;