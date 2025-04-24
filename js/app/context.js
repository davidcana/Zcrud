/* 
    context singleton class
*/
'use strict';
    
var zpt = require( 'zpt' );
//var pageUtils = require( './pages/pageUtils.js' );

module.exports = (function() {
    
    //var zptParser = undefined;
    var subformSeparator = '-';
    
    // Cache
    var cache = {};
    var put = function ( id, data ){
        cache[ id ] = data;
    };
    var get = function ( id ){
        return cache[ id ];
    };
    
    // I18n
    var i18nArray = undefined;
    var setI18nArray = function( i18nArrayToApply ){
        i18nArray = i18nArrayToApply;
    };
    var translate = function( id, params, format, subformat ){
        return zpt.i18nHelper.tr( i18nArray, id, params, format || 'string', subformat );
    };
    var i18nExists = function( id ){ //TODO Reimplement this using i18n.exists
        var translated = translate( id );
        return translated !== 'I18n resource "' + id + '" not found!'
    };
    var translateAlternatives = function( ids, params, format, subformat ){
        for ( const id of ids ) {
            if ( i18nExists( id ) ){
                return zpt.i18nHelper.tr( i18nArray, id, params, format || 'string', subformat );
            }
        }
        return 'No i18n resource found: ' + ids;
    };

    // Errors
    var showError = function ( options, throwException, message, mustTranslate, params, format, subformat ) {
        var translated = 
            mustTranslate? 
            translate( message, params, format, subformat ): 
            message;
        options.errorFunction( translated );
        if ( throwException ){
            throw translated;
        }
    };
    var confirm = function ( options, confirmOptions, onFulfilled ) {
        options.confirmFunction( confirmOptions, onFulfilled );
    };
    var showMessage = function ( options, messageOptions ) {
        options.showMessageFunction( messageOptions );
    };
    
    // Form validation language
    /*
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
    */

    // Options
    var putOptions = function( $item, options ){
        put( 'options_' + getSelectorString( $item ), options );
    };
    var getOptions = function( $item ){
        return get( 'options_' + getSelectorString( $item ) );
    };
    /*
    var putOptions = function( id, options ){
        put( 'options_' + id, options );
    };
    var getOptions = function( id ){
        return get( 'options_' + id );
    };*/
    
    // Pages
    var putPage = function( id, page ){
        put( 'page_' + id, page );
    };
    var getPage = function( id ){
        return get( 'page_' + id );
    };

    var getSelectorString = function( $item ){
        
        var selector = (typeof($item.attr('id')) !== 'undefined' || $item.attr('id') !== null) ? '#' + $item.attr('id') :  '.' + $item.attr('class');
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
    
    var getFormPage = function( formPageIdSource ){

        try {
            var formPageId = typeof formPageIdSource === 'object'? formPageIdSource.formId: formPageIdSource;
        } catch ( e ) {
            alert( 'Exception trying to get options.pageConf.pages.list.id!' );
            return false;
        }

        return getPage( formPageId );
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
    /*
    var getZPTParser = function(){
        return zptParser;
    };
    var setZPTParser = function( zptParserToApply ){
        zptParser = zptParserToApply;
    };
    */
    
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

    // Field builder
    var fieldBuilder = undefined;
    var setFieldBuilder = function( fieldBuildertoApply ){
        fieldBuilder = fieldBuildertoApply;
    };
    var getFieldBuilder = function(){
        return fieldBuilder;
    };
    
    // History
    var history = undefined;
    var setHistory = function( historytoApply ){
        history = historytoApply;
    };
    var getHistory = function(){
        return history;
    };
    
    // Subforms
    var buildSubformsRecordsIdFromFieldId = function( options, subformsRecordsId ){
        return subformsRecordsId + options.subformsRecordsSuffix;
    };
    var buildFieldIdFromSubformsRecordsId = function( options, subformsRecordsId ){
        return removeChars( subformsRecordsId, options.subformsRecordsSuffix );
    };
    var removeChars = function( string, toRemove ){
        return string.replace( toRemove, '' );
    };
    
    // Dictionary
    var dictionary;
    var setDictionary = function( _dictionary ){
        dictionary = _dictionary;
    };
    var getDictionary = function(){
        return dictionary;
    };
    
    return {
        put: put,
        get: get,
        setI18nArray: setI18nArray,
        translate: translate,
        translateAlternatives: translateAlternatives,
        showError: showError,
        confirm: confirm,
        showMessage: showMessage,
        //getFormValidationLanguage: getFormValidationLanguage,
        putOptions: putOptions,
        getOptions: getOptions,
        putPage: putPage,
        getPage: getPage,
        getSelectorString: getSelectorString,
        getListPage: getListPage,
        getFormPage: getFormPage,
        declareRemotePageUrl: declareRemotePageUrl,
        //getZPTParser: getZPTParser,
        //setZPTParser: setZPTParser,
        updateFormVisibleFields: updateFormVisibleFields,
        updateListVisibleFields: updateListVisibleFields,
        updateSubformFields: updateSubformFields,
        getField: getField,
        getFieldData: getFieldData,
        subformSeparator: subformSeparator,
        getJSONBuilder: getJSONBuilder,
        setFieldBuilder: setFieldBuilder,
        getFieldBuilder: getFieldBuilder,
        setHistory: setHistory,
        getHistory: getHistory,
        buildSubformsRecordsIdFromFieldId: buildSubformsRecordsIdFromFieldId,
        buildFieldIdFromSubformsRecordsId: buildFieldIdFromSubformsRecordsId,
        setDictionary: setDictionary,
        getDictionary: getDictionary
    };
})();
