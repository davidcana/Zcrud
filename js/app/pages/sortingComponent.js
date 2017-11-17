/* 
    sortingComponent class
*/
module.exports = function( optionsToApply, thisOptionsToApply, listPageToApply ) {
    "use strict";
    
    var context = require( '../context.js' );
    var $ = require( 'jquery' );
    
    var options = optionsToApply;
    var listPage = listPageToApply;
    
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
    
    var bindEvents = function(){
        
        $( '#' + listPage.getId() )
            .find( '.zcrud-column-header-sortable' )
            .off() // Remove previous event handlers
            .click( function ( e ) {
                e.preventDefault();
                //alert( 'Sort!\nfield: ' + $( this ).data( 'sort-field-id' ) + '\ntype: ' + $( this ).data( 'sort-type' ) );
                changeSort( 
                    $( this ).data( 'sort-field-id'), 
                    $( this ).data( 'sort-type' ) );
        });
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
        
        //alert( 'changeSort\nfield: ' + sortFieldId + '\ntype: ' + sortType );
        saveSettings();
        updateList();
    };
    
    var updateList = function(){
        
        listPage.show( 
            false,
            undefined, 
            [ $( '#' + listPage.getThisOptions().tableId )[0] ] );
    };
    
    var addToDataToSend = function( dataToSend ){
        
        if ( sortFieldId ){
            dataToSend.sortFieldId = sortFieldId;
        }
        
        if ( sortType ){
            dataToSend.sortType = sortType;
        }
    };
    
    var dataFromServer = function( data ){
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
        dataFromServer: dataFromServer,
        bindEvents: bindEvents,
        getThisOptions: getThisOptions,
        getSortFieldId: getSortFieldId,
        getSortType: getSortType,
        getTypeForFieldId: getTypeForFieldId
    };
};
