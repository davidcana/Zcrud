/* 
    context singleton class
*/
module.exports = (function() {
    "use strict";
    
    var $ = require( 'jquery' );
    var zpt = require( 'zpt' );
    var pageUtils = require( './pages/pageUtils.js' );
    
    var defaultConf = {
        busyDivId: 'zcrud-busy'
    };
    var zptParser = undefined;
    var subformSeparator = '-';
    
    /* Cache */
    var cache = {};
    var put = function ( id, data ){
        cache[ id ] = data;
    };
    var get = function ( id ){
        return cache[ id ];
    };
    
    /* busy */
    /*
    var busyDiv = undefined;
    var getBusyDiv = function(){
        if ( ! busyDiv ){
            busyDiv = $( '#' + defaultConf.busyDivId );
        }
        return busyDiv;
    };
    var showBusy = function ( options, fullVersion ) {
        
        if ( fullVersion ){
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
    };*/
    
    // I18n
    var i18nArray = undefined;
    var setI18nArray = function( i18nArrayToApply, options ){
        i18nArray = i18nArrayToApply;
        options.dictionary[ options.i18n.i18nArrayVarName ] = i18nArray;
    };
    var translate = function( id, params, format, subformat ){
        return zpt.i18nHelper.tr( i18nArray, id, params, format || 'string', subformat );
    };
    
    // Errors
    var showError = function ( options, throwException, message, mustTranslate, params, format, subformat ) {
        var translated = 
            mustTranslate? 
            translate( message, params, format, subformat ): 
            message;
        options.fatalErrorFunction( translated );
        if ( throwException ){
            throw translated;
        }
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
        return selector;
    };
    
    var getListPage = function( listPageIdSource ){
        
        try {
            var listPageId = typeof listPageIdSource === 'object'? listPageIdSource.pageConf.pages.list.id: listPageIdSource;
        } catch ( e ) {
            alert( 'Exception trying to get options.pageConf.pages.list.id!' );
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
    
    // ZPT
    var initZPT = function( zptOptions ){

        zptParser = zpt.buildParser( zptOptions );
        zptParser.init( zptOptions.callback );
    };
    var getZPTParser = function(){
        return zptParser;
    };
    
    // Update visible fields (for testing purposes)
    var updateFormVisibleFields = function( options, fieldIdList ){
        options.pageConf.pages.create.fields = fieldIdList;
        options.pageConf.pages.update.fields = fieldIdList;
        options.pageConf.pages.delete.fields = fieldIdList;
    };
    var updateListVisibleFields = function( options, fieldIdList ){
        options.pageConf.pages.list.fields = fieldIdList;
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
    
    // Fields
    var getField = function( fields, fullName ){

        var fieldData = getFieldData( fullName );
        return fieldData.subformName? fields[ fieldData.subformName ].fields[ fieldData.name ]: fields[ fieldData.name ];
    };
    var getFieldData = function( fullName ){

        var subformSeparatorIndex = fullName.indexOf( subformSeparator );
        return {
            subformName: subformSeparatorIndex === -1? null: fullName.substring( 0, subformSeparatorIndex ),
            name: subformSeparatorIndex === -1? fullName: fullName.substring( 1 + subformSeparatorIndex )
        };
    };
    
    // JSONBuilder
    var getJSONBuilder = function( options ){
        return options.jsonBuilder;
    };

    // fieldBuilder
    var fieldBuilder = undefined;
    var setFieldBuilder = function( fieldBuildertoApply ){
        fieldBuilder = fieldBuildertoApply;
    };
    var getFieldBuilder = function(){
        return fieldBuilder;
    };
    
    return {
        put: put,
        get: get,
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
        updateFormVisibleFields: updateFormVisibleFields,
        updateListVisibleFields: updateListVisibleFields,
        updateSubformFields: updateSubformFields,
        getField: getField,
        getFieldData: getFieldData,
        subformSeparator: subformSeparator,
        getJSONBuilder: getJSONBuilder,
        setFieldBuilder: setFieldBuilder,
        getFieldBuilder: getFieldBuilder
        //showBusy: showBusy,
        //hideBusy: hideBusy
    };
})();
