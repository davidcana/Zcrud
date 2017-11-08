/*
    Create class
*/
"use strict";

var Create = function( columnIndexToApply, $thisToApply ) {
    
    var columnIndex = columnIndexToApply;
    var $this = $thisToApply;
                    
    var undo = function(){
        //$this.val( previousValue );
    };
    
    var redo = function(){
        //$this.val( newValue );
    };
    
    var buildRecord = function(){
        var record = {};
        return record;
    };
    
    return {
        undo: undo,
        redo: redo,
        columnIndex: columnIndex,
        $this: $this
    };
};

module.exports = Create;