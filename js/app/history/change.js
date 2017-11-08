/*
    Change class
*/
"use strict";

var $ = require( 'jquery' );

var Change = function( editableOptionsToApply, columnIndexToApply, nameToApply, newValueToApply, previousValueToApply, $thisToApply ) {
    
    var editableOptions = editableOptionsToApply;
    var columnIndex = columnIndexToApply;
    var name = nameToApply;
    var newValue = newValueToApply;
    var previousValue = previousValueToApply;
    var $this = $thisToApply;
                    
    var undo = function(){
        $this.val( previousValue );
    };
    
    var redo = function(){
        $this.val( newValue );
    };
    
    var register = function( modified ){
        var row = modified[ columnIndex ];

        if ( ! row ){
            row = {};
            modified[ columnIndex ] = row;
        }

        row[ name ] = newValue;
        
        Change.updateCSS( $this, editableOptions, true, true );
    };
    
    return {
        undo: undo,
        redo: redo,
        register: register,
        columnIndex: columnIndex,
        name: name,
        newValue: newValue,
        previousValue: previousValue,
        $this: $this
    };
};

Change.updateCSS = function( $this, editableOptions, td, tr ){

    if ( td ){
        $this.closest( 'td' ).addClass( editableOptions.modifiedFieldsClass );
    } else {
        $this.closest( 'td' ).removeClass( editableOptions.modifiedFieldsClass );
    }

    if ( tr ){
        $this.closest( 'tr' ).addClass( editableOptions.modifiedRowsClass );
    } else {
        $this.closest( 'tr' ).removeClass( editableOptions.modifiedRowsClass );
    }
};

Change.resetCSS = function( id, editableOptions ){

    var $list = $( '#' + id );
    $list.find( '.' + editableOptions.modifiedFieldsClass ).removeClass( editableOptions.modifiedFieldsClass );
    $list.find( '.' + editableOptions.modifiedRowsClass ).removeClass( editableOptions.modifiedRowsClass );
};

module.exports = Change;