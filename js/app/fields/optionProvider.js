/*
    OptionProvider singleton class
*/
"use strict";

var context = require( '../context.js' );
var crudManager = require( '../crudManager.js' );
var utils = require( '../utils.js' );

var OptionProvider = function() {
    
    var cache = {};
    var resetCache = function(){
        cache = {};
    };

    var getOptionsFromBlank = function( field, options ){
        return getOptionsFromRecord( [], field, options );
    };
    
    var getOptionsFromRecord = function( record, field, options ){
        
        var params = {
            field: field, 
            value: record[ field.id ],
            options: options,
            record: record
        };
        params.dependedValues = createDependedValuesUsingRecord( record, field );
        
        return buildOptions( params );
    };
    
    var asyncGetOptions = function( record, field, options, callback ){
        
        var params = {
            field: field,
            value: record[ field.id ],
            options: options,
            record: record
        };
        params.dependedValues = createDependedValuesUsingRecord( record, field );
        //params.dependedValues = {};

        buildOptions( params, callback );
    };

    var buildOptions = function( params, callback ){

        var optionsSource = params.field.options;
        var funcParams = params;
        var mustGetOptionsFromCRUD = false;

        // Check if it is a function
        if ( utils.isFunction( optionsSource ) ) {
            // Prepare parameter to the function
            funcParams = buildFuncParams( funcParams );
            
            // Call function and get actual options source
            optionsSource = optionsSource( funcParams );
        }
        
        // Get optionsList according to its source type
        var optionsList = undefined;
        if ( typeof optionsSource !== 'string' ) { // Check it is NOT an URL

            // It is NOT an URL, must build optionsList
            optionsList = buildOptionsFromArrayOrObject( optionsSource, params.field );

        } else {
            // It is an URL, must download options

            // Try to get values from cache
            var cacheKey = 'options_' + params.field.id + '_' + optionsSource; // Create an unique cache key
            optionsList = cache[ cacheKey ];

            if ( ! optionsList ) {
                // Options are not found in the cache, download options
                mustGetOptionsFromCRUD = true;

                // Download options
                crudManager.getOptions(
                    params.field.id, 
                    optionsSource, 
                    params.options,
                    function( newValues ){

                        // Build optionsList
                        optionsList = buildOptionsFromArrayOrObject(
                            newValues,
                            params.field
                        );
                        // Add optionsList to cache
                        cache[ cacheKey ] = optionsList;

                        // Sort values
                        sortFieldOptions(
                            cache[ cacheKey ],
                            params.field.optionsSorting
                        );

                        // Add current value if needed
                        if ( params.field.addCurrentValueToOptions ){
                            optionsList = addCurrentValue( optionsList, params );
                        }

                        // Run callback if needed
                        if ( callback ){
                            callback( optionsList );
                        }

                        return;
                    }
                );
            }
        }

        // Return undefined if must build optionsList
        if ( ! optionsList && mustGetOptionsFromCRUD ){
            return undefined;
        }
        
        // Add current value if needed
        if ( params.field.addCurrentValueToOptions ){
            optionsList = addCurrentValue( optionsList, params );
        }
        
        // Run callback if needed
        if ( callback ){
            callback( optionsList );
            return;
        }

        return optionsList;
    };
    
    var buildFuncParams = function( funcParams ){
        
        var newFuncParams = {
            dependedValues: {}
        };
        
        for ( var i in funcParams ){
            newFuncParams[ i ] = i == 'options' || i == 'dictionary'|| i == 'formPage'?
                funcParams[ i ]:
                utils.extend( true, {}, funcParams[ i ] );
        }
        
        return newFuncParams;
    };
    
    var buildItem = function( value, text ){
        
        return {
            value: value,
            displayText: text? text: value
        };
    };
    
    var addCurrentValue = function( list, params ){
        
        var result = [];
        
        // Add the value
        var value = params.value;
        if ( value ){
            result.push( buildItem( value ) );
        }
        
        // Add all the items of list
        for ( var i = 0; i < list.length; i++ ) {
            result.push( list[ i ] );
        }
        
        return result;
    };
    
    var buildOptionsFromArrayOrObject = function( optionsSource, field ){
        
        var optionsList = undefined;
        
        if ( utils.isArray( optionsSource ) ) { // It is an array
            optionsList = buildOptionsFromArray( optionsSource );
            sortFieldOptions( optionsList, field.optionsSorting );
            
        } else { // It is an object
            optionsList = buildOptionsArrayFromObject( optionsSource );
            sortFieldOptions( optionsList, field.optionsSorting );
        }
        
        return optionsList;
    };
    
    // Create array of options from giving options array
    var buildOptionsFromArray = function ( optionsArray ) {
        
        var list = [];

        for ( var i = 0; i < optionsArray.length; i++ ) {
            if ( utils.isPlainObject( optionsArray[ i ] ) ) {
                list.push( optionsArray[ i ] );
            } else { // Assumed as primitive type (int, string...)
                list.push( buildItem( optionsArray[ i ] ) );
                /*list.push({
                    value: optionsArray[ i ],
                    displayText: optionsArray[ i ]
                });*/
            }
        }

        return list;
    };
    
    // Sort given options according to sorting parameter
    var sortFieldOptions = function ( options, sorting ) {

        if ( ( ! options ) || ( ! options.length ) || ( ! sorting ) ) {
            return;
        }

        var dataSelector = undefined;
        if ( sorting.indexOf( 'value' ) == 0) {
            dataSelector = function ( option ) {
                return option.value;
            };
        } else { // Assume as text
            dataSelector = function ( option ) {
                return option.displayText;
            };
        }

        var compareFunc = undefined;
        if ( utils.isString( dataSelector( options[ 0 ] ) ) ) {
            compareFunc = function ( option1, option2 ) {
                return dataSelector( option1 ).localeCompare( dataSelector( option2 ) );
            };
        } else { // Assume as numeric
            compareFunc = function ( option1, option2 ) {
                return dataSelector( option1 ) - dataSelector( option2 );
            };
        }

        if ( sorting.indexOf( 'desc' ) > 0 ) {
            options.sort( function ( a, b ) {
                return compareFunc( b, a );
            });
        } else { // Assume as asc
            options.sort( function ( a, b ) {
                return compareFunc( a, b );
            });
        }
    };
    /*
    // Find an option object by given value
    var findOptionByValue = function (options, value) {
        return findItemByProperty( options, 'value', value );
    };
    
    // Find an option object by given value
    var findItemByProperty = function ( items, key, value ) {
        
        for ( var i = 0; i < items.length; i++ ) {
            if ( items[ i ][ key ] == value ) {
                return items[ i ];
            }
        }

        return {};
    };
    */
    // Create an array of options from given object
    var buildOptionsArrayFromObject = function ( options ) {
        
        var list = [];

        for ( var propName in options ){
            var propValue = options[ propName ];
            list.push( buildItem( propName, propValue ) );
        }
        /*
        $.each( options, function ( propName, propValue ) {
            list.push( buildItem( propName, propValue ) );
        });
        */
       
        return list;
    };
    
    // Create and return an object with properties are depended values of a record
    var createDependedValuesUsingRecord = function ( record, field ) {
        
        var dependsOn = field.dependsOn;
        if ( ! dependsOn ) {
            return {};
        }

        var dependedValues = {};
        for ( var i = 0; i < dependsOn.length; i++ ) {
            var fieldName = dependsOn[ i ];
            var fieldId = context.getFieldData( fieldName ).name;
            dependedValues[ fieldName ] = record[ fieldId ];
        }

        return dependedValues;
    };
    
    var createDependedValuesUsingForm = function ( field, options, $selection, params ) {
        
        var dependedValues = {};
        
        for ( var i = 0; i < field.dependsOn.length; i++ ) {
            var dependedFieldId = field.dependsOn[ i ];
            var dependedField = context.getField( params.options.fields, dependedFieldId );
            dependedValues[ dependedFieldId ] = $selection.find( "[name='" + dependedField.name + "']").val();
        }
        
        return dependedValues;
    };
    
    return {
        buildOptions: buildOptions,
        getOptionsFromBlank: getOptionsFromBlank,
        getOptionsFromRecord: getOptionsFromRecord,
        asyncGetOptions: asyncGetOptions,
        createDependedValuesUsingForm: createDependedValuesUsingForm,
        resetCache: resetCache
    };
}();

module.exports = OptionProvider;