"use strict";

var $ = require( 'jquery' );
var zcrud = require( '../../../js/app/main.js' );
require( '../../../js/app/jqueryPlugin.js' );
var Qunit = require( 'qunit' );
var testHelper = require( './testHelper.js' );
var testServerSide = require( './testServerSide.js' );
var context = require( '../../../js/app/context.js' );

var formOptions = require( './defaultTestOptions.js' );
var subformTestOptions = require( './subformTestOptions.js' );
var editableListTestOptions = require( './editableListTestOptions.js' );
var options = undefined;

var errorFunctionCounter = 0;
formOptions.errorFunction = function( message ){
    ++errorFunctionCounter;
};
subformTestOptions.errorFunction = function( message ){
    ++errorFunctionCounter;
};
editableListTestOptions.errorFunction = function( message ){
    ++errorFunctionCounter;
};

var configureOptions = function( optionsToExtend ){

    options = $.extend( true, {}, optionsToExtend );
    options.pageConf.defaultPageConf.getRecordURL = 'http://localhost/CRUDManager.do?cmd=GET&table=people';
    options.pageConf.pages.list.getGroupOfRecordsURL = 'http://localhost/CRUDManager.do?cmd=LIST&table=people';
    options.pageConf.pages.list.fields = [ 
        {
            "type": "fieldsGroup"
        }
    ];
    options.fields.phoneType.options = 'http://localhost/CRUDManager.do?table=phoneTypesUsingId';
    delete options.fields.name.attributes;
    delete options.fields.province;
    delete options.fields.city;
    delete options.fields.number;
};

var configureFormOptions = function(){
    configureOptions( formOptions );
};

var configureEditableListFormOptions = function(){

    options = $.extend( true, {}, editableListTestOptions );
    options.pageConf.pages.list.getGroupOfRecordsURL = 'http://localhost/CRUDManager.do?cmd=LIST&table=people';
    options.pageConf.pages.list.fields = [ 
        {
            "type": "fieldsGroup"
        }
    ];
    options.fields.phoneType.options = 'http://localhost/CRUDManager.do?table=phoneTypesUsingId';
    delete options.fields.name.attributes;
    delete options.fields.province;
    delete options.fields.city;
    delete options.fields.number;
    options.fields.id.attributes = {
        field: {
            size: 4
        }
    };
    options.fields.description.attributes = {
        field: {
            rows: 2,
            cols: 10
        }
    };
    options.fields.hobbies = {
        type: 'checkboxes',
        translateOptions: true,
        options: [ 'reading_option', 'videogames_option', 'sports_option', 'cards_option' ]
    };
};

var configureSubformOptions = function(){
    configureOptions( formOptions );
    options.pageConf.pages.list.fields = [ 
        {
            "type": "fieldsGroup",
            "except": [ "members" ]
        }
    ];
    options.fields.members = {
        type: 'subform',
        subformKey: 'code',
        fields: { 
            code: { 
                attributes: {
                    field: {
                        size: 4
                    }
                }
            },
            name: { },
            description: {
                type: 'textarea',
                attributes: {
                    field: {
                        rows: 2,
                        cols: 10
                    }
                }
            },
            date: {
                type: 'date',
                inline: false
            },
            time: {
                type: 'time'
            },
            datetime: {
                type: 'datetime'
            },
            phoneType: {
                type: 'radio',
                translateOptions: true,
                options: 'http://localhost/CRUDManager.do?table=phoneTypesUsingId'
            },
            browser: {
                type: 'datalist',
                options: [ 'Internet Explorer', 'Firefox', 'Chrome', 'Opera', 'Safari' ]
            },
            important: {
                type: 'checkbox'
            },
            hobbies: {
                type: 'checkboxes',
                translateOptions: true,
                options: [ 'reading_option', 'videogames_option', 'sports_option', 'cards_option' ]
            }
        }
    };
};

