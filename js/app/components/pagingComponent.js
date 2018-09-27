/* 
    PagingComponent class
*/
"use strict";

var context = require( '../context.js' );
var Component = require( './component.js' );
var pageUtils = require( '../pages/pageUtils.js' );
var $ = require( 'jquery' );

var PagingComponent = function( optionsToApply, thisOptionsToApply, parentToApply ) {

    Component.call( this, optionsToApply, thisOptionsToApply, parentToApply );
    
    this.cssClass = 'zcrud-bottom-panel';
    
    // Init some vars if needed
    if ( this.thisOptions.goToPageFieldClass == undefined ){
        this.thisOptions.goToPageFieldClass = 'zcrud-go-to-page-field';
    }
    if ( this.thisOptions.pageSizeChangeFieldClass == undefined ){
        this.thisOptions.pageSizeChangeFieldClass = 'zcrud-page-size-change-field';
    }
    
    this.pageNumber = 1; // The current page
    this.totalNumberOfRecords = undefined;
    this.pageSize = parseInt( this.thisOptions.defaultPageSize );
    this.pageSizeLocalStorageId = 'page-size';
    this.thisPageSize = undefined;
    this.records = undefined;
    this.localStorage = localStorage;

    this.loadSettings();
};
Component.doSuperClassOf( PagingComponent );

PagingComponent.prototype.getClass = function(){
    return this.cssClass;
};

PagingComponent.prototype.getRecords = function(){
    return this.records;
};

PagingComponent.prototype.loadSettings = function(){

    if ( ! this.options.saveUserPreferences ) {
        return;
    }

    var localStoragePageSize = this.localStorage.getItem( this.pageSizeLocalStorageId );
    if ( localStoragePageSize ) {
        this.pageSize = pageUtils.normalizeNumber( 
            localStoragePageSize, 
            1, 
            1000000, 
            this.thisOptions.defaultPageSize
        );
    }
};

PagingComponent.prototype.saveSettings = function() {

    if ( ! this.options.saveUserPreferences ) {
        return;
    }

    this.localStorage.setItem( this.pageSizeLocalStorageId, this.pageSize );
};

PagingComponent.prototype.bindEventsToPageSizeChangeCombobox = function(){

    if ( ! this.thisOptions.pageSizeChangeArea ) {
        return;
    }

    // Change page size on combobox change
    var instance = this;
    this.get$().find( '.' + this.thisOptions.pageSizeChangeFieldClass )
        .off() // Remove previous event handlers
        .change( 
            function() {
                instance.changePageSize(
                    parseInt( $( this ).val() )
                );
            }
    );
};

PagingComponent.prototype.updateParent = function(){

    if ( this.parent.type == 'subform' ){
        this.parent.update();
        return;
    }

    this.parent.show( 
        {
            root: [ $( '#' + this.parent.getThisOptions().tbodyId )[0], this.get$()[0] ] 
        }
    );
};

PagingComponent.prototype.processDirty = function( callback ){

    if ( ! this.parent.isDirty() ){
        callback();
        return;
    }

    // Component is dirty!
    var instance = this;
    context.confirm(
        this.options,
        {
            title: context.translate( 'dirtyPagingTitle' ),
            text: context.translate( 'dirtyPagingText' ),
            className: "wideConfirm",
            buttons: {
                cancel: context.translate( 'dirtyPagingCancel' ),
                /*save: {
                        text: context.translate( 'dirtyPagingSave' ),
                        value: "save",
                    },*/
                discard: {
                    text: context.translate( 'dirtyPagingDiscard' ),
                    value: "discard",
                }
            }
        },
        function( value ){
            switch ( value ) {
                case "discard":
                    instance.parent.removeChanges();
                    callback();
                    break;
            }
        }
    );
};

// Change current page to given value
PagingComponent.prototype.changePage = function ( newPageNumber ) {

    var instance = this;
    this.processDirty(
        function(){
            instance.doChangePage( newPageNumber );
        }
    );
};

PagingComponent.prototype.doChangePage = function( newPageNumber ) {

    newPageNumber = pageUtils.normalizeNumber( parseInt( newPageNumber ), 1, this.calculatePageCount(), 1 );
    if ( newPageNumber == this.pageNumber ) {
        return;
    }

    this.pageNumber = newPageNumber;

    this.updateParent();
}

PagingComponent.prototype.changePageSize = function( newPageSize ) {

    // If newPageSize is not in pageSizes return
    if ( -1 == this.thisOptions.pageSizes.indexOf( newPageSize ) ){
        return;
    }

    // If the new size is the current size return
    if ( newPageSize == this.pageSize ) {
        return;
    }
    
    var instance = this;
    this.processDirty(
        function(){
            instance.doChangePageSize( newPageSize );
        }
    );
};

