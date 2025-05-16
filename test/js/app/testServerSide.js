/* 
    testServerSide singleton class
*/
'use strict';
    
//var $ = require( 'zzdom' );
//var zzDOM = require( '../../../js/app/zzDOMPlugin.js' );
//var $ = zzDOM.zz;
var utils = require( '../../../js/app/utils.js' );

module.exports = (function() {
    
    var defaultPeople = [
        {
            'id': 1,
            'name': 'Ulysses Aguilar',
            'description': 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Curabitur sed tortor. Integer aliquam adipiscing lacus. Ut nec urna',
            'date': new Date( '2017-06-06' ).getTime(),
            'datetime': new Date( '2014-11-23T22:10:04' ).getTime(),
            'time': '04:40',
            'phoneType': 1,
            'browser': 'Edge',
            'important': false,
            'hobbies': [ 'reading_option', 'sports_option', 'cards_option' ],
            'password': 'mypassword1'
        },
        {
            'id': 2,
            'name': 'Mara Riggs',
            'description': 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Curabitur sed tortor. Integer aliquam adipiscing lacus. Ut nec',
            'date': new Date( '2013-04-07' ).getTime(),
            'datetime': new Date( '2013-07-06T19:44:23' ).getTime(),
            'time': '09:14',
            'phoneType': 3,
            'browser': 'Edge',
            'important': true,
            'hobbies': [ 'videogames_option', 'sports_option', 'cards_option' ],
            'password': 'mypassword2',
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
                },
                {
                    'code': 3,
                    'name': 'Samson Bernard',
                    'description': 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Curabitur sed tortor. Integer aliquam adipiscing lacus. Ut nec urna et',
                    'date': new Date( '2018-04-05' ),
                    'datetime': new Date( '2015-07-13T03:46:19' ),
                    'time': '04:11',
                    'phoneType': 1,
                    'browser': 'Safari',
                    'important': 'false',
                    'hobbies': [ 'reading_option', 'videogames_option', 'sports_option' ]
                },
                {
                    'code': 4,
                    'name': 'Wade Pierce',
                    'description': 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Curabitur sed tortor. Integer aliquam adipiscing lacus.',
                    'date': new Date( '2012-10-21' ),
                    'datetime': new Date( '2013-12-19T12:01:49' ),
                    'time': '23:25',
                    'phoneType': 2,
                    'browser': 'Chrome',
                    'important': 'false',
                    'hobbies': [ 'reading_option', 'sports_option', 'cards_option' ]
                },
                {
                    'code': 5,
                    'name': 'Seth Hatfield',
                    'description': 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Curabitur sed',
                    'date': new Date( '2017-09-28' ),
                    'datetime': new Date( '2017-01-15T12:40:02' ),
                    'time': '12:57',
                    'phoneType': 2,
                    'browser': 'Chrome',
                    'important': 'false',
                    'hobbies': [ 'reading_option', 'videogames_option', 'cards_option' ]
                },
                {
                    'code': 6,
                    'name': 'Henry Moses',
                    'description': 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Curabitur sed tortor. Integer aliquam adipiscing lacus. Ut nec',
                    'date': new Date( '2017-10-01' ),
                    'datetime': new Date( '2018-07-16T14:35:35' ),
                    'time': '08:39',
                    'phoneType': 3,
                    'browser': 'Opera',
                    'important': 'false',
                    'hobbies': [ 'videogames_option', 'sports_option', 'cards_option' ]
                },
                {
                    'code': 7,
                    'name': 'Ivy Duncan',
                    'description': 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Curabitur sed tortor. Integer aliquam adipiscing lacus. Ut',
                    'date': new Date( '2011-06-15' ),
                    'datetime': new Date( '2019-02-07T13:51:38' ),
                    'time': '06:30',
                    'phoneType': 1,
                    'browser': 'Firefox',
                    'important': 'false',
                    'hobbies': [ 'reading_option', 'videogames_option', 'cards_option' ]
                },
                {
                    'code': 8,
                    'name': 'Tatum Edwards',
                    'description': 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Curabitur sed tortor. Integer aliquam adipiscing lacus. Ut',
                    'date': new Date( '2015-09-11' ),
                    'datetime': new Date( '2016-09-11T22:24:04' ),
                    'time': '23:39',
                    'phoneType': 2,
                    'browser': 'Safari',
                    'important': 'true',
                    'hobbies': [ 'videogames_option', 'sports_option', 'cards_option' ]
                },
                {
                    'code': 9,
                    'name': 'Hamish Jones',
                    'description': 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Curabitur sed tortor. Integer',
                    'date': new Date( '2018-09-29' ),
                    'datetime': new Date( '2016-07-01T00:15:37' ),
                    'time': '09:19',
                    'phoneType': 2,
                    'browser': 'Opera',
                    'important': 'true',
                    'hobbies': [ 'reading_option', 'sports_option', 'cards_option' ]
                },
                {
                    'code': 10,
                    'name': 'Amos Norton',
                    'description': 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Curabitur sed tortor. Integer aliquam adipiscing lacus. Ut nec',
                    'date': new Date( '2013-12-05' ),
                    'datetime': new Date( '2017-05-06T12:45:39' ),
                    'time': '09:28',
                    'phoneType': 2,
                    'browser': 'Opera',
                    'important': 'true',
                    'hobbies': [ 'reading_option', 'videogames_option', 'cards_option' ]
                },
                {
                    'code': 11,
                    'name': 'Tiger Flynn',
                    'description': 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Curabitur sed tortor. Integer aliquam adipiscing lacus. Ut nec',
                    'date': new Date( '2019-01-20' ),
                    'datetime': new Date( '2013-06-22T22:12:30' ),
                    'time': '08:54',
                    'phoneType': 2,
                    'browser': 'Opera',
                    'important': 'true',
                    'hobbies': [ 'videogames_option', 'sports_option', 'cards_option' ]
                },
                {
                    'code': 12,
                    'name': 'Cheryl Martinez',
                    'description': 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Curabitur sed tortor. Integer aliquam adipiscing lacus. Ut nec urna',
                    'date': new Date( '2011-11-13' ),
                    'datetime': new Date( '2015-11-10T05:45:58' ),
                    'time': '02:12',
                    'phoneType': 1,
                    'browser': 'Chrome',
                    'important': 'false',
                    'hobbies': [ 'reading_option', 'videogames_option', 'cards_option' ]
                },
                {
                    'code': 13,
                    'name': 'Stone Sanford',
                    'description': 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Curabitur sed',
                    'date': new Date( '2017-03-10' ),
                    'datetime': new Date( '2014-07-26T07:16:53' ),
                    'time': '23:25',
                    'phoneType': 1,
                    'browser': 'Edge',
                    'important': 'false',
                    'hobbies': [ 'reading_option', 'videogames_option', 'cards_option' ]
                },
                {
                    'code': 14,
                    'name': 'Merrill Thomas',
                    'description': 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Curabitur sed tortor. Integer aliquam adipiscing lacus. Ut nec urna et arcu',
                    'date': new Date( '2019-09-26' ),
                    'datetime': new Date( '2018-03-01T19:40:40' ),
                    'time': '08:55',
                    'phoneType': 1,
                    'browser': 'Safari',
                    'important': 'true',
                    'hobbies': [ 'reading_option', 'sports_option', 'cards_option' ]
                }
            ]
        },
        {
            'id': 3,
            'name': 'Leah Nguyen',
            'description': 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Curabitur sed tortor. Integer aliquam adipiscing lacus. Ut nec urna',
            'date': new Date( '2012-10-11' ).getTime(),
            'datetime': new Date( '2019-06-19T07:57:41' ).getTime(),
            'time': '13:57',
            'phoneType': 2,
            'browser': 'Chrome',
            'important': true,
            'hobbies': [ 'reading_option', 'videogames_option', 'sports_option' ],
            'password': 'mypassword3'
        },
        {
            'id': 4,
            'name': 'Victor Knight',
            'description': 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Curabitur sed tortor. Integer aliquam adipiscing',
            'date': new Date( '2019-02-21' ).getTime(),
            'datetime': new Date( '2017-08-04T22:40:04' ).getTime(),
            'time': '10:15',
            'phoneType': 3,
            'browser': 'Opera',
            'important': true,
            'hobbies': [ 'reading_option', 'videogames_option', 'cards_option' ],
            'password': 'mypassword4'
        },
        {
            'id': 5,
            'name': 'Samson Bernard',
            'description': 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Curabitur sed tortor. Integer aliquam adipiscing lacus. Ut nec urna et',
            'date': new Date( '2018-04-05' ).getTime(),
            'datetime': new Date( '2015-07-13T03:46:19' ).getTime(),
            'time': '04:11',
            'phoneType': 1,
            'browser': 'Safari',
            'important': false,
            'hobbies': [ 'reading_option', 'videogames_option', 'sports_option' ],
            'password': 'mypassword5'
        },
        {
            'id': 6,
            'name': 'Wade Pierce',
            'description': 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Curabitur sed tortor. Integer aliquam adipiscing lacus.',
            'date': new Date( '2012-10-21' ).getTime(),
            'datetime': new Date( '2013-12-19T12:01:49' ).getTime(),
            'time': '23:25',
            'phoneType': 2,
            'browser': 'Chrome',
            'important': false,
            'hobbies': [ 'reading_option', 'sports_option', 'cards_option' ],
            'password': 'mypassword6'
        },
        {
            'id': 7,
            'name': 'Seth Hatfield',
            'description': 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Curabitur sed',
            'date': new Date( '2017-09-28' ).getTime(),
            'datetime': new Date( '2017-01-15T12:40:02' ).getTime(),
            'time': '12:57',
            'phoneType': 2,
            'browser': 'Chrome',
            'important': false,
            'hobbies': [ 'reading_option', 'videogames_option', 'cards_option' ],
            'password': 'mypassword7'
        },
        {
            'id': 8,
            'name': 'Henry Moses',
            'description': 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Curabitur sed tortor. Integer aliquam adipiscing lacus. Ut nec',
            'date': new Date( '2017-10-01' ).getTime(),
            'datetime': new Date( '2018-07-16T14:35:35' ).getTime(),
            'time': '08:39',
            'phoneType': 3,
            'browser': 'Opera',
            'important': false,
            'hobbies': [ 'videogames_option', 'sports_option', 'cards_option' ],
            'password': 'mypassword8'
        },
        {
            'id': 9,
            'name': 'Ivy Duncan',
            'description': 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Curabitur sed tortor. Integer aliquam adipiscing lacus. Ut',
            'date': new Date( '2011-06-15' ).getTime(),
            'datetime': new Date( '2019-02-07T13:51:38' ).getTime(),
            'time': '06:30',
            'phoneType': 1,
            'browser': 'Firefox',
            'important': false,
            'hobbies': [ 'reading_option', 'videogames_option', 'cards_option' ],
            'password': 'mypassword9'
        },
        {
            'id': 10,
            'name': 'Tatum Edwards',
            'description': 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Curabitur sed tortor. Integer aliquam adipiscing lacus. Ut',
            'date': new Date( '2015-09-11' ).getTime(),
            'datetime': new Date( '2016-09-11T22:24:04' ).getTime(),
            'time': '23:39',
            'phoneType': 2,
            'browser': 'Safari',
            'important': true,
            'hobbies': [ 'videogames_option', 'sports_option', 'cards_option' ],
            'password': 'mypassword10'
        },
        {
            'id': 11,
            'name': 'Hamish Jones',
            'description': 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Curabitur sed tortor. Integer',
            'date': new Date( '2018-09-29' ).getTime(),
            'datetime': new Date( '2016-07-01T00:15:37' ).getTime(),
            'time': '09:19',
            'phoneType': 2,
            'browser': 'Opera',
            'important': 'true', // Boolean as text
            'hobbies': [ 'reading_option', 'sports_option', 'cards_option' ],
            'password': 'mypassword11'
        },
        {
            'id': 12,
            'name': 'Amos Norton',
            'description': 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Curabitur sed tortor. Integer aliquam adipiscing lacus. Ut nec',
            'date': new Date( '2013-12-05' ).getTime(),
            'datetime': new Date( '2017-05-06T12:45:39' ).getTime(),
            'time': '09:28',
            'phoneType': 2,
            'browser': 'Opera',
            'important': 'true', // Boolean as text
            'hobbies': [ 'reading_option', 'videogames_option', 'cards_option' ],
            'password': 'mypassword12'
        }
    ];
    var people = {};
    var peopleSubformsFields = [ 'members' ];
    var resetPeople = function( newPeople ){

        if ( newPeople ){
            people = newPeople;
            return people;
        }

        people = {};
        for ( var c = 0; c < defaultPeople.length; ++c ){
            var person = defaultPeople[ c ];
            people[ person.id ] = person;
        }

        return people;
    };
    resetPeople();
    
    var addAddressesToPeopleObject = function( peopleObject ){

        peopleObject[ 1 ][ 'addresses' ] = [
            {
                'address': 'Calle Regino Martínez 3',
                'province': 'Cádiz',
                'city': 'Algeciras'
            },{
                'address': 'Calle Andalucía 113',
                'province': 'Cádiz',
                'city': 'Algeciras'
            },{
                'address': 'Some address else',
                'province': 'Málaga',
                'city': 'Estepona'
            },
        ];
    };

    var services = {};
    var servicesSubformsFields = [ 'members', 'externalMembers' ];
    var subformsRecordsSuffix = 'ZCrudRecords';
    var numberOfServices = 130;
    var serviceIndex = numberOfServices - 1;
    var provinces = [ 'Cádiz', 'Málaga' ];
    var cities0 = [ 'Algeciras', 'Tarifa' ];
    var cities1 = [ 'Estepona', 'Marbella' ];
    var resetServices = function( newServices, addDescriptions, addProvinceAndCity ){
        
        if ( newServices ){
            services = newServices;
            return;
        }
        
        services = {};
        var cities0Index = 0;
        var cities1Index = 0;
        var citiesToUse;
        for ( var c = 1; c < numberOfServices; ++c ){
            var service = { 
                name: 'Service ' + c 
            };
            services[ c ] = service;
            if ( addDescriptions ){
                service.description = service.name + ' description';
            }
            if ( addProvinceAndCity ){
                service.province = c % 2 == 0? provinces[ 0 ]: provinces[ 1 ];
                if ( c % 2 == 0 ){
                    // use cities0
                    citiesToUse = cities0;
                    service.city = cities0[ cities0Index ];
                    if ( ++cities0Index == cities0.length ){
                        cities0Index = 0;
                    }
                } else {
                    // use cities1
                    citiesToUse = cities1;
                    service.city = cities1[ cities1Index ];
                    if ( ++cities1Index == cities1.length ){
                        cities1Index = 0;
                    }
                }
            }
        }
        serviceIndex = numberOfServices - 1;
    };
    resetServices();
    
    var reset2SubformMembersServices = function( serviceKeys, numberOfMembers, numberOfExternalMembers ){

        resetServices();
        
        for ( var c = 0; c < serviceKeys.length; ++c ){
            var key = serviceKeys[ c ];
            var service = services[ key ];

            addToService( service , 'members', 'Member', numberOfMembers );
            addToService( service , 'externalMembers', 'External member', numberOfExternalMembers );
        }
    };
    var addToService = function( service, subformName, name, numberOfItems ){
        
        var thisArray = service[ subformName ];
        if ( ! thisArray ){
            thisArray = [];
            service[ subformName ] = thisArray;
        }
        
        for ( var c = 0; c < numberOfItems; ++c ){
            var sufix = '' + ( c + 1 );
            var thisName = name + ' ' + sufix;
            thisArray.push(
                {
                    'code': sufix,
                    'name': thisName,
                    'description': 'Description of ' + thisName
                }
            );
        }
    };
    
    var members;
    var originalMembersIndex = 0;
    var resetOriginalAndVerifiedMembers = function( name,  numberOfItems ){
        
        originalMembersIndex = numberOfItems - 1;
        members = {};
        members.originalMembers = [];
        members.verifiedMembers = {};
        //members.verifiedMembersFiltering = {};
        
        for ( var c = 0; c < numberOfItems; ++c ){
            var sufix = '' + ( c + 1 );
            var thisName = name + ' ' + sufix;
            members.originalMembers.push( 
                {
                    'code': sufix,
                    'name': thisName,
                    'description': 'Description of ' + thisName,
                    'important': false,
                    'hobbies': []
                }
            );
        }
    };
    var getOriginalMembers = function(){
        return members.originalMembers;
    };
    var getVerifiedMembers = function(){
        return members.verifiedMembers;
    };
    
    var getOriginalMembersByCode = function( code ){
        
        for ( var c = 0; c < members.originalMembers.length; ++c ){
            var member = members.originalMembers[ c ];
            if ( member.code == code ){
                return member;
            }
        }
        
        return undefined;
    };
    
    var phoneTypes = [ 'Home phone', 'Office phone', 'Cell phone' ];
    var phoneTypesByCode = [
        { value: '1', displayText: 'homePhone_option' }, 
        { value: '2', displayText: 'officePhone_option' }, 
        { value: '3', displayText: 'cellPhone_option' } 
    ];
    var cities = {
        'Cádiz': [ 'Algeciras', 'Los Barrios', 'Tarifa' ],
        'Málaga': [ 'Estepona', 'Manilva', 'Marbella' ]
    };
    var urls = [];
    var lastListUrl = undefined;
    var lastBatchUpdateUrl = undefined;
    var jsonUpdatesArray = [];
    
    var access = {};
    var resetAccess = function(){
        access = {};
    };
    var updateAccess = function( url ){
        var counter = access[ url ];
        if ( ! counter ){
            access[ url ] = 1;
            return;
        }
        access[ url ] = ++counter;
    };
    var getAccess = function( url ){
        var counter = access[ url ];
        return counter? counter: 0;
    };

    var reset = function(){
    
        resetServices();
        
        urls = [];
        lastListUrl = undefined;
        lastBatchUpdateUrl = undefined;
        jsonUpdatesArray = [];
    };
    
    var forceError = function( options ){
        
        var dataToSend = {
            result: 'Error',
            message: 'Forced error!'
        };
        
        options.success( dataToSend );
    };
    
    var ajax = function( options ){
        
        // Get file, cmd and table
        var url = options.url;
        urls.push( url );
        
        var data = options.data;
        var file = url.split( '?' )[ 0 ];
        var parameters = parseQueryString( url.split( '?' )[ 1 ] );
        var cmd = parameters.cmd;
        var table = parameters.table;
        
        // Force error if requested
        if ( parameters.forceError ){
            forceError( options );
            return;
        }
        
        // Run AJAX
        switch ( table ) {
            case 'department':
                ajaxServices( options, cmd, file, data, url );
                break;
            case 'phoneTypes':
                ajaxPhoneTypes( options, false );
                break;
            case 'phoneTypesUsingId':
                ajaxPhoneTypes( options, true );
                break;
            case 'cities':
                ajaxCities( options, parameters, url );
                break;
            case 'members':
                ajaxMembersFields( 'members', options, data );
                break;
            case 'externalMembers':
                ajaxMembersFields( 'externalMembers', options, data );
                break;
            case 'memberCheck':
                ajaxMembersCheck( options, cmd, file, data, url );
                break;
            case 'originalMembers':
                ajaxOriginalMembers( options, cmd, file, data, url );
                break;
            case 'verifiedMembers':
                ajaxVerifiedMembers( options, cmd, file, data, url );
                break;
            case 'people':
                ajaxPeople( options, cmd, file, data, url );
                break;
            case 'peopleMembers':
                ajaxPeopleMembersFields( 'members', options, data );
                break;
            case 'provinces':
                ajaxProvinces(  options, parameters, url );
                break;
            default:
                throw 'Unknown table in ajax: ' + table;
        }
    };
    
    var ajaxMembersCheck = function( options, cmd, file, data, url ){

        // Run command
        var dataToSend = undefined;
        switch ( cmd ) {
            case 'BATCH_UPDATE':
                dataToSend = ajaxMembersCheckBatchUpdate( file, data, url );
                break;
            case 'BATCH_UPDATE_FILTERING':
                dataToSend = ajaxMembersCheckBatchUpdateFiltering( file, data, url );
                break;
            case 'GET':
                dataToSend = ajaxMembersCheckGet( file, data, url );
                break;
            case 'GET_FILTERING':
                dataToSend = ajaxMembersCheckGetFiltering( file, data, url );
                break;
            case 'LIST':
                dataToSend = ajaxMembersCheckList( file, data, url );
                break;
            default:
                throw 'Unknown command in ajax: ' + cmd;
        }

        options.success( dataToSend );
    };
    
    var ajaxOriginalMembers = function( options, cmd, file, data, url ){

        // Run command
        var dataToSend = undefined;
        switch ( cmd ) {
            case 'BATCH_UPDATE':
                dataToSend = ajaxOriginalMembersBatchUpdate( file, data, url );
                break;
            case 'GET':
                dataToSend = ajaxOriginalMembersGet( file, data, url );
                break;
            default:
                throw 'Unknown command in ajax: ' + cmd;
        }

        options.success( dataToSend );
    };
    
    var ajaxVerifiedMembers = function( options, cmd, file, data, url ){

        // Run command
        var dataToSend = undefined;
        switch ( cmd ) {
            case 'LIST':
                dataToSend = ajaxVerifiedMembersCheckList( file, data, url );
                break;
            default:
                throw 'Unknown command in ajax: ' + cmd;
        }

        options.success( dataToSend );
    };
    
    var getOriginalMember = function( code ){
        
        for ( var c = 0; c < members.originalMembers.length; ++c ){
            var member = members.originalMembers[ c ];
            if ( member.code == code ){
                return member;
            }
        }
        
        return undefined;
    };
    
    var replaceOriginalMember = function( code, newMember ){

        for ( var c = 0; c < members.originalMembers.length; ++c ){
            var member = members.originalMembers[ c ];
            if ( member.code == code ){
                members.originalMembers[ c ] = newMember;
                return true;
            }
        }
        
        return false;
    };
    
    var removeOriginalMember = function( code ){

        for ( var c = 0; c < members.originalMembers.length; ++c ){
            var member = members.originalMembers[ c ];
            if ( member.code == code ){
                members.originalMembers.splice( c, 1 );
                return true;
            }
        }

        return false;
    };
    
    var ajaxOriginalMembersBatchUpdate = function( file, data, url ){

        lastBatchUpdateUrl = url;
        jsonUpdatesArray.push( 
            utils.extend( true, {}, data ) );

        // Init data
        var dataToSend = {};
        dataToSend.message = '';
        dataToSend.newRecords = [];
        var error = false;

        // Add all existing originalMembers
        for ( var id in data.existingRecords ) {
            var modifiedItem = data.existingRecords[ id ];
            var currentItem = getOriginalMember( id );

            if ( ! currentItem ){
                error = true;
                dataToSend.message += 'Original member with key "' + id + '" not found trying to update it!';
                continue;       
            }

            var newId = modifiedItem.code;
            var newIdService = newId == undefined? undefined: getOriginalMember( newId );
            if ( id != newId && newIdService ){
                error = true;
                dataToSend.message += 'Original member with key "' + newId + '" found: duplicated key trying to update it!';
                continue;    
            }

            var extendedService = utils.extend( true, {}, currentItem, modifiedItem );

            if ( ! replaceOriginalMember( id, extendedService ) ){
                dataToSend.message += 'Original member with key "' + id + '" not found trying to replace it!';
                continue;   
            }
        }

        // Add all new services
        for ( var c = 0; c < data.newRecords.length; c++ ) {
            var newItem = data.newRecords[ c ];
            if ( newItem.code == undefined ){
                newItem.code = buildOriginalMemberId();
            }
            id = newItem.code;
            currentItem = getOriginalMember( id );
            
            if ( currentItem ){
                error = true;
                dataToSend.message += 'Original member with key "' + id + '" found trying to create it!';
                continue;
            }

            members.originalMembers.unshift( newItem ); // Add to the beginning!
            dataToSend.newRecords.push( newItem );               
        }

        // Remove all services to remove
        for ( c = 0; c < data.recordsToRemove.length; c++ ) {
            id = data.recordsToRemove[ c ];
            currentItem = getOriginalMember( id );
            
            if ( ! currentItem ){
                error = true;
                dataToSend.message += 'Service with key "' + id + '" not found trying to delete it!';
                continue;
            }

            if ( ! removeOriginalMember( id ) ){
                dataToSend.message += 'Original member with key "' + id + '" not found trying to delete it!';
                continue;
            }
             
        }

        dataToSend.result = dataToSend.result || error? 'Error': 'OK';
        if ( dataToSend.message != '' ){
            dataToSend.translateMessage = false;
        }

        return dataToSend;
    };
    
    var buildOriginalMemberId = function(){

        var item = members.originalMembers[ ++originalMembersIndex ]; 
        while ( item ) {
            item = members.originalMembers[ ++originalMembersIndex ];
        }

        return '' + originalMembersIndex;
    };
    
    var ajaxOriginalMembersGet = function( file, data ){

        // Init data
        var dataToSend = {};
        dataToSend.result = 'OK';
        dataToSend.message = '';

        // Build record
        var thisOriginalMember = getOriginalMember( data.key );
        /*
        var c = 0;
        var thisOriginalMember = undefined;
        while ( thisOriginalMember == undefined ){
            var currentItem = members.originalMembers[ c++ ];
            if ( currentItem.code == data.key ){
                thisOriginalMember = currentItem;
            }
        }*/
        dataToSend.record = utils.extend( true, {}, thisOriginalMember );
        dataToSend.fieldsData = {};

        return dataToSend;
    };

    var ajaxMembersCheckBatchUpdate = function( file, data, url ){

        lastBatchUpdateUrl = url;
        jsonUpdatesArray.push( 
            utils.extend( true, {}, data ) );

        // Init data
        var dataToSend = {};
        dataToSend.message = '';
        dataToSend.subforms = {};
        dataToSend.subforms.verifiedMembers = {};
        dataToSend.subforms.verifiedMembers.newRecords = [];
        var error = false;
        var input = members.verifiedMembers;
        var verifiedMembersZCrudRecords = data.existingRecords[ 0 ].verifiedMembersZCrudRecords;
        
        // Add all existing services
        for ( var id in verifiedMembersZCrudRecords.existingRecords ) {
            var modifiedItem = verifiedMembersZCrudRecords.existingRecords[ id ];
            var currentItem = input[ id ];

            if ( ! currentItem ){
                error = true;
                dataToSend.message += 'Verified member with key "' + id + '" not found trying to update it!';
                continue;       
            }

            var newId = modifiedItem.code;
            var newIdService = input[ newId ];
            if ( id != newId && newIdService ){
                error = true;
                dataToSend.message += 'Verified member with key "' + newId + '" found: duplicated key trying to update it!';
                continue;    
            }

            var extendedItem = utils.extend( true, {}, currentItem, modifiedItem );

            if ( newId && id !== newId ){
                delete input[ id ];
                id = newId;
            }
            input[ id ] = extendedItem;  
        }

        // Add all new services
        for ( var c = 0; c < verifiedMembersZCrudRecords.newRecords.length; c++ ) {
            var newItem = verifiedMembersZCrudRecords.newRecords[ c ];

            if ( newItem.code == undefined ){
                newItem.code = buildVerifiedMemberId( input );
            }
            id = newItem.code;
            currentItem = input[ id ];

            if ( currentItem ){
                error = true;
                dataToSend.message += 'Verified member with key "' + id + '" found trying to create it!';
                continue;
            }
            input[ id ] = newItem;

            dataToSend.subforms.verifiedMembers.newRecords.push( newItem );               
        }

        // Remove all services to remove
        for ( c = 0; c < verifiedMembersZCrudRecords.recordsToRemove.length; c++ ) {
            id = verifiedMembersZCrudRecords.recordsToRemove[ c ];
            currentItem = input[ id ];

            if ( ! currentItem ){
                error = true;
                dataToSend.message += 'Verified member with key "' + id + '" not found trying to delete it!';
                continue;
            }

            delete input[ id ];                
        }

        dataToSend.result = dataToSend.result || error? 'Error': 'OK';
        if ( dataToSend.message != '' ){
            dataToSend.translateMessage = false;
        }

        return dataToSend;
    };
    
    var ajaxMembersCheckBatchUpdateFiltering = function( file, data, url ){

        var dataToSend = {};
        dataToSend.message = '';
        if ( ! data || ! data.filter || data.filter.name == undefined || data.filter.name == '' ){
            dataToSend.result = 'Error';
            dataToSend.message = 'Filter not set!';
            return dataToSend;
        }
        
        lastBatchUpdateUrl = url;
        jsonUpdatesArray.push( 
            utils.extend( true, {}, data ) );

        // Init data
        //dataToSend.verifiedMembers = {};
        //dataToSend.verifiedMembers.newRecords = [];
        var error = false;
        
        var input = members.verifiedMembers;
        /*
        var index = data.filter.name;
        var input = members.verifiedMembersFiltering[ index ];
        if ( ! input ){
            input = {};
            members.verifiedMembersFiltering[ index ] = input;
        }*/

        for ( var filterId in data.existingRecords ) {
            var record = data.existingRecords[ filterId ].verifiedMembersZCrudRecords;
                
            // Add all existing services
            for ( var id in record.existingRecords ) {
                var modifiedItem = record.existingRecords[ id ];
                var currentItem = input[ id ];

                if ( ! currentItem ){
                    error = true;
                    dataToSend.message += 'Verified member with key "' + id + '" not found trying to update it!';
                    continue;       
                }

                var newId = modifiedItem.code;
                var newIdService = input[ newId ];
                if ( id != newId && newIdService ){
                    error = true;
                    dataToSend.message += 'Verified member with key "' + newId + '" found: duplicated key trying to update it!';
                    continue;    
                }

                var extendedItem = utils.extend( true, {}, currentItem, modifiedItem );

                if ( newId && id !== newId ){
                    delete input[ id ];
                    id = newId;
                }
                input[ id ] = extendedItem; 
                extendedItem.filter = data.filter.name;
            }


            // Add all new services
            for ( var c = 0; c < record.newRecords.length; c++ ) {
                var newItem = record.newRecords[ c ];

                if ( newItem.code == undefined ){
                    newItem.code = buildVerifiedMemberId( input );
                }
                id = newItem.code;
                currentItem = input[ id ];

                if ( currentItem ){
                    error = true;
                    dataToSend.message += 'Verified member with key "' + id + '" found trying to create it!';
                    continue;
                }
                input[ id ] = newItem;

                //dataToSend.verifiedMembers.newRecords.push( newItem );  
                newItem.filter = data.filter.name;
            }

            // Remove all services to remove
            for ( c = 0; c < record.recordsToRemove.length; c++ ) {
                id = record.recordsToRemove[ c ];
                currentItem = input[ id ];

                if ( ! currentItem ){
                    error = true;
                    dataToSend.message += 'Verified member with key "' + id + '" not found trying to delete it!';
                    continue;
                }

                delete input[ id ];                
            }
        }
        
        dataToSend.result = dataToSend.result || error? 'Error': 'OK';
        if ( dataToSend.message != '' ){
            dataToSend.translateMessage = false;
        }

        return dataToSend;
    };
    
    var fromObjectToArray = function( object ){
        
        var result = [];
        for ( var i in object ){
            result.push( object[ i ] );
        }
        return result;
    };
    
    var ajaxVerifiedMembersCheckList = function( file, data, url ){
        return ajaxGeneralMembersList( file, data, url, fromObjectToArray( members.verifiedMembers ) );
    };
    var ajaxMembersCheckList = function( file, data, url ){
        return ajaxGeneralMembersList( file, data, url, members.originalMembers );
    };
    
    var ajaxGeneralMembersList = function( file, data, url, input ){

        lastListUrl = url;

        // Init data
        var dataToSend = {};
        dataToSend.result = 'OK';
        dataToSend.message = '';

        // Add all records to data
        //var input = members.originalMembers;
        var allRecords = [];
        for ( var c = 0; c < input.length; ++c ) {
            var member = input[ c ];
            if ( ! matches( member, data.filter ) ){
                continue;
            }
            allRecords.push( 
                clone( member ) );
        }

        // Sort them
        if ( data.sortFieldId && data.sortType ){
            allRecords.sort( 
                dynamicSort( data.sortFieldId, data.sortType ) );
        }

        // Page them
        pageRecords( data, dataToSend, allRecords );

        return dataToSend;
    };
    /*
    var ajaxMembersCheckList = function( file, data, url ){

        lastListUrl = url;

        // Init data
        var dataToSend = {};
        dataToSend.result = 'OK';
        dataToSend.message = '';

        // Add all records to data
        var input = members.originalMembers;
        var allRecords = [];
        for ( var c = 0; c < input.length; ++c ) {
            var member = input[ c ];
            if ( ! matches( member, data.filter ) ){
                continue;
            }
            allRecords.push( 
                clone( member ) );
        }

        // Sort them
        if ( data.sortFieldId && data.sortType ){
            allRecords.sort( 
                dynamicSort( data.sortFieldId, data.sortType ) );
        }

        // Page them
        pageRecords( data, dataToSend, allRecords );

        return dataToSend;
    };*/
    
    var ajaxMembersCheckGet = function( file, data ){

        // Init data
        var dataToSend = {};
        dataToSend.result = 'OK';
        dataToSend.message = '';

        // Build record
        dataToSend.record = {};
        dataToSend.fieldsData = {};
        processMembersSubformsInGet( data, dataToSend.record, dataToSend );
        
        return dataToSend;
    };
    
    var ajaxMembersCheckGetFiltering = function( file, data ){

        var dataToSend = ajaxMembersCheckGet( file, data );
        
        // Add key to record
        if ( data.filter && data.filter.name ){
            dataToSend.record.id = data.filter.name;
        }
        
        return dataToSend;
    };
    
    var cloneArray = function( arrayToClone ){
        return utils.extend( true, [], arrayToClone );
    };
    
    var processMembersSubformsInGet = function( data, record, dataToSend ){
        
        var fieldsData = data.searchFieldsData || {};
        var subformsFields = [ 'originalMembers', 'verifiedMembers' ];
        var filters = {
            originalMembers: function( input ){
                return filter( input, data.filter );
            },
            verifiedMembers: function( input ){
                return filterVerified( input, data.filter );
            }
        };
        
        for ( var c = 0; c < subformsFields.length; ++c ){
            var subformFieldId = subformsFields[ c ];

            var allSubformValues = members[ subformFieldId ]? 
                cloneArray( members[ subformFieldId ] ): 
                {};
            var thisFieldData = fieldsData[ subformFieldId ]? 
                cloneArray( fieldsData[ subformFieldId ] ): 
                {};
            
            // Filter them
            allSubformValues = filters[ subformFieldId ]( allSubformValues, data.filter );
            
            // Sort them

            // Page them
            var thisFieldDataToSend = {};
            pageRecords( thisFieldData, thisFieldDataToSend, allSubformValues );
            record[ subformFieldId ] = thisFieldDataToSend.records;
            dataToSend.fieldsData[ subformFieldId ] = {
                totalNumberOfRecords: thisFieldDataToSend.totalNumberOfRecords
            };
        }
    };
    
    var filterVerified = function( input, filter ){

        if ( ! filter ){
            return [];
        }

        var result = [];

        for ( var id in input ) {
            var item = input[ id ];
            if ( item.filter == filter.name ){
                result.push( item );
            }
        }

        return result;
    };
    
    var filter = function( input, filter ){
        
        if ( ! filter ){
            return input;
        }
        
        var result = [];
        
        for ( var id in input ) {
            var item = input[ id ];
            if ( matches( item, filter ) ){
                result.push( item );
            }
        }
        
        return result;
    };
    
    var ajaxMembersFields = function( subformId, options, data ){

        // Init data
        var dataToSend = {};
        dataToSend.result = 'OK';
        dataToSend.message = '';
        var thisFieldData = data;

        // Add all records to data
        var service = services[ data.key ];
        if ( ! service ){
            dataToSend.message += 'Service with key "' + data.key + '" not found trying to get ' + subformId + ' subform!';
            options.error( dataToSend );
            return;
        }
        
        var input = service[ subformId ] || [];
        var allRecords = [];
        
        // Filter them
        for ( var id in input ) {
            var member = input[ id ];
            if ( ! matches( member, thisFieldData.filter ) ){
                continue;
            }
            member.id = id;
            allRecords.push( 
                clone( member ) );
        }

        // Sort them
        if ( thisFieldData.sortFieldId && thisFieldData.sortType ){
            allRecords.sort( 
                dynamicSort( thisFieldData.sortFieldId, thisFieldData.sortType ) );
        }

        // Page them
        pageRecords( thisFieldData, dataToSend, allRecords );

        options.success( dataToSend );
    };
    
    var ajaxPhoneTypes = function( options, byCode ){
        options.success({
            result: 'OK',
            message: '',
            options: byCode? phoneTypesByCode : phoneTypes
        });
    };
    
    var ajaxCities = function( options, parameters, url ){
        
        options.success({
            result: 'OK',
            message: '',
            options: cities[ parameters.province ]? cities[ parameters.province ]: []
        });

        updateAccess( url );
    };
    
    var ajaxProvinces = function( options, parameters, url ){
        
        options.success({
            result: 'OK',
            message: '',
            options: provinces
        });
        updateAccess( url );
    };

    var ajaxServices = function( options, cmd, file, data, url ){
        
        // Run command
        var dataToSend = undefined;
        switch ( cmd ) {
            case 'LIST':
                dataToSend = ajaxServicesList( file, data, url );
                break;
            case 'BATCH_UPDATE':
                dataToSend = ajaxServicesBatchUpdate( file, data, url );
                break;
            case 'GET':
                dataToSend = ajaxServicesGet( file, data, url );
                break;
            default:
                throw 'Unknown command in ajax: ' + cmd;
        }
        
        options.success( dataToSend );
    };
    
    var ajaxServicesGet = function( file, data ){

        // Init data
        var dataToSend = {};
        dataToSend.result = 'OK';
        dataToSend.message = '';
        
        // Build record
        dataToSend.record = utils.extend( true, {}, services[ data.key ] );
        dataToSend.fieldsData = {};
        processSubformsInGet( data, servicesSubformsFields, dataToSend.record, dataToSend );
        
        return dataToSend;
    };
    
    var processSubformsInGet = function( data, subformsFields, record, dataToSend ){
        
        var fieldsData = data.searchFieldsData || {};
        
        for ( var c = 0; c < subformsFields.length; ++c ){
            var subformFieldId = subformsFields[ c ];
            
            // Continue if record does not contain this subform
            if ( record[ subformFieldId ] === undefined ){
                continue;
            }
            
            var allSubformValues = record[ subformFieldId ] || {};
            var thisFieldData = fieldsData[ subformFieldId ] || {};
            
            // Filter them
            
            // Sort them
            
            // Page them
            var thisFieldDataToSend = {};
            pageRecords( thisFieldData, thisFieldDataToSend, allSubformValues );
            record[ subformFieldId ] = thisFieldDataToSend.records;
            dataToSend.fieldsData[ subformFieldId ] = {
                totalNumberOfRecords: thisFieldDataToSend.totalNumberOfRecords
            };
        }
    };
    
    var ajaxPeopleMembersFields = function( subformId, options, data ){

        // Init data
        var dataToSend = {};
        dataToSend.result = 'OK';
        dataToSend.message = '';
        var thisFieldData = data;

        // Add all records to data
        var person = people[ data.key ];
        if ( ! person ){
            dataToSend.message += 'Person with key "' + data.key + '" not found trying to get ' + subformId + ' subform!';
            options.error( dataToSend );
            return;
        }

        var input = person[ subformId ] || [];
        var allRecords = [];

        // Filter them
        for ( var id in input ) {
            var member = input[ id ];
            if ( ! matches( member, thisFieldData.filter ) ){
                continue;
            }
            member.id = id;
            allRecords.push( 
                clone( member ) 
            );
        }

        // Sort them
        if ( thisFieldData.sortFieldId && thisFieldData.sortType ){
            allRecords.sort( 
                dynamicSort( thisFieldData.sortFieldId, thisFieldData.sortType ) );
        }

        // Page them
        pageRecords( thisFieldData, dataToSend, allRecords );

        options.success( dataToSend );
    };
    
    var pageRecords = function( data, dataToSend, allRecords ){
        
        if ( data.pageNumber && data.pageSize ){
            var firstElementIndex = ( data.pageNumber - 1 ) * data.pageSize;
            dataToSend.records = allRecords.slice(
                firstElementIndex, 
                firstElementIndex + data.pageSize ); 
        } else {
            dataToSend.records = allRecords;
        }
        dataToSend.totalNumberOfRecords = allRecords.length;
    };
    
    var ajaxServicesBatchUpdate = function( file, data, url ){

        lastBatchUpdateUrl = url;
        jsonUpdatesArray.push( 
            utils.extend( true, {}, data ) );
        
        // Init data
        var dataToSend = {};
        dataToSend.message = '';
        dataToSend.newRecords = [];
        var error = false;

        // Add all existing services
        for ( var id in data.existingRecords ) {
            var modifiedService = data.existingRecords[ id ];
            var currentService = services[ id ];

            if ( ! currentService ){
                error = true;
                dataToSend.message += 'Service with key "' + id + '" not found trying to update it!';
                continue;       
            }
            
            var newId = modifiedService.id;
            var newIdService = services[ newId ];
            if ( id != newId && newIdService ){
                error = true;
                dataToSend.message += 'Service with key "' + newId + '" found: duplicated key trying to update it!';
                continue;    
            }
            
            servicesSubformsListBatchUpdate( currentService, modifiedService, dataToSend );
            
            var extendedService = utils.extend( true, {}, currentService, modifiedService );

            if ( newId && id !== newId ){
                delete services[ id ];
                id = newId;
            }
            services[ id ] = extendedService;  
        }
        
        // Add all new services
        for ( var c = 0; c < data.newRecords.length; c++ ) {
            var newService = data.newRecords[ c ];
            if ( newService.id == undefined ){
                newService.id = buildServiceId();
            }
            id = newService.id;
            currentService = services[ id ];

            if ( currentService ){
                error = true;
                dataToSend.message += 'Service with key "' + id + '" found trying to create it!';
                continue;
            }
            
            var newServiceClone = utils.extend( true, {}, newService );
            if ( newService.membersZCrudRecords ){
                newService.members = [];
                delete newService.membersZCrudRecords;
            }
            servicesSubformsListBatchUpdate( newService, newServiceClone, dataToSend );
            services[ id ] = newService;
            
            dataToSend.newRecords.push( newService );               
        }
        
        // Remove all services to remove
        for ( c = 0; c < data.recordsToRemove.length; c++ ) {
            id = data.recordsToRemove[ c ];
            currentService = services[ id ];

            if ( ! currentService ){
                error = true;
                dataToSend.message += 'Service with key "' + id + '" not found trying to delete it!';
                continue;
            }

            delete services[ id ];                
        }
        
        dataToSend.result = dataToSend.result || error? 'Error': 'OK';
        if ( dataToSend.message != '' ){
            dataToSend.translateMessage = false;
        }
        
        return dataToSend;
    };
    
    var buildServiceId = function(){
        
        var service = services[ ++serviceIndex ]; 
        while ( service ) {
            service = services[ ++serviceIndex ];
        }
        
        return '' + serviceIndex;
    };
    
    var buildVerifiedMemberId = function( input ){

        var thisIndex = 0;
        var item = input[ ++thisIndex ]; 
        while ( item ) {
            item = input[ ++thisIndex ];
        }

        return '' + thisIndex;
    };
    
    var servicesSubformsListBatchUpdate = function( currentService, modifiedService, dataToSend ){
        subformsListBatchUpdate( servicesSubformsFields, currentService, modifiedService, dataToSend );
    };
    
    var subformsListBatchUpdate = function( subformsFields, current, modified, dataToSend ){
        
        for ( var id in modified ){
            var fieldId = removeChars( id, subformsRecordsSuffix );
            if ( subformsFields.indexOf( fieldId ) !== -1 ){
                if ( current[ fieldId ] == undefined ){
                    current[ fieldId ] = [];
                }
                subformFieldBatchUpdate( 
                    modified[ id ], 
                    current[ fieldId ], 
                    dataToSend );
                delete modified[ id ]; // Delete subform data in modified, current has been already updated
            }
        }
    };
    
    var removeChars = function( string, toRemove ){
        return string.replace( toRemove, '' );
    };
    
    var subformFieldBatchUpdate = function( data, current, dataToSend ){
        
        // Add all existing items
        for ( var rowId in data.existingRecords ) {
            var modifiedItem = data.existingRecords[ rowId ];
            var currentItem = getSubformItem( current, rowId );
            
            if ( ! currentItem ){
                //error = true;
                dataToSend.result = 'Error';
                dataToSend.message += 'Row with index "' + rowId + '" not found trying to update it!';
                continue;       
            }
            
            utils.extend( true, currentItem, modifiedItem );
        }
        
        // Add all new items
        for ( var c = 0; c < data.newRecords.length; c++ ) {
            var newItem = data.newRecords[ c ];
            if ( newItem.code == undefined ){
                newItem.code = buildItemCode( current );
            }
            current.push( newItem );
        }
        
        // Remove items
        for ( c = 0; c < data.recordsToRemove.length; c++ ) {
            rowId = data.recordsToRemove[ c ];

            if ( ! removeSubformItem( current, rowId ) ){
                //error = true;
                dataToSend.result = 'Error';
                dataToSend.message += 'Subform item with key "' + rowId + '" not found trying to delete it!';
                continue;
            }           
        }
    };

    var buildItemCode = function( members ){

        var max = 0;
        for ( var c = 0; c < members.length; ++c ){
            var currentCode = members[ c ].code;
            if ( currentCode > max ){
                max = currentCode;
            }
        }
        return '' + ( 1 + parseInt( max ) );
    };
    
    var removeSubformItem = function( current, rowId ){

        for ( var rowIndex in current ){
            var currentRow = current[ rowIndex ];
            if ( currentRow.code ==  rowId ){
                current.splice( rowIndex, 1 );
                return true;
            }
        }
        
        return false;
    };
    
    var getSubformItem = function( current, rowId ){
        
        for ( var rowIndex in current ){
            var currentRow = current[ rowIndex ];
            if ( currentRow.code ==  rowId ){
                return currentRow;
            }
        }
        
        return undefined;
    };
    
    var ajaxServicesList = function( file, data, url ){
        
        lastListUrl = url;
        
        // Init data
        var dataToSend = {};
        dataToSend.result = 'OK';
        dataToSend.message = '';
        //dataToSend.records = [];
        
        // Add all records to data
        var input = services;
        var allRecords = [];
        for ( var id in input ) {
            var service = input[ id ];
            if ( ! matches( service, data.filter ) ){
                continue;
            }
            service.id = id;
            allRecords.push( 
                clone( service ) );
        }
        
        // Sort them
        if ( data.sortFieldId && data.sortType ){
            allRecords.sort( 
                dynamicSort( data.sortFieldId, data.sortType ) );
        }
        
        // Page them
        pageRecords( data, dataToSend, allRecords );
        
        return dataToSend;
    };
    
    var matches = function( record, filter ){
        
        for ( var filterName in filter ) {
            var filterValue = filter[ filterName ];
            var recordValue = record[ filterName ];
            if ( recordValue.indexOf( filterValue ) == -1 ){
                return false;
            }
        }
        
        return true;
    };
    
    var dynamicSort = function( property, type ) {

        var sortOrder = type && type.toLowerCase() === 'desc'? -1: 1;
        return function ( a, b ) {
            var result = ( a [property] < b [property] ) ? -1 : ( a [property] > b [property] ) ? 1 : 0;
            return result * sortOrder;
        }
    }
    
    var parseQueryString = function( query ) {
        
        var vars = query.split( '&' );
        var query_string = {};
        for ( var i = 0; i < vars.length; i++ ) {
            var pair = vars[ i ].split( '=' );
            // If first entry with this name
            if ( typeof query_string[ pair[ 0 ] ] === 'undefined' ) {
                query_string[ pair[ 0 ] ] = decodeURIComponent( pair[ 1 ] );
                // If second entry with this name
            } else if ( typeof query_string[ pair[ 0 ] ] === 'string' ) {
                var arr = [ query_string[pair[ 0 ]], decodeURIComponent( pair[ 1 ] )];
                query_string[ pair[ 0 ] ] = arr;
                // If third or later entry with this name
            } else {
                query_string[ pair[ 0 ] ].push( decodeURIComponent( pair[ 1 ] ) );
            }
        }
        return query_string;
    }
    
    var clone = function( object ){
        
        if ( ! object ){
            return object;
        }
        
        var cloned = {};

        for ( var id in object ){
            cloned[ id ] = object[ id ];
        }

        return cloned;
    };
    
    var getService = function( key ){
        return clone( services[ key ] );
    };
    
    var setService = function( key, service ){
        //services[ key ] = clone( service );
        services[ key ] = utils.extend( true, {}, service );
    };
    
    var removeService = function( key ){
        delete services[ key ];
    };
    
    var getUrl = function( index ){
        return urls[ index ];
    };
    
    var getLastListUrl = function(){
        return lastListUrl;
    };
    
    var getLastBatchUpdateUrl = function(){
        return lastBatchUpdateUrl;
    };
    
    var getJSONUpdate = function( index ){
        return jsonUpdatesArray[ index ];
    };
    
    var ajaxPeople = function( options, cmd, file, data, url ){

        // Run command
        var dataToSend = undefined;
        switch ( cmd ) {
            case 'LIST':
                dataToSend = ajaxPeopleList( file, data, url );
                break;
            /*case 'BATCH_UPDATE':
                dataToSend = ajaxPeopleBatchUpdate( file, data, url );
                break;*/
            case 'GET':
                dataToSend = ajaxPeopleGet( file, data, url );
                break;
            default:
                throw 'Unknown command in ajax: ' + cmd;
        }

        options.success( dataToSend );
    };
    
    var ajaxPeopleList = function( file, data, url ){

        lastListUrl = url;

        // Init data
        var dataToSend = {};
        dataToSend.result = 'OK';
        dataToSend.message = '';

        // Add all records to data
        var input = people;
        var allRecords = [];
        for ( var id in input ) {
            var record = input[ id ];
            if ( ! matches( record, data.filter ) ){
                continue;
            }
            record.id = id;
            allRecords.push( 
                clone( record )
            );
        }

        // Sort them
        if ( data.sortFieldId && data.sortType ){
            allRecords.sort( 
                dynamicSort( data.sortFieldId, data.sortType ) );
        }

        // Page them
        pageRecords( data, dataToSend, allRecords );

        return dataToSend;
    };

    var ajaxPeopleGet = function( file, data ){

        // Init data
        var dataToSend = {};
        dataToSend.result = 'OK';
        dataToSend.message = '';

        // Build record
        dataToSend.record = utils.extend( true, {}, people[ data.key ] );
        dataToSend.fieldsData = {};
        processSubformsInGet( data, peopleSubformsFields, dataToSend.record, dataToSend );

        return dataToSend;
    };
    
    var getPerson = function( key ){
        return clone( people[ key ] );
    };
    
    return {
        ajax: ajax,
        getService: getService,
        setService: setService,
        removeService: removeService,
        resetServices: resetServices,
        reset2SubformMembersServices: reset2SubformMembersServices,
        resetOriginalAndVerifiedMembers: resetOriginalAndVerifiedMembers,
        getOriginalMembers: getOriginalMembers,
        getOriginalMembersByCode: getOriginalMembersByCode,
        getVerifiedMembers: getVerifiedMembers,
        getUrl: getUrl,
        getLastListUrl: getLastListUrl,
        getLastBatchUpdateUrl: getLastBatchUpdateUrl,
        getJSONUpdate: getJSONUpdate,
        reset: reset,
        resetPeople: resetPeople,
        getPerson: getPerson,
        addAddressesToPeopleObject: addAddressesToPeopleObject,
        resetAccess: resetAccess,
        getAccess: getAccess
    };
})();
