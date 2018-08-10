/*
    Checkbox class
*/
"use strict";

var Field = require( './field.js' );
var context = require( '../context.js' );

var Checkbox = function( properties ) {
    Field.call( this, properties );
};

Checkbox.prototype = new Field();
Checkbox.prototype.constructor = Checkbox;

Checkbox.prototype.getValue = function( $this ){
    return $this.is( ":checked" );
};

Checkbox.prototype.getValueFromForm = function( $selection ){
    return $selection.find( "[name='" + this.name + "']").is( ':checked' );
}

Checkbox.prototype.setValueToForm = function( value, $this ){
    $this.prop( 'checked', value === undefined? false: value );
    this.throwEventsForSetValueToForm( $this );
};

Checkbox.prototype.getValueFromRecord = function( record, params ){
    var value = record[ this.id ];
    value = value == undefined? false: value;

    switch( params.source ) {
        case 'create':
        case 'update':
            return value;
        case 'delete':
        case 'list':
            return value? context.translate( 'true' ): context.translate( 'false' )
        default:
            throw "Unknown source in checkbox field: " + params.source;
    }
};

module.exports = Checkbox;