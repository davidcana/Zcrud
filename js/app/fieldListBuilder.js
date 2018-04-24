/* 
    fieldListBuilder singleton class
*/
var $ = require( 'jquery' );
var normalizer = require( './normalizer.js' );

module.exports = (function() {
    "use strict";
    
    var build = function( items, options ) {

        var result = [];
        
        for ( var c = 0; c < items.length; ++c ){
            
            var item = items[ c ];
            
            // Is string?
            if ( $.type( item ) === 'string' ){
                result.push( options.fields[ item ] );
                
            // Is fieldSubset?
            } else if ( item.type == 'fieldSubset' ){
                buildFieldsFromFieldSubset( item, options, result );
                
            // Must be a field instance
            } else {
                normalizer.normalizeFieldOptions( item.id, item, options );
                result.push( item );
            }
        }
        
        return result;
    };
    /*
    var getField = function( item, options ){
        return options.fields[ item ];
    };*/
    
    var buildFieldsFromFieldSubset = function( item, options, result ) {
        
        var start = item.start;
        var end = item.end;
        var except = item.except;
        var source = item.source; // 'default' or page id
        
        var allFields = buildFieldsFromSource( source, options );
        
        var started = ! start;
        var ended = false;
        
        for ( var c = 0; c < allFields.length; ++c ){
            
            var field = allFields[ c ];
            var id = field.id;
            
            if ( id === start ){
                started = true;
            }
            if ( id === end ){
                ended = true;
            }
            
            if ( started && ( except? -1 === except.indexOf( id ): true ) ){
                result.push( field );
            }
            
            if ( ended ){
                return;
            }
        }
    };
    
    var buildFieldsFromSource = function( source, options ){
        
        // Is default?
        if ( ! source || source === '' || source === 'default' ){
            var result = [];
            $.each( options.fields, function ( fieldId, field ) {
                result.push( field );
            });
            return result;
        }
        
        // Must be a page id
        return options.pages[ source ].fields;
    };
    
    var self = {
        build: build
    };
    
    return self;
})();
