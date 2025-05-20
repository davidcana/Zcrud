/*
    FileUpload class
*/
'use strict';

var Field = require( './field.js' );
var context = require( '../context.js' );
var utils = require( '../utils.js' );

var zpt = require( 'zpt' );

var FileUpload = function( properties ) {
    Field.call( this, properties );
};

FileUpload.prototype = new Field();
FileUpload.prototype.constructor = FileUpload;

FileUpload.prototype.asyncValue = true;

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
        //alert( `File name ${file.name}, file size ${utils.formatFileSize(file.size)} loaded successfully` );
        this.runSetValueListeners();
        this.updateNewFile( this.fullValue.file );
    });

    if ( file ){
        reader.readAsArrayBuffer( file );
    } else {
        this.runSetValueListeners();
        this.updateNewFile( undefined );
    }
};

FileUpload.prototype.updateNewFile = function( newFile ){
    
    var $thisNewFile = this.get$().find( '.newFile' );

    zpt.run({
        root: $thisNewFile.el,
        dictionaryExtension: {
            newFile: newFile
        }
    });
};

// Extract just the 4 standard information on selected files
FileUpload.prototype.filterFilePart = function( file ){
    return file?
    {
        name: file.name,
        lastModified: file.lastModified,
        size: file.size,
        type: file.type
    }:
    {
        name: undefined,
        lastModified: undefined,
        size: 0,
        type: undefined
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
        const fileDescription = `File name ${file.name}, file size ${utils.formatFileSize(file.size)}.`;
        alert( fileDescription );
    }
};
*/

FileUpload.prototype.getValue = function( $this ){
    return this.fullValue;
};

FileUpload.prototype.getValueFromForm = function( $selection ){
    return this.fullValue;
    /*
    const $file = this.get$file();
    var files = $file.el.files;
    return files[ 0 ];
    */
}

FileUpload.prototype.setValueToForm = function( value, $this ){
    this.fullValue = value? value: undefined;
    this.updateNewFile( this.fullValue? this.fullValue.file: undefined );
};

//TODO Implement this!
FileUpload.prototype.validate = function( value ){
    return true;
};

module.exports = FileUpload;