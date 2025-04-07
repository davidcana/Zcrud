"use strict";

//var $ = require( 'zzdom' );
//var zcrud = require( '../../../js/app/main.js' );
var zzDOM = require( '../../../js/app/zzDOMPlugin.js' );
var $ = zzDOM.zz;
var Qunit = require( 'qunit' );
var utils = require( '../../../js/app/utils.js' );
var testServerSide = require( './testServerSide.js' );
var testHelper = require( './testHelper.js' );
var fieldListBuilder = require( '../../../js/app/fields/fieldListBuilder.js' );

var defaultTestOptions = require( './defaultTestOptions.js' );
var options = undefined;

var buildIdsArray = function( fieldsArray ){
    
    var result = [];
    
    for ( var c = 0; c < fieldsArray.length; ++c ){
        var item = fieldsArray[ c ];
        
        if ( item.type == "fieldContainer" ){
            var container = result[ result.length - 1 ];
            if ( ! container || container.id != item.id ){
                container = {
                    type: item.type,
                    id: item.id,
                    containerType: item.containerType,
                    template: item.template,
                    fields: []
                };
                result.push( container );
            }
            container.fields = buildIdsArray( item.fields );
            
        } else {
            result.push( item.id );
        }
    }
    
    return result;
};

// Run tests
QUnit.test( "Field list from general fields builder test", function( assert ) {
    
    var done = assert.async();
    options = defaultTestOptions;
    
    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){
            $( '#departmentsContainer' ).zcrud( 'renderList' );
            
            // Empty array
            var items = [];
            var expected = [];
            var fields = fieldListBuilder.build( items, options ).fieldsArray;
            assert.deepEqual( fields, expected );
            
            // Strings only
            items = [ 'name', 'description' ];
            expected = [
                {
                    "id": "name",
                    "type": "text",
                    "elementId": "zcrud-name",
                    "attributes": {},
                    "name": "name",
                    "sorting": true,
                    "template": "text@templates/fields/basic.html",
                    "viewTemplate": undefined
                },
                {
                    "id": "description",
                    "type": "textarea",
                    "attributes": {},
                    "elementId": "zcrud-description",
                    "name": "description",
                    "sorting": true,
                    "template": "textarea@templates/fields/basic.html",
                    "viewTemplate": undefined
                }
            ];
            fields = fieldListBuilder.build( items, options ).fieldsArray;
            //assert.deepEqual( fields, expected );
            testHelper.checkAllPropertiesInFirstInSecond( assert, expected, fields );
            
            // Fields only
            items = [ 
                {
                    "id": "name",
                    "type": "text"
                },
                {
                    "id": "description",
                    "type": "textarea"
                }
            ];
            expected = [
                {
                    "id": "name",
                    "type": "text",
                    "elementId": "zcrud-name",
                    "attributes": {},
                    "name": "name",
                    "sorting": true,
                    "template": "text@templates/fields/basic.html",
                    "viewTemplate": undefined
                },
                {
                    "id": "description",
                    "type": "textarea",
                    "attributes": {},
                    "elementId": "zcrud-description",
                    "name": "description",
                    "sorting": true,
                    "template": "textarea@templates/fields/basic.html",
                    "viewTemplate": undefined
                }
            ];
            fields = fieldListBuilder.build( items, options ).fieldsArray;
            //assert.deepEqual( fields, expected );
            testHelper.checkAllPropertiesInFirstInSecond( assert, expected, fields );
            
            // A fieldsGroup only (with all default fields)
            items = [ 
                {
                    "type": "fieldsGroup",
                    "source": "default"
                }
            ];
            expected = [
                "id",
                "name",
                "description",
                "date",
                "time",
                "datetime",
                "phoneType",
                "province",
                "city",
                "browser",
                "important",
                "number",
                "hobbies"
            ];
            fields = fieldListBuilder.build( items, options ).fieldsArray;
            assert.deepEqual( buildIdsArray( fields ), expected );
            
            // A fieldsGroup only (starting with datetime)
            items = [ 
                {
                    "type": "fieldsGroup",
                    "source": "default",
                    "start": "datetime"
                }
            ];
            expected = [
                "datetime",
                "phoneType",
                "province",
                "city",
                "browser",
                "important",
                "number",
                "hobbies"
            ];
            fields = fieldListBuilder.build( items, options ).fieldsArray;
            assert.deepEqual( buildIdsArray( fields ), expected );
            
            // A fieldsGroup only (ending with phoneType)
            items = [ 
                {
                    "type": "fieldsGroup",
                    "source": "default",
                    "end": "phoneType"
                }
            ];
            expected = [
                "id",
                "name",
                "description",
                "date",
                "time",
                "datetime",
                "phoneType"
            ];
            fields = fieldListBuilder.build( items, options ).fieldsArray;
            assert.deepEqual( buildIdsArray( fields ), expected );
            
            // A fieldsGroup only (starting with description and ending with browser)
            items = [ 
                {
                    "type": "fieldsGroup",
                    "source": "default",
                    "start": "description",
                    "end": "browser"
                }
            ];
            expected = [
                "description",
                "date",
                "time",
                "datetime",
                "phoneType",
                "province",
                "city",
                "browser"
            ];
            fields = fieldListBuilder.build( items, options ).fieldsArray;
            assert.deepEqual( buildIdsArray( fields ), expected );
            
            // A fieldsGroup only (starting with description and ending with browser except time and phoneType)
            items = [ 
                {
                    "type": "fieldsGroup",
                    "source": "default",
                    "start": "description",
                    "end": "browser",
                    "except": [ "time", "phoneType" ]
                }
            ];
            expected = [
                "description",
                "date",
                "datetime",
                "province",
                "city",
                "browser"
            ];
            fields = fieldListBuilder.build( items, options ).fieldsArray;
            assert.deepEqual( buildIdsArray( fields ), expected );
            
            done();
        }
    );
});

