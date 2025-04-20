/*
    Datetime class
*/
"use strict";

var Field = require( './field.js' );
var context = require( '../context.js' );
//var $ = require( 'zzdom' );
var zzDOM = require( '../../../lib/zzDOM-closures-full.js' );
var $ = zzDOM.zz;
var zpt = require( 'zpt' );
var DateFormatter = require( '../../../lib/php-date-formatter.js' );

var Datetime = function( properties ) {
    Field.call( this, properties );
    
    this.dictionary = undefined;
    this.currentTimer = undefined;
};

Datetime.prototype = new Field();
Datetime.prototype.constructor = Datetime;

Datetime.prototype.selectedDateClass = 'current';
Datetime.prototype.pickerValueAttr = 'data-picker-value';
Datetime.prototype.weekDays = [ 
    'Sun', 
    'Mon', 
    'Tue', 
    'Wed', 
    'Thu', 
    'Fri', 
    'Sat'
];
Datetime.prototype.monthNames = [ 
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
Datetime.prototype.weekInitDone = false;
Datetime.prototype.dateFormatter = new DateFormatter();

Datetime.prototype.filterValue = function( record ){
    return this.getValueFromString( record[ this.id ]);
};

Datetime.prototype.setValueToForm = function( value, $this ){
    
    switch( this.type ) {
        case 'datetime':
            var manageTime = true;
        case 'date':
            this.setValueToFormForDatetime( value, $this, manageTime );
            this.throwEventsForSetValueToForm( $this );
            return;
        case 'time':
            this.setValueToFormForTime( value, $this );
            this.throwEventsForSetValueToForm( $this );
            return;
    }

    throw 'Unknown type in Datetime: ' + this.type;
};

Datetime.prototype.setValueToFormForTime = function( _value, $this ){

    // Set value to null instead of undefined so zzDOM sets the value properly
    const value = _value === undefined? null: _value;

    $this
        .val( value )
        .attr( this.pickerValueAttr, value );

    if ( this.inline ){
        var $datetime = this.get$datetime( 
            $this.parents( '.zcrud-data-entity' ).first() );
        var timeObject = this.buildTimeObjectFromString( value );
        this.updateTime( $datetime, timeObject );
    }
};

Datetime.prototype.setValueToFormForDatetime = function( value, $this, manageTime ){
    
    var formattedValue = this.formatToClient( value );
    $this
        .val( formattedValue || value )  // Use string value if formattedValue is not a valid date
        .attr( this.pickerValueAttr, formattedValue );

    if ( this.inline ){
        var $datetime = this.get$datetime( $this.parents( '.zcrud-data-entity' ).first() );

        // Update dictionary
        this.dictionary.field = this;
        this.dictionary.value = value;

        this.goToDate( 
            value,
            $datetime, 
            this.dictionary
        );

        if ( manageTime ){
            var timeObject = this.buildTimeObjectFromHoursAndMinutes( 
                value? value.getHours(): 0, 
                value? value.getMinutes(): 0 );
            this.updateTime( $datetime, timeObject );
        }
    }
};

Datetime.prototype.updateTime = function( $datetime, timeObject ){
    
    var $timePicker = this.get$timePicker( $datetime );
    this.get$hoursByTimePicker( $timePicker ).text( 
        timeObject.hoursToShow );
    this.get$minutesByTimePicker( $timePicker ).text( 
        timeObject.minutesToShow );
};

Datetime.prototype.parseDate = function( datetimeString ){

    try {
        return this.dateFormatter.parseDate( datetimeString, this.getI18nFormat() );

    } catch ( error ) {
        return null;
    }
};

Datetime.prototype.getValueFromString = function( stringValue ){
    
    switch( this.type ) {
        case 'date':
        case 'datetime':
            return stringValue? this.parseDate( stringValue ): undefined;
        case 'time':
            return stringValue;
    }

    throw 'Unknown type in Datetime: ' + this.type;
};

Datetime.prototype.getValue = function( $this ){
    return this.getValueFromString( $this.val() );
};

Datetime.prototype.getValueForHistory = function( $this ){
    const value = this.getValue( $this );
    return value? value: $this.val();
};

Datetime.prototype.afterProcessTemplateForField = function( params, $selection ){
    
    if ( this.isReadOnly() ){
        return;
    }
    
    this.afterProcessTemplateForFieldInCreateOrUpdate( params, $selection );
};

Datetime.prototype.afterProcessTemplateForFieldInCreateOrUpdate = function( params, $selection ){
    
    var date = false;
    var time = false;

    switch ( this.type ) {
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
            throw 'Unknown type in Datetime: ' + this.type;
    }

    this.buildDictionaryFromParams( params );
    this.bindEvents( params, $selection, date, time );
};

Datetime.prototype.getTemplate = function(){
    return this.type + '@templates/fields/datetime.html';
};

Datetime.prototype.getI18nFormat = function(){
    
    var formatI18nId = this.type + 'Format';
    return context.translate( formatI18nId );
};
/*
Datetime.prototype.getI18nPattern = function(){
    
    var patternI18nId = this.type + 'Pattern';
    return context.translate( patternI18nId );
};
*/
Datetime.prototype.getValueFromForm = function( $selection ){
    
    return this.inline? 
           this.getValueFromFormForInline( $selection ): 
           this.getValueFromFormForNotInline( $selection );
};

Datetime.prototype.getValueFromFormForNotInline = function( $selection ){
    
    var datetimeString = $selection.find( "[name='" + this.name + "']").val();

    if ( ! datetimeString || datetimeString.length == 0 || this.type == 'time' ){
        return datetimeString;
    }

    return this.parseDate( datetimeString );
};

Datetime.prototype.getValueFromFormForInline = function( $selection ){
    
    return this.buildDatetimeInstance( 
                this.get$datetime( $selection ) );
};

Datetime.prototype.getValueFromRecord = function( record ){

    var value = record[ this.id ];
    if ( ! value || value.length == 0 ){
        return value;
    }

    switch( this.type ) {
        case 'date':
        case 'datetime':
            return new Date( value );
        case 'time':
            return value;
    }

    throw 'Unknown type in Datetime: ' + this.type;
};

Datetime.prototype.getViewValueFromRecord = function( record ){

    var value = record[ this.id ];
    if ( ! value || value.length == 0 ){
        return value;
    }

    switch( this.type ) {
        case 'date':
        case 'datetime':
            var dateInstance = new Date( value );
            return this.formatToClient( dateInstance );
        case 'time':
            return value;
    }

    throw 'Unknown type in Datetime: ' + this.type;
};

Datetime.prototype.getTimeInfo = function(  timeString ){
    return this.buildTimeObjectFromString( timeString );
};

Datetime.prototype.buildTimeObjectFromString = function( timeString ){
    
    var minutes = 0;
    var hours = 0;

    // Validate time
    var timeArray = timeString? timeString.split( ':' ): undefined;

    if ( timeArray
        && timeArray.length == 2 
        && ! isNaN( timeArray[0] ) && ! isNaN( timeArray[1] )
        && timeArray[0] >= 0 && timeArray[1] >= 0 
        && timeArray[0] <= this.maxHour && timeArray[1] <= 59 ){

        hours = timeArray[0];
        minutes = timeArray[1];
    }

    return this.buildTimeObjectFromHoursAndMinutes( hours, minutes );
};

Datetime.prototype.buildTimeObjectFromDateInstance = function( date ){
    
    var minutes = date? date.getMinutes(): 0;
    var hours = date? date.getHours(): 0;

    return this.buildTimeObjectFromHoursAndMinutes( hours, minutes );
};

Datetime.prototype.buildTimeObjectFromHoursAndMinutes = function( hours, minutes ){

    return {
        minutes: minutes,
        minutesToShow: this.formatTimeNumber( minutes, 59 ),
        hours: hours,
        hoursToShow: this.formatTimeNumber( hours, this.maxHour )
    };
};

Datetime.prototype.formatTimeNumber = function( number, maxNumber ) {
    
    var numberOfDigits = ( '' + maxNumber ).length;
    var string = '' + number;
    return string.length >= numberOfDigits?
        string: 
    new Array( numberOfDigits - string.length + 1 ).join( '0' ) + string;
};

Datetime.prototype.getDateInfo = function( selectedDate ){
    
    var referenceDate = this.getReferenceDate( selectedDate );
    return this.getDateInfoFromObject( referenceDate, selectedDate );
};

Datetime.prototype.getDateInfoFromObject = function( referenceDate, selectedDate ){
    
    return {
        years: this.buildYears( referenceDate ),
        months: this.buildMonths( referenceDate ),
        weekDays: this.getWeekDays(),
        daysInWeeks: this.buildDaysInWeeks( 
            referenceDate, 
            selectedDate,
            context.translate( 'dayOfWeekStart' ) )
    };
};

Datetime.prototype.getReferenceDate = function( selectedDate ){
    
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

Datetime.prototype.getDateTimeInfo = function( selectedDate ){
    
    var referenceDate = this.getReferenceDate( selectedDate );
    var timeString = this.buildTimeStringFromDate( referenceDate );

    return {
        dateInfo: this.getDateInfoFromObject( referenceDate, selectedDate ),
        timeInfo: this.getTimeInfo( timeString )
    };
};

Datetime.prototype.buildTimeStringFromDate = function( date ){
    return this.buildTimeString( date.getHours(), date.getMinutes() );
};

Datetime.prototype.getWeekDays = function(){
    
    if ( ! this.weekInitDone ){
        // Sort the list of days in a week
        var dayOfWeekStart = context.translate( 'dayOfWeekStart' );
        if ( dayOfWeekStart != 0 ){
            this.weekDays = this.weekDays.slice( dayOfWeekStart ).concat( 
                this.weekDays.slice( 0, dayOfWeekStart ) );
        }
        this.weekInitDone = true;
    }

    return this.weekDays;
};

Datetime.prototype.buildYears = function( referenceDate ){
    
    var currentYear = referenceDate.getFullYear();
    var minYear = this.minYear;
    var maxYear = this.maxYear;

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

Datetime.prototype.buildMonths = function( referenceDate ){
    
    var currentMonth = referenceDate.getMonth();
    var months = [];

    for ( var c = 0; c < 12; ++c ){
        months.push(
            {
                value: c,
                name: this.monthNames[ c ],
                current: currentMonth == c
            }
        );
    }

    return months;
};

Datetime.prototype.buildDaysInWeeks = function( referenceDate, selectedDate, dayOfWeekStart ){

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

Datetime.prototype.get$datePicker = function( event ){
    return $( event.target ).parents( '.datepicker' ).first();
    //return $( event.target ).closest( '.datepicker' );
};

Datetime.prototype.getSelectedDate = function( event, selectDay, $datePicker ){

    $datePicker = $datePicker || this.get$datePicker( event );

    var year = $datePicker.find( "[name='datepicker-year']" ).val();
    var month = $datePicker.find( "[name='datepicker-month']" ).val();
    var day = selectDay? 1: 1;

    return new Date( year, month, day, 0, 0, 0 );
};

Datetime.prototype.getSelectedYearAndMonthDate = function( event, $datePicker ){
    return this.getSelectedDate( event, undefined, $datePicker );
};

Datetime.prototype.goToPreviousMonth = function( event, $datetime, params ){
    
    var thisDate = this.getSelectedYearAndMonthDate( event );

    if ( thisDate.getMonth() == 0 ){
        thisDate.setFullYear( thisDate.getFullYear() - 1 );
        thisDate.setMonth( 11 );
    } else {
        thisDate.setMonth( thisDate.getMonth() - 1 );
    }

    this.goToDate( 
        thisDate, 
        $datetime, 
        this.buildDictionaryFromParams( params ) );
};

Datetime.prototype.goToNextMonth = function( event, $datetime, params ){
    
    var thisDate = this.getSelectedYearAndMonthDate( event );

    if ( thisDate.getMonth() == 11 ){
        thisDate.setFullYear( thisDate.getFullYear() + 1 );
        thisDate.setMonth( 0 );
    } else {
        thisDate.setMonth( thisDate.getMonth() + 1 );
    }

    this.goToDate( 
        thisDate, 
        $datetime, 
        this.buildDictionaryFromParams( params ) );
};

Datetime.prototype.goToPreviousYear = function( event, $datetime, params ){
    
    var thisDate = this.getSelectedYearAndMonthDate( event );
    thisDate.setFullYear( thisDate.getFullYear() - 1 );

    this.goToDate( 
        thisDate, 
        $datetime, 
        this.buildDictionaryFromParams( params ) );
};

Datetime.prototype.goToNextYear = function( event, $datetime, params ){
    
    var thisDate = this.getSelectedYearAndMonthDate( event );
    thisDate.setFullYear( thisDate.getFullYear() + 1 );

    this.goToDate( 
        thisDate, 
        $datetime, 
        this.buildDictionaryFromParams( params ) );
};

Datetime.prototype.update = function( event, $datetime, params ){
    
    var thisDate = this.getSelectedYearAndMonthDate( event );
    this.goToDate( 
        thisDate, 
        $datetime, 
        this.buildDictionaryFromParams( params ) );
};

Datetime.prototype.goToday = function( event, $datetime, params ){
    
    this.goToDate( 
        new Date(), 
        $datetime, 
        this.buildDictionaryFromParams( params ) );
};

Datetime.prototype.buildDictionaryFromParams = function( params ){
    
    //this.dictionary = utils.extend( params.dictionary );
    this.dictionary = {};
    this.dictionary.field = this;

    return this.dictionary;
};

Datetime.prototype.goToDate = function( referenceDate, $datetime, dictionary ){
    
    // Build selectedDate
    var selectedDate = dictionary.value? 
        new Date( dictionary.value ):
        undefined;

    // Update the date picker
    this.updateDatePicker( 
        referenceDate, 
        selectedDate, 
        $datetime );
};

Datetime.prototype.updateDatePicker = function( referenceDate, selectedDate, $datetime ){
    
    this.dictionary.dateInfo = this.getDateInfoFromObject( 
        referenceDate? referenceDate: this.getSelectedYearAndMonthDate( undefined, $datetime ), 
        selectedDate );

    // Refresh template
    zpt.run({
    //context.getZPTParser().run({
        root: $datetime.find( '.datepicker' )[ 0 ],
        dictionaryExtension: this.dictionary
        //notRemoveGeneratedTags: false
    });

    // Bind events
    this.bindDatePickerEvents( $datetime );
};

Datetime.prototype.get$datetime = function( $selection ){
    return $selection.find( '.zcrud-like-field-' + this.name );
};

Datetime.prototype.bindEvents = function( params, $selection, dateEvents, timeEvents ){
    
    var $datetime = this.get$datetime( $selection );
    this.bindCommonEvents( params, $selection, $datetime );

    if ( dateEvents ){
        this.bindDateEvents( params, $selection, $datetime );
    }

    if ( timeEvents ){
        this.bindTimeEvents( params, $selection, $datetime );
    }
};

Datetime.prototype.bindCommonEvents = function( params, $selection, $datetime ){
    
    var datetimeInstance = this;
    $datetime
        .find( '.save-button' )
        .on(
            'click',  
            function ( event ) {
                event.preventDefault();
                event.stopPropagation();
                datetimeInstance.save( $datetime, true );
            }
    );
    $datetime
        .find( '.cancel-button' )
        .on(
            'click',  
            function ( event ) {
                event.preventDefault();
                event.stopPropagation();
                datetimeInstance.cancel( event, $datetime, params );
            }
    );
    $datetime
        .find( '.toggle-picker' )
        .off( 'click' )
        .on(
            'click',  
            function ( event ) {
                event.preventDefault();
                event.stopPropagation();
                datetimeInstance.toggle( event, $datetime, params );
            }
    );
};

Datetime.prototype.bindTimeEvents = function( params, $selection, $datetime ){
    
    var datetimeInstance = this;
    var delay = this.timerDelay;
    var minutesStep = this.minutesStep;
    var hoursStep = 1;

    var mouseupFunction = function( event ){
        event.preventDefault();
        event.stopPropagation();
        clearInterval( datetimeInstance.currentTimer );
    };

    $datetime
        .find( '.prev-hour' )
        .on(
            'mousedown',
            function ( event ) {
                event.preventDefault();
                event.stopPropagation();
                datetimeInstance.addHoursInterval( event, $datetime, -hoursStep, delay );
            }
        ).on( 'mouseup', mouseupFunction );

    $datetime
        .find( '.prev-minute' )
        .on(
            'mousedown',
            function ( event ) {
                event.preventDefault();
                event.stopPropagation();
                datetimeInstance.addMinutesInterval( event, $datetime, -minutesStep, delay );
            }
        ).on( 'mouseup', mouseupFunction );

    $datetime
        .find( '.next-hour' )
        .on(
            'mousedown',
            function ( event ) {
                event.preventDefault();
                event.stopPropagation();
                datetimeInstance.addHoursInterval( event, $datetime, hoursStep, delay );
            }
        ).on( 'mouseup', mouseupFunction );

    $datetime
        .find( '.next-minute' )
        .on(
            'mousedown',
            function ( event ) {
                event.preventDefault();
                event.stopPropagation();
                datetimeInstance.addMinutesInterval( event, $datetime, minutesStep, delay );
            }
        ).on( 'mouseup', mouseupFunction );
};

Datetime.prototype.bindDateEvents = function( params, $selection, $datetime ){
    
    var datetimeInstance = this;
    $datetime
        .find( '.today-button' )
        .on(
            'click',
            function ( event ) {
                event.preventDefault();
                event.stopPropagation();
                datetimeInstance.goToday( event, $datetime, params );
            }
    );

    $datetime
        .find( '.prev-month' )
        .on(
            'click',
            function ( event ) {
                event.preventDefault();
                event.stopPropagation();
                datetimeInstance.goToPreviousMonth( event, $datetime, params );
            }
    );

    $datetime
        .find( '.next-month' )
        .on(
            'click',
            function ( event ) {
                event.preventDefault();
                event.stopPropagation();
                datetimeInstance.goToNextMonth( event, $datetime, params );
            }
    );

    $datetime
        .find( '.prev-year' )
        .on(
            'click',
            function ( event ) {
                event.preventDefault();
                event.stopPropagation();
                datetimeInstance.goToPreviousYear( event, $datetime, params );
            }
    );

    $datetime
        .find( '.next-year' )
        .on(
            'click',
            function ( event ) {
                event.preventDefault();
                event.stopPropagation();
                datetimeInstance.goToNextYear( event, $datetime, params );
            }
    );

    $datetime
        .find( "[name='datepicker-month'], [name='datepicker-year']" )
        .on(
            'change',
            function ( event ) {
                event.preventDefault();
                event.stopPropagation();
                datetimeInstance.update( event, $datetime, params );
            }
    );

    this.bindDatePickerEvents( $datetime );
};

Datetime.prototype.bindDatePickerEvents = function( $datetime ){
    
    var datetimeInstance = this;
    $datetime
        .find( '.date' )
        .on(
            'click',
            function ( event ) {
                event.preventDefault();
                event.stopPropagation();
                datetimeInstance.updateCalendarValue( $datetime, $( this ) );
            }
    );
};

Datetime.prototype.addHours = function( event, $datetime, valueToAdd ){
    
    var $hours = this.get$hours( $datetime );
    var currentValue = parseInt( $hours.text() );
    var maxHourPlus1 = 1 + this.maxHour;

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
        this.formatTimeNumber( currentValue, this.maxHour ) );

    // Save value if inline
    if ( this.inline ){
        this.save( $datetime, false );
    }
};

Datetime.prototype.addHoursInterval = function( event, $datetime, valueToAdd, delay ){
    
    var datetimeInstance = this;
    clearInterval( this.currentTimer );
    this.addHours( event, $datetime, valueToAdd );

    this.currentTimer = setInterval( 
        function(){
            datetimeInstance.addHours( event, $datetime, valueToAdd );
        }, 
        delay );
};

Datetime.prototype.addMinutesInterval = function( event, $datetime, valueToAdd, delay ){
    
    var datetimeInstance = this;
    clearInterval( this.currentTimer );
    this.addMinutes( event, $datetime, valueToAdd );

    this.currentTimer = setInterval( 
        function(){
            datetimeInstance.addMinutes( event, $datetime, valueToAdd );
        }, 
        delay );
};

Datetime.prototype.addMinutes = function( event, $datetime, valueToAdd ){
    
    var $minutes = this.get$minutes( $datetime );
    var currentValue = parseInt( $minutes.text() );

    // Get the new value
    currentValue += valueToAdd;
    if ( currentValue < 0 ){
        currentValue += 60;
        this.addHours( event, $datetime, -1 );
    }
    if ( currentValue >= 60 ){
        currentValue -= 60;
        this.addHours( event, $datetime, 1 );
    }

    // Update value
    $minutes.text( 
        this.formatTimeNumber( currentValue, 59 ) );

    // Save value if inline
    if ( this.inline ){
        this.save( $datetime, false );
    }
};

Datetime.prototype.get$timePicker = function( $datetime ){
    return $datetime.find( '.timepicker' );
};

Datetime.prototype.get$hours = function( $datetime ){
    return this.get$hoursByTimePicker( this.get$timePicker( $datetime ) );
};

Datetime.prototype.get$hoursByTimePicker = function( $timePicker ){
    return $timePicker.find( '.hours' );
};

Datetime.prototype.get$minutes = function( $datetime ){
    return this.get$minutesByTimePicker( this.get$timePicker( $datetime ) );
};

Datetime.prototype.get$minutesByTimePicker = function( $timePicker ){
    return $timePicker.find( '.minutes' );
};

Datetime.prototype.updateCalendarValue = function( $datetime, $cell ){
    
    $datetime.find( '.' + this.selectedDateClass ).removeClass( this.selectedDateClass );
    $cell.addClass( this.selectedDateClass );

    if ( this.inline ){
        this.save( $datetime, false );
    }
};

Datetime.prototype.get$selectedCell = function( $datetime ){
    return $datetime.find( '.' + this.selectedDateClass );
};

Datetime.prototype.buildDatetimeInstance = function( $datetime ){
    
    var processDate = false;
    var processTime = false;

    switch( this.type ) {
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
            throw 'Unknown type in Datetime: ' + this.type;
    }

    // Get items from datatime picker
    var day = 0;
    var month = 0;
    var year = 0;
    var hours = 0;
    var minutes = 0;

    if ( processDate ){
        var $selectedDate = this.get$selectedCell( $datetime );
        if ( ! $selectedDate.length ){
            context.showError(
                this.page.getOptions(),
                false,
                context.translate( 'noSelectedDate' )
            );
            return undefined;
        } else {
            day = $selectedDate.attr( 'data-date' );
            month = $selectedDate.attr( 'data-month' );
            year = $selectedDate.attr( 'data-year' );
        }
    }
    if ( processTime ){
        hours = parseInt( this.get$hours( $datetime ).text() );
        minutes = parseInt( this.get$minutes( $datetime ).text() );
    }

    return new Date( year, month, day, hours, minutes );
};

Datetime.prototype.formatToClient = function( dateInstance ){
    
    try {
        return dateInstance?
            this.dateFormatter.formatDate( dateInstance, this.getI18nFormat() ):
            '';
    } catch ( error ) {
        return '';
    }
};

Datetime.prototype.buildDatetimeValue = function( $datetime ){
    
    var datatimeInstance = this.buildDatetimeInstance( $datetime );
    return this.formatToClient( datatimeInstance );
};

Datetime.prototype.get$picker = function( $datetime ){
    return $datetime.find( '.datetime' );
};

Datetime.prototype.get$input = function( $datetime ){
    return $datetime.find( "[name='" + this.name + "']" );
};

Datetime.prototype.save = function( $datetime, hide ){
    
    // Build client values
    var value = undefined;
    switch( this.type ) {
        case 'datetime':
        case 'date':
            value = this.buildDatetimeValue( $datetime );
            break;
        case 'time':
            value = this.buildTimeValue( $datetime );
            break;
        default:
            throw 'Unknown type in Datetime: ' + this.type;
    }

    // Do nothing if the user did not select any date
    if ( ! value ){
        return;
    }

    // Set values and trigger event
    var $input = this.get$input( $datetime );
    $input.val( value )
        .attr( this.pickerValueAttr, value )
        .trigger( 'change' );

    if ( hide ){
        this.get$picker( $datetime ).hide();
    }
};

Datetime.prototype.buildTimeValue = function( $datetime ){
    
    var $timePicker = this.get$timePicker( $datetime );
    var $hours = this.get$hoursByTimePicker( $timePicker );
    var $minutes = this.get$minutesByTimePicker( $timePicker );

    return this.buildTimeString( $hours.text(), $minutes.text() );
};

Datetime.prototype.buildTimeString = function( hours, minutes ){
    return '' + hours + ':' + minutes;
};

Datetime.prototype.cancel = function( event, $datetime, params ){
    this.get$picker( $datetime ).hide();
};

Datetime.prototype.show = function( event, $datetime, params ){
    this.get$picker( $datetime ).show();
};

Datetime.prototype.toggle = function( event, $datetime, params ){
    
    var $picker = this.get$picker( $datetime );

    // If the picker is not visible update it if needed
    //if ( ! $picker.is( ":visible" ) ){
    if ( ! $picker.isVisible() ){
        var $input = this.get$input( $datetime );
        var currentValue = $input.val();
        var pickerValue = $input.attr( this.pickerValueAttr );

        if ( pickerValue !== currentValue ){
            this.updateDatetime( currentValue, $datetime );
            $input.attr( this.pickerValueAttr, currentValue );
        }
    }

    $picker.toggle();
};

Datetime.prototype.updateDatetime = function( value, $datetime ){
    
    var date = false;
    var time = false;

    switch( this.type ) {
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
            throw 'Unknown type in Datetime: ' + this.type;
    }

    if ( date ){
        var selectedDate = 
            value? 
            this.parseDate( value ): 
        undefined;
        var referenceDate = this.getReferenceDate( selectedDate );
        this.updateDatePicker( referenceDate, selectedDate, $datetime );         
    }

    if ( time ){
        var timeObject = this.type == 'time'? 
            this.buildTimeObjectFromString( value ):
            this.buildTimeObjectFromDateInstance( selectedDate );
        this.updateTime( $datetime, timeObject );
    }
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
/*
Datetime.validateDatetime = function( value, type ){
    //return !isNaN( new Date( value ) );
    const dateInstance = new Date( value );
    if ( ! isNaN( dateInstance ) ){
        return false;
    }
    const dateFormatter = new DateFormatter();
    
    var formatI18nId = type + 'Format';
    const i18nFormat = context.translate( formatI18nId );

    const dateString = dateFormatter.formatDate( dateInstance, i18nFormat );
};
*/

module.exports = Datetime;