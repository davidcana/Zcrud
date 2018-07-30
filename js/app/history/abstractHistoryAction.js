/* 
    AbstractHistoryAction class
*/
"use strict";

//var $ = require( 'jquery' );
var pageUtils = require( '../pages/pageUtils.js' );

var AbstractHistoryAction = function( historyToApply ){
    
    this.history = historyToApply;
    this.id = pageUtils.generateId();
};

AbstractHistoryAction.prototype.getId = function(){
    return this.id;
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

AbstractHistoryAction.prototype.type = 'AbstractHistoryAction';

module.exports = AbstractHistoryAction;
