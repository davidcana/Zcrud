/* 
    filteringComponent class
*/
var context = require( '../context.js' );
var $ = require( 'jquery' );
var pageUtils = require( '../pages/pageUtils.js' );
var fieldUtils = require( '../fields/fieldUtils.js' );
var fieldListBuilder = require( '../fields/fieldListBuilder.js' );

module.exports = function( optionsToApply, thisOptionsToApply, parentToApply ) {
    "use strict";
    
    var options = optionsToApply;
    var parent = parentToApply;
    
    var thisOptions = thisOptionsToApply;
    var getThisOptions = function(){
        return thisOptions;
    };
    
    var cssClass = 'zcrud-filter-panel';
    var getClass = function(){
        return cssClass;
    };
    
    var filterRecord = undefined;
    var fullFilter = undefined;
    var getFilter = function(){
        return fullFilter;
    };
    
    var bindEvents = function(){
        
        get$()
            .find( '.zcrud-filter-submit-button' )
            .off() // Remove previous event handlers
            .click( 
                function ( e ) {
                    e.preventDefault();
                    filter();
                }
            );
    };
    
    var filter = function(){
        
        filterRecord = fieldUtils.buildRecord( 
            getFields(), 
            parent.get$() );
        
        var pagingComponent = parent.getComponent( 'paging' );
        if ( pagingComponent ){
            pagingComponent.goToFirstPage();
        }
        
        updateParent();
    };
    /*
    var addToDataToSend = function( dataToSend ){
        
        var filterRecord = fieldUtils.buildRecord( 
            getFields(), 
            parent.get$() );
        
        fullFilter = $.extend( true, {}, filterRecord, dataToSend.filter );
        if ( ! $.isEmptyObject( fullFilter ) ){
            dataToSend.filter = fullFilter;
        }
    };*/
    
    var addToDataToSend = function( dataToSend ){

        fullFilter = $.extend( true, {}, filterRecord, dataToSend.filter );
        if ( ! $.isEmptyObject( fullFilter ) ){
            dataToSend.filter = fullFilter;
        }
    };
    
    var updateParent = function(){
        
        if ( parent.type == 'subform' ){
            parent.update(
                [
                    parent.get$().find( 'thead' )[0],
                    parent.get$().find( 'tbody' )[0],
                    parent.getPagingComponent().get$()[0]
                ]
            );
            return;
        }
        
        // Get root
        var pagingComponent = parent.getComponent( 'paging' );
        var root = pagingComponent?
            [ 
                $( '#' + parent.getThisOptions().tbodyId )[0], 
                pagingComponent.get$()[0] 
            ]:
            [ 
                $( '#' + parent.getThisOptions().tbodyId )[0]
            ];
        
        // Show list page
        parent.show( 
            {
                root: root
            }
        );
    };
    
    var get$ = function(){
        return parent.get$().find( '.' + cssClass );
    };
    
    var fields = undefined;
    var getFields = function(){
        
        if ( ! fields ){
            fields = buildFields();
        }
        
        return fields;
    };
    
    var buildFields = function(){
        
        var fieldsCache = fieldListBuilder.getForList( thisOptions, options, parent.getFieldsSource() );
        return fieldsCache.fieldsArray;
    };
    /*
    var buildFields = function(){

        var newFields = [];

        $.each( thisOptions.fields, function ( filterFieldId, filterField ) {

            var newFilterField = undefined;

            if ( $.type( filterField ) === 'string' ){
                // Clone the field from fields if filterField is a string
                newFilterField = $.extend( true, {}, options.fields[ filterField ] );
            } else {
                // Extend the field from fields if filterField is an object
                newFilterField = $.extend( true, {}, options.fields[ filterField ], filterField );
            }

            newFields.push( newFilterField );
        });

        return newFields;
    };*/
    
    var filterIsOn = function(){
        
        if ( ! fullFilter ){
            return false;
        }
        
        for ( var index in fullFilter ){
            var filterFieldValue = fullFilter[ index ];
            if ( filterFieldValue != undefined ){
                return true;
            }
        }
        
        return false;
    };
    
    var getInitialRecord = function(){
        return {};
    };
    
    var getParent = function(){
        return parent;
    };
    
    return {
        bindEvents: bindEvents,
        getThisOptions: getThisOptions,
        addToDataToSend: addToDataToSend,
        getClass: getClass,
        getFields: getFields,
        getFilter: getFilter,
        filterIsOn: filterIsOn,
        getInitialRecord: getInitialRecord,
        getParent: getParent
    };
};
