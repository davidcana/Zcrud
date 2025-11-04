/* 
    fieldListBuilder singleton class
*/

import { normalizer } from '../normalizer.js';
import { Container } from './container.js';
import { utils } from '../utils.js';

export const fieldListBuilder = (function() {
    
    var getForList = function( listOptions, options, fields ){

        if ( listOptions.fieldsCache ){
            return listOptions.fieldsCache;
        }

        var fieldsCache = build( 
            listOptions.fields, 
            options, 
            undefined, 
            function( field ){
                field.buildFields();
            },
            fields
        );

        listOptions.fieldsCache = fieldsCache;

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
            }
        );

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
                functionToApplyToField
            );
        }
    
        return result;
    };
    
    var build1Pass = function( result, fields, item, options, pageIdArray, functionToApplyToField, containerType, containerId, container ) {

        // Is string?
        if ( utils.isString( item ) ){
            addField( 
                getFieldUsingId( fields, item ), 
                result, 
                options, 
                functionToApplyToField, 
                containerType, 
                containerId, 
                container
            );
            
        // Is fieldsGroup?
        } else if ( item.type == 'fieldsGroup' ){
            buildFieldsFromFieldsGroup(
                result,
                fields,
                item,
                options,
                pageIdArray,
                functionToApplyToField,
                containerType,
                containerId,
                container
            );

        // Is composition?
        } else if ( item.type == 'composition' ){
            buildFieldsFromComposition(
                result,
                fields,
                item,
                options,
                pageIdArray,
                functionToApplyToField,
                containerType,
                containerId,
                container
            );

        // Must be a field instance
        } else {
            var newField = normalizer.buildFullFieldInstance( item.id, item, options );
            addField(
                newField,
                result,
                options,
                functionToApplyToField,
                containerType,
                containerId,
                container
            );
        }
    };
    
    var buildFieldsFromComposition = function( result, fields, composition, options, pageIdArray, functionToApplyToField, containerType, containerId ) {

        // Init compositionView, init view property and add it to result.view
        var compositionView = composition;
        composition.view = compositionView;
        result.view.push( compositionView );

        // Init compositionResult with result.fieldsArray, result.fieldsMap and an empty list of views
        var compositionResult = {
            fieldsArray: result.fieldsArray,
            fieldsMap: result.fieldsMap,
            view: []
        };

        // Instance a new Container
        composition.view = buildContainerInstance(
            'composition',
            composition.container,
            options
        );

        // Remove fields from view, we shall use items instead
        delete composition.view.fields;

        // Set items in view
        composition.view.items = composition.items;
        /*
            'type': 'composition',
            'containerType': 'tabContainer',
            'template': 'tabContainer@templates/containers/basic.html',
            'itemsView': expected
        };
        */
        //compositionResult.view;

        // Iterate items
        for ( const compositionItem of composition.items ) {
            build1Pass(
                compositionResult,
                fields || options.fields,
                compositionItem,
                options,
                pageIdArray,
                functionToApplyToField
            );
        }
    };

    var buildFieldsFromFieldsGroup = function( result, fields, item, options, pageIdArray, functionToApplyToField, containerType, containerId ) {
        
        var container;
        
        // Get configuration if it is a container
        if ( item.container && item.container.containerType != 'none' ){
            containerType = item.container.containerType;
            containerId = item.container.id;
            container = item.container;
        }
        
        // Get configuration from item
        var start = item.start;
        var end = item.end;
        var except = item.except;
        var source = item.source; // 'default' or page id

        var view = buildFieldsFromSource( source, options, pageIdArray );

        // Must add a containerInstance to result.view if there are no fields to add
        // Needed to support custom containerType with no fields
        if ( ! view.length ){
            const containerInstance = buildFieldContainerInstance( container, options );
            result.view.push( containerInstance );
            return;
        }

        // There are fields to add!
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
                if ( viewItem.type == 'fieldContainer' ){
                    container = viewItem;
                    for ( var i = 0; i < container.fields.length; ++i ){
                        addField( 
                            container.fields[ i ], 
                            result, 
                            options, 
                            functionToApplyToField, 
                            container.containerType, 
                            container.id,
                            container, 
                            true
                        );
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
                        containerId,
                        container
                    );
                }
            }

            if ( ended ){
                return;
            }
        }
        
    };
    
    var buildFieldContainerInstance = function( container, options ){
        return buildContainerInstance( 'fieldContainer', container, options );
    };

    var buildContainerInstance = function( type, container, options ){
        
        utils.extend( 
            true, 
            container,
            {
                //type: 'fieldContainer',
                type: type,
                template: options.containers.types[ container.containerType ].template,
                fields: []
            }
        );
        container.options = options;
        
        return new Container( container );
    };
    
    var addField = function( field, result, options, functionToApplyToField, containerType, containerId, newContainer, dontAddToContainer ){
        
        result.fieldsArray.push( field );
        result.fieldsMap[ field.id ] = field;
        
        if ( containerId ){ 
            var container = result.view[ result.view.length - 1 ];
            
            if ( ! container || container.id != containerId ){
                
                container = buildFieldContainerInstance( newContainer, options );
                
                if ( ! container.template ){
                    throw 'Container with containerId "' + containerId + '" has got no template!';
                }
                result.view.push( container );
            }
            if ( ! dontAddToContainer ){
                container.fields.push( field );
            }
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
        if ( utils.isArray( source ) ){
            result = [];
            for ( var i = 0; i < source.length; ++i ){
                var item = source[ i ];
                
                // Is string?
                if ( utils.isString( item ) ){
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
            for ( var fieldId in options.fields ){
                var field = options.fields[ fieldId ];
                result.push( field );
            }
            return result;
        }
        
        // Is subform?
        if ( source.startsWith( 'subform/' ) ){
            var subformId = source.substring( 'subform/'.length );
            result = [];

            for ( var fieldId in options.fields[ subformId ].fields ){
                var field = options.fields[ subformId ].fields[ fieldId ];
                result.push( field );
            }
            return result;
        }
        
        // Must be a page id
        result = getForPage( source, options, pageIdArray ).view;
        return result;
    };
    
    var validateField = function( field, id ){
        
        if ( field ){
            return field;
        }
        
        throw 'Field with id "' + id + '" not found!';
    };
    
    var getFieldUsingId = function( fields, id ){
        
        var index = id.indexOf( '/' );
        
        if ( index === -1 ){
            return validateField( 
                fields[ id ], 
                id
            );
        }
        
        var subformId = id.substring( 0, index );
        var subformFieldId = id.substring( 1 + index );
        var subform = fields[ subformId ];
        
        if ( ! subform ){
            throw 'Subform with id "' + subformId + '" not found!';
        }
        
        return validateField( 
            subform.fields[ subformFieldId ], 
            id
        );
    };
    
    var self = {
        getForPage: getForPage,
        getForList: getForList,
        build: build
    };
    
    return self;
})();
