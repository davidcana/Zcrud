/* 
    Class Table 
*/
module.exports = function ( optionsToApply ) {
    "use strict";
    
    var context = require( '../context.js' );
    var SimpleUpdate = require( './simpleUpdate.js' );
    var $ = require( 'jquery' );
    var zpt = require( 'zpt' );
    
    var options = optionsToApply;
    var dictionary = undefined;
    var records = {};
    
    //
    var run = function(){
        loadRegistersUsingAjax();
    };
    
    var configureTemplate = function(){
        options.target.attr(
            'data-muse-macro', options.listTemplate );
    };
    
    //
    var parseTemplate = function(){
        /*
        dictionary = {
            options: options,
            records: data.Records
        };
        
        buildDictionary( data );*/
        
        zpt.run({
            //root: options.target[0],
            root: options.body,
            dictionary: dictionary,
            callback: addButtonsEvents
        });
    };
    
    var updateDictionary = function( data ){
        
        dictionary = {
            options: options,
            records: data.Records
        };
    };
    
    var addButtonsEvents = function() {

        var createButtons = $( '.zcrud-new-command-button' )
            .click(function ( event ) {
                event.preventDefault();
                event.stopPropagation();
                showCreateForm( event );
            });
        var editButtons = $( '.zcrud-edit-command-button' )
            .click(function ( event ) {
                event.preventDefault();
                event.stopPropagation();
                showEditForm( event );
            });
        var deleteButtons = $( '.zcrud-delete-command-button' )
            .click(function ( event ) {
                event.preventDefault();
                event.stopPropagation();
                showDeleteForm( event );
            });
    };
    
    var showCreateForm = function( event ){
        alert( 'showCreateForm' );
    };
    
    var showEditForm = function( event ){
        var key = getKeyFromButton( event );
        //alert( 'showEditForm: ' + records[ key ].name );
        
        var update =  new SimpleUpdate( options );
        update.setRecord( records[ key ] );
        update.run();
    };
    
    var showDeleteForm = function( event ){
        alert( 'showDeleteForm: ' + getKeyFromButton( event ) );
    };
    
    var getKeyFromButton = function( event ){
        return $( event.target ).parent().parent().attr( 'data-record-key' );
    };
    
    var buildRecords = function(){
        for ( var c = 0; c < dictionary.records.length; c++ ) {
            var record = dictionary.records[ c ];
            records[ record[ options.key ] ] = record;
        }
    };
    
    //
    var loadRegistersUsingAjax = function () {
        
        //Generate URL (with query string parameters) to load records
        var loadUrl = createRecordLoadUrl();

        //Load data from server using AJAX
        ajax({
            url: loadUrl,
            //data: this._lastPostData,
            success: function ( data ) {
                updateDictionary( data );
                configureTemplate();
                parseTemplate();
                buildRecords();
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
            //alert( 'Customized ajax!' );
            options.ajaxFunction( ajaxOptions );
            return;
        }
        
        //alert( 'Standard ajax!' );
        $.ajax( ajaxOptions );
    };
    
    
    return {
        run: run
    };
};