var buildRecord1 = function(){

    return {
        "id": "1",
        "name": "Ulysses Aguilar",
        "description": "Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Curabitur sed tortor. Integer aliquam adipiscing lacus. Ut nec urna",
        "date": new Date( "2017-06-06" ).getTime(),
        "datetime": new Date( "2014-11-23T22:10:04" ).getTime(),
        "time": "04:40",
        "phoneType": 1,
        "browser": "Internet Explorer",
        "important": false,
        "hobbies": [ 'reading_option', 'sports_option', 'cards_option' ]
    };
};

var buildSubformRecord1 = function(){
    
    return {
        "id": "2",
        "name": "Mara Riggs",
        "description": "Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Curabitur sed tortor. Integer aliquam adipiscing lacus. Ut nec",
        "date": new Date( "2013-04-07" ).getTime(),
        "datetime": new Date( "2013-07-06T19:44:23" ).getTime(),
        "time": "09:14",
        "phoneType": 3,
        "browser": "Internet Explorer",
        "important": true,
        "hobbies": [ 'videogames_option', 'sports_option', 'cards_option' ],
        "members": [
            {
                "code": 1,
                "name": "Leah Nguyen",
                "description": "Lorem",
                "date": new Date( "2012-10-11" ).getTime(),
                "datetime": new Date( "2019-06-19T07:57:41" ).getTime(),
                "time": "13:57",
                "phoneType": 2,
                "browser": "Chrome",
                "important": true,
                "hobbies": [ 'reading_option', 'videogames_option', 'sports_option' ]  
            },
            {
                "code": 2,
                "name": "Victor Knight",
                "description": "Lorem ipsum",
                "date": new Date( "2019-02-21" ).getTime(),
                "datetime": new Date( "2017-08-04T22:40:04" ).getTime(),
                "time": "10:15",
                "phoneType": 3,
                "browser": "Opera",
                "important": false,
                "hobbies": [ 'videogames_option', 'cards_option' ]  
            }
        ]
    }
};

// Run tests