QUnit.test( "Field list from page id builder test", function( assert ) {

    var done = assert.async();
    options = {
        entityId: 'department',
        saveUserPreferences: false,

        pageConf: {
            defaultPageConf: {
                updateURL: 'http://localhost/CRUDManager.do?cmd=BATCH_UPDATE&table=department'
            },
            pages: {
                list: {
                    getGroupOfRecordsURL: 'http://localhost/CRUDManager.do?cmd=LIST&table=department',
                    fields: [ 'id', 'name' ],
                }, 
                create: {
                    fields: [
                        {
                            "type": "fieldsGroup",
                            "source": "list"
                        },
                        'name2'
                    ],
                }, 
                update: {
                    fields: [
                        {
                            "type": "fieldsGroup",
                            "source": "list"
                        },
                        'name3'
                    ],
                }, 
                delete: {
                    fields: [
                        {
                            "type": "fieldsGroup",
                            "source": "update"
                        },
                        'name4'
                    ],
                }
            }
        },
        
        key : 'id',
        fields: {
            id: {
                sorting: false
            },
            name: {
                attributes:{
                    rowHeader: {
                        style: 'width:10%'
                    }
                }
            },
            name2: {
                attributes:{
                    rowHeader: {
                        style: 'width:20%'
                    }
                }
            },
            name3: {
                attributes:{
                    rowHeader: {
                        style: 'width:30%'
                    }
                }
            },
            name4: {
                attributes:{
                    rowHeader: {
                        style: 'width:40%'
                    }
                }
            }
        },
        
        ajax: {
            ajaxFunction: testServerSide.ajax    
        },
        
        i18n: {
            language: 'en',
            filesPath: '/i18n/',
            files: { 
                en: [ 'en-common.json', 'en-services.json' ],
                es: [ 'es-common.json', 'es-services.json' ] 
            }
        }
    };
    
    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){
            $( '#departmentsContainer' ).zcrud( 'renderList' );

            // A fieldsGroup only (with all default fields)
            var items = [ 
                {
                    "type": "fieldsGroup",
                    "source": "list"
                }
            ];
            var expected = [
                "id",
                "name"
            ];
            var fields = fieldListBuilder.build( items, options ).fieldsArray;
            assert.deepEqual( buildIdsArray( fields ), expected );
            
            // A fieldsGroup only (with all default fields except name)
            items = [ 
                {
                    "type": "fieldsGroup",
                    "source": "list",
                    "except": [ "name" ]
                }
            ];
            expected = [
                "id"
            ];
            fields = fieldListBuilder.build( items, options ).fieldsArray;
            assert.deepEqual( buildIdsArray( fields ), expected );
            
            // A fieldsGroup only already built
            items = [ 
                {
                    "type": "fieldsGroup",
                    "source": "create"
                }
            ];
            expected = [
                "id",
                "name",
                "name2"
            ];
            fields = fieldListBuilder.build( items, options ).fieldsArray;
            assert.deepEqual( buildIdsArray( fields ), expected );
            
            // A fieldsGroup only not built
            items = [ 
                {
                    "type": "fieldsGroup",
                    "source": "delete"
                }
            ];
            expected = [
                "id",
                "name",
                "name3",
                "name4"
            ];
            fields = fieldListBuilder.build( items, options ).fieldsArray;
            assert.deepEqual( buildIdsArray( fields ), expected );
            
            done();
        }
    );
});

