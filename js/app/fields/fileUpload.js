/*
    FileUpload class
*/
'use strict';

var Field = require( './field.js' );
var context = require( '../context.js' );
var utils = require( '../utils.js' );

var FileUpload = function( properties ) {
    Field.call( this, properties );
};

FileUpload.prototype = new Field();
FileUpload.prototype.constructor = FileUpload;

FileUpload.prototype.getTemplate = function(){
    return this.type + '@templates/fields/files.html';
};

FileUpload.prototype.afterProcessTemplateForField = function( params, $selection ){
    
    if ( this.isReadOnly() ){
        return;
    }
    
    this.afterProcessTemplateForFieldInCreateOrUpdate( params, $selection );
};

FileUpload.prototype.afterProcessTemplateForFieldInCreateOrUpdate = function( params, $selection ){
    /*
    var date = false;
    var time = false;

    switch ( this.type ) {
        case 'date':
            date = true;
            break;
        case 'datetime':
            date = true;
            time = true;
            break;
        case 'time':
            time = true;
            break;
        default:
            throw 'Unknown type in Datetime: ' + this.type;
    }

    this.buildDictionaryFromParams( params );
    */
    this.bindEvents( params, $selection );
};

FileUpload.prototype.bindEvents = function( params, $selection ){
    
    this.bindCommonEvents( params, $selection );
    /*
    if ( dateEvents ){
        this.bindDateEvents( params, $selection, $datetime );
    }

    if ( timeEvents ){
        this.bindTimeEvents( params, $selection, $datetime );
    }
    */
};

FileUpload.prototype.get$file = function(){
    return this.get$().find( 'input[type="file"]' );
};

FileUpload.prototype.bindCommonEvents = function( params, $selection ){
    
    var fileUploadInstance = this;
    const $file = this.get$file();

    $file
        .on(
            'change',  
            function ( event ) {
                event.preventDefault();
                event.stopPropagation();
                fileUploadInstance.updateFileDescription( $file );
            }
    );
};

FileUpload.prototype.updateFileDescription = function( $file ){

    var files = $file.el.files;

    for ( const file of files ) {
        const fileDescription = `File name ${file.name}, file size ${utils.returnFileSize(file.size)}.`;
        alert( fileDescription );
    }
};

FileUpload.prototype.getValue = function( $this ){
   return $this.val();
};

FileUpload.prototype.getValueFromForm = function( $selection ){
    const $file = this.get$file();
    var files = $file.el.files;
    return files[ 0 ];
}

FileUpload.prototype.setValueToForm = function( value, $this ){
    $this.prop( 'checked', value === undefined? false: value );
    //this.throwEventsForSetValueToForm( $this );
};

FileUpload.prototype.getValueFromRecord = function( record ){

    var value = record[ this.id ];
    return value === false || value === true? value: value == 'true';
};

FileUpload.prototype.getViewValueFromRecord = function( record ){

    var value = this.getValueFromRecord( record );
    return value? context.translate( 'true' ): context.translate( 'false' )
};

FileUpload.prototype.getValueFromSelection = function( $selection ){
    
    var stringValue = Field.prototype.getValueFromSelection.call( this, $selection ).toLowerCase();
    return stringValue == 'true';
};

//TODO Implement this!
FileUpload.prototype.validate = function( value ){
    return true;
};

module.exports = FileUpload;