QUnit.test( "list test", function( assert ) {

    var done = assert.async();
    configureFormOptions();
    testServerSide.resetPeople();
    
    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){
            
            errorFunctionCounter = 0;
            
            assert.equal( errorFunctionCounter, 0 );
            $( '#departmentsContainer' ).zcrud( 'renderList' );
            assert.equal( errorFunctionCounter, 0 );
            
            testHelper.pagingTest({
                options: options,
                assert: assert,
                visibleRows: 10,
                pagingInfo: 'Showing 1-10 of 12',
                records: [
                    "1|Ulysses Aguilar|Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Curabitur sed tortor. Integer aliquam adipiscing lacus. Ut nec urna|06/06/2017|04:40|11/23/2014 22:10|Home phone|Internet Explorer|False|Reading, Sports, Cards",
                    "2|Mara Riggs|Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Curabitur sed tortor. Integer aliquam adipiscing lacus. Ut nec|04/07/2013|09:14|07/06/2013 19:44|Cell phone|Internet Explorer|True|Videogames, Sports, Cards",
                    "3|Leah Nguyen|Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Curabitur sed tortor. Integer aliquam adipiscing lacus. Ut nec urna|10/11/2012|13:57|06/19/2019 07:57|Office phone|Chrome|True|Reading, Videogames, Sports",
                    "4|Victor Knight|Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Curabitur sed tortor. Integer aliquam adipiscing|02/21/2019|10:15|08/04/2017 22:40|Cell phone|Opera|True|Reading, Videogames, Cards",
                    "5|Samson Bernard|Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Curabitur sed tortor. Integer aliquam adipiscing lacus. Ut nec urna et|04/05/2018|04:11|07/13/2015 03:46|Home phone|Safari|False|Reading, Videogames, Sports",
                    "6|Wade Pierce|Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Curabitur sed tortor. Integer aliquam adipiscing lacus.|10/21/2012|23:25|12/19/2013 12:01|Office phone|Chrome|False|Reading, Sports, Cards",
                    "7|Seth Hatfield|Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Curabitur sed|09/28/2017|12:57|01/15/2017 12:40|Office phone|Chrome|False|Reading, Videogames, Cards",
                    "8|Henry Moses|Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Curabitur sed tortor. Integer aliquam adipiscing lacus. Ut nec|10/01/2017|08:39|07/16/2018 14:35|Cell phone|Opera|False|Videogames, Sports, Cards",
                    "9|Ivy Duncan|Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Curabitur sed tortor. Integer aliquam adipiscing lacus. Ut|06/15/2011|06:30|02/07/2019 13:51|Home phone|Firefox|False|Reading, Videogames, Cards",
                    "10|Tatum Edwards|Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Curabitur sed tortor. Integer aliquam adipiscing lacus. Ut|09/11/2015|23:39|09/11/2016 22:24|Office phone|Safari|True|Videogames, Sports, Cards"
                ],
                pageListNotActive: [ '<<', '<', '1' ],
                pageListActive: [ '2', '>', '>>' ]
            });
            
            testHelper.pagingTest({
                action: { 
                    nextPage: true
                },
                options: options,
                assert: assert,
                visibleRows: 2,
                pagingInfo: 'Showing 11-12 of 12',
                records: [
                    "11|Hamish Jones|Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Curabitur sed tortor. Integer|09/29/2018|09:19|07/01/2016 00:15|Office phone|Opera|True|Reading, Sports, Cards",
                    "12|Amos Norton|Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Curabitur sed tortor. Integer aliquam adipiscing lacus. Ut nec|12/05/2013|09:28|05/06/2017 12:45|Office phone|Opera|True|Reading, Videogames, Cards"
                ],
                pageListNotActive: [ "2", ">", ">>" ],
                pageListActive: [ "<<", "<", "1" ]
            });
            
            testHelper.pagingTest({
                action: { 
                    previousPage: true
                },
                options: options,
                assert: assert,
                visibleRows: 10,
                pagingInfo: 'Showing 1-10 of 12',
                records: [
                    "1|Ulysses Aguilar|Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Curabitur sed tortor. Integer aliquam adipiscing lacus. Ut nec urna|06/06/2017|04:40|11/23/2014 22:10|Home phone|Internet Explorer|False|Reading, Sports, Cards",
                    "2|Mara Riggs|Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Curabitur sed tortor. Integer aliquam adipiscing lacus. Ut nec|04/07/2013|09:14|07/06/2013 19:44|Cell phone|Internet Explorer|True|Videogames, Sports, Cards",
                    "3|Leah Nguyen|Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Curabitur sed tortor. Integer aliquam adipiscing lacus. Ut nec urna|10/11/2012|13:57|06/19/2019 07:57|Office phone|Chrome|True|Reading, Videogames, Sports",
                    "4|Victor Knight|Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Curabitur sed tortor. Integer aliquam adipiscing|02/21/2019|10:15|08/04/2017 22:40|Cell phone|Opera|True|Reading, Videogames, Cards",
                    "5|Samson Bernard|Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Curabitur sed tortor. Integer aliquam adipiscing lacus. Ut nec urna et|04/05/2018|04:11|07/13/2015 03:46|Home phone|Safari|False|Reading, Videogames, Sports",
                    "6|Wade Pierce|Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Curabitur sed tortor. Integer aliquam adipiscing lacus.|10/21/2012|23:25|12/19/2013 12:01|Office phone|Chrome|False|Reading, Sports, Cards",
                    "7|Seth Hatfield|Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Curabitur sed|09/28/2017|12:57|01/15/2017 12:40|Office phone|Chrome|False|Reading, Videogames, Cards",
                    "8|Henry Moses|Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Curabitur sed tortor. Integer aliquam adipiscing lacus. Ut nec|10/01/2017|08:39|07/16/2018 14:35|Cell phone|Opera|False|Videogames, Sports, Cards",
                    "9|Ivy Duncan|Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Curabitur sed tortor. Integer aliquam adipiscing lacus. Ut|06/15/2011|06:30|02/07/2019 13:51|Home phone|Firefox|False|Reading, Videogames, Cards",
                    "10|Tatum Edwards|Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Curabitur sed tortor. Integer aliquam adipiscing lacus. Ut|09/11/2015|23:39|09/11/2016 22:24|Office phone|Safari|True|Videogames, Sports, Cards"
                ],
                pageListNotActive: [ '<<', '<', '1' ],
                pageListActive: [ '2', '>', '>>' ]
            });
            
            done();
        }
    );
});

