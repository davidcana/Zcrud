/*
    Change class
*/
"use strict";

var $ = require( 'jquery' );
var context = require( '../../../js/app/context.js' );
var AbstractHistoryAction = require( './abstractHistoryAction.js' );

var Change = function( historyToApply, optionsToApply, rowIndexToApply, nameToApply, newValueToApply, previousValueToApply, $thisToApply, fieldToApply, subformNameToApply, subformRowIndexToApply, subformRowKeyToApply ) {
    
    AbstractHistoryAction.call( this, historyToApply );
    
    this.options = optionsToApply;
    this.rowIndex = rowIndexToApply;
    this.name = nameToApply;
    this.newValue = newValueToApply;
    this.previousValue = previousValueToApply;
    this.$this = $thisToApply;
    this.field = fieldToApply;
    this.subformName = subformNameToApply;
    this.subformRowIndex = subformRowIndexToApply;
    this.subformRowKey = subformRowKeyToApply;

    this.updateCSS( true, true );
};

Change.prototype = new AbstractHistoryAction();
Change.prototype.constructor = Change;

Change.prototype.setValue = function( value ){

    this.field.setValueToForm(  
        value, 
        this.$this, 
        ! this.history.isFormMode(), 
        this.options );
};

Change.prototype.undo = function(){

    this.setValue( this.previousValue );

    var previousItem = this.history.getPreviousItem( 
        this.rowIndex, 
        this.name, 
        this.subformName, 
        this.subformRowIndex );
    
    this.updateCSS(
        previousItem? previousItem.isDirty(): false, 
        this.history.getPreviousRecordItem( 
            this.rowIndex, 
            this.subformName, 
            this.subformRowIndex ) );
};

Change.prototype.redo = function(){

    this.setValue( this.newValue );
    this.updateCSS( true, true );
};

Change.prototype.updateCSS = function( fieldChanged, registerChanged ){

    if ( ! this.$this ){
        return;
    }

    if ( this.history.isFormMode() && ! this.subformName ){
        if ( fieldChanged ){
            this.$this.closest( '.zcrud-field' ).addClass( 
                this.history.getEditableOptions().modifiedFieldsClass );
        } else {
            this.$this.closest( '.zcrud-field' ).removeClass( 
                this.history.getEditableOptions().modifiedFieldsClass );   
        }
        return;    
    }

    if ( fieldChanged ){
        this.$this.closest( 'td' ).addClass( 
            this.history.getEditableOptions().modifiedFieldsClass );
    } else {
        this.$this.closest( 'td' ).removeClass( 
            this.history.getEditableOptions().modifiedFieldsClass );
    }

    if ( registerChanged ){
        this.$this.closest( 'tr' ).addClass( 
            this.history.getEditableOptions().modifiedRowsClass );
    } else {
        this.$this.closest( 'tr' ).removeClass( 
            this.history.getEditableOptions().modifiedRowsClass );
    }
};

Change.prototype.getNewValue = function(){
    return this.newValue;
};

Change.prototype.doAction = function( actionsObject, records ){

    // Build or get row and then attach it to actionsObject
    var row = this.history.buildAndAttachRowForDoAction( 
        actionsObject, 
        records, 
        this.rowIndex, 
        this.subformName, 
        this.subformRowIndex, 
        this.subformRowKey,
        undefined,
        true );

    // Set new value
    row[ this.name ] = this.newValue;
};

Change.prototype.saveEnabled = function(){
    return true;
};

Change.prototype.isDirty = function(){
    return true;
};

Change.prototype.isRelatedToField = function( rowIndexToCheck, nameToCheck, subformNameToCheck, subformRowIndexToCheck ){

    return this.rowIndex == rowIndexToCheck 
        && this.name == nameToCheck
        && this.subformName == subformNameToCheck
        && this.subformRowIndex == subformRowIndexToCheck;
};

Change.resetCSS = function( $list, editableOptions ){

    $list.find( '.' + editableOptions.modifiedFieldsClass ).removeClass( editableOptions.modifiedFieldsClass );
    $list.find( '.' + editableOptions.modifiedRowsClass ).removeClass( editableOptions.modifiedRowsClass );
};

Change.prototype.type = 'change';

module.exports = Change;