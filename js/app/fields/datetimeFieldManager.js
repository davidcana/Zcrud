/*
    DatetimeFieldManager singleton class
*/
"use strict";

var $ = require( 'jquery' );
var zpt = require( 'zpt' );
var DateFormatter = require( '../../../lib/php-date-formatter.js' );
var context = require( '../context.js' );

var DatetimeFieldManager = function() {
    
    var selectedDateClass = 'current';
    var pickerValueAttr = 'data-picker-value';
    var dictionary = undefined;
    var currentTimer = undefined;

    var weekDays = [ 
        'Sun', 
        'Mon', 
        'Tue', 
        'Wed', 
        'Thu', 
        'Fri', 
        'Sat'
    ];
    var monthNames = [ 
        'January' , 
        'February', 
        'March', 
        'April', 
        'May', 
        'June', 
        'July', 
        'August', 
        'September', 
        'October', 
        'November', 
        'December' 
    ];
    var weekInitDone = false;
    var dateFormatter = new DateFormatter();
    
    var filterValue = function( record, field ){
        return getValueFromString( record[ field.id ], field );
    };
    
    var setValueToForm = function( field, value, $this ){
        
        switch( field.type ) {
            case 'datetime':
                var manageTime = true;
            case 'date':
                setValueToFormForDatetime( field, value, $this, manageTime );
                return;
            case 'time':
                setValueToFormForTime( field, value, $this );
                return;
        }

        throw 'Unknown type in DatetimeFieldManager: ' + field.type;
    };
    
    var setValueToFormForTime = function( field, value, $this ){

        $this
            .val( value )
            .attr( pickerValueAttr, value );
        
        if ( field.customOptions.inline ){
            //var $datetime = get$datetime( $this.closest( 'form' ), field );
            var $datetime = get$datetime( $this.parents( '.zcrud-data-entity' ).first(), field );
            var timeObject = buildTimeObjectFromString( field, value );
            updateTime( $datetime, timeObject );
        }
    };
    
    var setValueToFormForDatetime = function( field, value, $this, manageTime ){

        var formattedValue = formatToClient( field, value );
        $this
            .val( formattedValue )
            .attr( pickerValueAttr, formattedValue );

        if ( field.customOptions.inline ){
            //var $datetime = get$datetime( $this.closest( 'form' ), field );
            var $datetime = get$datetime( $this.parents( '.zcrud-data-entity' ).first(), field );
            
            // Update dictionary
            dictionary.field = field;
            dictionary.value = value;

            goToDate( 
                value,
                $datetime, 
                dictionary
            );
            
            if ( manageTime ){
                var timeObject = buildTimeObjectFromHoursAndMinutes( 
                    field, 
                    value? value.getHours(): 0, 
                    value? value.getMinutes(): 0 );
                updateTime( $datetime, timeObject );
            }
        }
    };
    
    var updateTime = function( $datetime, timeObject ){

        var $timePicker = get$timePicker( $datetime );
        get$hoursByTimePicker( $timePicker ).text( timeObject.hoursToShow );
        get$minutesByTimePicker( $timePicker ).text( timeObject.minutesToShow );
    };
    
    var parseDate = function( datetimeString, field ){
        return dateFormatter.parseDate( datetimeString, getI18nFormat( field ) );
    }
    
    var getValueFromString = function( stringValue, field ){

        switch( field.type ) {
            case 'date':
            case 'datetime':
                return stringValue? parseDate( stringValue, field ): undefined;
            case 'time':
                return stringValue;
        }

        throw 'Unknown type in DatetimeFieldManager: ' + field.type;
    };
    
    var getValue = function( $this, field ){
        return getValueFromString( $this.val(), field );
    };
    
    var afterProcessTemplateForField = function( params, $selection ){
        
        switch( params.source ) {
        case 'create':
        case 'update':
            afterProcessTemplateForFieldInCreateOrUpdate( params, $selection );
            break;
        case 'delete':
            // Nothing to do
            break; 
        default:
            throw "Unknown source in DatetimeFieldManager: " + params.source;
        }
    };
    
    var afterProcessTemplateForFieldInCreateOrUpdate = function( params, $selection ){
        
        var date = false;
        var time = false;
        
        switch( params.field.type ) {
            case 'date':
                date = true;
                break;
            case 'datetime':
                date = true;
                time = true;
                break;
            case 'time':
                time = true;
                break;
            default:
                throw 'Unknown type in DatetimeFieldManager: ' + params.field.type;
        }

        buildDictionaryFromParams( params );
        bindEvents( params, $selection, date, time );
    };
    
    var getTemplate = function( field ){
        return field.type + '@templates/fields/datetime.html';
    };
    
    var getI18nFormat = function( field ){

        var formatI18nId = field.type + 'Format';
        return context.translate( formatI18nId );
    };
    
    var getValueFromForm = function( field, options, $selection ){
        
        return field.customOptions.inline? 
            getValueFromFormForInline( field, options, $selection ): 
            getValueFromFormForNotInline( field, options, $selection );
    };
    
    var getValueFromFormForNotInline = function( field, options, $selection ){

        var datetimeString = $selection.find( "[name='" + field.name + "']").val();
        
        if ( ! datetimeString || datetimeString.length == 0 || field.type == 'time' ){
            return datetimeString;
        }
        
        var datetimeInstance = dateFormatter.parseDate( 
            datetimeString, 
            getI18nFormat( field ) );
        
        return datetimeInstance;
    };
    
    var getValueFromFormForInline = function( field, options, $selection ){
        
        return buildDatetimeInstance( 
            field, 
            get$datetime( $selection, field ) );
    };

    var getValueFromRecord = function( field, record, params ){

        var value = record[ field.id ];
        if ( ! value || value.length == 0 ){
            return value;
        }

        switch( field.type ) {
            case 'date':
            case 'datetime':
                return new Date( value );
            case 'time':
                return value;
        }
        
        throw 'Unknown type in DatetimeFieldManager: ' + field.type;
    };
    
    var getTimeInfo = function( field, timeString ){
        return buildTimeObjectFromString( field, timeString );
    };
    
    var buildTimeObjectFromString = function( field, timeString ){
        
        var minutes = 0;
        var hours = 0;
        
        // Validate time
        var timeArray = timeString? timeString.split( ':' ): undefined;
        
        if ( timeArray
            && timeArray.length == 2 
            && ! isNaN( timeArray[0] ) && ! isNaN( timeArray[1] )
            && timeArray[0] >= 0 && timeArray[1] >= 0 
            && timeArray[0] <= field.customOptions.maxHour && timeArray[1] <= 59 ){
            
            hours = timeArray[0];
            minutes = timeArray[1];
        }
        
        return buildTimeObjectFromHoursAndMinutes( field, hours, minutes );
    };
    
    var buildTimeObjectFromDateInstance = function( field, date ){
        
        var minutes = date? date.getMinutes(): 0;
        var hours = date? date.getHours(): 0;

        return buildTimeObjectFromHoursAndMinutes( field, hours, minutes );
    };
    
    var buildTimeObjectFromHoursAndMinutes = function( field, hours, minutes ){

        return {
            minutes: minutes,
            minutesToShow: formatTimeNumber( minutes, 59 ),
            hours: hours,
            hoursToShow: formatTimeNumber( hours, field.customOptions.maxHour )
        };
    };
    
    /*
    var formatTimeNumber = function( number ){
        return ( '' + number ).length < 2? '0' + number: '' + number;
    }*/
    function formatTimeNumber( number, maxNumber ) {
        
        var numberOfDigits = ( '' + maxNumber ).length;
        var string = '' + number;
        return string.length >= numberOfDigits?
               string: 
               new Array( numberOfDigits - string.length + 1 ).join( '0' ) + string;
    }
    
    var getDateInfo = function( field, selectedDate ){
        
        //var referenceDate = selectedDate? selectedDate: new Date();
        var referenceDate = getReferenceDate( selectedDate );
        
        return getDateInfoFromObject( field, referenceDate, selectedDate );
    };
    
    var getDateInfoFromObject = function( field, referenceDate, selectedDate ){
        
        return {
            years: buildYears( field, referenceDate ),
            months: buildMonths( referenceDate ),
            weekDays: getWeekDays(),
            daysInWeeks: buildDaysInWeeks( 
                referenceDate, 
                selectedDate,
                context.translate( 'dayOfWeekStart' ) )
        };
    };

    var getReferenceDate = function( selectedDate ){
        
        //var referenceDate = selectedDate? selectedDate: new Date();
        
        var referenceDate = undefined;
        
        if ( selectedDate ){
            referenceDate = selectedDate;
        } else {
            referenceDate =  new Date();
            referenceDate.setHours( 0 );
            referenceDate.setMinutes( 0 );
        }
        
        return referenceDate;
    };
    
    var getDateTimeInfo = function( field, selectedDate ){

        var referenceDate = getReferenceDate( selectedDate );
        var timeString = buildTimeStringFromDate( referenceDate );
        
        return {
            dateInfo: getDateInfoFromObject( field, referenceDate, selectedDate ),
            timeInfo: getTimeInfo( field, timeString )
        };
    };
    
    var buildTimeStringFromDate = function( date ){
        return buildTimeString( date.getHours(), date.getMinutes() );
    };
    
    var getWeekDays = function(){
        
        if ( ! weekInitDone ){

            // Sort the list of days in a week
            var dayOfWeekStart = context.translate( 'dayOfWeekStart' );
            if ( dayOfWeekStart != 0 ){
                weekDays = weekDays.slice( dayOfWeekStart ).concat( 
                    weekDays.slice( 0, dayOfWeekStart ) );
            }

            weekInitDone = true;
        }
        
        return weekDays;
    };
    
    var buildYears = function( field, referenceDate ){
        
        var currentYear = referenceDate.getFullYear();
        var minYear = field.customOptions.minYear;
        var maxYear = field.customOptions.maxYear;
        
        var years = [];
        
        for ( var c = minYear; c <= maxYear; ++c ){
            years.push(
                {
                    value: c,
                    current: currentYear == c
                }
            );
        }
        
        return years;
    };
    
    var buildMonths = function( referenceDate ){
        
        var currentMonth = referenceDate.getMonth();
        var months = [];
        
        for ( var c = 0; c < 12; ++c ){
            months.push(
                {
                    value: c,
                    name: monthNames[ c ],
                    current: currentMonth == c
                }
            );
        }
        
        return months;
    };
    
    var buildDaysInWeeks = function( referenceDate, selectedDate, dayOfWeekStart ){
        
        var totalNumberOfDays = referenceDate.countDaysInMonth();
        
        // Set start date to day 1/current month/current day/00:00:00
        var tempDate = new Date( referenceDate.getFullYear(), referenceDate.getMonth(), 1, 0, 0, 0 );
        
        // Make the start date to start the week
        while ( tempDate.getDay() != dayOfWeekStart ) {
            tempDate.setDate( tempDate.getDate() - 1 );
            ++totalNumberOfDays;
        }
        
        // Build today
        var today = new Date();
        today = new Date( today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0 );
        
        // Build days
        var week = [];
        var weeksArray = [];
        var c = 0;
        while ( ++c <= totalNumberOfDays || tempDate.getDay() != dayOfWeekStart ) {
            
            var dayOfWeek = tempDate.getDay();
            var thisDay = {
                day: tempDate.getDate(),                                      // data-day atttr and content of td
                month: tempDate.getMonth(),                                   // data-month atttr
                year: tempDate.getFullYear(),                                 // data-year atttr
                dayOfWeek: tempDate.getDay(),                                 // day_of_week{dayOfWeek} class
                current: tempDate.dateEquals( selectedDate ),                 // current class if true
                today: today.dateEquals( tempDate ),                          // today class if true
                otherMonth: referenceDate.getMonth() !== tempDate.getMonth(), // other-month class if true
                weekEnd: dayOfWeek == 0 || dayOfWeek == 6                     // weekend class if true
            };

            week.push( thisDay );
            
            if ( c % 7 === 0 ){
                var fullWeek = week.slice();
                weeksArray.push( fullWeek );
                week = [];
            }
            
            tempDate.setDate( tempDate.getDate() + 1 );
        }
        
        return weeksArray;
    };
    
    Date.prototype.countDaysInMonth = function () {
        return new Date( this.getFullYear(), this.getMonth() + 1, 0 ).getDate();
    };
    
    Date.prototype.dateEquals = function ( otherDate ) {
        
        if ( ! otherDate ){
            return false;
        }
        
        return this.getFullYear() === otherDate.getFullYear()
            && this.getMonth() === otherDate.getMonth()
            && this.getDate() === otherDate.getDate();
    };
    
    var get$datePicker = function( event ){
        return $( event.target ).closest( '.datepicker' );
    };
    /*
    var get$timePicker = function( event ){
        return $( event.target ).closest( '.timepicker' );
    };*/
    
    var getSelectedDate = function( event, field, selectDay, $datePicker ){
        
        var $datePicker = $datePicker || get$datePicker( event );
        
        var year = $datePicker.find( "[name='datepicker-year']" ).val();
        var month = $datePicker.find( "[name='datepicker-month']" ).val();
        var day = selectDay? 1: 1;
        
        return new Date( year, month, day, 0, 0, 0 );
    };
    
    var getSelectedYearAndMonthDate = function( event, field, $datePicker ){
        return getSelectedDate( event, field, undefined, $datePicker );
    };
    
    var goToPreviousMonth = function( event, $datetime, params ){

        var thisDate = getSelectedYearAndMonthDate( event, params.field );

        if ( thisDate.getMonth() == 0 ){
            thisDate.setFullYear( thisDate.getFullYear() - 1 );
            thisDate.setMonth( 11 );
        } else {
            thisDate.setMonth( thisDate.getMonth() - 1 );
        }

        goToDate( thisDate, $datetime, buildDictionaryFromParams( params ) );
    };
    
    var goToNextMonth = function( event, $datetime, params ){
        
        var thisDate = getSelectedYearAndMonthDate( event, params.field );
        
        if ( thisDate.getMonth() == 11 ){
            thisDate.setFullYear( thisDate.getFullYear() + 1 );
            thisDate.setMonth( 0 );
        } else {
            thisDate.setMonth( thisDate.getMonth() + 1 );
        }

        goToDate( thisDate, $datetime, buildDictionaryFromParams( params ) );
    };
    
    var goToPreviousYear = function( event, $datetime, params ){

        var thisDate = getSelectedYearAndMonthDate( event, params.field );

        thisDate.setFullYear( thisDate.getFullYear() - 1 );

        goToDate( thisDate, $datetime, buildDictionaryFromParams( params ) );
    };
    
    var goToNextYear = function( event, $datetime, params ){

        var thisDate = getSelectedYearAndMonthDate( event, params.field );

        thisDate.setFullYear( thisDate.getFullYear() + 1 );

        goToDate( thisDate, $datetime, buildDictionaryFromParams( params ) );
    };
    
    var update = function( event, $datetime, params ){

        var thisDate = getSelectedYearAndMonthDate( event, params.field );

        goToDate( thisDate, $datetime, buildDictionaryFromParams( params ) );
    };
    
    var goToday = function( event, $datetime, params ){
        goToDate( new Date(), $datetime, buildDictionaryFromParams( params ) );
    };
    
    var buildDictionaryFromParams = function( params ){
        
        //dictionary = params.dictionary;
        dictionary = $.extend( true, {}, params.dictionary );
        
        dictionary.field = params.field;
        dictionary.value = params.value;
        
        return dictionary;
    };
    
    var goToDate = function( referenceDate, $datetime, dictionary ){
            
        // Build selectedDate
        var selectedDate = dictionary.value? 
            new Date( dictionary.value ):
            undefined;
        
        // Update the date picker
        updateDatePicker( dictionary.field, referenceDate, selectedDate, $datetime );
    };
    
    var updateDatePicker = function( field, referenceDate, selectedDate, $datetime ){
        
        dictionary.dateInfo = getDateInfoFromObject( 
            field, 
            referenceDate? referenceDate: getSelectedYearAndMonthDate( undefined, field, $datetime ), 
            selectedDate );

        // Refresh template
        //zpt.run({
        context.getZPTParser().run({
            root: $datetime.find( '.datepicker' )[ 0 ],
            dictionary: dictionary,
            notRemoveGeneratedTags: false
        });

        // Bind events
        bindDatePickerEvents( field, $datetime );
    };
    
    var get$datetime = function( $selection, field ){

        return $selection.find( '.zcrud-like-field-' + field.name );
        /*
        return field.name.indexOf( '/') == -1?
            $selection.find( '.zcrud-field-' + field.id ):
            $selection.find( '.zcrud-column-data-' + field.id );*/
    };
    
    var bindEvents = function( params, $selection, dateEvents, timeEvents ){
        
        var $datetime = get$datetime( $selection, params.field );
        
        bindCommonEvents( params, $selection, $datetime );
        
        if ( dateEvents ){
            bindDateEvents( params, $selection, $datetime );
        }
        
        if ( timeEvents ){
            bindTimeEvents( params, $selection, $datetime );
        }
    };
    
    var bindCommonEvents = function( params, $selection, $datetime ){

        $datetime
            .find( '.save-button' )
            .click( 
            function ( event ) {
                event.preventDefault();
                event.stopPropagation();
                save( $datetime, params.field, true );
            }
        );

        $datetime
            .find( '.cancel-button' )
            .click( 
            function ( event ) {
                event.preventDefault();
                event.stopPropagation();
                cancel( event, $datetime, params );
            }
        );

        $datetime
            .find( '.toggle-picker' )
            .off( 'click' )
            .click( 
            function ( event ) {
                event.preventDefault();
                event.stopPropagation();
                toggle( event, $datetime, params );
            }
        );
    };
    
    var bindTimeEvents = function( params, $selection, $datetime ){
        
        var delay = params.field.customOptions.timerDelay;
        var minutesStep = params.field.customOptions.minutesStep;
        var hoursStep = 1;
        
        var mouseupFunction = function( event ){
            event.preventDefault();
            event.stopPropagation();
            clearInterval( currentTimer );
        };
        
        $datetime
            .find( '.prev-hour' )
            .mousedown( 
                function ( event ) {
                    event.preventDefault();
                    event.stopPropagation();
                    addHoursInterval( event, $datetime, params, -hoursStep, delay );
                }
            )
            .mouseup( mouseupFunction );
        
        $datetime
            .find( '.prev-minute' )
            .mousedown( 
                function ( event ) {
                    event.preventDefault();
                    event.stopPropagation();
                    addMinutesInterval( event, $datetime, params, -minutesStep, delay );
                }
            )
            .mouseup( mouseupFunction );
        
        $datetime
            .find( '.next-hour' )
            .mousedown( 
                function ( event ) {
                    event.preventDefault();
                    event.stopPropagation();
                    addHoursInterval( event, $datetime, params, hoursStep, delay );
                }
            )
            .mouseup( mouseupFunction );

        $datetime
            .find( '.next-minute' )
            .mousedown( 
                function ( event ) {
                    event.preventDefault();
                    event.stopPropagation();
                    addMinutesInterval( event, $datetime, params, minutesStep, delay );
                }
            )
            .mouseup( mouseupFunction );
    };
    
    var bindDateEvents = function( params, $selection, $datetime ){
        
        $datetime
            .find( '.today-button' )
            .click( 
                function ( event ) {
                    event.preventDefault();
                    event.stopPropagation();
                    goToday( event, $datetime, params );
                }
            );
        
        $datetime
            .find( '.prev-month' )
            .click( 
            function ( event ) {
                event.preventDefault();
                event.stopPropagation();
                goToPreviousMonth( event, $datetime, params );
            }
        );
        
        $datetime
            .find( '.next-month' )
            .click( 
            function ( event ) {
                event.preventDefault();
                event.stopPropagation();
                goToNextMonth( event, $datetime, params );
            }
        );
        
        $datetime
            .find( '.prev-year' )
            .click( 
            function ( event ) {
                event.preventDefault();
                event.stopPropagation();
                goToPreviousYear( event, $datetime, params );
            }
        );
        
        $datetime
            .find( '.next-year' )
            .click( 
            function ( event ) {
                event.preventDefault();
                event.stopPropagation();
                goToNextYear( event, $datetime, params );
            }
        );

        $datetime
            .find( "[name='datepicker-month'], [name='datepicker-year']" )
            .change( 
            function ( event ) {
                event.preventDefault();
                event.stopPropagation();
                update( event, $datetime, params );
            }
        );
        
        bindDatePickerEvents( params.field, $datetime );
    };
    
    var bindDatePickerEvents = function( field, $datetime ){
        
        $datetime
            .find( '.date' )
            .click( 
            function ( event ) {
                event.preventDefault();
                event.stopPropagation();
                updateCalendarValue( field, $datetime, $( this ) );
            }
        );
    };

    var addHours = function( event, $datetime, params, valueToAdd ){

        var $hours = get$hours( $datetime );
        var currentValue = parseInt( $hours.text() );
        var maxHourPlus1 = 1 + params.field.customOptions.maxHour;
        
        // Get the new value
        currentValue += valueToAdd;
        while ( currentValue < 0 ){
            currentValue += maxHourPlus1;
        }
        if ( currentValue >= maxHourPlus1 ){
            currentValue -= maxHourPlus1;
        }
        
        // Update value
        $hours.text(
            formatTimeNumber( currentValue, params.field.customOptions.maxHour ) );
        
        // Save value if inline
        if ( params.field.customOptions.inline ){
            save( $datetime, params.field, false );
        }
    };
    
    var addHoursInterval = function( event, $datetime, params, valueToAdd, delay ){
        
        clearInterval( currentTimer );
        addHours( event, $datetime, params, valueToAdd );
        
        currentTimer = setInterval( 
            function(){
                addHours( event, $datetime, params, valueToAdd );
            }, 
            delay );
    };
    
    var addMinutesInterval = function( event, $datetime, params, valueToAdd, delay ){
        
        clearInterval( currentTimer );
        addMinutes( event, $datetime, params, valueToAdd );
        
        currentTimer = setInterval( 
            function(){
                addMinutes( event, $datetime, params, valueToAdd );
            }, 
            delay );
    };
    
    var addMinutes = function( event, $datetime, params, valueToAdd ){

        var $minutes = get$minutes( $datetime );
        var currentValue = parseInt( $minutes.text() );
        
        // Get the new value
        currentValue += valueToAdd;
        if ( currentValue < 0 ){
            currentValue += 60;
            addHours( event, $datetime, params, -1 );
        }
        if ( currentValue >= 60 ){
            currentValue -= 60;
            addHours( event, $datetime, params, 1 );
        }
        
        // Update value
        $minutes.text( 
            formatTimeNumber( currentValue, 59 ) );
        
        // Save value if inline
        if ( params.field.customOptions.inline ){
            save( $datetime, params.field, false );
        }
    };
    
    var get$timePicker = function( $datetime ){
        return $datetime.find( '.timepicker' );
    };
    var get$hours = function( $datetime ){
        return get$hoursByTimePicker( get$timePicker( $datetime ) );
    };
    var get$hoursByTimePicker = function( $timePicker ){
        return $timePicker.find( '.hours' );
    };
    var get$minutes = function( $datetime ){
        return get$minutesByTimePicker( get$timePicker( $datetime ) );
    };
    var get$minutesByTimePicker = function( $timePicker ){
        return $timePicker.find( '.minutes' );
    };
    
    var updateCalendarValue = function( field, $datetime, $cell ){

        $datetime.find( '.' + selectedDateClass ).removeClass( selectedDateClass );
        $cell.addClass( selectedDateClass );
        
        if ( field.customOptions.inline ){
            save( $datetime, field, false );
        }
    };
    
    var get$selectedCell = function( $datetime ){
        return $datetime.find( '.' + selectedDateClass );
    };
    
    var buildDatetimeInstance = function( field, $datetime ){
        
        var processDate = false;
        var processTime = false;

        switch( field.type ) {
            case 'date':
                processDate = true;
                break;
            case 'datetime':
                processDate = true;
                processTime = true;
                break;
            case 'time':
                processTime = true;
                break;
            default:
                throw 'Unknown type in DatetimeFieldManager: ' + field.type;
        }

        // Get items from datatime picker
        var day = 0;
        var month = 0;
        var year = 0;
        var hours = 0;
        var minutes = 0;

        if ( processDate ){

            var $selectedDate = get$selectedCell( $datetime );
            if ( ! $selectedDate ){
                alert( 'No selected items!' );
            } else {
                day = $selectedDate.attr( 'data-date' );
                month = $selectedDate.attr( 'data-month' );
                year = $selectedDate.attr( 'data-year' );
            }
        }
        if ( processTime ){
            hours = parseInt( get$hours( $datetime ).text() );
            minutes = parseInt( get$minutes( $datetime ).text() );
        }

        return new Date( year, month, day, hours, minutes );
    };
    
    var formatToClient = function( field, dateInstance ){
        
        return dateInstance?
            dateFormatter.formatDate( 
                dateInstance, 
                getI18nFormat( field ) ):
            '';
    };
    
    var buildDatetimeValue = function( field, $datetime ){
        
        var datatimeInstance = buildDatetimeInstance( field, $datetime );

        return formatToClient( field, datatimeInstance );
    };
    
    var get$picker = function( $datetime ){
        return $datetime.find( '.datetime' );
    };
    
    var get$input = function( field, $datetime ){
        return $datetime.find( "[name='" + field.name + "']" );
    };
    
    var save = function( $datetime, field, hide ){
        
        // Build client values
        var value = undefined;
        switch( field.type ) {
            case 'datetime':
            case 'date':
                value = buildDatetimeValue( field, $datetime );
                break;
            case 'time':
                value = buildTimeValue( field, $datetime );
                break;
            default:
                throw 'Unknown type in DatetimeFieldManager: ' + field.type;
        }
        
        // Set values and trigger event
        var $input = get$input( field, $datetime );
        $input.val( value )
            .attr( pickerValueAttr, value )
            .trigger( 'change' );
        
        if ( hide ){
            get$picker( $datetime ).hide();
        }
    };

    var buildTimeValue = function( field, $datetime ){

        var $timePicker = get$timePicker( $datetime );
        var $hours = get$hoursByTimePicker( $timePicker );
        var $minutes = get$minutesByTimePicker( $timePicker );
        
        return buildTimeString( $hours.text(), $minutes.text() );
    };
    
    var buildTimeString = function( hours, minutes ){
        return '' + hours + ':' + minutes;
    };
    
    var cancel = function( event, $datetime, params ){
        get$picker( $datetime ).hide();
    };
    
    var show = function( event, $datetime, params ){
        get$picker( $datetime ).show();
    };
    
    var toggle = function( event, $datetime, params ){
        
        var $picker = get$picker( $datetime );
        
        // If the picker is not visible update it if needed
        if ( ! $picker.is( ":visible" ) ){
            var $input = get$input( params.field, $datetime );
            var currentValue = $input.val();
            var pickerValue = $input.attr( pickerValueAttr );

            if ( pickerValue !== currentValue ){
                //alert( 'currentValue: ' + currentValue + '\npickerValue: ' + pickerValue );
                updateDatetime( params.field, currentValue, $datetime );
                $input.attr( pickerValueAttr, currentValue );
            }
        }
        
        $picker.toggle();
    };
    
    var updateDatetime = function( field, value, $datetime ){
        
        var date = false;
        var time = false;

        switch( field.type ) {
            case 'date':
                date = true;
                break;
            case 'datetime':
                date = true;
                time = true;
                break;
            case 'time':
                time = true;
                break;
            default:
                throw 'Unknown type in DatetimeFieldManager: ' + field.type;
        }
        
        if ( date ){
            var selectedDate = 
                value? 
                dateFormatter.parseDate( 
                    value, 
                    getI18nFormat( field ) ): 
                undefined;
            //var referenceDate = selectedDate? selectedDate: new Date();
            var referenceDate = getReferenceDate( selectedDate );
            updateDatePicker( field, referenceDate, selectedDate, $datetime );         
        }
        
        if ( time ){
            var timeObject = 
                field.type == 'time'? 
                buildTimeObjectFromString( field, value ):
                buildTimeObjectFromDateInstance( field, selectedDate );
            updateTime( $datetime, timeObject );
        }
    };
    
    return {
        id: 'datetimeFieldManager',
        addToDictionary: true,
        getValue: getValue,
        setValueToForm: setValueToForm,
        afterProcessTemplateForField: afterProcessTemplateForField,
        getTemplate: getTemplate,
        getValueFromForm: getValueFromForm,
        getValueFromRecord: getValueFromRecord,
        getDateInfo: getDateInfo,
        formatToClient: formatToClient,
        getTimeInfo: getTimeInfo,
        filterValue: filterValue,
        getDateTimeInfo: getDateTimeInfo,
        getValueFromString: getValueFromString,
        buildTimeObjectFromString: buildTimeObjectFromString
    };
}();

DatetimeFieldManager.types = [ 'date', 'datetime', 'time' ];

module.exports = DatetimeFieldManager;