QUnit.test( "form update test", function( assert ) {

    var done = assert.async();
    configureFormOptions();
    testServerSide.resetPeople();
    
    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){
            $( '#departmentsContainer' ).zcrud( 'renderList' );

            // Assert register with key 1 exists
            var key = 1;
            var record = buildRecord1();
            assert.deepEqual( testServerSide.getPerson( key ), record );
            
            // Go to edit form
            testHelper.clickUpdateListButton( key );
            
            // Check it
            var clientRecord = $.extend( true, {}, record );
            clientRecord.date = '06/06/2017';
            clientRecord.datetime = '11/23/2014 22:10';
            clientRecord.phoneType = "" + record.phoneType;
            testHelper.checkForm( assert, clientRecord );
            
            done();
        }
    );
});

QUnit.test( "form delete test", function( assert ) {

    var done = assert.async();
    configureFormOptions();
    testServerSide.resetPeople();

    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){
            $( '#departmentsContainer' ).zcrud( 'renderList' );

            // Assert register with key 1 exists
            var key = 1;
            var record = buildRecord1();
            assert.deepEqual( testServerSide.getPerson( key ), record );

            // Go to edit form
            testHelper.clickDeleteListButton( key );

            // Check it
            var clientRecord = $.extend( true, {}, record );
            clientRecord.date = '06/06/2017';
            clientRecord.datetime = '11/23/2014 22:10';
            clientRecord.phoneType = 'Home phone';
            clientRecord.important = 'False';
            clientRecord.hobbies = 'Reading, Sports, Cards';
            
            testHelper.checkDeleteForm( assert, clientRecord );

            done();
        }
    );
});

QUnit.test( "subform update test", function( assert ) {

    var done = assert.async();
    configureSubformOptions();
    testServerSide.resetPeople();

    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){
            $( '#departmentsContainer' ).zcrud( 'renderList' );

            // Assert register with key 1 exists
            var key = 2;
            var record = buildSubformRecord1();
            assert.deepEqual( testServerSide.getPerson( key ), record );
            
            // Go to edit form
            testHelper.clickUpdateListButton( key );
            
            // Check it
            var clientRecord = $.extend( true, {}, record );
            clientRecord.date = '04/07/2013';
            clientRecord.datetime = '07/06/2013 19:44';
            clientRecord.phoneType = '' + record.phoneType;
            clientRecord.members[0].code = '' + record.members[0].code;
            clientRecord.members[0].date = '10/11/2012';
            clientRecord.members[0].datetime = '06/19/2019 07:57';
            clientRecord.members[0].phoneType = '' + record.members[0].phoneType;
            clientRecord.members[1].code = '' + record.members[1].code;
            clientRecord.members[1].date = '02/21/2019';
            clientRecord.members[1].datetime = '08/04/2017 22:40';
            clientRecord.members[1].phoneType = '' + record.members[1].phoneType;
            testHelper.checkForm( assert, clientRecord );
            
            done();
        }
    );
});

