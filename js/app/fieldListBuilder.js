/* 
    fieldListBuilder singleton class
*/
var $ = require( 'jquery' );
var normalizer = require( './normalizer.js' );
var fieldBuilder = require( './fields/fieldBuilder' );

module.exports = (function() {
    "use strict";

    var containerCounter = 0;
    
    var get = function( pageId, options, pageIdArray ){
        
        var pageOptions = options.pageConf.pages[ pageId ];
        if ( ! pageOptions ){
            throw 'Page id not found: ' + pageId;
        }
        
        if ( pageOptions.fieldsCache ){
            return pageOptions.fieldsCache;
        }
        
        // To avoid circular references
        if ( ! pageIdArray ){
            pageIdArray = [];
        } else if ( -1 !== pageIdArray.indexOf( pageId ) ){
            throw 'Circular reference trying to build fields for ' + pageId + ' page!';
        }
        pageIdArray.push( pageId );
        
        var fieldsCache = build( 
            pageOptions.fields, 
            options, 
            pageIdArray, 
            fieldBuilder.buildFields );
        pageOptions.fieldsCache = fieldsCache;
        
        return fieldsCache;
    };

    var build = function( items, options, pageIdArray, functionToApplyToField ) {
        
        var result = {
            fieldsArray: [],
            fieldsMap: {},
            view: []
        };
        
        buildPass( result, items, options, pageIdArray, functionToApplyToField );
        
        return result;
    };
    
    var buildPass = function( result, items, options, pageIdArray, functionToApplyToField, containerId, containerTag ) {
        
        for ( var c = 0; c < items.length; ++c ){
            
            var item = items[ c ];
            
            // Is string?
            if ( $.type( item ) === 'string' ){
                addField( options.fields[ item ], result, functionToApplyToField, containerId, containerTag );
                
            // Is fieldSubset?
            } else if ( item.type == 'fieldSubset' ){
                buildFieldsFromFieldSubset( result, item, options, pageIdArray, functionToApplyToField, containerId, containerTag );
                
            // Is fieldContainer?
            } else if ( item.type == 'fieldContainer' ){
                buildFieldsFromFieldContainer( result, item, options, pageIdArray, functionToApplyToField );
                
            // Must be a field instance
            } else {
                normalizer.normalizeFieldOptions( item.id, item, options );
                addField( item, result, functionToApplyToField, containerId, containerTag );
            }
        }
    };
    
    var addField = function( field, result, functionToApplyToField, containerId, containerTag ){
        
        result.fieldsArray.push( field );
        result.fieldsMap[ field.id ] = field;
        
        if ( containerId ){
            var container = result.view[ result.view.length - 1 ];
            if ( ! container || container.id != containerId ){
                container = {
                    type: "fieldContainer",
                    id: containerId,
                    tag: containerTag,
                    fields: []
                };
                result.view.push( container );
            }
            container.fields.push( field );
        } else {
            result.view.push( field );
        }
        
        if ( functionToApplyToField ){
            functionToApplyToField( field );
        }
    };
    
    var buildFieldsFromFieldContainer = function( result, item, options, pageIdArray, functionToApplyToField ) {

        buildPass( 
            result, 
            item.contents, 
            options, 
            pageIdArray, 
            functionToApplyToField,
            ++containerCounter,
            item.tag );
    };
    
    var buildFieldsFromFieldSubset = function( result, item, options, pageIdArray, functionToApplyToField, containerId, containerTag ) {
        
        var start = item.start;
        var end = item.end;
        var except = item.except;
        var source = item.source; // 'default' or page id
        
        var allFields = buildFieldsFromSource( source, options, pageIdArray );
        
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
                addField( field, result, functionToApplyToField, containerId, containerTag );
            }
            
            if ( ended ){
                return;
            }
        }
    };
    
    var buildFieldsFromSource = function( source, options, pageIdArray ){
        
        // Is default?
        if ( ! source || source === '' || source === 'default' ){
            var result = [];
            $.each( options.fields, function ( fieldId, field ) {
                result.push( field );
            });
            return result;
        }
        
        // Must be a page id
        return get( source, options, pageIdArray ).fieldsArray;
    };
    
    var self = {
        get: get,
        build: build
        //buildMapFromArray: buildMapFromArray
    };
    
    return self;
})();
