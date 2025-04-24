/*
    Create class
*/
'use strict';

var zpt = require( 'zpt' );
//var context = require( '../context.js' );
var AbstractHistoryAction = require( './abstractHistoryAction.js' );
var utils = require( '../utils.js' );

var Create = function( historyToApply, thisDictionaryToApply, $tbodyToApply, recordToApply, subformNameToApply ) {
    
    AbstractHistoryAction.call( this, historyToApply );
    
    this.thisDictionary = thisDictionaryToApply;
    this.$tbody = $tbodyToApply;
    this.record = recordToApply;
    this.subformName = subformNameToApply;
    this.isSubform = this.subformName !== undefined;
    
    this.$tr = undefined;
    this.rowIndex = 0;
    this.subformRowIndex = undefined;
    
    var buildDictionary = function( dictionary ){
        
        var result = utils.extend( {}, dictionary );
        result[ 'omitKey' ] = true;
        
        return result;
    };
    this.thisDictionary = buildDictionary( this.thisDictionary );
    
    this.addRow();
    this.recordId = this.$tr.attr( 'data-record-id' );
    this.updateCSS( true );
};

Create.prototype = new AbstractHistoryAction();
Create.prototype.constructor = Create;

Create.prototype.undo = function(){
    this.history.hideTr( this.$tr );
};

Create.prototype.redo = function(){
    this.history.showTr( this.$tr );
    this.updateCSS( true );
};

Create.prototype.addRow = function(){
    
    zpt.run({
        root: this.$tbody[ 0 ],
        dictionaryExtension: this.thisDictionary,
        notRemoveGeneratedTags: true
    });
    
    this.$tr = this.$tbody.find( 'tr.zcrud-data-row:last-child' );
    //this.$tr = this.$tbody.find( 'tr.zcrud-data-row:last' );

    var recordIndex = this.$tr.attr( 'data-record-index' );
    if ( this.isSubform ){
        this.subformRowIndex = recordIndex;
    } else {
        this.rowIndex = recordIndex;
    }
};

Create.prototype.updateCSS = function( visible ){

    if ( visible ){
        this.$tr.addClass( 
            this.history.getEditableOptions().modifiedRowsClass );
    } else {
        this.$tr.removeClass( 
            this.history.getEditableOptions().modifiedRowsClass );
    }
};

Create.prototype.getNewValue = function( rowIndexToGet, nameToGet, subformNameToGet, subformRowIndexToGet ){
    return this.record[ nameToGet ];
};

Create.prototype.doAction = function( actionsObject, records ){

    // Build or get row and then attach it to actionsObject
    this.history.buildAndAttachRowForDoAction( 
        actionsObject, 
        records, 
        this.rowIndex, 
        this.subformName, 
        this.subformRowIndex,
        undefined,
        this.record,
        false );
};

Create.prototype.get$Tr = function(){
    return this.$tr;
};

Create.prototype.saveEnabled = function(){
    return false;
};

Create.prototype.isDirty = function(){
    return false;
};

Create.prototype.updateFromChange = function( changeHistoryItem ){
    this.record[ changeHistoryItem.name ] = changeHistoryItem.newValue;
};

Create.prototype.getCreationItems = function( subformId ){
    return this.subformName == subformId? [ this ]: [];
};

Create.resetCSS = function(){};

Create.prototype.type = 'create';

module.exports = Create;
