/*
    OptionListProviderManager singleton class
*/
"use strict";

//var context = require( '../context.js' );
var $ = require( 'jquery' );

var OptionListProviderManager = function() {
    
    var initDone = false;
    var cache = {};
    
    var init = function(){
        if ( ! initDone ){
            
            initDone = true;
        }
    };
    
    //var beforeProcessTemplate = function( field, elementId, options, record ){
    var beforeProcessTemplateForField = function( params ){
        init();
        
        var optionsSource = params.field.options;
        var funcParams = {
            record: params.record,
            value: params.record[ params.field.id ],
            source: 'list',
            dependedValues: createDependedValuesUsingRecord( params )
            //dependedValues: createDependedValuesUsingRecord( params.record, params.field.dependsOn, params )
        };
        
        // Check if it is a function
        if ( $.isFunction( optionsSource ) ) {
            //prepare parameter to the function
            funcParams = $.extend( true, {
                _cacheCleared: false,
                dependedValues: {},
                clearCache: function () {
                    this._cacheCleared = true;
                }
            }, funcParams );

            //call function and get actual options source
            optionsSource = optionsSource( funcParams );
        }
        
        //Build options according to it's source type
        var optionsList = undefined;
        if ( typeof optionsSource == 'string' ) { //It is an Url to download options
            var cacheKey = 'options_' + params.field.id + '_' + optionsSource; //create a unique cache key
            var mustBuild = false;
            if ( funcParams._cacheCleared || ( ! cache[ cacheKey ] ) ) {
                //if user calls clearCache() or options are not found in the cache, download options
                mustBuild = true;
            } else {
                //found on cache..
                //if this method (getOptionsForField) is called to get option for a specific value (on funcParams.source == 'list')
                //and this value is not in cached options, we need to re-download options to get the unfound (probably new) option.
                if ( funcParams.value != undefined ) {
                    var optionForValue = findOptionByValue( cache[ cacheKey ], funcParams.value );
                    if ( optionForValue.displayText == undefined ) { //this value is not in cached options...
                        mustBuild = true;
                    }
                }
            }
            
            if ( mustBuild ){
                optionsList = buildOptionsFromArrayOrObject(
                    downloadOptions( params.field.id, optionsSource, params.options ),
                    params.field );
                cache[ cacheKey ] = optionsList;
                sortFieldOptions( cache[ cacheKey ], params.field.optionsSorting );
                
            } else {
                optionsList = cache[ cacheKey ];
            }
            
        } else {
            optionsList = buildOptionsFromArrayOrObject( optionsSource, params.field );
        }

        params.field.optionsList = optionsList;
    };
    
    var buildOptionsFromArrayOrObject = function( optionsSource, field ){
        
        var optionsList = undefined;
        
        if ( $.isArray( optionsSource ) ) { //It is an array of options
            optionsList = buildOptionsFromArray( optionsSource );
            sortFieldOptions( optionsList, field.optionsSorting );
            
        } else { //It is an object that it's properties are options
            optionsList = buildOptionsArrayFromObject( optionsSource );
            sortFieldOptions( optionsList, field.optionsSorting );
        }
        
        return optionsList;
    };
    
    /* Creates array of options from giving options array.
     ************************************************************************/
    var buildOptionsFromArray = function ( optionsArray ) {
        var list = [];

        for ( var i = 0; i < optionsArray.length; i++ ) {
            if ( $.isPlainObject( optionsArray[ i ] ) ) {
                list.push( optionsArray[ i ] );
            } else { //assumed as primitive type (int, string...)
                list.push({
                    value: optionsArray[ i ],
                    displayText: optionsArray[ i ]
                });
            }
        }

        return list;
    };
    
    /* Download options for a field from server.
    *************************************************************************/
    var downloadOptions = function ( fieldId, url, options ) {
        var result = [];

        var thisOptions = {
            url    : url,
            async  : false,
            success: function ( data ) {
                data = options.ajaxPostFilter( data );
                if ( data.result != 'OK' ) {
                    throw 'Error downloading options:' + data.message;
                }

                result = data.options;
            },
            error  : function ( data ) {
                data = options.ajaxPostFilter( data );
                throw self.options.messages.cannotLoadOptionsFor + fieldId;
            }
        };
        
        options.ajax(
            $.extend( {}, options.defaultFormAjaxOptions, thisOptions ) );

        return result;
    };
    
    /* Sorts given options according to sorting parameter.
    *  sorting can be: 'value', 'value-desc', 'text' or 'text-desc'.
    *************************************************************************/
    var sortFieldOptions = function ( options, sorting ) {

        if ( ( ! options ) || ( ! options.length ) || ( ! sorting ) ) {
            return;
        }

        //Determine using value of text
        var dataSelector = undefined;
        if ( sorting.indexOf( 'value' ) == 0) {
            dataSelector = function ( option ) {
                return option.value;
            };
        } else { //assume as text
            dataSelector = function ( option ) {
                return option.displayText;
            };
        }

        var compareFunc = undefined;
        if ( $.type( dataSelector( options[ 0 ] ) ) == 'string' ) {
            compareFunc = function ( option1, option2 ) {
                return dataSelector( option1 ).localeCompare( dataSelector( option2 ) );
            };
        } else { //asuume as numeric
            compareFunc = function ( option1, option2 ) {
                return dataSelector( option1 ) - dataSelector( option2 );
            };
        }

        if ( sorting.indexOf( 'desc' ) > 0 ) {
            options.sort( function ( a, b ) {
                return compareFunc( b, a );
            });
        } else { //assume as asc
            options.sort( function ( a, b ) {
                return compareFunc( a, b );
            });
        }
    };
    
    /* Finds an option object by given value.
    *************************************************************************/
    var findOptionByValue = function (options, value) {
        return findItemByProperty( options, 'value', value );
    };
    
    /* Finds an option object by given value.
    *************************************************************************/
    var findItemByProperty = function ( items, key, value ) {
        for ( var i = 0; i < items.length; i++ ) {
            if ( items[ i ][ key ] == value ) {
                return items[ i ];
            }
        }

        return {}; //no item found
    };
    
    /* Creates an array of options from given object.
    *************************************************************************/
    var buildOptionsArrayFromObject = function ( options ) {
        var list = [];

        $.each( options, function ( propName, propValue ) {
            list.push({
                value: propName,
                displayText: propValue
            });
        });

        return list;
    };
    
    /* Creates and returns an object that's properties are depended values of a record.
    *************************************************************************/
    var createDependedValuesUsingRecord = function ( params ) {
        var dependsOn = params.field.dependsOn;
        if ( ! dependsOn ) {
            return {};
        }
        
        var record = params.record;
        var dependentFieldId = params.field.id;
        var dependedValues = {};
        for ( var i = 0; i < dependsOn.length; i++ ) {
            var fieldId = dependsOn[ i ];
            dependedValues[ fieldId ] = record[ fieldId ];
            addDependency( fieldId, dependentFieldId, params );
        }

        return dependedValues;
    };
    
    /* Creates depended values object from given form.
    *************************************************************************/
    /*
    var createDependedValuesUsingForm = function ( $form, dependsOn ) {
        if ( ! dependsOn ) {
            return {};
        }

        var dependedValues = {};

        for ( var i = 0; i < dependsOn.length; i++ ) {
            var dependedField = dependsOn[ i ];

            var $dependsOn = $form.find( 'select[name=' + dependedField + ']' );
            if ( $dependsOn.length <= 0 ) {
                continue;
            }

            dependedValues[ dependedField ] = $dependsOn.val();
        }

        return dependedValues;
    };*/
    var createDependedValuesUsingForm = function ( field, elementId ) {
        
        var dependedValues = {};
        
        for ( var i = 0; i < field.dependencies.length; i++ ) {
            var dependedField = field.dependencies[ i ];
            dependedValues[ dependedField ] = $( '#' + elementId ).val();
        }
        
        return dependedValues;
    };
    
    var addDependency = function( fieldId, dependentFieldId, params ){
        
        var field = params.options.fields[ fieldId ];
        
        if ( ! field.dependencies ){
            field.dependencies = [];
        }
        
        // Add it only if not present yet
        if ( field.dependencies.indexOf( dependentFieldId ) === -1 ){
            field.dependencies.push( dependentFieldId );
        }
    };
    
    var afterProcessTemplateForField = function( params ){
    };
    
    return {
        beforeProcessTemplateForField: beforeProcessTemplateForField,
        afterProcessTemplateForField: afterProcessTemplateForField
    };
}();

OptionListProviderManager.types = [ 'datalist', 'select', 'optgroup', 'radio' ];

module.exports = OptionListProviderManager;