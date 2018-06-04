/* 
    Field class
*/
"use strict";

var $ = require( 'jquery' );

var Field = function( properties ) {
    $.extend( true, this, properties );
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
    return $selection.find( "[name='" + this.id + "']").val();
};

Field.prototype.getValueFromRecord = function( record, params ){
    return record[ this.id ];
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

module.exports = Field;
