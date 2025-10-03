/* 
    Main class of ZCrud
*/

import { zpt } from '../../node_modules/zpt/index.js';
var log = zpt.logHelper;
import { context } from './context.js';
import { ListPage } from './pages/listPage.js';
import { FormPage } from './pages/formPage.js';
import { normalizer } from './normalizer.js';
import { fieldBuilder } from './fields/fieldBuilder.js';
import { defaultOptions } from './defaultOptions.js';
import { utils } from './utils.js';

export const zcrud = {};

zcrud.version = '0.3.0-SNAPSHOT';

zcrud.init = function( userOptions, callback, failCallback ){
    
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
                if ( callback && utils.isFunction( callback ) ){
                    callback( options );
                }
            },
            failCallback: function( msg ){
                if ( failCallback && utils.isFunction( failCallback ) ){
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
    var options = utils.extend( true, {}, defaultOptions, userOptions );
    
    // Init dictionary, set in context and remove 
    var dictionary = options.dictionary;
    dictionary.options = options;
    context.setDictionary( dictionary );
    delete options.dictionary;
    
    // Configure logging
    zpt.context.getConf().loggingOn = options.logging.isOn;
    //zpt.context.getConf().loggingLevel = utils.buildLoggingLevel( options.logging.level );

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

zcrud.renderList = function( options, data, callback ){

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

zcrud.renderForm = function( options, data, callback ){

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

zcrud.destroy = function( options ){
    options.target.empty();
};

zcrud.showCreateForm = function( listPageIdSource ){
    
    var listPage = context.getListPage( listPageIdSource );
    if ( ! checkListPage( listPage, listPageIdSource ) ){
        return;
    }
    listPage.showCreateForm();
};

zcrud.showUpdateForm = function( listPageIdSource, key ){

    var listPage = context.getListPage( listPageIdSource );
    if ( ! checkListPage( listPage, listPageIdSource ) ){
        return;
    }
    listPage.showEditForm( undefined, key );
};

zcrud.showDeleteForm = function( listPageIdSource, key ){

    var listPage = context.getListPage( listPageIdSource );
    if ( ! checkListPage( listPage, listPageIdSource ) ){
        return;
    }
    listPage.showDeleteForm( undefined, key );
};

zcrud.getRecordByKey = function( listPageIdSource, key ){
    
    var listPage = context.getListPage( listPageIdSource );
    if ( ! checkListPage( listPage, listPageIdSource ) ){
        return;
    }
    return listPage.getRecordByKey( key );
};

zcrud.getRecords = function( listPageIdSource ){

    var listPage = context.getListPage( listPageIdSource );
    if ( ! checkListPage( listPage, listPageIdSource ) ){
        return;
    }
    return listPage.getRecordsArray();
};

zcrud.getRowByKey = function( listPageIdSource, key ){

    var listPage = context.getListPage( listPageIdSource );
    if ( ! checkListPage( listPage, listPageIdSource ) ){
        return;
    }
    return listPage.getRowByKey( key );
};

zcrud.selectRecords = function( listPageIdSource, rows ){

    var listPage = context.getListPage( listPageIdSource );
    if ( ! checkListPage( listPage, listPageIdSource ) ){
        return;
    }
    listPage.getSecureComponent( 'selecting' ).selectRecords( rows );
};

zcrud.deselectRecords = function( listPageIdSource, rows ){

    var listPage = context.getListPage( listPageIdSource );
    if ( ! checkListPage( listPage, listPageIdSource ) ){
        return;
    }
    listPage.getSecureComponent( 'selecting' ).deselectRecords( rows );
};

zcrud.selectRows = function( listPageIdSource, rows ){

    var listPage = context.getListPage( listPageIdSource );
    if ( ! checkListPage( listPage, listPageIdSource ) ){
        return;
    }
    listPage.getSecureComponent( 'selecting' ).selectRows( rows );
};

zcrud.deselectRows = function( listPageIdSource, rows ){

    var listPage = context.getListPage( listPageIdSource );
    if ( ! checkListPage( listPage, listPageIdSource ) ){
        return;
    }
    listPage.getSecureComponent( 'selecting' ).deselectRows( rows );
};

zcrud.getSelectedRows = function( listPageIdSource ){

    var listPage = context.getListPage( listPageIdSource );
    if ( ! checkListPage( listPage, listPageIdSource ) ){
        return;
    }
    return listPage.getSecureComponent( 'selecting' ).getSelectedRows();
};

zcrud.getSelectedRecords = function( listPageIdSource ){

    var listPage = context.getListPage( listPageIdSource );
    if ( ! checkListPage( listPage, listPageIdSource ) ){
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
    if ( ! checkListPage( listPage, listPageIdSource ) ){
        return false;
    }
    
    return listPage.instanceNewForm( type, data.key );
};

zcrud.addRecord = function( listPageIdSource, data ){
    
    var formPage = recordOperationCommon( listPageIdSource, data, true, false, 'addRecord', 'create' );
    if ( formPage ){
        formPage.addRecord( data );
    }
};

zcrud.updateRecord = function( listPageIdSource, data ){
    
    var formPage = recordOperationCommon( listPageIdSource, data, true, true, 'updateRecord', 'update' );
    if ( formPage ){
        formPage.updateRecord( data );
    }
};

zcrud.deleteRecord = function( listPageIdSource, data ){

    var formPage = recordOperationCommon( listPageIdSource, data, false, true, 'deleteRecord', 'delete' );
    if ( formPage ){
        formPage.deleteRecord( data );
    }
};

zcrud.getListPage = function( listPageIdSource ){

    var listPage = context.getListPage( listPageIdSource );
    if ( ! checkListPage( listPage, listPageIdSource ) ){
        return;
    }
    return listPage;
};

zcrud.getFormPage = function( formPageIdSource ){

    var formPage = context.getFormPage( formPageIdSource );
    if ( ! checkFormPage( formPage, formPageIdSource ) ){
        return;
    }
    return formPage;
};

var checkListPage = function( listPage, listPageIdSource ){
    if ( ! listPage ){
        //alert( 'No list found using that source:' + listPageIdSource );
        context.showError( 
            options, 
            false, 
            'No list found using that source:' + listPageIdSource
        );
        return false;
    }
    return true;
};

var checkFormPage = function( formPage, formPageIdSource ){
    if ( ! formPage ){
        //alert( 'No form found using that source:' + formPageIdSource );
        context.showError( 
            options, 
            false, 
            'No form found using that source:' + formPageIdSource
        );
        return false;
    }
    return true;
};

zcrud.utils = utils;
