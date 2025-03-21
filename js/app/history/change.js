/*
    Change class
*/
"use strict";

var $ = require( 'jquery' );
var context = require( '../../../js/app/context.js' );
var AbstractHistoryAction = require( './abstractHistoryAction.js' );
var fieldUtils = require( '../fields/fieldUtils.js' );
var utils = require( '../../../js/app/utils.js' );

var Change = function( historyToApply, optionsToApply, recordIdToApply, rowIndexToApply, nameToApply, newValueToApply, previousValueToApply, $thisToApply, fieldToApply, subformNameToApply, subformRowIndexToApply, subformRowKeyToApply ) {
    
    AbstractHistoryAction.call( this, historyToApply, recordIdToApply );
    
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
            this.$this.parents( '.zcrud-field' ).first().addClass(
            //this.$this.closest( '.zcrud-field' ).addClass(
                this.history.getEditableOptions().modifiedFieldsClass
            );
        } else {
            this.$this.parents( '.zcrud-field' ).first().removeClass(
            //this.$this.closest( '.zcrud-field' ).removeClass(
                this.history.getEditableOptions().modifiedFieldsClass
            );
        }
        return;    
    }

    if ( fieldChanged ){
        this.$this.parents( 'td' ).first().addClass(
        //this.$this.closest( 'td' ).addClass(
            this.history.getEditableOptions().modifiedFieldsClass
        );
    } else {
        this.$this.parents( 'td' ).first().removeClass(
        //this.$this.closest( 'td' ).removeClass(
            this.history.getEditableOptions().modifiedFieldsClass
        );
    }

    if ( registerChanged ){
        this.$this.parents( 'tr' ).first().addClass(
        //this.$this.closest( 'tr' ).addClass(
            this.history.getEditableOptions().modifiedRowsClass
        );
    } else {
        this.$this.parents( 'tr' ).first().removeClass(
        //this.$this.closest( 'tr' ).removeClass(
            this.history.getEditableOptions().modifiedRowsClass
        );
    }
};

Change.prototype.getNewValue = function(){
    return this.newValue;
};

Change.prototype.doAction = function( actionsObject, records, defaultValue, fieldsMap ){

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

    //
    this.processDefaultValue( actionsObject, records, defaultValue, fieldsMap, row );
    
    // Set new value
    row[ this.name ] = this.newValue;
};

Change.prototype.processDefaultValue = function( actionsObject, records, defaultValue, fieldsMap, row ){

    // Return if it is not needed
    if ( ! utils.isEmptyObject( row ) || ! this.isNew( records ) ){
        return;
    }
    
    // Copy properties from defaultRow to row excluding arrays
    var defaultRow = this.subformName? 
                     this.buildSubformRowDefaultValue( defaultValue ):
                     this.buildFirstRowDefaultValue( defaultValue );
    this.copyProperties( defaultRow, row, false );
    
    // Add default subforms
    this.addDefaultSubformsToActionsObject( actionsObject, defaultValue, fieldsMap, row );
};

Change.prototype.addDefaultSubformsToActionsObject = function( actionsObject, defaultValue, fieldsMap, row ){
    
    for ( var id in defaultValue ){
        var value = defaultValue[ id ];
        var field = fieldsMap[ id ];

        if ( utils.isArray( value ) && field && field.type == 'subform' ){
            var subformActionsObject = this.history.buildEmptyActionsObject();
            row[ id ] = subformActionsObject;
            
            for ( var c = 0; c < value.length; ++c ){
                var arrayItem = value[ c ];
                subformActionsObject.new[ c ] = arrayItem;
            }
        }
    }
};

Change.prototype.buildSubformRowDefaultValue = function( defaultValue ){

    var subformRecords = defaultValue[ this.subformName ];
    if ( ! subformRecords ){
        return undefined;
    }
    
    var defaultSubformValue = subformRecords[ this.subformRowIndex ];
    if ( ! defaultSubformValue ){
        return undefined;
    }
    
    return this.buildFirstRowDefaultValue( defaultSubformValue );
};

Change.prototype.buildFirstRowDefaultValue = function( defaultValue ){
    
    var result = {};
    
    this.copyProperties( defaultValue, result, true );
    
    return result;
};

Change.prototype.copyProperties = function( from, to, excludeArrays ){

    if ( ! from ){
        return;
    }
    
    for ( var id in from ){
        var itemValue = from[ id ];
        if ( ! excludeArrays || ! utils.isArray( itemValue ) ){
            to[ id ] = itemValue;
        }
    }
};

Change.prototype.isNew = function( records ){
    return this.history.isNew( records, this.rowIndex );
};
/*
Change.prototype.isNew = function( records ){
    return ! records[ this.rowIndex ];
};
*/
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

Change.prototype.getCreationItems = function(){
    return [];
};

Change.resetCSS = function( $list, editableOptions ){

    $list.find( '.' + editableOptions.modifiedFieldsClass ).removeClass( editableOptions.modifiedFieldsClass );
    $list.find( '.' + editableOptions.modifiedRowsClass ).removeClass( editableOptions.modifiedRowsClass );
};

Change.prototype.type = 'change';

module.exports = Change;