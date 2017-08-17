/* 
    sortingComponent class
*/
module.exports = function( optionsToApply ) {
    "use strict";
    
    var context = require( '../context.js' );
    var $ = require( 'jquery' );
    
    var options = optionsToApply;
    
    var thisOptions = options.sorting;
    var sortFieldId = thisOptions.default.fieldId;
    var sortType = thisOptions.default.type;
    var sortFieldIdLocalStorageId = 'sort-field-id';
    var sortTypeLocalStorageId = 'sort-type';
    
    var loadSettings = function(){

        if ( ! options.saveUserPreferences ) {
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
    
    var saveSortingSettings = function() {
        
        if ( ! options.saveUserPreferences ) {
            return;
        }

        localStorage.setItem( sortFieldIdLocalStorageId, sortFieldId );
        localStorage.setItem( sortTypeLocalStorageId, sortType );
    };
    /*
    var bindEventsToPageSizeChangeCombobox = function(){
        
        if ( ! thisOptions.pageSizeChangeArea ) {
            return;
        }

        // Change page size on combobox change
        $( '#' + thisOptions.pageSizeChangeComboboxId )
            .off() // Remove previous event handlers
            .change( function() {
                changePageSize(
                    parseInt( $( this ).val() ) );
            });
    };*/
    /*
    var updateList = function(){
        //context.getMainPage().show( false );
        
        context.getMainPage().show( 
            false,
            undefined, 
            [ $( '#' + options.currentList.tbodyId )[0], $( '#' + thisOptions.pagingComponentId )[0] ] );
    };*/
    
    /* Changes current page to given value.
    *************************************************************************/
    /*
    var changePage = function ( newPageNumber ) {
        
        newPageNumber = pageUtils.normalizeNumber( parseInt( newPageNumber ), 1, calculatePageCount(), 1 );
        if ( newPageNumber == pageNumber ) {
            return;
        }

        pageNumber = newPageNumber;
        //alert( 'changePage: ' + pageNumber );
        
        updateList();
    };*/
    /*
    var changePageSize = function( newPageSize ) {
        
        // If newPageSize is not in pageSizes return
        if ( -1 == thisOptions.pageSizes.indexOf( newPageSize ) ){
            return;
        }
        
        if ( newPageSize == pageSize ) {
            return;
        }

        pageSize = parseInt( newPageSize );
        pageNumber = 1;
        //alert( 'changePageSize:' + pageSize );
        
        savePagingSettings();
        updateList();
    };*/
    /*
    var bindEventsToGoToPage = function() {
        
        if ( ! thisOptions.gotoPageArea || thisOptions.gotoPageArea == 'none' ) {
            return;
        }
        
        // Goto page input
        if ( thisOptions.gotoPageArea == 'combobox' ) {
            $( '#' + thisOptions.goToPageComboboxId )
                .off() // Remove previous event handlers
                .change( function() {
                changePage(
                    parseInt( $( this ).val() ) );
            });

        } else { //textbox
            // TODO Implement this
        }
    };*/
    
    /* Binds click events of all page links to change the page.
    *************************************************************************/
    /*
    var bindEventsToPageNumberButtons = function () {
        
        $( '#' + thisOptions.pagingComponentId )
            .find( '.zcrud-page-number,.zcrud-page-number-previous,.zcrud-page-number-next,.zcrud-page-number-first,.zcrud-page-number-last' )
            .not( '.zcrud-page-number-disabled' )
            .off() // Remove previous event handlers
            .click( function ( e ) {
                e.preventDefault();
                changePage( $( this ).data( 'page') );
            });
    };*/
    
    var bindEvents = function(){
        /*
        bindEventsToPageNumberButtons();
        bindEventsToGoToPage();
        bindEventsToPageSizeChangeCombobox();*/
    };
    
    var addToDataToSend = function( dataToSend ){
        dataToSend.sortFieldId = sortFieldId;
        dataToSend.sortType = sortType;
    };
    
    var dataFromServer = function( data ){
        /*
        totalNumberOfRecords = data.totalNumberOfRecords;
        thisPageSize = data.records.length;*/
    };

    var getThisOptions = function(){
        return thisOptions;
    };
        
    loadSettings();
    
    return {
        addToDataToSend: addToDataToSend,
        dataFromServer: dataFromServer,
        bindEvents: bindEvents,
        getThisOptions: getThisOptions
    };
};