QUnit.test( "subform delete test", function( assert ) {

    var done = assert.async();
    configureSubformOptions();
    testServerSide.resetPeople();

    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){
            $( '#departmentsContainer' ).zcrud( 'renderList' );

            // Assert register with key 1 exists
            var key = 2;
            var record = buildSubformRecord1();
            assert.deepEqual( testServerSide.getPerson( key ), record );

            // Go to edit form
            testHelper.clickDeleteListButton( key );

            // Check it
            var clientRecord = $.extend( true, {}, record );
            clientRecord.date = '04/07/2013';
            clientRecord.datetime = '07/06/2013 19:44';
            clientRecord.phoneType = 'Cell phone';
            clientRecord.important = 'True';
            clientRecord.hobbies = 'Videogames, Sports, Cards';
            clientRecord.members[0].code = '' + record.members[0].code;
            clientRecord.members[0].date = '10/11/2012';
            clientRecord.members[0].important = 'True';
            clientRecord.members[0].datetime = '06/19/2019 07:57';
            clientRecord.members[0].phoneType = 'Office phone';
            clientRecord.members[0].hobbies = 'Reading, Videogames, Sports';
            clientRecord.members[1].code = '' + record.members[1].code;
            clientRecord.members[1].date = '02/21/2019';
            clientRecord.members[1].important = 'False';
            clientRecord.members[1].datetime = '08/04/2017 22:40';
            clientRecord.members[1].phoneType = 'Cell phone';
            clientRecord.members[1].hobbies = 'Videogames, Cards';
            
            testHelper.checkDeleteForm( assert, clientRecord );

            done();
        }
    );
});

