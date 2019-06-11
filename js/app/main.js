/* 
    Main class of ZCrud
*/
var $ = require( 'jquery' );
var zpt = require( 'zpt' );
var log = zpt.logHelper;
var context = require( './context.js' );
var ListPage = require( './pages/listPage.js' );
var FormPage = require( './pages/formPage.js' );
var normalizer = require( './normalizer.js' );
var fieldBuilder = require( './fields/fieldBuilder' );
var defaultOptions = require( './defaultOptions.js' );

exports.init = function( userOptions, callback, failCallback ){
    
    // Register in options.dictionary I18n instances
    var initI18n = function( dictionary ){

        // Build the list of file paths
        var fileNames = options.i18n.files[ options.i18n.language ];
        if ( ! fileNames ){
            throw( 'No file names set to init i18n subsystem!' );
        }

        // Build ZPT options
        var zptOptions = {
            command: 'preload',
            root: document.body,
            //root: ( options.target? options.target[0]: null ) || options.body,
            dictionary: dictionary,
            declaredRemotePageUrls: options.allDeclaredRemotePageUrls,
            notRemoveGeneratedTags: true,
            i18n: {
                urlPrefix: options.filesPathPrefix + options.i18n.filesPath,
                files: {}
            },
            callback: function(){
                context.setI18nArray( dictionary.i18nArray );
                if ( callback && $.isFunction( callback ) ){
                    callback( options );
                }
            },
            failCallback: function( msg ){
                if ( failCallback && $.isFunction( failCallback ) ){
                    failCallback( msg );
                }
            }
        };
        zptOptions.i18n.files[ options.i18n.language ] = fileNames;
        if ( options.templates.filesPath ){
            zpt.context.getConf().externalMacroPrefixURL = options.filesPathPrefix + options.templates.filesPath;
        }
                    
        // Init ZPT parser
        zpt.run( zptOptions );
    };

    // Init options
    var options = $.extend( true, {}, defaultOptions, userOptions );
    
    // Init dictionary, set in context and remove 
    var dictionary = options.dictionary;
    dictionary.options = options;
    context.setDictionary( dictionary );
    delete options.dictionary;
    
    // Configure logging
    zpt.context.getConf().loggingOn = options.logging.isOn;
    zpt.context.getConf().loggingLevel = options.logging.level;

    log.info( 'Initializing ZCrud...' );
    
    // Register all field managers
    fieldBuilder.registerAllConstructors( options.fieldsConfig.constructors );
    context.setFieldBuilder( fieldBuilder );
    
    // Normalize options
    normalizer.run( options, userOptions );
    
    // Init I18n
    initI18n( dictionary );
    
    log.info( '...ZCrud initialized.' );
    
    return options;
};

exports.renderList = function( options, data, callback ){

    try {
        log.info( 'Rendering list...' );

        var listPage =  new ListPage( options, data );
        context.putPage( listPage.getId(), listPage );
        listPage.show( 
            {
                callback: callback
            } 
        );

        log.info( '...list rendering finished.' );
        
    } catch ( e ) {
        context.showError( 
            options, 
            false, 
            'Error trying to render list: ' + ( e.message || e )
        );
    }
};

exports.renderForm = function( options, data, callback ){

    try {
        log.info( 'Rendering form...' );

        data = data || {};
        data.type = 'customForm';
        var formPage = new FormPage( options, data ); 

        context.putPage( formPage.getId(), formPage );
        formPage.show( 
            {
                callback: callback
            } 
        );

        log.info( '...form rendering finished.' );
        
    } catch ( e ) {
        context.showError( 
            options, 
            false, 
            'Error trying to render form: ' + ( e.message || e )
        );
    }
};

exports.destroy = function( options ){
    options.target.empty();
};

exports.showCreateForm = function( listPageIdSource ){
    
    var listPage = context.getListPage( listPageIdSource );
    if ( ! listPage ){
        //alert( 'No list found using that source:' + listPageIdSource );
        context.showError( 
            options, 
            false, 
            'No list found using that source:' + listPageIdSource
        );
        return;
    }
    listPage.showCreateForm();
};

exports.showUpdateForm = function( listPageIdSource, key ){

    var listPage = context.getListPage( listPageIdSource );
    if ( ! listPage ){
        alert( 'No list found using that source:' + listPageIdSource );
        return;
    }
    listPage.showEditForm( undefined, key );
};

exports.showDeleteForm = function( listPageIdSource, key ){

    var listPage = context.getListPage( listPageIdSource );
    if ( ! listPage ){
        alert( 'No list found using that source:' + listPageIdSource );
        return;
    }
    listPage.showDeleteForm( undefined, key );
};

