
import { utils } from '../../../js/app/utils.js';
import { zzDOM } from '../../../js/app/zzDOMPlugin.js';
var $ = zzDOM.zz;

import { testHelper } from './testHelper.js';
import { testServerSide } from './testServerSide.js';

import { defaultTestOptions as formOptions } from './defaultTestOptions.js';
import { subformTestOptions } from './subformTestOptions.js';
import { editableListTestOptions } from './editableListTestOptions.js';

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

    options = utils.extend( true, {}, optionsToExtend );
    options.pageConf.defaultPageConf.getRecordURL = 'http://localhost/CRUDManager.do?cmd=GET&table=people';
    options.pageConf.pages.list.getGroupOfRecordsURL = 'http://localhost/CRUDManager.do?cmd=LIST&table=people';
    options.pageConf.pages.list.fields = [ 
        {
            'type': 'fieldsGroup'
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

    options = utils.extend( true, {}, editableListTestOptions );
    options.pageConf.pages.list.getGroupOfRecordsURL = 'http://localhost/CRUDManager.do?cmd=LIST&table=people';
    options.pageConf.pages.list.fields = [ 
        {
            'type': 'fieldsGroup'
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
            'type': 'fieldsGroup',
            'except': [ 'members' ]
        }
    ];
    options.fields.members = {
        type: 'subform',
        getGroupOfRecordsURL: 'http://localhost/CRUDManager.do?cmd=LIST&table=peopleMembers',
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
                options: [ 'Edge', 'Firefox', 'Chrome', 'Opera', 'Safari' ]
            },
            important: {
                type: 'checkbox'
            },
            hobbies: {
                type: 'checkboxes',
                translateOptions: true,
                options: [ 'reading_option', 'videogames_option', 'sports_option', 'cards_option' ]
            }
        },
        components: {
            paging: {
                isOn: true,
                defaultPageSize: 10,
                pageSizes: [10, 25, 50, 100, 250, 500],
                pageSizeChangeArea: true,
                gotoPageFieldType: 'combobox', // possible values: 'textbox', 'combobox', 'none'
                maxNumberOfAllShownPages: 5,
                block1NumberOfPages: 1,
                block2NumberOfPages: 5,
                block3NumberOfPages: 1
            }
        }
    };
};

var buildRecord1 = function(){

    return {
        'id': '1',
        'name': 'Ulysses Aguilar',
        'description': 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Curabitur sed tortor. Integer aliquam adipiscing lacus. Ut nec urna',
        'date': new Date( '2017-06-06' ).getTime(),
        'datetime': new Date( '2014-11-23T22:10:04' ).getTime(),
        'time': '04:40',
        'phoneType': 1,
        'browser': 'Edge',
        'important': false,
        'hobbies': [ 'reading_option', 'sports_option', 'cards_option' ],
        "password": "mypassword1"
    };
};

var buildSubformRecord1 = function(){
    
    return {
        'id': '2',
        'name': 'Mara Riggs',
        'description': 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Curabitur sed tortor. Integer aliquam adipiscing lacus. Ut nec',
        'date': new Date( '2013-04-07' ).getTime(),
        'datetime': new Date( '2013-07-06T19:44:23' ).getTime(),
        'time': '09:14',
        'phoneType': 3,
        'browser': 'Edge',
        'important': true,
        'hobbies': [ 'videogames_option', 'sports_option', 'cards_option' ],
        'members': [
            {
                'code': 1,
                'name': 'Leah Nguyen',
                'description': 'Lorem',
                'date': new Date( '2012-10-11' ).getTime(),
                'datetime': new Date( '2019-06-19T07:57:41' ).getTime(),
                'time': '13:57',
                'phoneType': 2,
                'browser': 'Chrome',
                'important': true,
                'hobbies': [ 'reading_option', 'videogames_option', 'sports_option' ]  
            },
            {
                'code': 2,
                'name': 'Victor Knight',
                'description': 'Lorem ipsum',
                'date': new Date( '2019-02-21' ).getTime(),
                'datetime': new Date( '2017-08-04T22:40:04' ).getTime(),
                'time': '10:15',
                'phoneType': 3,
                'browser': 'Opera',
                'important': false,
                'hobbies': [ 'videogames_option', 'cards_option' ]  
            }
        ]
    }
};

