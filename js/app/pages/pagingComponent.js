/* 
    pagingComponent singleton class
*/
module.exports = function( optionsToApply ) {
    "use strict";
    
    var pageUtils = require( './pageUtils.js' );
    var $ = require( 'jquery' );
    
    var options = optionsToApply;
    var thisOptions = options.paging;
    var $pagingComponent = thisOptions.isOn? $( '#pagingComponent' ): undefined;
    var $pageSizeChangeCombobox = thisOptions.pageSizeChangeArea? $( '#' + thisOptions.pageSizeChangeComboboxId ): undefined;
    var pageNumber = 1; // The current page
    var totalNumberOfRecords = undefined;
    
    var loadPagingSettings = function(){

        if ( ! options.saveUserPreferences ) {
            return;
        }
        
        var pageSize = localStorage.getItem( 'page-size' );
        if ( pageSize ) {
            thisOptions.pageSize = pageUtils.normalizeNumber( pageSize, 1, 1000000, thisOptions.pageSize );
        }
    };
    
    var savePagingSettings = function() {
        
        if ( ! options.saveUserPreferences ) {
            return;
        }

        localStorage.setItem( 'page-size', options.pageSize );
    };
    
    var bindEventsToPageSizeChangeCombobox = function(){
        
        if ( ! thisOptions.pageSizeChangeArea ) {
            return;
        }
        /*
        //Select current page size
        $pageSizeChangeCombobox.val( thisOptions.pageSize );

        //Change page size on combobox change
        $pageSizeChangeCombobox.change( function() {
            changePageSize(
                parseInt( $( this ).val() ) );
        });
        */
    };
    
    var changePageSize = function( pageSize ) {
        
        if ( pageSize == thisOptions.pageSize ) {
            return;
        }

        thisOptions.pageSize = pageSize;
        /*
        //Normalize current page
        var pageCount = this._calculatePageCount();
        if (this._currentPageNo > pageCount) {
            this._currentPageNo = pageCount;
        }
        if (this._currentPageNo <= 0) {
            this._currentPageNo = 1;
        }

        //if user sets one of the options on the combobox, then select it.
        var $pageSizeChangeCombobox = this._$bottomPanel.find('.jtable-page-size-change select');
        if ($pageSizeChangeCombobox.length > 0) {
            if (parseInt($pageSizeChangeCombobox.val()) != pageSize) {
                var selectedOption = $pageSizeChangeCombobox.find('option[value=' + pageSize + ']');
                if (selectedOption.length > 0) {
                    $pageSizeChangeCombobox.val(pageSize);
                }
            }
        }

        this._savePagingSettings();
        this._reloadTable();
        */
    };
    
    var bindEventsToGoToPage = function() {
        
        if ( ! thisOptions.gotoPageArea || thisOptions.gotoPageArea == 'none' ) {
            return;
        }
        /*
        //Goto page input
        if (self.options.gotoPageArea == 'combobox') {

            self._$gotoPageInput = $('<select></select>')
                .appendTo(this._$gotoPageArea)
                .data('pageCount', 1)
                .change(function() {
                    self._changePage(parseInt($(this).val()));
                });
            self._$gotoPageInput.append('<option value="1">1</option>');

        } else { //textbox

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
                });

        }*/
    };
    
    var addPagingInfoToUrl = function (url, pageNumber) {
        /*
        if (!this.options.paging) {
            return url;
        }

        var jtStartIndex = (pageNumber - 1) * this.options.pageSize;
        var jtPageSize = this.options.pageSize;

        return (url + (url.indexOf('?') < 0 ? '?' : '&') + 'jtStartIndex=' + jtStartIndex + '&jtPageSize=' + jtPageSize);
        */
    };
    
    /* Binds click events of all page links to change the page.
    *************************************************************************/
    var bindEventsToPageNumberButtons = function () {
        $( '.zcrud-page-number,.zcrud-page-number-previous,.zcrud-page-number-next,.zcrud-page-number-first,.zcrud-page-number-last' )
            .not( '.zcrud-page-number-disabled' )
            .click( function ( e ) {
                e.preventDefault();
                changePage( $( this ).data( 'page') );
            });
        /*
        $pagingComponent
            //.find( '.zcrud-page-number' )
            .find( '.zcrud-page-number,.zcrud-page-number-previous,.zcrud-page-number-next,.zcrud-page-number-first,.zcrud-page-number-last' )
            .not( '.zcrud-page-number-disabled' )
            .click( function ( e ) {
                e.preventDefault();
                changePage( $( this ).data( 'pageNumber') );
            });*/
    };
    
    /* Changes current page to given value.
    *************************************************************************/
    var changePage = function ( newPageNumber ) {
        alert( 'changePage: ' + newPageNumber );
        /*
        pageNo = this._normalizeNumber(pageNo, 1, this._calculatePageCount(), 1);
        if (pageNo == this._currentPageNo) {
            this._refreshGotoPageInput();
            return;
        }

        this._currentPageNo = pageNo;
        this._reloadTable();
        */
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
        dataToSend.pageNumber = pageNumber;
        dataToSend.pageSize = thisOptions.pageSize;
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
            var block2NumberOfPages = pageUtils.normalizeNumber( thisOptions.block2NumberOfPages, 5, 100, 5 );
            info.block2OfPages = builPageList( 
                block2NumberOfPages, 
                1, 
                1);
            var block3NumberOfPages = pageUtils.normalizeNumber( thisOptions.pagesOfLastBlock, 2, 100, 2 );
            info.block3OfPages = builPageList( 
                block3NumberOfPages,
                1, 
                numberOfPages - block3NumberOfPages + 1 );
            
        // At last pages
        } else if ( pageNumber > ( numberOfPages - maxNumberOfAllShownPages ) ){
            info.block1OfPages = builPageList( 
                pageUtils.normalizeNumber( thisOptions.pagesOfFirstBlock, 2, 100, 2 ), 
                1, 
                1 );
            var block2NumberOfPages = pageUtils.normalizeNumber( thisOptions.block2NumberOfPages, 3, 100, 3 );
            info.block2OfPages = builPageList( 
                block2NumberOfPages, 
                1, 
                numberOfPages - block2NumberOfPages + 1 );
            
        // Intermediate
        } else {
            info.block1OfPages = builPageList( 
                pageUtils.normalizeNumber( thisOptions.pagesOfFirstBlock, 2, 100, 2 ), 
                1, 
                1 );
            var block2NumberOfPages = pageUtils.normalizeNumber( thisOptions.block2NumberOfPages, 3, 100, 3 );
            info.block2OfPages = builPageList( 
                block2NumberOfPages, 
                1, 
                Math.floor( numberOfPages / 2 - block2NumberOfPages / 2 ) );
            var block3NumberOfPages = pageUtils.normalizeNumber( thisOptions.pagesOfLastBlock, 2, 100, 2 );
            info.block3OfPages = builPageList( 
                block3NumberOfPages,
                1, 
                numberOfPages - block3NumberOfPages + 1 );
        }
        
        return info;
    };
    
    var buildInfo = function(){
        
        var firstElementIndex = ( pageNumber - 1 ) * thisOptions.pageSize;
        var numberOfPages = calculatePageCount();
        
        return {
            pageNumber: pageNumber,
            pageSize: thisOptions.pageSize,
            first: 1 + firstElementIndex,
            last: 1 + firstElementIndex + thisOptions.pageSize,
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

        var pageCount = Math.floor( totalNumberOfRecords / thisOptions.pageSize );
        if ( totalNumberOfRecords % thisOptions.pageSize != 0 ) {
            ++pageCount;
        }

        return pageCount;
    };
    
    return {
        getPageSizes: getPageSizes,
        addToDataToSend: addToDataToSend,
        dataFromServer: dataFromServer,
        buildInfo: buildInfo,
        bindEvents: bindEvents
    };
};