PagingComponent.prototype.doChangePageSize = function( newPageSize ) {

    this.pageSize = parseInt( newPageSize );
    this.pageNumber = 1;

    this.saveSettings();

    this.updateParent();
}

PagingComponent.prototype.bindEventsToGoToPage = function() {
    
    var instance = this;
    
    if ( ! this.thisOptions.gotoPageFieldType || this.thisOptions.gotoPageFieldType == 'none' ) {
        return;
    }

    // Goto page input
    if ( this.thisOptions.gotoPageFieldType == 'combobox' ) {
        this.get$().find( '.' + this.thisOptions.goToPageFieldClass )
            .off() // Remove previous event handlers
            .change( 
                function() {
                    instance.changePage(
                        parseInt( $( this ).val() ) );
                }
            );
        return;

    } else if ( this.thisOptions.gotoPageFieldType == 'textbox' ) {
        this.get$().find( '.' + this.thisOptions.goToPageFieldClass )
            .off() // Remove previous event handlers
            .keypress( 
                function( event ) {
                    if ( event.which == 13 ) { // enter
                        event.preventDefault();
                        instance.changePage(
                            parseInt( $( this ).val() ) );
                    } else if ( event.which == 43 ) { // +
                        event.preventDefault();
                        instance.changePage( instance.pageNumber + 1 );
                        instance.get$().find( '.' + instance.thisOptions.goToPageFieldClass ).focus();
                    } else if ( event.which == 45 ) { // -
                        event.preventDefault();
                        instance.changePage( instance.pageNumber - 1 );
                        instance.get$().find( '.' + instance.thisOptions.goToPageFieldClass ).focus();
                    } else {
                        // Allow only digits
                        var isValid =
                            ( 47 < event.keyCode && event.keyCode < 58 && event.shiftKey == false && event.altKey == false )
                            || ( event.keyCode == 8 )
                            || ( event.keyCode == 9 );

                        if ( ! isValid ) {
                            event.preventDefault();
                        }
                    }
                }
            );
        return;
    }

    throw 'Not valid paging component / gotoPageFieldType value:' + this.thisOptions.gotoPageFieldType;
};

// Bind click events of all page links to change the page
PagingComponent.prototype.bindEventsToPageNumberButtons = function () {
    
    var instance = this;
    this.get$()
        .find( '.zcrud-page-number,.zcrud-page-number-previous,.zcrud-page-number-next,.zcrud-page-number-first,.zcrud-page-number-last' )
        .not( '.zcrud-page-number-disabled' )
        .off() // Remove previous event handlers
        .click( 
            function ( e ) {
                e.preventDefault();
                instance.changePage( $( this )[ 0 ].getAttribute( 'data-page' ) );
            }
        );
};

PagingComponent.prototype.bindEvents = function(){
    
    this.bindEventsToPageNumberButtons();
    this.bindEventsToGoToPage();
    this.bindEventsToPageSizeChangeCombobox();
};

PagingComponent.prototype.getPageSizes = function(){
    return this.thisOptions.pageSizes;
};

PagingComponent.prototype.addToDataToSend = function( dataToSend ){
    dataToSend.pageNumber = parseInt( this.pageNumber);
    dataToSend.pageSize = parseInt( this.pageSize );
};

PagingComponent.prototype.builPageList = function( numberOfPages, pageStep, pageStart ){

    var pages = [];

    for ( var c = 0; c < ( numberOfPages * pageStep ); c += pageStep ) {
        pages.push( pageStart + c );
    }

    return pages;
};

