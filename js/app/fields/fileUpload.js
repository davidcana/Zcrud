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
    this.bindEvents( params, $selection );
};

FileUpload.prototype.get$file = function(){
    return this.get$().find( 'input[type="file"]' );
};

FileUpload.prototype.bindEvents = function( params, $selection ){
    
    var fileUploadInstance = this;
    const $file = this.get$file();

    $file
        .on(
            'change',  
            function ( event ) {
                event.preventDefault();
                event.stopPropagation();
                fileUploadInstance.readFile( $file );
            }
    );
};

FileUpload.prototype.readFile = function( $file ){

    // Get the file instance
    var file = $file.el.files[ 0 ];

    // Update fullValue property
    this.fullValue = {
        file: this.filterFilePart( file )
    };

    // Instance a FileReader and read the file with it
    const reader = new FileReader();
    var fileUploadInstance = this;
    reader.addEventListener( 'loadend', () => {
        // reader.result contains the contents of blob as a typed array
        fileUploadInstance.fullValue.contents = fileUploadInstance.filterContentsPart( reader.result );
        //alert( `File name ${file.name}, file size ${utils.returnFileSize(file.size)} loaded successfully` );
    });
    reader.readAsArrayBuffer( file );
};

// Extract just the 4 standard information on selected files
FileUpload.prototype.filterFilePart = function( file ){
    return {
        name: file.name,
        lastModified: file.lastModified,
        size: file.size,
        type: file.type
    };
};

//TODO Extract just the needed data from the ArrayBuffer
FileUpload.prototype.filterContentsPart = function( contents ){
    return contents;
};

/*
FileUpload.prototype.updateFileDescription = function( $file ){

    var files = $file.el.files;

    for ( const file of files ) {
        const fileDescription = `File name ${file.name}, file size ${utils.returnFileSize(file.size)}.`;
        alert( fileDescription );
    }
};
*/

FileUpload.prototype.getValue = function( $this ){
    return this.fullValue;
    //return $this.val();
};

FileUpload.prototype.getValueFromForm = function( $selection ){
    return this.fullValue;
    /*
    const $file = this.get$file();
    var files = $file.el.files;
    return files[ 0 ];
    */
}
/*
FileUpload.prototype.setValueToForm = function( value, $this ){
    $this.prop( 'checked', value === undefined? false: value );
    //this.throwEventsForSetValueToForm( $this );
};
*/
/*
FileUpload.prototype.getValueFromRecord = function( record ){
    return record[ this.id ];
};
*/
/*
FileUpload.prototype.getViewValueFromRecord = function( record ){
    return record[ this.id ];
};
*/
/*
FileUpload.prototype.getValueFromSelection = function( $selection ){
    
    var stringValue = Field.prototype.getValueFromSelection.call( this, $selection ).toLowerCase();
    return stringValue == 'true';
};
*/

//TODO Implement this!
FileUpload.prototype.validate = function( value ){
    return true;
};

module.exports = FileUpload;