QUnit.test( "editable list test", function( assert ) {

    var done = assert.async();
    configureEditableListFormOptions();
    testServerSide.resetPeople();

    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){

            errorFunctionCounter = 0;

            assert.equal( errorFunctionCounter, 0 );
            $( '#departmentsContainer' ).zcrud( 'renderList' );
            assert.equal( errorFunctionCounter, 0 );

            testHelper.pagingTest({
                options: options,
                assert: assert,
                visibleRows: 10,
                pagingInfo: 'Showing 1-10 of 12',
                records: [
                    "1|Ulysses Aguilar|Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Curabitur sed tortor. Integer aliquam adipiscing lacus. Ut nec urna|06/06/2017|04:40|11/23/2014 22:10|1|Internet Explorer|false|[reading_option/sports_option/cards_option]",
                    "2|Mara Riggs|Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Curabitur sed tortor. Integer aliquam adipiscing lacus. Ut nec|04/07/2013|09:14|07/06/2013 19:44|3|Internet Explorer|true|[videogames_option/sports_option/cards_option]",
                    "3|Leah Nguyen|Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Curabitur sed tortor. Integer aliquam adipiscing lacus. Ut nec urna|10/11/2012|13:57|06/19/2019 07:57|2|Chrome|true|[reading_option/videogames_option/sports_option]",
                    "4|Victor Knight|Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Curabitur sed tortor. Integer aliquam adipiscing|02/21/2019|10:15|08/04/2017 22:40|3|Opera|true|[reading_option/videogames_option/cards_option]",
                    "5|Samson Bernard|Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Curabitur sed tortor. Integer aliquam adipiscing lacus. Ut nec urna et|04/05/2018|04:11|07/13/2015 03:46|1|Safari|false|[reading_option/videogames_option/sports_option]",
                    "6|Wade Pierce|Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Curabitur sed tortor. Integer aliquam adipiscing lacus.|10/21/2012|23:25|12/19/2013 12:01|2|Chrome|false|[reading_option/sports_option/cards_option]",
                    "7|Seth Hatfield|Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Curabitur sed|09/28/2017|12:57|01/15/2017 12:40|2|Chrome|false|[reading_option/videogames_option/cards_option]",
                    "8|Henry Moses|Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Curabitur sed tortor. Integer aliquam adipiscing lacus. Ut nec|10/01/2017|08:39|07/16/2018 14:35|3|Opera|false|[videogames_option/sports_option/cards_option]",
                    "9|Ivy Duncan|Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Curabitur sed tortor. Integer aliquam adipiscing lacus. Ut|06/15/2011|06:30|02/07/2019 13:51|1|Firefox|false|[reading_option/videogames_option/cards_option]",
                    "10|Tatum Edwards|Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Curabitur sed tortor. Integer aliquam adipiscing lacus. Ut|09/11/2015|23:39|09/11/2016 22:24|2|Safari|true|[videogames_option/sports_option/cards_option]"
                ],
                pageListNotActive: [ '<<', '<', '1' ],
                pageListActive: [ '2', '>', '>>' ],
                editable: true
            });
            
            testHelper.pagingTest({
                action: { 
                    nextPage: true
                },
                options: options,
                assert: assert,
                visibleRows: 2,
                pagingInfo: 'Showing 11-12 of 12',
                records: [
                    "11|Hamish Jones|Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Curabitur sed tortor. Integer|09/29/2018|09:19|07/01/2016 00:15|2|Opera|true|[reading_option/sports_option/cards_option]",
                    "12|Amos Norton|Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Curabitur sed tortor. Integer aliquam adipiscing lacus. Ut nec|12/05/2013|09:28|05/06/2017 12:45|2|Opera|true|[reading_option/videogames_option/cards_option]"
                ],
                pageListNotActive: [ "2", ">", ">>" ],
                pageListActive: [ "<<", "<", "1" ],
                editable: true
            });
            
            testHelper.pagingTest({
                action: { 
                    previousPage: true
                },
                options: options,
                assert: assert,
                visibleRows: 10,
                pagingInfo: 'Showing 1-10 of 12',
                records: [
                    "1|Ulysses Aguilar|Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Curabitur sed tortor. Integer aliquam adipiscing lacus. Ut nec urna|06/06/2017|04:40|11/23/2014 22:10|1|Internet Explorer|false|[reading_option/sports_option/cards_option]",
                    "2|Mara Riggs|Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Curabitur sed tortor. Integer aliquam adipiscing lacus. Ut nec|04/07/2013|09:14|07/06/2013 19:44|3|Internet Explorer|true|[videogames_option/sports_option/cards_option]",
                    "3|Leah Nguyen|Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Curabitur sed tortor. Integer aliquam adipiscing lacus. Ut nec urna|10/11/2012|13:57|06/19/2019 07:57|2|Chrome|true|[reading_option/videogames_option/sports_option]",
                    "4|Victor Knight|Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Curabitur sed tortor. Integer aliquam adipiscing|02/21/2019|10:15|08/04/2017 22:40|3|Opera|true|[reading_option/videogames_option/cards_option]",
                    "5|Samson Bernard|Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Curabitur sed tortor. Integer aliquam adipiscing lacus. Ut nec urna et|04/05/2018|04:11|07/13/2015 03:46|1|Safari|false|[reading_option/videogames_option/sports_option]",
                    "6|Wade Pierce|Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Curabitur sed tortor. Integer aliquam adipiscing lacus.|10/21/2012|23:25|12/19/2013 12:01|2|Chrome|false|[reading_option/sports_option/cards_option]",
                    "7|Seth Hatfield|Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Curabitur sed|09/28/2017|12:57|01/15/2017 12:40|2|Chrome|false|[reading_option/videogames_option/cards_option]",
                    "8|Henry Moses|Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Curabitur sed tortor. Integer aliquam adipiscing lacus. Ut nec|10/01/2017|08:39|07/16/2018 14:35|3|Opera|false|[videogames_option/sports_option/cards_option]",
                    "9|Ivy Duncan|Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Curabitur sed tortor. Integer aliquam adipiscing lacus. Ut|06/15/2011|06:30|02/07/2019 13:51|1|Firefox|false|[reading_option/videogames_option/cards_option]",
                    "10|Tatum Edwards|Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Curabitur sed tortor. Integer aliquam adipiscing lacus. Ut|09/11/2015|23:39|09/11/2016 22:24|2|Safari|true|[videogames_option/sports_option/cards_option]"
                ],
                pageListNotActive: [ '<<', '<', '1' ],
                pageListActive: [ '2', '>', '>>' ],
                editable: true
            });

            done();
        }
    );
});

