/* 
    Field class
*/

import { utils } from '../utils.js';

export const Field = function( properties ) {
    utils.extend( true, this, properties );
};

Field.prototype.asyncValue = false;
Field.prototype.setValueListeners = [];
Field.prototype.addSetValueListeners = function( listener ){
    this.setValueListeners.push( listener );
};
Field.prototype.runSetValueListeners = function(){
    // Run each listener
    for ( const listener of this.setValueListeners ) {
        listener();
    }
    // Empty setValueListeners
    this.setValueListeners = [];
};

Field.prototype.forceNullValueWhenNoPreviousItem = false;

Field.prototype.setPage = function( pageToApply ){
    this.page = pageToApply;
};

Field.prototype.getPage = function(){
    return this.page;
};

Field.prototype.afterProcessTemplateForField = function( params, $selection ){
    // Nothing to do
};

Field.prototype.throwEventsForSetValueToForm = function( $this ){
    $this.trigger( 'keyup' );
    $this.trigger(
        'change',
        {
            'disableHistory': true
        }
    );
};

Field.prototype.setValueToForm = function( value, $this ){
    $this.val( value );
    this.throwEventsForSetValueToForm( $this );
};

Field.prototype.getValue = function( $this ){
    return $this.val();
};
/*
Field.prototype.getValueForHistory = function( $this ){
    return this.getValue( $this );
};
*/
Field.prototype.getValueFromForm = function( $selection ){
    return $selection.find( '[name="' + this.name + '"]' ).val();
};

Field.prototype.getValueFromRecord = function( record ){
    return record[ this.id ];
};

Field.prototype.getViewValueFromRecord = function( record ){
    return record[ this.id ];
};
/*
Field.prototype.getValueFromSelection = function( $selection ){
    return $selection.find( '.zcrud-like-field-' + this.name ).text().trim();
};
*/
Field.prototype.get$Input = function(){
    return this.get$().find( '[name="' + this.name + '"]' );
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

Field.prototype.goToFirstPage = function(){
    // Nothing to do
};

Field.prototype.getAttributesFor = function( fieldAttributes ){
    return this.attributes[
        fieldAttributes?
        fieldAttributes:
        'field'
    ];
};

Field.prototype.validate = function( value ){
    return true;
};

