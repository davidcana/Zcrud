/* 
    pagingComponent class
*/
module.exports = function( optionsToApply, thisOptionsToApply, listPageToApply ) {
    "use strict";
    
    var context = require( '../context.js' );
    var pageUtils = require( './pageUtils.js' );
    var $ = require( 'jquery' );
    
    var options = optionsToApply;
    var listPage = listPageToApply;
    
    var thisOptions = thisOptionsToApply;
    var getThisOptions = function(){
        return thisOptions;
    };
    
    // Init some vars if needed
    var id = thisOptions.id;
    if ( id == undefined ){
        id = 'zcrud-paging-' + options.entityId;
    }
    if ( thisOptions.goToPageComboboxId == undefined ){
        thisOptions.goToPageComboboxId = 'zcrud-go-to-page-combobox-' + options.entityId;
    }
    if ( thisOptions.pageSizeChangeComboboxId == undefined ){
        thisOptions.pageSizeChangeComboboxId = 'zcrud-page-size-change-' + options.entityId;
    }
    
    
    var pageNumber = 1; // The current page
    var totalNumberOfRecords = undefined;
    var pageSize = parseInt( thisOptions.defaultPageSize );
    var pageSizeLocalStorageId = 'page-size';
    var thisPageSize = undefined;
    
    var loadSettings = function(){

        if ( ! options.saveUserPreferences ) {
            return;
        }
        
        var localStoragePageSize = localStorage.getItem( pageSizeLocalStorageId );
        if ( localStoragePageSize ) {
            pageSize = pageUtils.normalizeNumber( localStoragePageSize, 1, 1000000, thisOptions.defaultPageSize );
        }
    };
    
    var saveSettings = function() {
        
        if ( ! options.saveUserPreferences ) {
            return;
        }

        localStorage.setItem( pageSizeLocalStorageId, pageSize );
    };
    
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
    };
    
    var updateList = function(){
        
        listPage.show( 
            false,
            undefined, 
            [ $( '#' + listPage.getThisOptions().tbodyId )[0], $( '#' + id )[0] ] );
    };
    
    /* Changes current page to given value.
    *************************************************************************/
    var changePage = function ( newPageNumber ) {
        
        newPageNumber = pageUtils.normalizeNumber( parseInt( newPageNumber ), 1, calculatePageCount(), 1 );
        if ( newPageNumber == pageNumber ) {
            return;
        }

        pageNumber = newPageNumber;
        //alert( 'changePage: ' + pageNumber );
        
        updateList();
    };
    
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
        
        saveSettings();
        updateList();
        
        /*
        //if user sets one of the options on the combobox, then select it.
        var $pageSizeChangeCombobox = this._$bottomPanel.find('.zcrud-page-size-change select');
        if ($pageSizeChangeCombobox.length > 0) {
            if (parseInt($pageSizeChangeCombobox.val()) != pageSize) {
                var selectedOption = $pageSizeChangeCombobox.find('option[value=' + pageSize + ']');
                if (selectedOption.length > 0) {
                    $pageSizeChangeCombobox.val(pageSize);
                }
            }
        }
        */
    };
    
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
            /*
            self._$gotoPageInput = $('<input type="text" maxlength="10" value="' + self._currentPageNo + '" />')
                .appendTo(this._$gotoPageArea)
                .keypress(function(event) {
                    if (event.which == 13) { //enter
                        event.preventDefault();
                        self._changePage(parseInt(self._$gotoPageInput.val()));
                    } else if (event.which == 43) { // +
                        event.preventDefault();
                        self._changePage(parseInt(self._$gotoPageInput.val()) + 1);
                    } else if (event.which == 45) { // -
                        event.preventDefault();
                        self._changePage(parseInt(self._$gotoPageInput.val()) - 1);
                    } else {
                        //Allow only digits
                        var isValid = (
                            (47 < event.keyCode && event.keyCode < 58 && event.shiftKey == false && event.altKey == false)
                                || (event.keyCode == 8)
                                || (event.keyCode == 9)
                        );

                        if (!isValid) {
                            event.preventDefault();
                        }
                    }
                });*/

        }
    };
    
    /* Binds click events of all page links to change the page.
    *************************************************************************/
    var bindEventsToPageNumberButtons = function () {
        
        $( '#' + id )
            .find( '.zcrud-page-number,.zcrud-page-number-previous,.zcrud-page-number-next,.zcrud-page-number-first,.zcrud-page-number-last' )
            .not( '.zcrud-page-number-disabled' )
            .off() // Remove previous event handlers
            .click( function ( e ) {
                e.preventDefault();
                changePage( $( this )[ 0 ].getAttribute( 'data-page' ) );
                //changePage( $( this ).data( 'page') );
            });
    };
    
    var bindEvents = function(){
        bindEventsToPageNumberButtons();
        bindEventsToGoToPage();
        bindEventsToPageSizeChangeCombobox();
    };
    
    var getPageSizes = function(){
        return thisOptions.pageSizes;
    };
    
    var addToDataToSend = function( dataToSend ){
        dataToSend.pageNumber = parseInt( pageNumber);
        dataToSend.pageSize = parseInt( pageSize );
    };
    
    var builPageList = function( numberOfPages, pageStep, pageStart ){

        var pages = [];
        
        for ( var c = 0; c < ( numberOfPages * pageStep ); c += pageStep ) {
            pages.push( pageStart + c );
        }
        
        return pages;
    };
    
    var buildPageListInfo = function( numberOfPages ){
        
        var info = {};
        
        info.block1OfPages = [];
        info.block2OfPages = [];
        info.block3OfPages = [];
        
        var maxNumberOfAllShownPages = pageUtils.normalizeNumber( thisOptions.maxNumberOfAllShownPages, 4, 100, 4 );
        
        // Show all pages
        if ( numberOfPages < maxNumberOfAllShownPages ){
            info.block1OfPages = builPageList( numberOfPages, 1, 1 );
        
        // At first pages            
        } else if ( pageNumber < maxNumberOfAllShownPages ){
            var block2NumberOfPages = pageUtils.normalizeNumber( thisOptions.block2NumberOfPages, 2, 100, 5 );
            info.block2OfPages = builPageList( 
                block2NumberOfPages, 
                1, 
                1);
            var block3NumberOfPages = pageUtils.normalizeNumber( thisOptions.block3NumberOfPages, 0, 100, 2 );
            info.block3OfPages = builPageList( 
                block3NumberOfPages,
                1, 
                numberOfPages - block3NumberOfPages + 1 );
            
        // At last pages
        } else if ( pageNumber > ( 1 + numberOfPages - maxNumberOfAllShownPages ) ){
            info.block1OfPages = builPageList( 
                pageUtils.normalizeNumber( thisOptions.block1NumberOfPages, 0, 100, 2 ), 
                1, 
                1 );
            block2NumberOfPages = pageUtils.normalizeNumber( thisOptions.block2NumberOfPages, 2, 100, 3 );
            info.block2OfPages = builPageList( 
                block2NumberOfPages, 
                1, 
                numberOfPages - block2NumberOfPages + 1 );
            
        // Intermediate
        } else {
            info.block1OfPages = builPageList( 
                pageUtils.normalizeNumber( thisOptions.block1NumberOfPages, 0, 100, 2 ), 
                1, 
                1 );
            block2NumberOfPages = pageUtils.normalizeNumber( thisOptions.block2NumberOfPages, 3, 100, 3 );
            info.block2OfPages = builPageList( 
                block2NumberOfPages, 
                1, 
                Math.floor( pageNumber - block2NumberOfPages / 2 + 1 ) );
            block3NumberOfPages = pageUtils.normalizeNumber( thisOptions.block3NumberOfPages, 0, 100, 2 );
            info.block3OfPages = builPageList( 
                block3NumberOfPages,
                1, 
                numberOfPages - block3NumberOfPages + 1 );
        }
        
        mixBlocksOfPages( info );
        
        return info;
    };
    
    var mixBlocksOfPages = function( info ){
        
        // Mix block 2 and block 3
        var mix = mix2BlocksOfPages( info.block2OfPages, info.block3OfPages );
        if ( mix ){
            info.block2OfPages = mix;
            info.block3OfPages = [];
        }
        
        // Mix block 1 and block 2
        mix = mix2BlocksOfPages( info.block1OfPages, info.block2OfPages );
        if ( mix ){
            info.block1OfPages = mix;
            info.block2OfPages = [];
        }
    };
    
    var mix2BlocksOfPages = function( block1, block2 ){
        
        // Return block2 if block1 is empty
        if ( block1.length == 0 ){
            return block2;
        }
        
        // Check blocks are not contigous
        if ( 1 + block1[ block1.length - 1 ] < block2[ 0 ] ){
            return undefined;
        }
        
        // Check blocks are contigous: concat them
        if ( 1 + block1[ block1.length - 1 ] == block2[ 0 ] ){
            return block1.concat( block2 );
        }

        // Blocks overlap: mix them
        return block1.concat( block2.filter( function ( item ) {
            return block1.indexOf( item ) < 0;
        }));
    };
    
    var buildInfo = function(){
        
        var firstElementIndex = ( pageNumber - 1 ) * pageSize;
        var numberOfPages = calculatePageCount();
        
        return {
            pageNumber: pageNumber,
            pageSize: pageSize,
            first: 1 + firstElementIndex,
            last: 1 + firstElementIndex + thisPageSize - 1,
            totalNumberOfRecords: totalNumberOfRecords,
            numberOfPages: numberOfPages,
            goToPageList: builGoToPageList( numberOfPages ),
            pageListInfo: buildPageListInfo( numberOfPages ),
            isFirstPage: pageNumber == 1,
            isLastPage: pageNumber == numberOfPages
        };
    };
    
    var dataFromServer = function( data ){
        totalNumberOfRecords = data.totalNumberOfRecords;
        thisPageSize = data.records.length;
    };
    
    var builGoToPageList = function( numberOfPages ){

        //Skip some pages is there are too many pages
        var pageStep = 1;
        if ( numberOfPages > 10000 ) {
            pageStep = 100;
        } else if ( numberOfPages > 5000 ) {
            pageStep = 10;
        } else if ( numberOfPages > 2000 ) {
            pageStep = 5;
        } else if ( numberOfPages > 1000 ) {
            pageStep = 2;
        }
        
        var pages = [];
        
        for ( var c = pageStep; c <= numberOfPages; c += pageStep ) {
            pages.push( c );
        }
        
        return pages;
    };
    
    var calculatePageCount = function (){

        var pageCount = Math.floor( totalNumberOfRecords / pageSize );
        if ( totalNumberOfRecords % pageSize != 0 ) {
            ++pageCount;
        }

        return pageCount;
    };

    var getPageSize = function(){
        return pageSize;
    };

    var setPageNumber = function( pageNumberToSet ){
        pageNumber = pageNumberToSet;
    };
    
    var goToFirstPage = function(){
        setPageNumber( 1 );
    };
    
    var getId = function(){
        return id;
    };
    
    loadSettings();
    
    return {
        getPageSizes: getPageSizes,
        addToDataToSend: addToDataToSend,
        dataFromServer: dataFromServer,
        buildInfo: buildInfo,
        bindEvents: bindEvents,
        getPageSize: getPageSize,
        getThisOptions: getThisOptions,
        setPageNumber: setPageNumber,
        goToFirstPage: goToFirstPage,
        getId: getId
    };
};