exports.getRecordByKey = function( listPageIdSource, key ){
    
    var listPage = context.getListPage( listPageIdSource );
    if ( ! listPage ){
        alert( 'No list found using that source:' + listPageIdSource );
        return;
    }
    return listPage.getRecordByKey( key );
};

exports.getRecords = function( listPageIdSource ){

    var listPage = context.getListPage( listPageIdSource );
    if ( ! listPage ){
        alert( 'No list found using that source:' + listPageIdSource );
        return;
    }
    return listPage.getRecordsArray();
};

exports.getRowByKey = function( listPageIdSource, key ){

    var listPage = context.getListPage( listPageIdSource );
    if ( ! listPage ){
        alert( 'No list found using that source:' + listPageIdSource );
        return;
    }
    return listPage.getRowByKey( key );
};

exports.selectRecords = function( listPageIdSource, rows ){

    var listPage = context.getListPage( listPageIdSource );
    if ( ! listPage ){
        alert( 'No list found using that source:' + listPageIdSource );
        return;
    }
    listPage.getSecureComponent( 'selecting' ).selectRecords( rows );
};

exports.deselectRecords = function( listPageIdSource, rows ){

    var listPage = context.getListPage( listPageIdSource );
    if ( ! listPage ){
        alert( 'No list found using that source:' + listPageIdSource );
        return;
    }
    listPage.getSecureComponent( 'selecting' ).deselectRecords( rows );
};

exports.selectRows = function( listPageIdSource, rows ){

    var listPage = context.getListPage( listPageIdSource );
    if ( ! listPage ){
        alert( 'No list found using that source:' + listPageIdSource );
        return;
    }
    listPage.getSecureComponent( 'selecting' ).selectRows( rows );
};

exports.deselectRows = function( listPageIdSource, rows ){

    var listPage = context.getListPage( listPageIdSource );
    if ( ! listPage ){
        alert( 'No list found using that source:' + listPageIdSource );
        return;
    }
    listPage.getSecureComponent( 'selecting' ).deselectRows( rows );
};

exports.getSelectedRows = function( listPageIdSource ){

    var listPage = context.getListPage( listPageIdSource );
    if ( ! listPage ){
        alert( 'No list found using that source:' + listPageIdSource );
        return;
    }
    return listPage.getSecureComponent( 'selecting' ).getSelectedRows();
};

exports.getSelectedRecords = function( listPageIdSource ){

    var listPage = context.getListPage( listPageIdSource );
    if ( ! listPage ){
        alert( 'No list found using that source:' + listPageIdSource );
        return;
    }
    return listPage.getSecureComponent( 'selecting' ).getSelectedRecords();
};

var recordOperationCommon = function( listPageIdSource, data, checkRecord, checkKey, method, type ){
    
    if ( checkRecord && ! data.record ){
        alert( 'Record not set in ' + method + ' method!' );
        return false;
    }
    
    if ( checkKey && ! data.key ){
        alert( 'Key not set in ' + method + ' method!' );
        return false;
    }
    
    var listPage = context.getListPage( listPageIdSource );
    if ( ! listPage ){
        alert( 'No list found using that source:' + listPageIdSource );
        return false;
    }
    
    return listPage.instanceNewForm( type, data.key );
};

exports.addRecord = function( listPageIdSource, data ){
    
    var formPage = recordOperationCommon( listPageIdSource, data, true, false, 'addRecord', 'create' );
    if ( formPage ){
        formPage.addRecord( data );
    }
};

exports.updateRecord = function( listPageIdSource, data ){
    
    var formPage = recordOperationCommon( listPageIdSource, data, true, true, 'updateRecord', 'update' );
    if ( formPage ){
        formPage.updateRecord( data );
    }
};

exports.deleteRecord = function( listPageIdSource, data ){

    var formPage = recordOperationCommon( listPageIdSource, data, false, true, 'deleteRecord', 'delete' );
    if ( formPage ){
        formPage.deleteRecord( data );
    }
};

exports.getListPage = function( listPageIdSource ){

    var listPage = context.getListPage( listPageIdSource );
    if ( ! listPage ){
        alert( 'No list found using that source:' + listPageIdSource );
        return;
    }
    return listPage;
};

exports.getFormPage = function( formPageIdSource ){

    var formPage = context.getFormPage( formPageIdSource );
    if ( ! formPage ){
        alert( 'No form found using that source:' + formPageIdSource );
        return;
    }
    return formPage;
};
