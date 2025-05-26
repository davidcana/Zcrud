/*
    Delete class
*/
'use strict';

var AbstractHistoryAction = require( './abstractHistoryAction.js' );

var Delete = function( historyToApply, recordIdToApply, rowIndexToApply, keyToApply, $trToApply, subformNameToApply, subformRowIndexToApply ) {
    
    AbstractHistoryAction.call( this, historyToApply, recordIdToApply );
    
    this.rowIndex = rowIndexToApply;
    this.key = keyToApply;
    this.$tr = $trToApply;
    this.subformName = subformNameToApply;
    this.subformRowIndex = subformRowIndexToApply || 0;
    
    if ( this.$tr ){
        this.history.hideTr( this.$tr );
    }
};

Delete.prototype = new AbstractHistoryAction();
Delete.prototype.constructor = Delete;

Delete.prototype.undo = function(){
    this.history.showTr( this.$tr );
};

Delete.prototype.redo = function(){
    this.history.hideTr( this.$tr );
};

Delete.prototype.getNewValue = function(){
    return undefined;
};

Delete.prototype.isRelatedToField = function(){
    return false;
};

Delete.prototype.isRelatedToRow = function( rowIndexToCheck ){
    return this.rowIndex == rowIndexToCheck;
};

Delete.prototype.getDeletedMap = function( actionsObject, records ){

    var record = records[ this.rowIndex ];
    var map = record? actionsObject.modified: actionsObject.new;

    if ( ! map[ this.rowIndex ] || ! map[ this.rowIndex ][ this.subformName ] ){
        this.history.createNestedObject( 
            map, 
            [ this.rowIndex, this.subformName ], 
            this.history.buildEmptyActionsObject() );
    }

    return map[ this.rowIndex ][ this.subformName ].deleted;
};

Delete.prototype.doAction = function( actionsObject, records ){

    // The deleted row is new
    if ( this.key == undefined ){
        if ( this.subformName ){
            delete actionsObject.new[ 0 ][ this.subformName ].new[ this.subformRowIndex ];
            return;
        }
        throw 'No subform name found trying to delete subform row!';
    }
    
    // The deleted row is NOT new
    var deletedMap = 
        this.subformName? 
        this.getDeletedMap( actionsObject, records ):
        actionsObject.deleted;

    if ( deletedMap.indexOf( this.key ) == -1 ){
        deletedMap.push( this.key );
    }
};

Delete.prototype.get$Tr = function(){
    return this.$tr;
};

Delete.prototype.getKey = function(){
    return this.key;
};

Delete.prototype.saveEnabled = function(){
    return this.key !== undefined;
};

Delete.prototype.isDirty = function(){
    return false;
};

Delete.prototype.getCreationItems = function(){
    return [];
};

Delete.resetCSS = function(){};

Delete.prototype.type = 'delete';

module.exports = Delete;
