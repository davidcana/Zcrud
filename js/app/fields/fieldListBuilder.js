/* 
    fieldListBuilder singleton class
*/
var $ = require( 'jquery' );
var context = require( '../context.js' );
var normalizer = require( '../normalizer.js' );

module.exports = (function() {
    "use strict";
    
    var getForList = function( listOptions, options, fields ){

        if ( listOptions.fieldsCache ){
            //setPageToFields( pageOptions.fieldsCache, page );
            return listOptions.fieldsCache;
        }

        var fieldsCache = build( 
            listOptions.fields, 
            options, 
            undefined, 
            function( field ){
                field.buildFields();
            },
            fields );

        listOptions.fieldsCache = fieldsCache;
        //setPageToFields( pageOptions.fieldsCache, page );

        return fieldsCache;
    };
    
    var getForPage = function( pageId, options, pageIdArray, page ){
        
        var pageOptions = options.pageConf.pages[ pageId ];
        if ( ! pageOptions ){
            throw 'Page id not found: ' + pageId;
        }
        
        if ( pageOptions.fieldsCache ){
            setPageToFields( pageOptions.fieldsCache, page );
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
            function( field ){
                field.buildFields();
            } );

        pageOptions.fieldsCache = fieldsCache;
        setPageToFields( pageOptions.fieldsCache, page );
        
        return fieldsCache;
    };
    
    // Set the page to all fields if needed
    var setPageToFields = function( fieldsCache, page ){
        
        if ( page ){
            for ( var c = 0; c < fieldsCache.fieldsArray.length; ++c ){
                fieldsCache.fieldsArray[ c ].setPage( page );
            }
        }
    };
    
    var build = function( items, options, pageIdArray, functionToApplyToField, fields ) {
        
        var result = {
            fieldsArray: [],
            fieldsMap: {},
            view: []
        };
        
        for ( var c = 0; c < items.length; ++c ){
            build1Pass( 
                result, 
                fields || options.fields,
                items[ c ], 
                options, 
                pageIdArray, 
                functionToApplyToField );
        }
    
        return result;
    };
    
    var build1Pass = function( result, fields, item, options, pageIdArray, functionToApplyToField, containerType, containerId ) {

        // Is string?
        if ( $.type( item ) === 'string' ){
            addField( fields[ item ], result, options, functionToApplyToField, containerType, containerId );
            //addField( options.fields[ item ], result, options, functionToApplyToField, containerType, containerId );
            
        // Is fieldsGroup?
        } else if ( item.type == 'fieldsGroup' ){
            buildFieldsFromFieldsGroup( result, fields, item, options, pageIdArray, functionToApplyToField, containerType, containerId );

        // Must be a field instance
        } else {
            var newField = normalizer.buildFullFieldInstance( item.id, item, options );
            addField( newField, result, options, functionToApplyToField, containerType, containerId );
        }
    };
    
    var buildFieldsFromFieldsGroup = function( result, fields, item, options, pageIdArray, functionToApplyToField, containerType, containerId ) {
        
        // Get configuration if it is a container
        if ( item.container && item.container.containerType != 'none' ){
            containerType = item.container.containerType;
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
                            container.containerType, 
                            container.id );
                    }   

                // Must be a field
                } else {
                    build1Pass( 
                        result, 
                        fields,
                        viewItem, 
                        options, 
                        pageIdArray, 
                        functionToApplyToField,  
                        containerType, 
                        containerId );
                }
            }

            if ( ended ){
                return;
            }
        }
        
    };
    
    var addField = function( field, result, options, functionToApplyToField, containerType, containerId ){
        
        result.fieldsArray.push( field );
        result.fieldsMap[ field.id ] = field;
        
        if ( containerId ){
            var container = result.view[ result.view.length - 1 ];
            if ( ! container || container.id != containerId ){
                container = {
                    type: "fieldContainer",
                    id: containerId,
                    containerType: containerType,
                    template: options.containers.types[ containerType ].template,
                    fields: []
                };
                if ( ! container.template ){
                    throw 'Container with containerType "' + containerType + '" has got no template!';
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
                    var newField = normalizer.buildFullFieldInstance( item.id, item, options );
                    result.push( newField );
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
        
        // Is subform?
        if ( source.startsWith( 'subform/' ) ){
            var subformId = source.substring( 'subform/'.length );
            result = [];
            $.each( options.fields[ subformId ].fields, function ( fieldId, field ) {
                result.push( field );
            });
            return result;
        }
        
        // Must be a page id
        return getForPage( source, options, pageIdArray ).view;
    };
    
    var self = {
        getForPage: getForPage,
        getForList: getForList,
        build: build
    };
    
    return self;
})();
