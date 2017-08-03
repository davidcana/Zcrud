/* 
    pagingComponent singleton class
*/
module.exports = function( optionsToApply ) {
    "use strict";
    
    var pageUtils = require( './pageUtils.js' );
    var $ = require( 'jquery' );
    
    var options = optionsToApply;
    var thisOptions = options.paging;
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
    
    var addJavascriptForPageSizeChangeCombobox = function(){
        
        if ( ! options.pageSizeChangeArea ) {
            return;
        }
        
        //Select current page size
        $pageSizeChangeCombobox.val( thisOptions.pageSize );

        //Change page size on combobox change
        $pageSizeChangeCombobox.change( function() {
            changePageSize(
                parseInt( $( this ).val() ) );
        });
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
    
    var createGotoPageInput = function() {
        
        if ( ! thisOptions.gotoPageArea || thisOptions.gotoPageArea == 'none' ) {
            return;
        }
        /*

        //Add a span to contain goto page items
        this._$gotoPageArea = $('<span></span>')
            .addClass('jtable-goto-page')
            .appendTo(self._$bottomPanel.find('.jtable-left-area'));

        //Goto page label
        this._$gotoPageArea.append('<span>' + self.options.messages.gotoPageLabel + ': </span>');

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
    
    var refreshGotoPageInput = function() {
        
        if ( ! thisOptions.gotoPageArea || thisOptions.gotoPageArea == 'none' ) {
            return;
        }
        /*
        if (this._totalRecordCount <= 0) {
            this._$gotoPageArea.hide();
        } else {
            this._$gotoPageArea.show();
        }

        if (this.options.gotoPageArea == 'combobox') {
            var oldPageCount = this._$gotoPageInput.data('pageCount');
            var currentPageCount = this._calculatePageCount();
            if (oldPageCount != currentPageCount) {
                this._$gotoPageInput.empty();

                //Skip some pages is there are too many pages
                var pageStep = 1;
                if (currentPageCount > 10000) {
                    pageStep = 100;
                } else if (currentPageCount > 5000) {
                    pageStep = 10;
                } else if (currentPageCount > 2000) {
                    pageStep = 5;
                } else if (currentPageCount > 1000) {
                    pageStep = 2;
                }

                for (var i = pageStep; i <= currentPageCount; i += pageStep) {
                    this._$gotoPageInput.append('<option value="' + i + '">' + i + '</option>');
                }

                this._$gotoPageInput.data('pageCount', currentPageCount);
            }
        }

        //same for 'textbox' and 'combobox'
        this._$gotoPageInput.val(this._currentPageNo);
        */
    };
    
    var onRecordsLoaded = function (data) {
        /*
        if (this.options.paging) {
            this._totalRecordCount = data.TotalRecordCount;
            this._createPagingList();
            this._createPagingInfo();
            this._refreshGotoPageInput();
        }

        base._onRecordsLoaded.apply(this, arguments);
        */
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
    
    var createPagingList = function () {
        /*
        if (this.options.pageSize <= 0) {
            return;
        }

        this._$pagingListArea.empty();
        if (this._totalRecordCount <= 0) {
            return;
        }

        var pageCount = this._calculatePageCount();

        this._createFirstAndPreviousPageButtons();
        if (this.options.pageList == 'normal') {
            this._createPageNumberButtons(this._calculatePageNumbers(pageCount));
        }
        this._createLastAndNextPageButtons(pageCount);
        this._bindClickEventsToPageNumberButtons();
        */
    };
    
    var createPageNumberButtons = function (pageNumbers) {
        /*
        var previousNumber = 0;
        for (var i = 0; i < pageNumbers.length; i++) {
            //Create "..." between page numbers if needed
            if ((pageNumbers[i] - previousNumber) > 1) {
                $('<span></span>')
                    .addClass('jtable-page-number-space')
                    .html('...')
                    .appendTo(this._$pagingListArea);
            }

            this._createPageNumberButton(pageNumbers[i]);
            previousNumber = pageNumbers[i];
        }
        */
    };
    
    /* Binds click events of all page links to change the page.
    *************************************************************************/
    var bindClickEventsToPageNumberButtons = function () {
        /*
        var self = this;
        self._$pagingListArea
            .find('.jtable-page-number,.jtable-page-number-previous,.jtable-page-number-next,.jtable-page-number-first,.jtable-page-number-last')
            .not('.jtable-page-number-disabled')
            .click(function (e) {
                e.preventDefault();
                self._changePage($(this).data('pageNumber'));
            });
            */
    };
    
    /* Changes current page to given value.
    *************************************************************************/
    var changePage = function (pageNo) {
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
    
    var getPageSizes = function(){
        return thisOptions.pageSizes;
    };
    
    var addToDataToSend = function( dataToSend ){
        dataToSend.pageNumber = pageNumber;
        dataToSend.pageSize = thisOptions.pageSize;
    };

    /* Calculates page numbers and returns an array of these numbers.
    *************************************************************************/
    var calculatePageNumbers = function (pageCount) {
        /*
        if (pageCount <= 4) {
            //Show all pages
            var pageNumbers = [];
            for (var i = 1; i <= pageCount; ++i) {
                pageNumbers.push(i);
            }

            return pageNumbers;
        } else {
            //show first three, last three, current, previous and next page numbers
            var shownPageNumbers = [1, 2, pageCount - 1, pageCount];
            var previousPageNo = this._normalizeNumber(this._currentPageNo - 1, 1, pageCount, 1);
            var nextPageNo = this._normalizeNumber(this._currentPageNo + 1, 1, pageCount, 1);

            this._insertToArrayIfDoesNotExists(shownPageNumbers, previousPageNo);
            this._insertToArrayIfDoesNotExists(shownPageNumbers, this._currentPageNo);
            this._insertToArrayIfDoesNotExists(shownPageNumbers, nextPageNo);

            shownPageNumbers.sort(function (a, b) { return a - b; });
            return shownPageNumbers;
        }
        */
    };
    
    var builPageList = function( numberOfPages, pageStep, pageStart ){

        var pages = [];
        
        for ( var c = pageStart; c < numberOfPages; c += pageStep ) {
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
        if ( numberOfPages < maxNumberOfAllShownPages ){
            info.block2OfPages = builPageList( numberOfPages, 1, 1 );
        } else {
            info.block1OfPages = builPageList( 
                pageUtils.normalizeNumber( thisOptions.block1NumberOfPages, 2, 100, 2 ), 
                1, 
                1 );
            var block2NumberOfPages = pageUtils.normalizeNumber( thisOptions.block2NumberOfPages, 3, 100, 3 );
            info.block2OfPages = builPageList( 
                block2NumberOfPages, 
                1, 
                Math.floor( pageNumber / 2 - block2NumberOfPages / 2 ) );
            info.block3OfPages = builPageList( 
                pageUtils.normalizeNumber( thisOptions.block3NumberOfPages, 2, 100, 2 ),
                1, 
                numberOfPages - 2 );
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
        buildInfo: buildInfo
    };
};
