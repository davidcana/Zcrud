# ZCrud

ZCrud is a javascript API (also works as jQuery plugin) used to create AJAX based CRUD tables without coding HTML or Javascript. First implmentations were based on [jTable](http://www.jtable.org) with some major changes:
 
 * The heaviest change is to build all HTML code of forms using a template engine ([ZPT-JS](https://github.com/davidcana/ZPT-JS/wiki)). 
 * It does not depend on any javascript API (like jQueryUI), only on jQuery.
 * It does not create any dialog form, only simple HTML forms.

Core features of ZCrud are:

* Automatically creates a main HTML table and loads records from server using AJAX. Supports server side sorting, paging and filtering using AJAX. The table can be editable directly too. 
* Automatically creates some typical forms and sends and receives data from/to server using AJAX:
    * *create record* form.  
    * *edit record* form. 
    * *delete record* form. 
* About forms:
    * Supports master/child forms. 
    * Allows user to select rows. 
    * Makes it easy to customize already implemented form field types; also to add new form field types.
    * Makes it easy to use defined buttons (submit, cancel, ...) and to add custom.
    * Built-in support of validation of forms using [jQuery Form Validator](http://www.formvalidator.net/). Exposes some events to enable custom validation without using it.
    * Undo/redo support. 
* All tables and forms are created using templates.  It is also possible to use customized templates. The template engine is [ZPT-JS](https://github.com/davidcana/ZPT-JS). 
* Pretty messages and confirm questions using [Sweetalert](https://sweetalert.js.org) (by default). It is easy to replace it by any other API or function.
* Only client-side: any server side technology can work with ZCrud. 
* Built-in support for english and spanish (full I18n and L10n support). Other languages can be added easily. 
* All HTML code is valid (w3c compliant). It works on all common browsers. 

## Installation

ZCrud is registered as a package on [npm](https://www.npmjs.com/package/zcrud). This is the recomended way of downloading it. You can install the latest version of ZCrud and its dependencies with the npm CLI command:

```bash
npm install zcrud
```

## Usage

The most important thing about **ZCrud** is that we define a javascript object to configure the CRUD:

```javascript
// Build this object to configure ZCrud instance
var options = {
 
    entityId: 'people',
    saveUserPreferences: false,
 
    pageConf: {
        defaultPageConf: {
            updateURL: 'http://your-domain/CRUDManager.do?cmd=BATCH_UPDATE&table=people',
            getRecordURL: 'http://your-domain/CRUDManager.do?cmd=GET&table=people'
        },
        pages: {
            list: {
                getGroupOfRecordsURL: 'http://your-domain/CRUDManager.do?cmd=LIST&table=people',
                fields: [ 'id', 'name', 'datetime', 'country', 'city', 'browser' ],
                components: {
                    sorting: {
                        isOn: true,
                        default: {
                            fieldId: 'name',
                            type: 'asc'
                        },
                        allowUser: false
                    },
                    filtering: {
                        isOn: true,
                        fields: [ 'id', 'name' ]
                    },
                    selecting: {
                        isOn: true,
                        multiple: true,
                        mode: [ 'checkbox', 'onRowClick' ] // Options are checkbox and onRowClick
                    }
                }
            }, 
            create: {
                fields: [
                    {
                        type: 'fieldsGroup'
                    }
                ]
            }, 
            update: {
                fields: [
                    {
                        type: 'fieldsGroup'
                    }
                ]
            }, 
            delete: {
                fields: [
                    {
                        type: 'fieldsGroup'
                    }
                ]
            }
        }
    },
 
    key : 'id',
    fields: {
        id: {
        },
        name: {
            attributes:{
                rowHeader: {
                    style: 'width:30%'
                }
            }
        },
        description: {
            type: 'textarea'
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
            options: [
                { value: '1', displayText: 'homePhone_option' }, 
                { value: '2', displayText: 'officePhone_option' }, 
                { value: '3', displayText: 'cellPhone_option' } 
            ]
        },
        country: {
            type: 'select',
            translateOptions: false,
            options: [
                { value: 1, displayText: 'France' }, 
                { value: 2, displayText: 'Italy' },
                { value: 3, displayText: 'Portugal' }, 
                { value: 4, displayText: 'Spain' }, 
                { value: 5, displayText: 'UK' }
            ],
            defaultValue: '4'
        },
        city: {
            type: 'select',
            sorting: false,
            dependsOn: 'country',
            options: function( data ){
 
                if ( ! data.dependedValues.country ){
                    return [];
                }
 
                switch ( parseInt( data.dependedValues.country ) ) {
                    case 1:
                        return [ 
                            { value: 1, displayText: 'Paris' }, 
                            { value: 2, displayText: 'Marseille' }, 
                            { value: 3, displayText: 'Lyon' }, 
                            { value: 4, displayText: 'Toulouse' },
                            { value: 5, displayText: 'Nice' }
                        ];
                    case 2:
                        return [ 
                            { value: 1, displayText: 'Roma' }, 
                            { value: 2, displayText: 'Milano' }, 
                            { value: 3, displayText: 'Napoli' }, 
                            { value: 4, displayText: 'Torino' },
                            { value: 5, displayText: 'Paliemmu' }
                        ];
                    case 3:
                        return [ 
                            { value: 1, displayText: 'Lisboa' }, 
                            { value: 2, displayText: 'Oporto' }, 
                            { value: 3, displayText: 'Vila Nova de Gaia' }, 
                            { value: 4, displayText: 'Amadora' },
                            { value: 5, displayText: 'Braga' }
                        ];
                    case 4:
                        return [ 
                            { value: 1, displayText: 'Madrid' }, 
                            { value: 2, displayText: 'Barcelona' }, 
                            { value: 3, displayText: 'Valencia' }, 
                            { value: 4, displayText: 'Sevilla' },
                            { value: 5, displayText: 'Zaragoza' }
                        ];
                    case 5:
                        return [ 
                            { value: 1, displayText: 'London' }, 
                            { value: 2, displayText: 'Birmingham' }, 
                            { value: 3, displayText: 'Glasgow' }, 
                            { value: 4, displayText: 'Liverpool' },
                            { value: 5, displayText: 'Leeds' }
                        ];
                    default:
                        throw 'Unknown country: ' + data.dependedValues.country;
                }
            }
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
    },
 
    validation: {
        modules: 'security, date',
        rules: {
            '#zcrud-name': {
                validation: 'length',
                length: '3-12'
            }
        }
    },
 
    i18n: {
        language: 'en',
        files: { 
            en: [ 'en-common.json', 'en-people.json' ],
            es: [ 'es-common.json', 'es-people.json' ] 
        }
    }
};
 
$( '#container' ).zcrud( 
    'init',
    options,
    function( options ){
        $( '#container' ).zcrud( 'renderList' );
    }
);
```

There are 2 calls to methods of **ZCrud**:

* The first call is 'init' method. This method initializes ZCrud (using the options object) and loads external resources (templates) using HTTP. When it has finished it calls to the callback function.
* The second call is 'renderList'. It sends a request to the server to retrieve records and then build the HTML of the list.

Take a look at [Getting started page](https://davidcana.github.io/Zcrud/tutorial/gettingStarted.html) to see more details.

## License
[LGPL](http://www.gnu.org/licenses/lgpl.html)
