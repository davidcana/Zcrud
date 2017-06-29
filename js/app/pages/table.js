/* 
    Class Table 
*/
module.exports = function ( optionsToApply ) {
    "use strict";
    
    var context = require( '../context.js' );
    var $ = require( 'jquery' );
    var zpt = require( 'zpt' );
    
    var options = optionsToApply;

    //
    var run = function(){
        loadRegistersUsingAjax();
    };
    
    //
    var parseTemplate = function( data ){
        alert( 'parseTemplate!' );
        
        var dictionary = {
            options: options,
            records: data.Records
        };
    };
    
    //
    var loadRegistersUsingAjax = function ( options ) {
        
        //Generate URL (with query string parameters) to load records
        var loadUrl = createRecordLoadUrl();

        //Load data from server using AJAX
        ajax({
            url: loadUrl,
            //data: this._lastPostData,
            success: function ( data ) {
                parseTemplate( data );
            },
            error: function ( data ) {
                hideBusy();
                showError( options.messages.serverCommunicationError );
            }
        });
    };
    
    var createRecordLoadUrl = function () {
        return options.actions.listAction;
    };
            
    /* Hides busy indicator and unblocks table UI.
    *************************************************************************/
    var hideBusy = function () {
        /*
        clearTimeout(this._setBusyTimer);
        this.setBusyTimer = null;
        this.$busyDiv.hide();
        this.$busyMessageDiv.html('').hide();*/
    };

    /* Returns true if jTable is busy.
    *************************************************************************/
    var isBusy = function () {
        return false;
        //return this.$busyMessageDiv.is( ':visible' );
    };
    
    /* Shows error message dialog with given message.
    *************************************************************************/
    var showError = function ( message ) {
        //this.$errorDialogDiv.html(message).dialog('open');
    };
            
    //
    var ajax = function ( ajaxOptions ) {
        
        if ( $.isFunction( options.ajaxFunction ) ) {
            alert( 'Customized ajax!' );
            options.ajaxFunction( ajaxOptions );
            return;
        }
        
        alert( 'Standard ajax!' );
        $.ajax( ajaxOptions );
    };
    
    
    return {
        run: run
    };
};