/* 
    AbstractHistoryAction class
*/
"use strict";

//var $ = require( 'jquery' );
var pageUtils = require( '../pages/pageUtils.js' );

var AbstractHistoryAction = function( historyToApply, recordIdToApply ){
    
    this.history = historyToApply;
    this.recordId = recordIdToApply;
    this.id = pageUtils.generateId();
};

AbstractHistoryAction.prototype.getId = function(){
    return this.id;
};

AbstractHistoryAction.prototype.getRecordId = function(){
    return this.recordId;
};

AbstractHistoryAction.prototype.undo = function(){
    throw 'Method undo not implemented!';
};

AbstractHistoryAction.prototype.redo = function(){
    throw 'Method redo not implemented!';
};

AbstractHistoryAction.prototype.isRelatedToField = function( rowIndexToCheck, nameToCheck, subformNameToCheck, subformRowIndexToCheck ){
    
    return this.rowIndex == rowIndexToCheck 
        && this.subformName == subformNameToCheck
        && this.subformRowIndex == subformRowIndexToCheck;
};

AbstractHistoryAction.prototype.isRelatedToRow = function( rowIndexToCheck, subformNameToCheck, subformRowIndexToCheck ){
    
    return this.rowIndex == rowIndexToCheck
        && this.subformName == subformNameToCheck 
        && this.subformRowIndex == subformRowIndexToCheck;
};

AbstractHistoryAction.prototype.doAction = function(){
    throw 'Method doAction not implemented!';
};

AbstractHistoryAction.prototype.doActionIfNotOff = function( actionsObject, records, historyCleaner, defaultValue, fieldsMap ){
    
    if ( historyCleaner.historyItemIsOn( this ) ){
        return this.doAction( actionsObject, records, defaultValue, fieldsMap );
    }
};

AbstractHistoryAction.prototype.getNewValue = function(){
    throw 'Method getNewValue not implemented!';
};

AbstractHistoryAction.prototype.saveEnabled = function(){
    throw 'Method saveEnabled not implemented!';
};

AbstractHistoryAction.prototype.isDirty = function(){
    throw 'Method isDirty not implemented!';
};

AbstractHistoryAction.prototype.getAtomicItems = function(){
    return [ this ];
};

AbstractHistoryAction.prototype.getCreationItems = function(){
    throw 'Method getCreationItems not implemented!';
};

AbstractHistoryAction.prototype.isNew = function(){
    return false;
};

AbstractHistoryAction.prototype.type = 'AbstractHistoryAction';

module.exports = AbstractHistoryAction;
