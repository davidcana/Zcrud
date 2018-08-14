/* 
    Field class
*/
"use strict";

var $ = require( 'jquery' );

var Field = function( properties ) {
    $.extend( true, this, properties );
};

Field.prototype.setPage = function( pageToApply ){
    this.page = pageToApply;
};

Field.prototype.afterProcessTemplateForField = function( params, $selection ){
    // Nothing to do
};

Field.prototype.throwEventsForSetValueToForm = function( $this ){
    $this.keyup();
};

Field.prototype.setValueToForm = function( value, $this ){
    $this.val( value );
    this.throwEventsForSetValueToForm( $this );
};

Field.prototype.getValue = function( $this ){
    return $this.val();
};

Field.prototype.getValueFromForm = function( $selection ){
    return $selection.find( "[name='" + this.name + "']").val();
};

Field.prototype.getValueFromRecord = function( record, params ){
    return record[ this.id ];
};

Field.prototype.getValueFromSelection = function( $selection ){
    return $selection.find( '.zcrud-like-field-' + this.name ).text().trim();
};

Field.prototype.getTemplate = function( options ){
    return options.fieldsConfig.getDefaultFieldTemplate( this );
};

Field.prototype.getPostTemplate = function(){
    return undefined;
};

Field.prototype.getViewTemplate = function(){
    return undefined;
};

Field.prototype.mustHideLabel = function(){
    return false;
};

Field.prototype.buildFields = function(){
    // Nothing to do
};

Field.prototype.filterValue = function( record ){
    return record[ this.id ];
};

Field.prototype.getThisOptions = function(){
    return this;
};

Field.prototype.get$ = function(){
    return this.page.get$().find( '.zcrud-field-' + this.id );
};
/*
Field.prototype.isReadOnly = function(){
    
    var temp = ( this.parentField && this.parentField.isReadOnly() ) || this.readOnly;
    
    if ( temp ){
        return true;
    }
    
    return this.page? this.page.isReadOnly(): false;
};*/
Field.prototype.isReadOnly = function(){
    return this.page.isReadOnly() || ( this.parentField && this.parentField.isReadOnly() ) || this.readOnly;
};

Field.prototype.setParentField = function( parentFieldToApply ){
    this.parentField = parentFieldToApply;
};

Field.prototype.buildDataToSend = function(){
    return undefined;
};

Field.prototype.dataFromServer = function(){
    // Nothing to do
};

Field.prototype.getId = function(){
    return this.id;
};

Field.prototype.getFields = function(){
    return undefined;
};

module.exports = Field;
