/* 
    Class ListPage 
*/
module.exports = function ( optionsToApply ) {
    "use strict";
    
    var context = require( '../context.js' );
    var pageUtils = require( './pageUtils.js' );
    var FormPage = require( './formPage.js' );
    var PagingComponent = require( './pagingComponent.js' );
    var $ = require( 'jquery' );
    var zpt = require( 'zpt' );
    
    var options = optionsToApply;
    var dictionary = undefined;
    var records = {};
    
    var components = {};
    var pagingComponent = undefined;
    
    //
    var configure = function(){
        options.currentList = {};
        options.currentList.fields = buildFields();
        
        pagingComponent = options.paging.isOn? new PagingComponent( options ): undefined;
        options.paging.component = pagingComponent;
        components.paging = pagingComponent;
    };
    
    var buildFields = function(){
        var fields = [];
        
        $.each( options.fields, function ( fieldId, field ) {
            if ( field.list == false ) {
                return;
            }
            fields.push( field );
        });
        
        return fields;
    };
    
    var buildDataToSend = function(){
        
        var data = {};  
        
        for ( var id in components ){
            var component = components[ id ];
            component.addToDataToSend( data );
        }
        
        return data;
    };
    
    // Main method
    var show = function ( dictionaryExtension ) {
        
        context.showBusy( options );
        context.setMainPage( this );
        
        //Generate URL (with query string parameters) to load records
        var loadUrl = createRecordLoadUrl();

        // Trigger loadingRecords event
        //options.events.loadingRecords( options, loadUrl );
        
        //Load data from server using AJAX
        options.ajax({
            url: loadUrl,
            data: buildDataToSend(),
            success: function ( data ) {
                data = options.ajaxPostFilter( data );
                updateDictionary( data, dictionaryExtension );
                buildHTMLAndJavascript();
                buildRecords();
            },
            error: function ( data ) {
                data = options.ajaxPostFilter( data );
                context.showError( options.messages.serverCommunicationError );
            }
        });
    };
    
    var createRecordLoadUrl = function () {
        return options.actions.listAction;
    };
    
    var updateDictionary = function( data, dictionaryExtension ){
        
        var thisDictionary = {
            options: options,
            records: data.records
        };
        
        if ( dictionaryExtension ){
            dictionary = $.extend( {}, thisDictionary, dictionaryExtension );
        } else {
            dictionary = thisDictionary;
        }
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
        showForm( options, 'create' );
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
        
        if ( record ){
            formPage.setRecord( record );
        } else {
            formPage.updateRecordFromDefaultValues();
        }
        
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
    
    configure();
    
    return {
        show: show
    };
};