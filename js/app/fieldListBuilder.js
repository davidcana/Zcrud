/* 
    fieldListBuilder singleton class
*/
var $ = require( 'jquery' );
var normalizer = require( './normalizer.js' );
var fieldBuilder = require( './fields/fieldBuilder' );

module.exports = (function() {
    "use strict";
    
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
        
        for ( var c = 0; c < items.length; ++c ){
            build1Pass( 
                result, 
                items[ c ], 
                options, 
                pageIdArray, 
                functionToApplyToField )
        }
    
        return result;
    };
    
    var build1Pass = function( result, item, options, pageIdArray, functionToApplyToField, containerTag, containerId ) {

        // Is string?
        if ( $.type( item ) === 'string' ){
            addField( options.fields[ item ], result, options, functionToApplyToField, containerTag, containerId );

        // Is fieldsGroup?
        } else if ( item.type == 'fieldsGroup' ){
            buildFieldsFromFieldsGroup( result, item, options, pageIdArray, functionToApplyToField, containerTag, containerId );

        // Must be a field instance
        } else {
            normalizer.normalizeFieldOptions( item.id, item, options );
            addField( item, result, options, functionToApplyToField, containerTag, containerId );
        }
    };
    
    var buildFieldsFromFieldsGroup = function( result, item, options, pageIdArray, functionToApplyToField, containerTag, containerId ) {
        
        // Get configuration if it is a container
        if ( item.container && item.container.tag != 'none' ){
            containerTag = item.container.tag;
            containerId = item.container.id;
        }
        
        // Get configuration from item
        var start = item.start;
        var end = item.end;
        var except = item.except;
        var source = item.source; // 'default' or page id

        var view = buildFieldsFromSource( source, options, pageIdArray );

        var started = ! start;
        var ended = false;

        for ( var c = 0; c < view.length; ++c ){

            var viewItem = view[ c ];
            var id = viewItem.id;

            if ( id === start ){
                started = true;
            }
            if ( id === end ){
                ended = true;
            }

            if ( started && ( except? -1 === except.indexOf( id ): true ) ){

                // Is a fieldContainer?
                if ( viewItem.type == "fieldContainer" ){
                    var container = viewItem;
                    for ( var i = 0; i < container.fields.length; ++i ){
                        addField( 
                            container.fields[ i ], 
                            result, 
                            options, 
                            functionToApplyToField, 
                            container.tag, 
                            container.id );
                    }   

                // Must be a field
                } else {
                    build1Pass( 
                        result, 
                        viewItem, 
                        options, 
                        pageIdArray, 
                        functionToApplyToField,  
                        containerTag, 
                        containerId );
                }
            }

            if ( ended ){
                return;
            }
        }
        
    };
    
    var addField = function( field, result, options, functionToApplyToField, containerTag, containerId ){
        
        result.fieldsArray.push( field );
        result.fieldsMap[ field.id ] = field;
        
        if ( containerId ){
            var container = result.view[ result.view.length - 1 ];
            if ( ! container || container.id != containerId ){
                container = {
                    type: "fieldContainer",
                    id: containerId,
                    tag: containerTag,
                    template: options.containers.types[ containerTag ].template,
                    fields: []
                };
                if ( ! container.template ){
                    throw 'Container with tag "' + containerTag + '" has got no template!';
                }
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
    
    var buildFieldsFromSource = function( source, options, pageIdArray ){
        
        var result = undefined;
        
        // Is array?
        if ( $.isArray( source ) ){
            result = [];
            for ( var i = 0; i < source.length; ++i ){
                var item = source[ i ];
                
                // Is string?
                if ( $.type( item ) === 'string' ){
                    result.push( options.fields[ item ] );

                // Must be a field instance
                } else {
                    normalizer.normalizeFieldOptions( item.id, item, options );
                    result.push( item );
                }
            }
            return result;
        }
        
        // Is default?
        if ( ! source || source === '' || source === 'default' ){
            result = [];
            $.each( options.fields, function ( fieldId, field ) {
                result.push( field );
            });
            return result;
        }
        
        // Must be a page id
        return get( source, options, pageIdArray ).view;
    };
    
    var self = {
        get: get,
        build: build
    };
    
    return self;
})();
