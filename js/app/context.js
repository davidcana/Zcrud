/* 
    context singleton class
*/
module.exports = (function() {
    "use strict";
    
    var $ = require( 'jquery' );
    var zpt = require( 'zpt' );
    var pageUtils = require( './pages/pageUtils.js' );
    //var FormPage = require( './pages/formPage.js' );
    
    var defaultConf = {
        /*mainContainerDivId: 'zcrud-main-container',*/
        busyDivId: 'zcrud-busy'
        //messageDivId: 'zcrud-message',
        /*defaultMessageDelay: 5000,*/
        //busyTemplate: "'busyDefaultTemplate@templates/misc.html'"
    };
    var zptParser = undefined;
    var subformSeparator = '-';
    //var subformSeparator = '/';
    
    /* Cache */
    var cache = {};
    var put = function ( id, data ){
        cache[ id ] = data;
    };
    var get = function ( id ){
        return cache[ id ];
    };
    
    /* mainPage */
    /*
    var mainPage = undefined;
    var setMainPage = function( mainPageToApply ){
        mainPage = mainPageToApply;
    };
    var getMainPage = function(){
        return mainPage;
    };*/
    
    /* mainContainer */
    /*
    var mainContainerDiv = undefined;
    var getMainContainerDiv = function(){
        if ( ! mainContainerDiv ){
            mainContainerDiv = $( '#' + defaultConf.mainContainerDivId );
        }
        return mainContainerDiv;
    };*/
    
    /* message */
    /*
    var messageDiv = undefined;
    var getMessageDiv = function(){
        if ( ! messageDiv ){
            messageDiv = $( '#' + defaultConf.messageDivId );
        }
        return messageDiv;
    };*/
    
    /* busy */
    var busyDiv = undefined;
    var getBusyDiv = function(){
        if ( ! busyDiv ){
            busyDiv = $( '#' + defaultConf.busyDivId );
        }
        return busyDiv;
    };
    /*
    var buildDeclaredRemotePageUrls = function( templatePath ){
        
        var result = [];
    
        var index = templatePath.lastIndexOf( '@' );
        
        if ( index != -1 ){
            result.push( templatePath.substring( 1 + index ) );
        }
        
        return result;
    };*/
    var showBusy = function ( options, fullVersion ) {
        
        if ( fullVersion ){
            //var templatePath = defaultConf.busyTemplate;
            var templatePath = options.templates.busyTemplate;
                
            pageUtils.configureTemplate( options, templatePath );

            zpt.run({
                //root: options.target[0],
                root: options.body,
                dictionary: {}
            });
            return;
        }
        
        getBusyDiv().show();
    };
    var hideBusy = function ( options, fullVersion ) {

        if ( fullVersion ){
            return;
        }

        getBusyDiv().hide();
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
    
    /* Returns true if ZCrud is busy.
    *************************************************************************/
    /*
    var isBusy = function () {
        return false;
        //return messageDiv().is( ':visible' );
    };*/
    
    /* Shows message with given message.
    *************************************************************************/
    /*
    var messageTimer = undefined;
    var hideMessage = function () {
        getMessageDiv().html( '' );
    };
    var showMessage = function ( message, delay ) {
        getMessageDiv().html( message );
        startHideMessageTimer( delay );
    };
    var showError = function ( message, delay ) {
        showMessage( message, delay );
    };
    var startHideMessageTimer = function ( delay ) {
        
        var delay = delay || defaultConf.defaultMessageDelay;
        
        if ( messageTimer ) {
            return;
        }

        messageTimer = setTimeout( hideMessage, delay );
    };*/
    var i18nArray = undefined;
    var setI18nArray = function( i18nArrayToApply, options ){
        i18nArray = i18nArrayToApply;
        options.dictionary[ options.i18n.i18nArrayVarName ] = i18nArray;
    };
    var translate = function( id, params, format, subformat ){
        return zpt.i18nHelper.tr( i18nArray, id, params, format || 'string', subformat );
        //return id;
    };
    
    var showError = function ( options, message, mustTranslate, params, format, subformat ) {
        var translated = 
            mustTranslate? 
            translate( message, params, format, subformat ): 
            message;
        options.fatalErrorFunction( translated );
        //alert( translated );
    };
    
    // Form validation language
    var getFormValidationLanguage = function( lang ){
    
        var cacheId = lang + '-formValidationLanguage';
        var language = get( cacheId );
        if ( ! language ){
            language = {
                errorTitle: translate( 'errorTitle' ),
                requiredFields: translate( 'requiredFields' ),
                badTime: translate( 'badTime' ),
                badEmail: translate( 'badEmail' ),
                badTelephone: translate( 'badTelephone' ),
                badSecurityAnswer: translate( 'badSecurityAnswer' ),
                badDate: translate( 'badDate' ),
                lengthBadStart: translate( 'lengthBadStart' ),
                lengthBadEnd: translate( 'lengthBadEnd' ),
                lengthTooLongStart: translate( 'lengthTooLongStart' ),
                lengthTooShortStart: translate( 'lengthTooShortStart' ),
                notConfirmed: translate( 'notConfirmed' ),
                badDomain: translate( 'badDomain' ),
                badUrl: translate( 'badUrl' ),
                badCustomVal: translate( 'badCustomVal' ),
                andSpaces: translate( 'andSpaces' ),
                badInt: translate( 'badInt' ),
                badSecurityNumber: translate( 'badSecurityNumber' ),
                badUKVatAnswer: translate( 'badUKVatAnswer' ),
                badStrength: translate( 'badStrength' ),
                badNumberOfSelectedOptionsStart: translate( 'badNumberOfSelectedOptionsStart' ),
                badNumberOfSelectedOptionsEnd: translate( 'badNumberOfSelectedOptionsEnd' ),
                badAlphaNumeric: translate( 'badAlphaNumeric' ),
                badAlphaNumericExtra: translate( 'badAlphaNumericExtra' ),
                wrongFileSize: translate( 'wrongFileSize' ),
                wrongFileType: translate( 'wrongFileType' ),
                groupCheckedRangeStart: translate( 'groupCheckedRangeStart' ),
                groupCheckedTooFewStart: translate( 'groupCheckedTooFewStart' ),
                groupCheckedTooManyStart: translate( 'groupCheckedTooManyStart' ),
                groupCheckedEnd: translate( 'groupCheckedEnd' ),
                badCreditCard: translate( 'badCreditCard' ),
                badCVV: translate( 'badCVV' ),
                wrongFileDim : translate( 'wrongFileDim' ),
                imageTooTall : translate( 'imageTooTall' ),
                imageTooWide : translate( 'imageTooWide' ),                                                                                     imageTooSmall : translate( 'imageTooSmall' ),
                min : translate( 'min' ),
                max : translate( 'max' ),
                imageRatioNotAccepted : translate( 'imageRatioNotAccepted' )
            };
            put( cacheId, language );
        }
        
        return language;
    };
    
    // options
    var putOptions = function( jqueryObject, options ){
        put( 'options_' + getSelectorString( jqueryObject ), options );
    };
    var getOptions = function( jqueryObject ){
        return get( 'options_' + getSelectorString( jqueryObject ) );
    };
    /*
    var putOptions = function( id, options ){
        put( 'options_' + id, options );
    };
    var getOptions = function( id ){
        return get( 'options_' + id );
    };*/
    
    // pages
    var putPage = function( id, page ){
        put( 'page_' + id, page );
    };
    var getPage = function( id ){
        return get( 'page_' + id );
    };

    var getSelectorString = function( $jqueryObject ){
        var selector = (typeof($jqueryObject.attr('id')) !== 'undefined' || $jqueryObject.attr('id') !== null) ? '#' + $jqueryObject.attr('id') :  '.' + $jqueryObject.attr('class');
        //alert(selector);
        return selector;
    };
    
    var getListPage = function( listPageIdSource ){
        
        try {
            var listPageId = typeof listPageIdSource === 'object'? listPageIdSource.pages.list.id: listPageIdSource;
        } catch ( e ) {
            alert( 'Exception trying to get options.pages.list.id!' );
            return false;
        }
        
        return getPage( listPageId );
    };    
    
    // Add to declaredRemotePageUrls all non repeated urls
    var declareRemotePageUrl = function( template, declaredRemotePageUrls ){

        if ( ! template ){
            return;
        }

        var index = template.indexOf( '@' );
        if ( index != -1 ){
            var url = template.substring( 1 + index );
            if ( declaredRemotePageUrls.indexOf( url ) == -1 ){
                declaredRemotePageUrls.push( url );
            }
        }
    };
    
    var initZPT = function( zptOptions ){

        zptParser = zpt.buildParser( zptOptions );
        zptParser.init( zptOptions.callback );
    };
    
    var getZPTParser = function(){
        return zptParser;
    };
    
    var updateListVisibleFields = function( options, fieldIdList ){
        
        var fields = options.fields;
        for ( var id in fields ){
            var field = fields[ id ];
            field.list = fieldIdList.indexOf( id ) !== -1;
        }
    };
    
    var updateSubformFields = function( subformField, fieldIdList ){
        
        var fields = subformField.fields;
        var temp = {};
        for ( var c = 0; c < fieldIdList.length; ++c ){
            var id = fieldIdList[ c ];
            temp[ id ] = fields[ id ];
        }  
        subformField.fields = temp;
    };
    
    var getField = function( fields, fullName ){

        var fieldData = getFieldData( fullName );
        return fieldData.subformName?
            fields[ fieldData.subformName ].fields[ fieldData.name ]:
        fields[ fieldData.name ];
    };

    var getFieldData = function( fullName ){

        var subformSeparatorIndex = fullName.indexOf( subformSeparator );
        return {
            subformName: subformSeparatorIndex === -1? null: fullName.substring( 0, subformSeparatorIndex ),
            name: subformSeparatorIndex === -1? fullName: fullName.substring( 1 + subformSeparatorIndex )
        };
    };
    
    return {
        put: put,
        get: get,
        //setMainPage: setMainPage,
        //getMainPage: getMainPage,
        showBusy: showBusy,
        hideBusy: hideBusy,
        //isBusy: isBusy,
        //showMessage: showMessage,
        setI18nArray: setI18nArray,
        translate: translate,
        showError: showError,
        getFormValidationLanguage: getFormValidationLanguage,
        putOptions: putOptions,
        getOptions: getOptions,
        putPage: putPage,
        getPage: getPage,
        getSelectorString: getSelectorString,
        getListPage: getListPage,
        declareRemotePageUrl: declareRemotePageUrl,
        initZPT: initZPT,
        getZPTParser: getZPTParser,
        updateListVisibleFields: updateListVisibleFields,
        updateSubformFields: updateSubformFields,
        getField: getField,
        getFieldData: getFieldData,
        subformSeparator: subformSeparator
        //getFormPage: getFormPage
    };
})();