PagingComponent.prototype.buildPageListInfo = function( numberOfPages ){

    var info = {};

    info.block1OfPages = [];
    info.block2OfPages = [];
    info.block3OfPages = [];

    var maxNumberOfAllShownPages = pageUtils.normalizeNumber( this.thisOptions.maxNumberOfAllShownPages, 4, 100, 4 );

    // Show all pages
    if ( numberOfPages < maxNumberOfAllShownPages ){
        info.block1OfPages = this.builPageList( numberOfPages, 1, 1 );

    // At first pages            
    } else if ( this.pageNumber < maxNumberOfAllShownPages ){
        var block2NumberOfPages = pageUtils.normalizeNumber( this.thisOptions.block2NumberOfPages, 2, 100, 5 );
        info.block2OfPages = this.builPageList( 
            block2NumberOfPages, 
            1, 
            1);
        var block3NumberOfPages = pageUtils.normalizeNumber( this.thisOptions.block3NumberOfPages, 0, 100, 2 );
        info.block3OfPages = this.builPageList( 
            block3NumberOfPages,
            1, 
            numberOfPages - block3NumberOfPages + 1 );

    // At last pages
    } else if ( this.pageNumber > ( 1 + numberOfPages - maxNumberOfAllShownPages ) ){
        info.block1OfPages = this.builPageList( 
            pageUtils.normalizeNumber( this.thisOptions.block1NumberOfPages, 0, 100, 2 ), 
            1, 
            1 );
        block2NumberOfPages = pageUtils.normalizeNumber( this.thisOptions.block2NumberOfPages, 2, 100, 3 );
        info.block2OfPages = this.builPageList( 
            block2NumberOfPages, 
            1, 
            numberOfPages - block2NumberOfPages + 1 );

    // Intermediate
    } else {
        info.block1OfPages = this.builPageList( 
            pageUtils.normalizeNumber( this.thisOptions.block1NumberOfPages, 0, 100, 2 ), 
            1, 
            1 );
        block2NumberOfPages = pageUtils.normalizeNumber( this.thisOptions.block2NumberOfPages, 3, 100, 3 );
        info.block2OfPages = this.builPageList( 
            block2NumberOfPages, 
            1, 
            Math.floor( this.pageNumber - block2NumberOfPages / 2 + 1 ) );
        block3NumberOfPages = pageUtils.normalizeNumber( this.thisOptions.block3NumberOfPages, 0, 100, 2 );
        info.block3OfPages = this.builPageList( 
            block3NumberOfPages,
            1, 
            numberOfPages - block3NumberOfPages + 1 );
    }

    this.mixBlocksOfPages( info );

    return info;
};

PagingComponent.prototype.mixBlocksOfPages = function( info ){

    // Mix block 2 and block 3
    var mix = this.mix2BlocksOfPages( info.block2OfPages, info.block3OfPages );
    if ( mix ){
        info.block2OfPages = mix;
        info.block3OfPages = [];
    }

    // Mix block 1 and block 2
    mix = this.mix2BlocksOfPages( info.block1OfPages, info.block2OfPages );
    if ( mix ){
        info.block1OfPages = mix;
        info.block2OfPages = [];
    }
};

PagingComponent.prototype.mix2BlocksOfPages = function( block1, block2 ){

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

PagingComponent.prototype.buildInfo = function(){

    var firstElementIndex = ( this.pageNumber - 1 ) * this.pageSize;
    var numberOfPages = this.calculatePageCount();

    return {
        pageNumber: this.pageNumber,
        pageSize: this.pageSize,
        first: 1 + firstElementIndex,
        last: 1 + firstElementIndex + this.thisPageSize - 1,
        totalNumberOfRecords: this.totalNumberOfRecords,
        numberOfPages: numberOfPages,
        goToPageList: this.buildGoToPageList( numberOfPages ),
        pageListInfo: this.buildPageListInfo( numberOfPages ),
        isFirstPage: this.pageNumber == 1,
        isLastPage: this.pageNumber == numberOfPages || numberOfPages == 0
    };
};

PagingComponent.prototype.dataFromServer = function( data ){

    this.totalNumberOfRecords = data.totalNumberOfRecords;
    this.records = data.records || [];
    this.thisPageSize = this.records.length;
};

PagingComponent.prototype.dataFromClient = function( delta ){

    this.totalNumberOfRecords += delta;
    this.thisPageSize += delta;
};

PagingComponent.prototype.buildGoToPageList = function( numberOfPages ){

    // Skip some pages is there are too many pages
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

PagingComponent.prototype.calculatePageCount = function (){

    var pageCount = Math.floor( this.totalNumberOfRecords / this.pageSize );
    if ( this.totalNumberOfRecords % this.pageSize != 0 ) {
        ++pageCount;
    }

    return pageCount;
};

PagingComponent.prototype.getPageSize = function(){
    return this.pageSize;
};

PagingComponent.prototype.setPageNumber = function( pageNumberToSet ){
    this.pageNumber = pageNumberToSet;
};

PagingComponent.prototype.goToFirstPage = function(){
    this.setPageNumber( 1 );
};

PagingComponent.prototype.getTotalNumberOfRecords = function(){
    return this.totalNumberOfRecords;
};

PagingComponent.prototype.get$ = function(){
    return this.parent.get$().find( '.' + this.cssClass );
};

module.exports = PagingComponent;