// Run tests
QUnit.test( 'list test', function( assert ) {

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
                    '1|Ulysses Aguilar|Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Curabitur sed tortor. Integer aliquam adipiscing lacus. Ut nec urna|06/06/2017|04:40|11/23/2014 22:10|Home phone|Edge|False|Reading, Sports, Cards|mypassword1',
                    '2|Mara Riggs|Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Curabitur sed tortor. Integer aliquam adipiscing lacus. Ut nec|04/07/2013|09:14|07/06/2013 19:44|Cell phone|Edge|True|Videogames, Sports, Cards|mypassword2',
                    '3|Leah Nguyen|Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Curabitur sed tortor. Integer aliquam adipiscing lacus. Ut nec urna|10/11/2012|13:57|06/19/2019 07:57|Office phone|Chrome|True|Reading, Videogames, Sports|mypassword3',
                    '4|Victor Knight|Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Curabitur sed tortor. Integer aliquam adipiscing|02/21/2019|10:15|08/04/2017 22:40|Cell phone|Opera|True|Reading, Videogames, Cards|mypassword4',
                    '5|Samson Bernard|Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Curabitur sed tortor. Integer aliquam adipiscing lacus. Ut nec urna et|04/05/2018|04:11|07/13/2015 03:46|Home phone|Safari|False|Reading, Videogames, Sports|mypassword5',
                    '6|Wade Pierce|Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Curabitur sed tortor. Integer aliquam adipiscing lacus.|10/21/2012|23:25|12/19/2013 12:01|Office phone|Chrome|False|Reading, Sports, Cards|mypassword6',
                    '7|Seth Hatfield|Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Curabitur sed|09/28/2017|12:57|01/15/2017 12:40|Office phone|Chrome|False|Reading, Videogames, Cards|mypassword7',
                    '8|Henry Moses|Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Curabitur sed tortor. Integer aliquam adipiscing lacus. Ut nec|10/01/2017|08:39|07/16/2018 14:35|Cell phone|Opera|False|Videogames, Sports, Cards|mypassword8',
                    '9|Ivy Duncan|Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Curabitur sed tortor. Integer aliquam adipiscing lacus. Ut|06/15/2011|06:30|02/07/2019 13:51|Home phone|Firefox|False|Reading, Videogames, Cards|mypassword9',
                    '10|Tatum Edwards|Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Curabitur sed tortor. Integer aliquam adipiscing lacus. Ut|09/11/2015|23:39|09/11/2016 22:24|Office phone|Safari|True|Videogames, Sports, Cards|mypassword10'
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
                    '11|Hamish Jones|Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Curabitur sed tortor. Integer|09/29/2018|09:19|07/01/2016 00:15|Office phone|Opera|True|Reading, Sports, Cards|mypassword11',
                    '12|Amos Norton|Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Curabitur sed tortor. Integer aliquam adipiscing lacus. Ut nec|12/05/2013|09:28|05/06/2017 12:45|Office phone|Opera|True|Reading, Videogames, Cards|mypassword12'
                ],
                pageListNotActive: [ '2', '>', '>>' ],
                pageListActive: [ '<<', '<', '1' ]
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
                    '1|Ulysses Aguilar|Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Curabitur sed tortor. Integer aliquam adipiscing lacus. Ut nec urna|06/06/2017|04:40|11/23/2014 22:10|Home phone|Edge|False|Reading, Sports, Cards|mypassword1',
                    '2|Mara Riggs|Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Curabitur sed tortor. Integer aliquam adipiscing lacus. Ut nec|04/07/2013|09:14|07/06/2013 19:44|Cell phone|Edge|True|Videogames, Sports, Cards|mypassword2',
                    '3|Leah Nguyen|Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Curabitur sed tortor. Integer aliquam adipiscing lacus. Ut nec urna|10/11/2012|13:57|06/19/2019 07:57|Office phone|Chrome|True|Reading, Videogames, Sports|mypassword3',
                    '4|Victor Knight|Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Curabitur sed tortor. Integer aliquam adipiscing|02/21/2019|10:15|08/04/2017 22:40|Cell phone|Opera|True|Reading, Videogames, Cards|mypassword4',
                    '5|Samson Bernard|Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Curabitur sed tortor. Integer aliquam adipiscing lacus. Ut nec urna et|04/05/2018|04:11|07/13/2015 03:46|Home phone|Safari|False|Reading, Videogames, Sports|mypassword5',
                    '6|Wade Pierce|Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Curabitur sed tortor. Integer aliquam adipiscing lacus.|10/21/2012|23:25|12/19/2013 12:01|Office phone|Chrome|False|Reading, Sports, Cards|mypassword6',
                    '7|Seth Hatfield|Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Curabitur sed|09/28/2017|12:57|01/15/2017 12:40|Office phone|Chrome|False|Reading, Videogames, Cards|mypassword7',
                    '8|Henry Moses|Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Curabitur sed tortor. Integer aliquam adipiscing lacus. Ut nec|10/01/2017|08:39|07/16/2018 14:35|Cell phone|Opera|False|Videogames, Sports, Cards|mypassword8',
                    '9|Ivy Duncan|Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Curabitur sed tortor. Integer aliquam adipiscing lacus. Ut|06/15/2011|06:30|02/07/2019 13:51|Home phone|Firefox|False|Reading, Videogames, Cards|mypassword9',
                    '10|Tatum Edwards|Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Curabitur sed tortor. Integer aliquam adipiscing lacus. Ut|09/11/2015|23:39|09/11/2016 22:24|Office phone|Safari|True|Videogames, Sports, Cards|mypassword10'
                ],
                pageListNotActive: [ '<<', '<', '1' ],
                pageListActive: [ '2', '>', '>>' ]
            });
            
            done();
        }
    );
});

