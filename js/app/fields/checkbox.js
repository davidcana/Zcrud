/*
    Checkbox class
*/
'use strict';

var Field = require( './field.js' );
var context = require( '../context.js' );

var Checkbox = function( properties ) {
    Field.call( this, properties );
};

Checkbox.prototype = new Field();
Checkbox.prototype.constructor = Checkbox;

Checkbox.prototype.getValue = function( $this ){
    return $this.checked();
    //return $this.is( ':checked' );
};

Checkbox.prototype.getValueFromForm = function( $selection ){
    return $selection.find( '[name="' + this.name + '"]').checked();
    //return $selection.find( '[name='' + this.name + '']' ).is( ':checked' );
}

Checkbox.prototype.setValueToForm = function( value, $this ){
    $this.prop( 'checked', value === undefined? false: value );
    this.throwEventsForSetValueToForm( $this );
};

Checkbox.prototype.getValueFromRecord = function( record ){

    var value = record[ this.id ];
    return value === false || value === true? value: value == 'true';
};

Checkbox.prototype.getViewValueFromRecord = function( record ){

    var value = this.getValueFromRecord( record );
    return value? context.translate( 'true' ): context.translate( 'false' )
};

Checkbox.prototype.getValueFromSelection = function( $selection ){
    
    var stringValue = Field.prototype.getValueFromSelection.call( this, $selection ).toLowerCase();
    return stringValue == 'true';
};

module.exports = Checkbox;