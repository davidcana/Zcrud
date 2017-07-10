/* 
    context singleton class
*/
module.exports = (function() {
    "use strict";
    
    var $ = require( 'jquery' );
    var zpt = require( 'zpt' );
    var pageUtils = require( './pages/pageUtils.js' );
    
    var defaultConf = {
        mainContainerDivId: 'zcrud-main-container',
        /*busyDivId: 'zcrud-busy-panel-background',*/
        messageDivId: 'zcrud-message',
        defaultMessageDelay: 5000,
        busyTemplate: 'busyDefaultTemplate'
    };
    
    /* htmlCache */
    var htmlCache = {};
    var put = function ( id, data ){
        htmlCache[ id ] = data;
    };
    var get = function ( id ){
        return htmlCache[ id ];
    };
    
    /* mainPage */
    var mainPage = undefined;
    var setMainPage = function( mainPageToApply ){
        mainPage = mainPageToApply;
    };
    var getMainPage = function(){
        return mainPage;
    };
    
    /* mainContainer */
    var mainContainerDiv = undefined;
    var getMainContainerDiv = function(){
        if ( ! mainContainerDiv ){
            mainContainerDiv = $( '#' + defaultConf.mainContainerDivId );
        }
        return mainContainerDiv;
    };
    
    /* message */
    var messageDiv = undefined;
    var getMessageDiv = function(){
        if ( ! messageDiv ){
            messageDiv = $( '#' + defaultConf.messageDivId );
        }
        return messageDiv;
    };
    
    /* busy */
    /*
    var busyDiv = undefined;
    var getBusyDiv = function(){
        if ( ! busyDiv ){
            busyDiv = $( '#' + defaultConf.busyDivId );
        }
        return busyDiv;
    };*/
    
    var busyTimer = undefined;
    var showBusy = function ( options ) {
                
        pageUtils.configureTemplate( options, defaultConf.busyTemplate );
        
        zpt.run({
            //root: options.target[0],
            root: options.body,
            dictionary: {}
        });
    };
    /*
    var showBusy = function ( message, delay ) {
        
        //Show a transparent overlay to prevent clicking to the table
        getBusyDiv()
            .width( getMainContainerDiv().width() )
            .height( getMainContainerDiv().height() )
            .addClass( 'zcrud-busy-panel-background-invisible' )
            .show();

        var makeVisible = function () {
            getBusyDiv().removeClass( 'zcrud-busy-panel-background-invisible' );
            getMessageDiv().html( message ).show();
        };

        if ( delay ) {
            if ( busyTimer ) {
                return;
            }

            busyTimer = setTimeout( makeVisible, delay );
        } else {
            makeVisible();
        }
    };*/
    
    /* Hides busy indicator and unblocks table UI.
    *************************************************************************/
    /*
    var hideBusy = function () {
        clearTimeout( busyTimer );
        busyTimer = null;
        getBusyDiv().hide();
        getMessageDiv().html( '' ).hide();
    };*/
    
    /* Returns true if zCrud is busy.
    *************************************************************************/
    /*
    var isBusy = function () {
        return false;
        //return messageDiv().is( ':visible' );
    };*/
    
    /* Shows message with given message.
    *************************************************************************/
    var showMessage = function ( message, delay ) {
        
        var delay = delay || defaultConf.defaultMessageDelay;
        getMessageDiv().html( message ).show();
        
        if ( busyTimer ) {
            return;
        }

        var makeVisible = function () {
            getMessageDiv().html( '' ).hide();
        };
        
        busyTimer = setTimeout( makeVisible, delay );
    };
    var showError = function ( message, delay ) {
        showMessage( message, delay );
    };
    
    return {
        put: put,
        get: get,
        setMainPage: setMainPage,
        getMainPage: getMainPage,
        showBusy: showBusy,
        //hideBusy: hideBusy,
        //isBusy: isBusy,
        showMessage: showMessage,
        showError: showError
    };
})();