QUnit.test( 'editable list test', function( assert ) {

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
                    '1|Ulysses Aguilar|Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Curabitur sed tortor. Integer aliquam adipiscing lacus. Ut nec urna|06/06/2017|04:40|11/23/2014 22:10|1|Edge|false|[reading_option/sports_option/cards_option]',
                    '2|Mara Riggs|Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Curabitur sed tortor. Integer aliquam adipiscing lacus. Ut nec|04/07/2013|09:14|07/06/2013 19:44|3|Edge|true|[videogames_option/sports_option/cards_option]',
                    '3|Leah Nguyen|Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Curabitur sed tortor. Integer aliquam adipiscing lacus. Ut nec urna|10/11/2012|13:57|06/19/2019 07:57|2|Chrome|true|[reading_option/videogames_option/sports_option]',
                    '4|Victor Knight|Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Curabitur sed tortor. Integer aliquam adipiscing|02/21/2019|10:15|08/04/2017 22:40|3|Opera|true|[reading_option/videogames_option/cards_option]',
                    '5|Samson Bernard|Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Curabitur sed tortor. Integer aliquam adipiscing lacus. Ut nec urna et|04/05/2018|04:11|07/13/2015 03:46|1|Safari|false|[reading_option/videogames_option/sports_option]',
                    '6|Wade Pierce|Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Curabitur sed tortor. Integer aliquam adipiscing lacus.|10/21/2012|23:25|12/19/2013 12:01|2|Chrome|false|[reading_option/sports_option/cards_option]',
                    '7|Seth Hatfield|Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Curabitur sed|09/28/2017|12:57|01/15/2017 12:40|2|Chrome|false|[reading_option/videogames_option/cards_option]',
                    '8|Henry Moses|Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Curabitur sed tortor. Integer aliquam adipiscing lacus. Ut nec|10/01/2017|08:39|07/16/2018 14:35|3|Opera|false|[videogames_option/sports_option/cards_option]',
                    '9|Ivy Duncan|Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Curabitur sed tortor. Integer aliquam adipiscing lacus. Ut|06/15/2011|06:30|02/07/2019 13:51|1|Firefox|false|[reading_option/videogames_option/cards_option]',
                    '10|Tatum Edwards|Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Curabitur sed tortor. Integer aliquam adipiscing lacus. Ut|09/11/2015|23:39|09/11/2016 22:24|2|Safari|true|[videogames_option/sports_option/cards_option]'
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
                    '11|Hamish Jones|Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Curabitur sed tortor. Integer|09/29/2018|09:19|07/01/2016 00:15|2|Opera|true|[reading_option/sports_option/cards_option]',
                    '12|Amos Norton|Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Curabitur sed tortor. Integer aliquam adipiscing lacus. Ut nec|12/05/2013|09:28|05/06/2017 12:45|2|Opera|true|[reading_option/videogames_option/cards_option]'
                ],
                pageListNotActive: [ '2', '>', '>>' ],
                pageListActive: [ '<<', '<', '1' ],
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
                    '1|Ulysses Aguilar|Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Curabitur sed tortor. Integer aliquam adipiscing lacus. Ut nec urna|06/06/2017|04:40|11/23/2014 22:10|1|Edge|false|[reading_option/sports_option/cards_option]',
                    '2|Mara Riggs|Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Curabitur sed tortor. Integer aliquam adipiscing lacus. Ut nec|04/07/2013|09:14|07/06/2013 19:44|3|Edge|true|[videogames_option/sports_option/cards_option]',
                    '3|Leah Nguyen|Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Curabitur sed tortor. Integer aliquam adipiscing lacus. Ut nec urna|10/11/2012|13:57|06/19/2019 07:57|2|Chrome|true|[reading_option/videogames_option/sports_option]',
                    '4|Victor Knight|Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Curabitur sed tortor. Integer aliquam adipiscing|02/21/2019|10:15|08/04/2017 22:40|3|Opera|true|[reading_option/videogames_option/cards_option]',
                    '5|Samson Bernard|Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Curabitur sed tortor. Integer aliquam adipiscing lacus. Ut nec urna et|04/05/2018|04:11|07/13/2015 03:46|1|Safari|false|[reading_option/videogames_option/sports_option]',
                    '6|Wade Pierce|Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Curabitur sed tortor. Integer aliquam adipiscing lacus.|10/21/2012|23:25|12/19/2013 12:01|2|Chrome|false|[reading_option/sports_option/cards_option]',
                    '7|Seth Hatfield|Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Curabitur sed|09/28/2017|12:57|01/15/2017 12:40|2|Chrome|false|[reading_option/videogames_option/cards_option]',
                    '8|Henry Moses|Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Curabitur sed tortor. Integer aliquam adipiscing lacus. Ut nec|10/01/2017|08:39|07/16/2018 14:35|3|Opera|false|[videogames_option/sports_option/cards_option]',
                    '9|Ivy Duncan|Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Curabitur sed tortor. Integer aliquam adipiscing lacus. Ut|06/15/2011|06:30|02/07/2019 13:51|1|Firefox|false|[reading_option/videogames_option/cards_option]',
                    '10|Tatum Edwards|Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Curabitur sed tortor. Integer aliquam adipiscing lacus. Ut|09/11/2015|23:39|09/11/2016 22:24|2|Safari|true|[videogames_option/sports_option/cards_option]'
                ],
                pageListNotActive: [ '<<', '<', '1' ],
                pageListActive: [ '2', '>', '>>' ],
                editable: true
            });

            done();
        }
    );
});

