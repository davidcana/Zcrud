/* 
    filteringComponent class
*/
module.exports = function( optionsToApply, thisOptionsToApply, parentToApply ) {
    "use strict";
    
    var context = require( '../context.js' );
    var $ = require( 'jquery' );
    var pageUtils = require( '../pages/pageUtils.js' );
    var fieldUtils = require( '../fields/fieldUtils.js' );
    
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
    
    var addToDataToSend = function( dataToSend ){

        var extendedFilter = $.extend( true, {}, filterRecord, dataToSend.filter );
        if ( ! $.isEmptyObject( extendedFilter ) ){
            dataToSend.filter = extendedFilter;
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
        parent.show( undefined, root );
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
    };
    
    return {
        bindEvents: bindEvents,
        getThisOptions: getThisOptions,
        addToDataToSend: addToDataToSend,
        getClass: getClass,
        getFields: getFields
    };
};