QUnit.test( "Field list from page id builder with circular references test", function( assert ) {

    var done = assert.async();
    options = {
        entityId: 'department',
        saveUserPreferences: false,

        pageConf: {
            defaultPageConf: {
                updateURL: 'http://localhost/CRUDManager.do?cmd=BATCH_UPDATE&table=department'
            },
            pages: {
                list: {
                    getGroupOfRecordsURL: 'http://localhost/CRUDManager.do?cmd=LIST&table=department',
                    fields: [ 'id', 'name' ],
                }, 
                create: {
                    fields: [
                        {
                            "type": "fieldsGroup",
                            "source": "create"
                        }
                    ],
                }, 
                update: {
                    fields: [
                        {
                            "type": "fieldsGroup",
                            "source": "delete"
                        }
                    ],
                }, 
                delete: {
                    fields: [
                        {
                            "type": "fieldsGroup",
                            "source": "update"
                        }
                    ],
                }
            }
        },
        
        key : 'id',
        fields: {
            id: {
                sorting: false
            },
            name: {
                attributes:{
                    rowHeader: {
                        style: 'width:10%'
                    }
                }
            },
            name2: {
                attributes:{
                    rowHeader: {
                        style: 'width:20%'
                    }
                }
            },
            name3: {
                attributes:{
                    rowHeader: {
                        style: 'width:30%'
                    }
                }
            },
            name4: {
                attributes:{
                    rowHeader: {
                        style: 'width:40%'
                    }
                }
            }
        },

        ajax: {
            ajaxFunction: testServerSide.ajax    
        },

        i18n: {
            language: 'en',
            filesPath: '/i18n/',
            files: { 
                en: [ 'en-common.json', 'en-services.json' ],
                es: [ 'es-common.json', 'es-services.json' ] 
            }
        }
    };

    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){
            $( '#departmentsContainer' ).zcrud( 'renderList' );

            // A fieldsGroup only (circular reference)
            var items = [ 
                {
                    "type": "fieldsGroup",
                    "source": "create"
                }
            ];
            var errors = 0;
            try {
                var fields = fieldListBuilder.build( items, options ).fieldsArray;
            } catch ( e ) {
                ++errors;
            }
            assert.equal( errors, 1 );
            
            // A fieldsGroup only (circular reference)
            items = [ 
                {
                    "type": "fieldsGroup",
                    "source": "update"
                }
            ];
            errors = 0;
            try {
                fields = fieldListBuilder.build( items, options ).fieldsArray;
            } catch ( e ) {
                ++errors;
            }
            assert.equal( errors, 1 );
            
            done();
        }
    );
});