QUnit.test( 'form update test', function( assert ) {

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
            var clientRecord = utils.extend( true, {}, record );
            clientRecord.date = '06/06/2017';
            clientRecord.datetime = '11/23/2014 22:10';
            clientRecord.phoneType = '' + record.phoneType;
            testHelper.checkForm( assert, clientRecord );
            
            done();
        }
    );
});

QUnit.test( 'form delete test', function( assert ) {

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
            var clientRecord = utils.extend( true, {}, record );
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

QUnit.test( 'subform update test', function( assert ) {

    var done = assert.async();
    configureSubformOptions();
    testServerSide.resetPeople();

    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){
            $( '#departmentsContainer' ).zcrud( 'renderList' );
            
            // Go to edit form
            var key = 2;
            testHelper.clickUpdateListButton( key );
            
            // Check it (page 1 of members)
            var clientRecord = {
                'id': '2',
                'name': 'Mara Riggs',
                'description': 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Curabitur sed tortor. Integer aliquam adipiscing lacus. Ut nec',
                date: '04/07/2013',
                datetime: '07/06/2013 19:44',
                'time': '09:14',
                'phoneType': '3',
                'browser': 'Edge',
                'important': true,
                'hobbies': [ 'videogames_option', 'sports_option', 'cards_option' ],
                'members': [
                    {
                        'browser': 'Chrome',
                        'code': '1',
                        'date': '10/11/2012',
                        'datetime': '06/19/2019 07:57',
                        'description': 'Lorem',
                        'hobbies': [
                            'reading_option',
                            'videogames_option',
                            'sports_option'
                        ],
                        'important': true,
                        'name': 'Leah Nguyen',
                        'phoneType': '2',
                        'time': '13:57'
                    },
                    {
                        'browser': 'Opera',
                        'code': '2',
                        'date': '02/21/2019',
                        'datetime': '08/04/2017 22:40',
                        'description': 'Lorem ipsum',
                        'hobbies': [
                            'videogames_option',
                            'cards_option'
                        ],
                        'important': false,
                        'name': 'Victor Knight',
                        'phoneType': '3',
                        'time': '10:15'
                    },
                    {
                        'browser': 'Safari',
                        'code': '3',
                        'date': '04/05/2018',
                        'datetime': '07/13/2015 03:46',
                        'description': 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Curabitur sed tortor. Integer aliquam adipiscing lacus. Ut nec urna et',
                        'hobbies': [
                            'reading_option',
                            'videogames_option',
                            'sports_option'
                        ],
                        'important': false,
                        'name': 'Samson Bernard',
                        'phoneType': '1',
                        'time': '04:11'
                    },
                    {
                        'browser': 'Chrome',
                        'code': '4',
                        'date': '10/21/2012',
                        'datetime': '12/19/2013 12:01',
                        'description': 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Curabitur sed tortor. Integer aliquam adipiscing lacus.',
                        'hobbies': [
                            'reading_option',
                            'sports_option',
                            'cards_option'
                        ],
                        'important': false,
                        'name': 'Wade Pierce',
                        'phoneType': '2',
                        'time': '23:25'
                    },
                    {
                        'browser': 'Chrome',
                        'code': '5',
                        'date': '09/28/2017',
                        'datetime': '01/15/2017 12:40',
                        'description': 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Curabitur sed',
                        'hobbies': [
                            'reading_option',
                            'videogames_option',
                            'cards_option'
                        ],
                        'important': false,
                        'name': 'Seth Hatfield',
                        'phoneType': '2',
                        'time': '12:57'
                    },
                    {
                        'browser': 'Opera',
                        'code': '6',
                        'date': '10/01/2017',
                        'datetime': '07/16/2018 14:35',
                        'description': 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Curabitur sed tortor. Integer aliquam adipiscing lacus. Ut nec',
                        'hobbies': [
                            'videogames_option',
                            'sports_option',
                            'cards_option'
                        ],
                        'important': false,
                        'name': 'Henry Moses',
                        'phoneType': '3',
                        'time': '08:39'
                    },
                    {
                        'browser': 'Firefox',
                        'code': '7',
                        'date': '06/15/2011',
                        'datetime': '02/07/2019 13:51',
                        'description': 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Curabitur sed tortor. Integer aliquam adipiscing lacus. Ut',
                        'hobbies': [
                            'reading_option',
                            'videogames_option',
                            'cards_option'
                        ],
                        'important': false,
                        'name': 'Ivy Duncan',
                        'phoneType': '1',
                        'time': '06:30'
                    },
                    {
                        'browser': 'Safari',
                        'code': '8',
                        'date': '09/11/2015',
                        'datetime': '09/11/2016 22:24',
                        'description': 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Curabitur sed tortor. Integer aliquam adipiscing lacus. Ut',
                        'hobbies': [
                            'videogames_option',
                            'sports_option',
                            'cards_option'
                        ],
                        'important': true,
                        'name': 'Tatum Edwards',
                        'phoneType': '2',
                        'time': '23:39'
                    },
                    {
                        'browser': 'Opera',
                        'code': '9',
                        'date': '09/29/2018',
                        'datetime': '07/01/2016 00:15',
                        'description': 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Curabitur sed tortor. Integer',
                        'hobbies': [
                            'reading_option',
                            'sports_option',
                            'cards_option'
                        ],
                        'important': true,
                        'name': 'Hamish Jones',
                        'phoneType': '2',
                        'time': '09:19'
                    },
                    {
                        'browser': 'Opera',
                        'code': '10',
                        'date': '12/05/2013',
                        'datetime': '05/06/2017 12:45',
                        'description': 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Curabitur sed tortor. Integer aliquam adipiscing lacus. Ut nec',
                        'hobbies': [
                            'reading_option',
                            'videogames_option',
                            'cards_option'
                        ],
                        'important': true,
                        'name': 'Amos Norton',
                        'phoneType': '2',
                        'time': '09:28'
                    }
                ]
            };
            testHelper.checkForm( assert, clientRecord );
            
            // Go to next page of members
            testHelper.goToNextSubformPage( 'members' );
            
            // Check it (page 2 of members)
            var clientRecord2 = {
                'id': '2',
                'name': 'Mara Riggs',
                'description': 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Curabitur sed tortor. Integer aliquam adipiscing lacus. Ut nec',
                date: '04/07/2013',
                datetime: '07/06/2013 19:44',
                'time': '09:14',
                'phoneType': '3',
                'browser': 'Edge',
                'important': true,
                'hobbies': [ 'videogames_option', 'sports_option', 'cards_option' ],
                'members': [
                    {
                        'browser': 'Opera',
                        'code': '11',
                        'date': '01/20/2019',
                        'datetime': '06/22/2013 22:12',
                        'description': 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Curabitur sed tortor. Integer aliquam adipiscing lacus. Ut nec',
                        'hobbies': [
                            'videogames_option',
                            'sports_option',
                            'cards_option'
                        ],
                        'important': true,
                        'name': 'Tiger Flynn',
                        'phoneType': '2',
                        'time': '08:54'
                    },
                    {
                        'browser': 'Chrome',
                        'code': '12',
                        'date': '11/13/2011',
                        'datetime': '11/10/2015 05:45',
                        'description': 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Curabitur sed tortor. Integer aliquam adipiscing lacus. Ut nec urna',
                        'hobbies': [
                            'reading_option',
                            'videogames_option',
                            'cards_option'
                        ],
                        'important': false,
                        'name': 'Cheryl Martinez',
                        'phoneType': '1',
                        'time': '02:12'
                    },
                    {
                        'browser': 'Edge',
                        'code': '13',
                        'date': '03/10/2017',
                        'datetime': '07/26/2014 07:16',
                        'description': 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Curabitur sed',
                        'hobbies': [
                            'reading_option',
                            'videogames_option',
                            'cards_option'
                        ],
                        'important': false,
                        'name': 'Stone Sanford',
                        'phoneType': '1',
                        'time': '23:25'
                    },
                    {
                        'browser': 'Safari',
                        'code': '14',
                        'date': '09/26/2019',
                        'datetime': '03/01/2018 19:40',
                        'description': 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Curabitur sed tortor. Integer aliquam adipiscing lacus. Ut nec urna et arcu',
                        'hobbies': [
                            'reading_option',
                            'sports_option',
                            'cards_option'
                        ],
                        'important': true,
                        'name': 'Merrill Thomas',
                        'phoneType': '1',
                        'time': '08:55'
                    }
                ]
            };
            testHelper.checkForm( assert, clientRecord2 );
            
            done();
        }
    );
});

