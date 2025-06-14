/*
    FileUpload class
*/
'use strict';

var Field = require( './field.js' );
var validationManager = require( '../validationManager.js' );

var zpt = require( 'zpt' );

var FileUpload = function( properties ) {
    Field.call( this, properties );
};

FileUpload.prototype = new Field();
FileUpload.prototype.constructor = FileUpload;

FileUpload.prototype.asyncValue = true;

FileUpload.prototype.forceNullValueWhenNoPreviousItem = true;

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

    // Change event
    $file
        .on(
            'change',  
            function ( event ) {
                event.preventDefault();
                event.stopPropagation();

                fileUploadInstance.readFile( $file );
            }
    );

    // Drag and drop events
    //TODO Implement multievent support in on method
    const $drag = this.get$();
    $drag
        .on(
            'dragover',
            function ( event ) {
                event.preventDefault();
                event.stopPropagation();

                $drag.addClass( 'drag-over' );
            }
        )
        .on(
            'dragenter',
            function ( event ) {
                event.preventDefault();
                event.stopPropagation();

                $drag.addClass( 'drag-over' );
            }
        )
        .on(
            'dragleave',
            function ( event ) {
                event.preventDefault();
                event.stopPropagation();

                $drag.removeClass( 'drag-over' );
            }
        )
        .on(
            'dragend',
            function ( event ) {
                event.preventDefault();
                event.stopPropagation();

                $drag.removeClass( 'drag-over' );
            }
        )
        .on(
            'drop',
            function ( event ) {
                event.preventDefault();
                event.stopPropagation();

                $drag.removeClass( 'drag-over' );

                // Getting the list of dragged files
                const files = event.dataTransfer.files;

                // Checking if there are any files
                if ( files.length ) {
                    // Assigning the files to the hidden input
                    $file.el.files = files;

                    // Trigger change event to update history and process file
                    $file.trigger( 'change' );
                }
            }
    );
};

FileUpload.prototype.getViewTemplate = function(){
    return 'viewTemplate@templates/fields/files.html';
};

FileUpload.prototype.readFile = function( $file ){

    // Get the file instance
    var file = $file.el.files[ 0 ];

    // Do nothing if there is no file: the user pressed cancel on select file dialog
    if ( ! file ){
        return;
    }

    // Update fullValue property
    this.fullValue = this.filterFilePart( file );

    // Instance a FileReader and read the file with it
    const reader = new FileReader();
    var fileUploadInstance = this;
    reader.addEventListener( 'loadend', () => {
        // reader.result contains the contents of blob as a typed array
        fileUploadInstance.fullValue.contents = fileUploadInstance.filterContentsPart( reader.result, file );
        this.afterSetValue( this.fullValue );
    });
    //reader.readAsArrayBuffer( file );
    reader.readAsDataURL( file );
};

FileUpload.prototype.afterSetValue = function( file ){
    this.runSetValueListeners();
    this.updateNewFile( file );

    const page = this.getPage();
    validationManager.showErrorForField(
        this.get$Input().el,
        this,
        page
    );
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
/*
FileUpload.prototype.filterFilePart = function( file ){

    return new FileItem(
        file?
        file:
        {
            size: 0
        }
    );
};
*/
FileUpload.prototype.filterContentsPart = function( contents, file ){
    return contents;
};

//FileUpload.prototype.filterContentsPart = function( fileBits, file ){
    //return String.fromCharCode.apply( null, new Uint8Array( fileBits ) );
    
    // The TextDecoder interface is documented at http://encoding.spec.whatwg.org/#interface-textdecoder
    /*
    var decoder = new TextDecoder( 'utf-8' );
    return decoder.decode(
        new DataView( fileBits )
    );
    */
    /*
    var enc = new TextDecoder( 'utf-8' );
    return enc.decode(
        new Uint8Array( fileBits )
    );
    */
    /*
    return new File(
        new Uint8Array( fileBits ),
        file.name,
        {
            type: file.type,
            lastModified: file.lastModified
        }
    );
    */
//};

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
    //this.updateNewFile( this.fullValue? this.fullValue.file: undefined );
    this.updateNewFile( this.fullValue? this.fullValue: undefined );

    const page = this.getPage();
    validationManager.showErrorForField(
        this.get$Input().el,
        this,
        page
    );
};
/*
FileUpload.prototype.getValueForHistory = function( $this ){
    return this.fullValue;
};
*/
FileUpload.prototype.validate = function(){
    //if ( ! this.fullValue || ! this.fullValue.file.size ){
    if ( ! this.fullValue || ! this.fullValue.size ){
        return true;
    }

    // Check extension
    if ( this.acceptedFileExtensions ){
        let found = false;
        for ( const extension of this.acceptedFileExtensions ) {
            //if ( this.fullValue.file.name.endsWith( extension ) ){
            if ( this.fullValue.name.endsWith( extension ) ){
                found = true;
            }
        }
        if ( ! found ){
            return 'badInput';
        }
    }

    // Check maxFileSize and minFileSize
    //if ( this.fullValue.file.size > this.maxFileSize ){
    if ( this.fullValue.size > this.maxFileSize ){
        return 'rangeOverflow';
    }
    //if ( this.fullValue.file.size < this.minFileSize ){
    if ( this.fullValue.size < this.minFileSize ){
        return 'rangeUnderflow';
    }
};

module.exports = FileUpload;

