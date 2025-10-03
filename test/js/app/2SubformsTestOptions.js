

import { testServerSide } from './testServerSide.js';

export const twoSubformsTestOptions = {

    entityId: 'department',
    saveUserPreferences: false,
    
    pageConf: {
        defaultPageConf: {
            updateURL: 'http://localhost/CRUDManager.do?cmd=BATCH_UPDATE&table=department',
            dataToSend: 'modified',
            confirm: {
                save: false,
                cancel: false
            }
        },
        pages: {
            list: {
                getGroupOfRecordsURL: 'http://localhost/CRUDManager.do?cmd=LIST&table=department',
                getRecordURL: 'http://localhost/CRUDManager.do?cmd=GET&table=department',
                fields: [ 'id', 'name' ],
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
                    },
                    sorting: {
                        isOn: false
                    },
                    selecting: {
                        isOn: false
                    },
                    filtering: {
                        isOn: false
                    }
                }
            }, 
            create: {
                fields: [
                    {
                        'type': 'fieldsGroup'
                    }
                ]
            }, 
            update: {
                fields: [
                    {
                        'type': 'fieldsGroup'
                    }
                ]
            }, 
            delete: {
                fields: [
                    {
                        'type': 'fieldsGroup'
                    }
                ]
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
                    style: 'width:90%'
                }
            }
        },
        description: {
            type: 'textarea',
            //template: 'descriptionTextarea'
        },
        important: {
            type: 'checkbox'
        },
        members: {
            type: 'subform',
            getGroupOfRecordsURL: 'http://localhost/CRUDManager.do?cmd=LIST&table=members',
            subformKey: 'code',
            fields: { 
                code: { },
                name: {
                    attributes:{
                        filterField: {
                            maxlength: 19
                        }
                    }
                },
                description: {
                    type: 'textarea',
                    sorting: false,
                    attributes: {
                        field: {
                            rows: 3
                        }
                    }
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
        },
        externalMembers: {
            type: 'subform',
            subformKey: 'code',
            fields: { 
                code: { },
                name: {
                    attributes:{
                        field: {
                            minlength: 3,
                            maxlength: 20,
                            pattern: '.{3,20}' // Must use pattern to make the tests work properly
                        }
                    }
                },
                description: {
                    type: 'textarea',
                    attributes: {
                        field: {
                            rows: 3
                        }
                    }
                }
            }
        }
    },

    ajax:{
        ajaxFunction: testServerSide.ajax    
    },

    events: {},
    
    i18n: {
        language: 'en',
        files: { 
            en: [ 'en-common.json', 'en-services.json' ],
            es: [ 'es-common.json', 'es-services.json' ] 
        }
    },
    
    logging: {
        isOn: true
    }
};
