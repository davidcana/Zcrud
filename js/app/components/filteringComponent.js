/* 
    filteringComponent class
*/
module.exports = function( optionsToApply, thisOptionsToApply, listPageToApply ) {
    "use strict";
    
    var context = require( '../context.js' );
    var $ = require( 'jquery' );
    var pageUtils = require( '../pages/pageUtils.js' );
    var fieldUtils = require( '../fields/fieldUtils.js' );
    
    var options = optionsToApply;
    var listPage = listPageToApply;
    
    var thisOptions = thisOptionsToApply;
    var getThisOptions = function(){
        return thisOptions;
    };
    
    var filterRecord = undefined;
    var elementIdSuffix = '-filter';
    
    var bindEvents = function(){
        
        $( '#' + listPage.getId() )
            .find( '.zcrud-filter-panel .zcrud-filter-submit-button' )
            .off() // Remove previous event handlers
            .click( function ( e ) {
                e.preventDefault();
                filter();
        });
    };
    
    var filter = function(){
        
        filterRecord = buildFilterRecordFromForm();
        
        var pagingComponent = listPage.getSecureComponent( 'paging' );
        if ( pagingComponent ){
            pagingComponent.goToFirstPage();
        }
        
        updateList();
    };
    
    var buildFilterRecordFromForm = function(){
        return fieldUtils.buildRecord( thisOptions.fields, $( '#' + listPage.getId() ) );
    };

    var addToDataToSend = function( dataToSend ){

        var extendedFilter = $.extend( true, {}, filterRecord, dataToSend.filter );
        if ( ! $.isEmptyObject( extendedFilter ) ){
            dataToSend.filter = extendedFilter;
        }
    };
    
    var updateList = function(){
        
        // Get root
        var pagingComponent = listPage.getComponent( 'paging' );
        var root = pagingComponent?
            [ 
                $( '#' + listPage.getThisOptions().tbodyId )[0], 
                pagingComponent.get$()[0] 
            ]:
            [ 
                $( '#' + listPage.getThisOptions().tbodyId )[0]
            ];
        
        // Show list page
        listPage.show( undefined, root );
    };
    
    var normalizeOptions = function(){
        
        var edited = [];
        
        $.each( thisOptions.fields, function ( filterFieldId, filterField ) {
            
            var newFilterField = undefined;
            
            if ( $.type( filterField ) === 'string' ){
                // Clone the field from fields if filterField is a string
                newFilterField = $.extend( true, {}, options.fields[ filterField ] );
            } else {
                // Extend the field from fields if filterField is an object
                newFilterField = $.extend( true, {}, options.fields[ filterField ], filterField );
            }
            
            //newFilterField.elementId += thisOptions.elementIdSuffix;
            newFilterField.elementId += elementIdSuffix;
            edited.push( newFilterField );
        });
        
        thisOptions.fields = edited;
    }();
    
    return {
        bindEvents: bindEvents,
        getThisOptions: getThisOptions,
        addToDataToSend: addToDataToSend
    };
};
