/* 
    Class ListPage 
*/
module.exports = function ( optionsToApply ) {
    "use strict";
    
    var context = require( '../context.js' );
    var pageUtils = require( './pageUtils.js' );
    var FormPage = require( './formPage.js' );
    var $ = require( 'jquery' );
    var zpt = require( 'zpt' );
    
    var options = optionsToApply;
    var dictionary = undefined;
    var records = {};
    
    //
    var configure = function(){

        options.currentList = {};
        options.currentList.fields = buildFields();
    };
    
    var buildFields = function(){
        var fields = [];
        
        for ( var c = 0; c < options.fields.length; c++ ) {
            var field = options.fields[ c ];
            
            if ( field.list == false ) {
                continue;
            }
            fields.push( field );
        }
        
        return fields;
    };
    
    // Main method
    var show = function () {
        
        context.setMainPage( this );
        
        //Generate URL (with query string parameters) to load records
        var loadUrl = createRecordLoadUrl();

        //Load data from server using AJAX
        ajax({
            url: loadUrl,
            success: function ( data ) {
                updateDictionary( data );
                buildHTMLAndJavascript();
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
        
    var updateDictionary = function( data ){
        
        dictionary = {
            options: options,
            records: data.Records
        };
    };
    
    //
    var buildHTMLAndJavascript = function(){
        
        pageUtils.configureTemplate( options, options.listTemplate );
        
        zpt.run({
            //root: options.target[0],
            root: options.body,
            dictionary: dictionary,
            callback: addButtonsEvents
        });
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
        //alert( 'showCreateForm' );
        showForm( options, 'create', {} );
    };
    
    var showEditForm = function( event ){
        var key = getKeyFromButton( event );
        //alert( 'showEditForm: ' + records[ key ].name );
        showForm( options, 'update', records[ key ] );
    };
    
    var showDeleteForm = function( event ){
        var key = getKeyFromButton( event );
        //alert( 'showDeleteForm: ' + records[ key ].name );
        showForm( options, 'delete', records[ key ] );
    };
    
    var showForm = function( options, type, record ){
        var formPage =  new FormPage( options, type );
        formPage.setRecord( record );
        formPage.show();
    };
    
    var getKeyFromButton = function( event ){
        return $( event.target ).parent().parent().attr( 'data-record-key' );
    };
    
    // Iterate dictionary.records (an array) and put them into records (a map) using the id of each record as the key
    var buildRecords = function(){
        for ( var c = 0; c < dictionary.records.length; c++ ) {
            var record = dictionary.records[ c ];
            records[ record[ options.key ] ] = record;
        }
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
    
    configure();
    
    return {
        show: show
    };
};