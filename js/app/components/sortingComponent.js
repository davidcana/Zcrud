/* 
    sortingComponent class
*/
module.exports = function( optionsToApply, thisOptionsToApply, parentToApply ) {
    "use strict";
    
    var context = require( '../context.js' );
    var $ = require( 'jquery' );
    
    var options = optionsToApply;
    var parent = parentToApply;
    
    var thisOptions = thisOptionsToApply;
    var getThisOptions = function(){
        return thisOptions;
    };
    
    var sortFieldId = thisOptions.default.fieldId;
    var sortType = thisOptions.default.type;
    var sortFieldIdLocalStorageId = 'sort-field-id';
    var sortTypeLocalStorageId = 'sort-type';
    
    var loadSettings = function(){

        if ( ! options.saveUserPreferences || ! thisOptions.loadFromLocalStorage ) {
            return;
        }
        
        var sortFieldIdLocalStorage = localStorage.getItem( sortFieldIdLocalStorageId );
        if ( sortFieldIdLocalStorage ) {
            sortFieldId = sortFieldIdLocalStorage;
        }
        
        var sortTypeLocalStorage = localStorage.getItem( sortTypeLocalStorageId );
        if ( sortTypeLocalStorage ) {
            sortType = sortTypeLocalStorage;
        }
    };
    
    var saveSettings = function() {
        
        if ( ! options.saveUserPreferences ) {
            return;
        }

        localStorage.setItem( sortFieldIdLocalStorageId, sortFieldId );
        localStorage.setItem( sortTypeLocalStorageId, sortType );
    };
    
    /*
    var bindEvents = function(){
        
        $( '#' + parent.getId() )
            .find( '.zcrud-column-header-sortable' )
            .off() // Remove previous event handlers
            .click( function ( e ) {
                e.preventDefault();
                changeSort( 
                    $( this ).data( 'sort-field-id'), 
                    $( this ).data( 'sort-type' ) );
        });
    };*/
    var bindEvents = function(){

        parent.get$()
            .find( '.zcrud-column-header-sortable' )
            .off() // Remove previous event handlers
            .click( 
                function ( e ) {
                    e.preventDefault();
                    changeSort( 
                        $( this ).data( 'sort-field-id'), 
                        $( this ).data( 'sort-type' ) );
                }
            );
    };
    
    var changeSort = function ( formFieldId, formType ) {
        
        // Update sortFieldId
        sortFieldId = formFieldId;
        
        // Update sortType
        if ( ! formType ){
            sortType = 'asc';
        } else {
            sortType = formType == 'asc'? 'desc': 'asc';
        }
        
        saveSettings();
        updateParent();
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
        
        parent.show( 
            {
                root: [ $( '#' + parent.getThisOptions().tableId )[0] ] 
            }
        );
    };
    
    var addToDataToSend = function( dataToSend ){
        
        if ( sortFieldId ){
            dataToSend.sortFieldId = sortFieldId;
        }
        
        if ( sortType ){
            dataToSend.sortType = sortType;
        }
    };
    
    var getSortFieldId = function(){
        return sortFieldId;
    };

    var getSortType = function(){
        return sortType;
    };
    
    var getTypeForFieldId = function( fieldId ){
        return fieldId !== sortFieldId? null: sortType;
    };
    
    loadSettings();
    
    return {
        addToDataToSend: addToDataToSend,
        bindEvents: bindEvents,
        getThisOptions: getThisOptions,
        getSortFieldId: getSortFieldId,
        getSortType: getSortType,
        getTypeForFieldId: getTypeForFieldId
    };
};