QUnit.test( "Field list from general fields with fieldContainer builder test", function( assert ) {
    
    var done = assert.async();
    options = defaultTestOptions;

    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){
            $( '#departmentsContainer' ).zcrud( 'renderList' );

            // A fieldContainer only (with all default fields)
            var items = [ 
                {
                    "type": "fieldsGroup",
                    "source": [ 'name', 'description' ],
                    "container": {
                        "id": "intro",
                        "containerType": "fieldSet",
                        "template": "fieldSet@templates/containers/basic.html"
                    }
                }
            ];
            var expected = [
                {
                    "id": "name",
                    "type": "text",
                    "elementId": "zcrud-name",
                    "attributes": {},
                    "name": "name",
                    "sorting": true,
                    "template": "text@templates/fields/basic.html",
                    "viewTemplate": undefined
                },
                {
                    "id": "description",
                    "type": "textarea",
                    "attributes": {
                        "field": {
                            "cols": 80,
                            "rows": 6
                        }
                    },
                    "elementId": "zcrud-description",
                    "name": "description",
                    "sorting": true,
                    "template": "textarea@templates/fields/basic.html",
                    "viewTemplate": undefined
                }
            ];
            var expectedView = [
                {
                    "type": "fieldContainer",
                    "id": "intro",
                    "containerType": "fieldSet",
                    "template": "fieldSet@templates/containers/basic.html",
                    "fields": expected
                }
            ];
            
            var fullObjectFields = fieldListBuilder.build( items, options );
            //assert.deepEqual( fullObjectFields.fieldsArray, expected );
            testHelper.checkAllPropertiesInFirstInSecond( assert, expected, fullObjectFields.fieldsArray );
            //assert.deepEqual( fullObjectFields.view, expectedView );
            testHelper.checkAllPropertiesInFirstInSecond( assert, expectedView, fullObjectFields.view );
            
            // A fieldContainer only (with fields only)
            items = [ 
                {
                    "type": "fieldsGroup",
                    "source": [ 
                        {
                            "id": "name",
                            "type": "text"
                        },
                        {
                            "id": "description",
                            "type": "textarea",
                            "attributes": {
                                "field": {
                                    "cols": 80,
                                    "rows": 6
                                }
                            }
                        }
                    ],
                    "container": {
                        "id": "intro",
                        "containerType": "fieldSet",
                        "template": "fieldSet@templates/containers/basic.html"
                    }
                }
            ];
            expected = [
                {
                    "id": "name",
                    "type": "text",
                    "elementId": "zcrud-name",
                    "attributes": {},
                    "name": "name",
                    "sorting": true,
                    "template": "text@templates/fields/basic.html",
                    "viewTemplate": undefined
                },
                {
                    "id": "description",
                    "type": "textarea",
                    "attributes": {
                        "field": {
                            "cols": 80,
                            "rows": 6
                        }
                    },
                    "elementId": "zcrud-description",
                    "name": "description",
                    "sorting": true,
                    "template": "textarea@templates/fields/basic.html",
                    "viewTemplate": undefined
                }
            ];
            expectedView = [
                {
                    "type": "fieldContainer",
                    "id": "intro",
                    "containerType": "fieldSet",
                    "template": "fieldSet@templates/containers/basic.html",
                    "fields": expected
                }
            ];
            
            fullObjectFields = fieldListBuilder.build( items, options );
            //assert.deepEqual( fullObjectFields.fieldsArray, expected );
            testHelper.checkAllPropertiesInFirstInSecond( assert, expected, fullObjectFields.fieldsArray );
            //assert.deepEqual( fullObjectFields.view, expectedView );
            testHelper.checkAllPropertiesInFirstInSecond( assert, expectedView, fullObjectFields.view );
            
            // A fieldContainer only (with a fieldsGroup only starting with description and ending with browser except time and phoneType)
            items = [ 
                {
                    "type": "fieldsGroup",
                    "source": "default",
                    "start": "description",
                    "end": "browser",
                    "except": [ "time", "phoneType" ],
                    "container": {
                        "id": "intro",
                        "containerType": "fieldSet",
                        "template": "fieldSet@templates/containers/basic.html"
                    }
                }
            ];
            expected = [
                "description",
                "date",
                "datetime",
                "province",
                "city",
                "browser"
            ];
            expectedView = [
                {
                    "type": "fieldContainer",
                    "id": "intro",
                    "containerType": "fieldSet",
                    "template": "fieldSet@templates/containers/basic.html",
                    "fields": expected
                }
            ];
            
            fullObjectFields = fieldListBuilder.build( items, options );
            assert.deepEqual( 
                buildIdsArray( fullObjectFields.fieldsArray ), 
                expected );
            assert.deepEqual( 
                buildIdsArray( fullObjectFields.view ), 
                expectedView );
            
            // A string and a fieldContainer (with a fieldsGroup only starting with description and ending with browser except time and phoneType)
            items = [ 
                'id',
                {
                    "type": "fieldsGroup",
                    "source": "default",
                    "start": "description",
                    "end": "browser",
                    "except": [ "time", "phoneType" ],
                    "container": {
                        "id": "intro",
                        "containerType": "div",
                        "template": "fieldSet@templates/containers/basic.html"
                    }
                }
            ];
            expected = [
                "id",
                "description",
                "date",
                "datetime",
                "province",
                "city",
                "browser"
            ];
            expectedView = [
                "id",
                {
                    "type": "fieldContainer",
                    "id": "intro",
                    "containerType": "div",
                    "template": "div@templates/containers/basic.html",
                    "fields": [
                        "description",
                        "date",
                        "datetime",
                        "province",
                        "city",
                        "browser"
                    ]
                }
            ];
            
            fullObjectFields = fieldListBuilder.build( items, options );
            assert.deepEqual( 
                buildIdsArray( fullObjectFields.fieldsArray ), 
                expected );
            assert.deepEqual( 
                buildIdsArray( fullObjectFields.view ), 
                expectedView );
            
            done();
        }
    );
});

