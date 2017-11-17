/* 
    filteringComponent class
*/
module.exports = function( optionsToApply, thisOptionsToApply, listPageToApply ) {
    "use strict";
    
    var context = require( '../context.js' );
    var $ = require( 'jquery' );
    var pageUtils = require( './pageUtils.js' );
    var fieldBuilder = require( '../fields/fieldBuilder' );
    
    var options = optionsToApply;
    var listPage = listPageToApply;
    
    var thisOptions = thisOptionsToApply;
    var getThisOptions = function(){
        return thisOptions;
    };
    
    var filterRecord = undefined;
    
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
        listPage.getComponent( 'paging' ).goToFirstPage();
        updateList();
    };
    
    var buildFilterRecordFromForm = function(){
        
        var record = {};

        for ( var c = 0; c < thisOptions.fields.length; c++ ) {
            var field = thisOptions.fields[ c ];
            var value = fieldBuilder.getValueFromForm( field, options );
            
            if ( value != undefined && value != '' ){
                record[ field.id ] = value;
            }
        }
        
        return record;
    };
    
    var addToDataToSend = function( dataToSend ){

        var extendedFilter = $.extend( true, {}, filterRecord, dataToSend.filter );
        if ( ! $.isEmptyObject( extendedFilter ) ){
            dataToSend.filter = extendedFilter;
        }
    };
    
    var updateList = function(){
        //listPage.show( false );
        
        listPage.show( 
            false,
            undefined, 
            [ $( '#' + listPage.getThisOptions().tbodyId )[0], $( '#' + listPage.getComponent( 'paging' ).getId() )[0] ] );
    };
    
    var normalizeOptions = function(){
        
        var edited = [];
        
        $.each( thisOptions.fields, function ( filterFieldId, filterField ) {
            
            var newFilterField = undefined;
            
            if ( $.type( filterField ) === 'string' ){
                newFilterField = options.fields[ filterField ];
            } else {
                newFilterField = filterField;
            }
            
            newFilterField.elementId += thisOptions.elementIdSuffix;
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