QUnit.test( 'subform delete test', function( assert ) {

    var done = assert.async();
    configureSubformOptions();
    testServerSide.resetPeople();

    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){
            $( '#departmentsContainer' ).zcrud( 'renderList' );

            // Go to edit form
            var key = 2;
            testHelper.clickDeleteListButton( key );

            // Check it
            var clientRecord = {
                'id': '2',
                'name': 'Mara Riggs',
                'description': 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Curabitur sed tortor. Integer aliquam adipiscing lacus. Ut nec',
                date: '04/07/2013',
                datetime: '07/06/2013 19:44',
                'time': '09:14',
                'phoneType': 'Cell phone',
                'browser': 'Edge',
                'important': 'True',
                'hobbies': 'Videogames, Sports, Cards',
                members: [
                    {
                        'browser': 'Chrome',
                        'code': '1',
                        'date': '10/11/2012',
                        'datetime': '06/19/2019 07:57',
                        'description': 'Lorem',
                        'hobbies': 'Reading, Videogames, Sports',
                        'important': 'True',
                        'name': 'Leah Nguyen',
                        'phoneType': 'Office phone',
                        'time': '13:57'
                    },
                    {
                        'browser': 'Opera',
                        'code': '2',
                        'date': '02/21/2019',
                        'datetime': '08/04/2017 22:40',
                        'description': 'Lorem ipsum',
                        'hobbies': 'Videogames, Cards',
                        'important': 'False',
                        'name': 'Victor Knight',
                        'phoneType': 'Cell phone',
                        'time': '10:15'
                    },
                    {
                        'browser': 'Safari',
                        'code': '3',
                        'date': '04/05/2018',
                        'datetime': '07/13/2015 03:46',
                        'description': 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Curabitur sed tortor. Integer aliquam adipiscing lacus. Ut nec urna et',
                        'hobbies': 'Reading, Videogames, Sports',
                        'important': 'False',
                        'name': 'Samson Bernard',
                        'phoneType': 'Home phone',
                        'time': '04:11'
                    },
                    {
                        'browser': 'Chrome',
                        'code': '4',
                        'date': '10/21/2012',
                        'datetime': '12/19/2013 12:01',
                        'description': 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Curabitur sed tortor. Integer aliquam adipiscing lacus.',
                        'hobbies': 'Reading, Sports, Cards',
                        'important': 'False',
                        'name': 'Wade Pierce',
                        'phoneType': 'Office phone',
                        'time': '23:25'
                    },
                    {
                        'browser': 'Chrome',
                        'code': '5',
                        'date': '09/28/2017',
                        'datetime': '01/15/2017 12:40',
                        'description': 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Curabitur sed',
                        'hobbies': 'Reading, Videogames, Cards',
                        'important': 'False',
                        'name': 'Seth Hatfield',
                        'phoneType': 'Office phone',
                        'time': '12:57'
                    },
                    {
                        'browser': 'Opera',
                        'code': '6',
                        'date': '10/01/2017',
                        'datetime': '07/16/2018 14:35',
                        'description': 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Curabitur sed tortor. Integer aliquam adipiscing lacus. Ut nec',
                        'hobbies': 'Videogames, Sports, Cards',
                        'important': 'False',
                        'name': 'Henry Moses',
                        'phoneType': 'Cell phone',
                        'time': '08:39'
                    },
                    {
                        'browser': 'Firefox',
                        'code': '7',
                        'date': '06/15/2011',
                        'datetime': '02/07/2019 13:51',
                        'description': 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Curabitur sed tortor. Integer aliquam adipiscing lacus. Ut',
                        'hobbies': 'Reading, Videogames, Cards',
                        'important': 'False',
                        'name': 'Ivy Duncan',
                        'phoneType': 'Home phone',
                        'time': '06:30'
                    },
                    {
                        'browser': 'Safari',
                        'code': '8',
                        'date': '09/11/2015',
                        'datetime': '09/11/2016 22:24',
                        'description': 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Curabitur sed tortor. Integer aliquam adipiscing lacus. Ut',
                        'hobbies': 'Videogames, Sports, Cards',
                        'important': 'True',
                        'name': 'Tatum Edwards',
                        'phoneType': 'Office phone',
                        'time': '23:39'
                    },
                    {
                        'browser': 'Opera',
                        'code': '9',
                        'date': '09/29/2018',
                        'datetime': '07/01/2016 00:15',
                        'description': 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Curabitur sed tortor. Integer',
                        'hobbies': 'Reading, Sports, Cards',
                        'important': 'True',
                        'name': 'Hamish Jones',
                        'phoneType': 'Office phone',
                        'time': '09:19'
                    },
                    {
                        'browser': 'Opera',
                        'code': '10',
                        'date': '12/05/2013',
                        'datetime': '05/06/2017 12:45',
                        'description': 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Curabitur sed tortor. Integer aliquam adipiscing lacus. Ut nec',
                        'hobbies': 'Reading, Videogames, Cards',
                        'important': 'True',
                        'name': 'Amos Norton',
                        'phoneType': 'Office phone',
                        'time': '09:28'
                    }
                ]
            };
            
            testHelper.checkDeleteForm( assert, clientRecord );

            // Go to next page of members
            testHelper.goToNextSubformPage( 'members' );

            // Check it (page 2 of members)
            var clientRecord2 = {
                'id': '2',
                'name': 'Mara Riggs',
                'description': 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Curabitur sed tortor. Integer aliquam adipiscing lacus. Ut nec',
                date: '04/07/2013',
                datetime: '07/06/2013 19:44',
                'time': '09:14',
                'phoneType': 'Cell phone',
                'browser': 'Edge',
                'important': 'True',
                'hobbies': 'Videogames, Sports, Cards',
                'members': [
                    {
                        'browser': 'Opera',
                        'code': '11',
                        'date': '01/20/2019',
                        'datetime': '06/22/2013 22:12',
                        'description': 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Curabitur sed tortor. Integer aliquam adipiscing lacus. Ut nec',
                        'hobbies': 'Videogames, Sports, Cards',
                        'important': 'True',
                        'name': 'Tiger Flynn',
                        'phoneType': 'Office phone',
                        'time': '08:54'
                    },
                    {
                        'browser': 'Chrome',
                        'code': '12',
                        'date': '11/13/2011',
                        'datetime': '11/10/2015 05:45',
                        'description': 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Curabitur sed tortor. Integer aliquam adipiscing lacus. Ut nec urna',
                        'hobbies': 'Reading, Videogames, Cards',
                        'important': 'False',
                        'name': 'Cheryl Martinez',
                        'phoneType': 'Home phone',
                        'time': '02:12'
                    },
                    {
                        'browser': 'Edge',
                        'code': '13',
                        'date': '03/10/2017',
                        'datetime': '07/26/2014 07:16',
                        'description': 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Curabitur sed',
                        'hobbies': 'Reading, Videogames, Cards',
                        'important': 'False',
                        'name': 'Stone Sanford',
                        'phoneType': 'Home phone',
                        'time': '23:25'
                    },
                    {
                        'browser': 'Safari',
                        'code': '14',
                        'date': '09/26/2019',
                        'datetime': '03/01/2018 19:40',
                        'description': 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Curabitur sed tortor. Integer aliquam adipiscing lacus. Ut nec urna et arcu',
                        'hobbies': 'Reading, Sports, Cards',
                        'important': 'True',
                        'name': 'Merrill Thomas',
                        'phoneType': 'Home phone',
                        'time': '08:55'
                    }
                ]
            };
            testHelper.checkDeleteForm( assert, clientRecord2 );
            
            done();
        }
    );
});