QUnit.test( "Field list from another view builder test", function( assert ) {
    
    var done = assert.async();
    var thisTestOptions = {
        pageConf: {
            pages: {
                create: {
                    fields: [
                        {
                            "type": "fieldsGroup"
                        }
                    ]
                }, 
                update: {
                    fields: [
                        {
                            "type": "fieldsGroup",
                            "source": [ 
                                'id',
                                'name',
                                'description' 
                            ],
                            "container": {
                                "id": "basicData",
                                "containerType": "fieldSet"
                            }
                        },
                        {
                            "type": "fieldsGroup",
                            "source": "default",
                            "start": "date",
                            "end": "phoneType"
                        },
                        {
                            "type": "fieldsGroup",
                            "source": [ 
                                'province',
                                'city'
                            ],
                            "container": {
                                "id": "location",
                                "containerType": "fieldSet"
                            }
                        },
                        'browser',
                        'important'
                    ]
                }, 
                delete: {
                    fields: [
                        {
                            "type": "fieldsGroup",
                            "source": "update",
                            "except": [ 'time' ],
                            "end": "location"
                        }
                    ]
                }
            }
        }
    };
    options = utils.extend( true, {}, defaultTestOptions, thisTestOptions );

    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){
            $( '#departmentsContainer' ).zcrud( 'renderList' );

            var expected = 	
                [
                    "id",
                    "name",
                    "description",
                    "date",
                    "datetime",
                    "phoneType",
                    "province",
                    "city"
                ];
            var expectedView = 
                [
                    {
                        "fields": [
                            "id",
                            "name",
                            "description"
                        ],
                        "id": "basicData",
                        "containerType": "fieldSet",
                        "template": "fieldSet@templates/containers/basic.html",
                        "type": "fieldContainer"
                    },
                    "date",
                    "datetime",
                    "phoneType",
                    {
                        "fields": [
                            "province",
                            "city"
                        ],
                        "id": "location",
                        "containerType": "fieldSet",
                        "template": "fieldSet@templates/containers/basic.html",
                        "type": "fieldContainer"
                    }
                ];
            var fullObjectFields = fieldListBuilder.getForPage( 'delete', options );
            
            assert.deepEqual( 
                buildIdsArray( fullObjectFields.fieldsArray ), 
                expected );
            assert.deepEqual( 
                buildIdsArray( fullObjectFields.view ), 
                expectedView );

            done();
        }
    );
});
