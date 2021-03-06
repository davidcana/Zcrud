/*!
 * @copyright Copyright &copy; Kartik Visweswaran, Krajee.com, 2014 - 2016
 * @version 1.3.4
 *
 * Date formatter utility library that allows formatting date/time variables or Date objects using PHP DateTime format.
 * @see http://php.net/manual/en/function.date.php
 *
 * For more JQuery plugins visit http://plugins.krajee.com
 * For more Yii related demos visit http://demos.krajee.com
 */
"use strict";
var DateFormatter = function (options) {
    var DAY = 1000 * 60 * 60 * 24;
    var HOUR = 3600;
	/*
    var _lpad = function (value, length, char) {
        var chr = char || '0', val = value.toString();
        return val.length < length ? _lpad(chr + val, length) : val;
    };*/

    var _compare = function (str1, str2) {
        return typeof(str1) === 'string' && typeof(str2) === 'string' && str1.toLowerCase() === str2.toLowerCase();
    };
    var _extend = function (out) {
        var i, obj;
        out = out || {};
        for (i = 1; i < arguments.length; i++) {
            obj = arguments[i];
            if (!obj) {
                continue;
            }
            for (var key in obj) {
                if (obj.hasOwnProperty(key)) {
                    if (typeof obj[key] === 'object') {
                        _extend(out[key], obj[key]);
                    } else {
                        out[key] = obj[key];
                    }
                }
            }
        }
        return out;
    };
    var _indexOf = function (val, arr) {
        for (var i = 0; i < arr.length; i++) {
            if (arr[i].toLowerCase() === val.toLowerCase()) {
                return i;
            }
        }
        return -1;
    };
    var defaultSettings = {
        dateSettings: {
            days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
            daysShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
            months: [
                'January', 'February', 'March', 'April', 'May', 'June', 'July',
                'August', 'September', 'October', 'November', 'December'
            ],
            monthsShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            meridiem: ['AM', 'PM'],
            ordinal: function (number) {
                var n = number % 10, suffixes = {1: 'st', 2: 'nd', 3: 'rd'};
                return Math.floor(number % 100 / 10) === 1 || !suffixes[n] ? 'th' : suffixes[n];
            }
        },
        separators: /[ \-+\/\.T:@]/g,
        validParts: /[dDjlNSwzWFmMntLoYyaABgGhHisueTIOPZcrU]/g,
        intParts: /[djwNzmnyYhHgGis]/g,
        tzParts: /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g,
        tzClip: /[^-+\dA-Z]/g
    };

    //var DateFormatter = function (options) {
        var self = this, config = _extend(defaultSettings, options);
        self.dateSettings = config.dateSettings;
        self.separators = config.separators;
        self.validParts = config.validParts;
        self.intParts = config.intParts;
        self.tzParts = config.tzParts;
        self.tzClip = config.tzClip;
    //};


};

DateFormatter.prototype = {
    constructor: DateFormatter,
	
    _lpad : function (value, length, char) {
        var chr = char || '0', val = value.toString();
        return val.length < length ? this._lpad(chr + val, length) : val;
    },

    getMonth: function (val) {
        var self = this, i;
        i = this._indexOf(val, self.dateSettings.monthsShort) + 1;
        if (i === 0) {
            i = this._indexOf(val, self.dateSettings.months) + 1;
        }
        return i;
    },
    parseDate: function (vDate, vFormat) {
        var self = this, vFormatParts, vDateParts, i, vDateFlag = false, vTimeFlag = false, vDatePart, iDatePart,
            vSettings = self.dateSettings, vMonth, vMeriIndex, vMeriOffset, len, mer,
            out = {date: null, year: null, month: null, day: null, hour: 0, min: 0, sec: 0};
        if (!vDate) {
            return null;
        }
        if (vDate instanceof Date) {
            return vDate;
        }
        if (vFormat === 'U') {
            i = parseInt(vDate);
            return i ? new Date(i * 1000) : vDate;
        }
        switch (typeof vDate) {
            case 'number':
                return new Date(vDate);
            case 'string':
                break;
            default:
                return null;
        }
        vFormatParts = vFormat.match(self.validParts);
        if (!vFormatParts || vFormatParts.length === 0) {
            throw new Error("Invalid date format definition.");
        }
        vDateParts = vDate.replace(self.separators, '\0').split('\0');
        for (i = 0; i < vDateParts.length; i++) {
            vDatePart = vDateParts[i];
            iDatePart = parseInt(vDatePart);
            switch (vFormatParts[i]) {
                case 'y':
                case 'Y':
                    if (iDatePart) {
                        len = vDatePart.length;
                        out.year = len === 2 ? parseInt((iDatePart < 70 ? '20' : '19') + vDatePart) : iDatePart;
                    } else {
                        return null;
                    }
                    vDateFlag = true;
                    break;
                case 'm':
                case 'n':
                case 'M':
                case 'F':
                    if (isNaN(iDatePart)) {
                        vMonth = self.getMonth(vDatePart);
                        if (vMonth > 0) {
                            out.month = vMonth;
                        } else {
                            return null;
                        }
                    } else {
                        if (iDatePart >= 1 && iDatePart <= 12) {
                            out.month = iDatePart;
                        } else {
                            return null;
                        }
                    }
                    vDateFlag = true;
                    break;
                case 'd':
                case 'j':
                    if (iDatePart >= 1 && iDatePart <= 31) {
                        out.day = iDatePart;
                    } else {
                        return null;
                    }
                    vDateFlag = true;
                    break;
                case 'g':
                case 'h':
                    vMeriIndex = (vFormatParts.indexOf('a') > -1) ? vFormatParts.indexOf('a') :
                        (vFormatParts.indexOf('A') > -1) ? vFormatParts.indexOf('A') : -1;
                    mer = vDateParts[vMeriIndex];
                    if (vMeriIndex > -1) {
                        vMeriOffset = this._compare(mer, vSettings.meridiem[0]) ? 0 :
                            (this._compare(mer, vSettings.meridiem[1]) ? 12 : -1);
                        if (iDatePart >= 1 && iDatePart <= 12 && vMeriOffset > -1) {
                            out.hour = iDatePart + vMeriOffset - 1;
                        } else if (iDatePart >= 0 && iDatePart <= 23) {
                            out.hour = iDatePart;
                        }
                    } else {
                        if (iDatePart >= 0 && iDatePart <= 23) {
                            out.hour = iDatePart;
                        } else {
                            return null;
                        }
                    }
                    vTimeFlag = true;
                    break;
                case 'G':
                case 'H':
                    if (iDatePart >= 0 && iDatePart <= 23) {
                        out.hour = iDatePart;
                    } else {
                        return null;
                    }
                    vTimeFlag = true;
                    break;
                case 'i':
                    if (iDatePart >= 0 && iDatePart <= 59) {
                        out.min = iDatePart;
                    } else {
                        return null;
                    }
                    vTimeFlag = true;
                    break;
                case 's':
                    if (iDatePart >= 0 && iDatePart <= 59) {
                        out.sec = iDatePart;
                    } else {
                        return null;
                    }
                    vTimeFlag = true;
                    break;
            }
        }
        if (vDateFlag === true && out.year && out.month && out.day) {
            out.date = new Date(out.year, out.month - 1, out.day, out.hour, out.min, out.sec, 0);
        } else {
            if (vTimeFlag !== true) {
                return null;
            }
            out.date = new Date(0, 0, 0, out.hour, out.min, out.sec, 0);
        }
        return out.date;
    },
    guessDate: function (vDateStr, vFormat) {
        if (typeof vDateStr !== 'string') {
            return vDateStr;
        }
        var self = this, vParts = vDateStr.replace(self.separators, '\0').split('\0'), vPattern = /^[djmn]/g, len,
            vFormatParts = vFormat.match(self.validParts), vDate = new Date(), vDigit = 0, vYear, i, n, iPart, iSec;

        if (!vPattern.test(vFormatParts[0])) {
            return vDateStr;
        }

        for (i = 0; i < vParts.length; i++) {
            vDigit = 2;
            iPart = vParts[i];
            iSec = parseInt(iPart.substr(0, 2));
            if (isNaN(iSec)) {
                return null;
            }
            switch (i) {
                case 0:
                    if (vFormatParts[0] === 'm' || vFormatParts[0] === 'n') {
                        vDate.setMonth(iSec - 1);
                    } else {
                        vDate.setDate(iSec);
                    }
                    break;
                case 1:
                    if (vFormatParts[0] === 'm' || vFormatParts[0] === 'n') {
                        vDate.setDate(iSec);
                    } else {
                        vDate.setMonth(iSec - 1);
                    }
                    break;
                case 2:
                    vYear = vDate.getFullYear();
                    len = iPart.length;
                    vDigit = len < 4 ? len : 4;
                    vYear = parseInt(len < 4 ? vYear.toString().substr(0, 4 - len) + iPart : iPart.substr(0, 4));
                    if (!vYear) {
                        return null;
                    }
                    vDate.setFullYear(vYear);
                    break;
                case 3:
                    vDate.setHours(iSec);
                    break;
                case 4:
                    vDate.setMinutes(iSec);
                    break;
                case 5:
                    vDate.setSeconds(iSec);
                    break;
            }
            n = iPart.substr(vDigit);
            if (n.length > 0) {
                vParts.splice(i + 1, 0, n);
            }
        }
        return vDate;
    },
    parseFormat: function (vChar, vDate) {
        var self = this, vSettings = self.dateSettings, fmt, backslash = /\\?(.?)/gi, doFormat = function (t, s) {
            return fmt[t] ? fmt[t]() : s;
        };
        fmt = {
            /////////
            // DAY //
            /////////
            /**
             * Day of month with leading 0: `01..31`
             * @return {string}
             */
            d: function () {
                return self._lpad(fmt.j(), 2);
            },
            /**
             * Shorthand day name: `Mon...Sun`
             * @return {string}
             */
            D: function () {
                return vSettings.daysShort[fmt.w()];
            },
            /**
             * Day of month: `1..31`
             * @return {number}
             */
            j: function () {
                return vDate.getDate();
            },
            /**
             * Full day name: `Monday...Sunday`
             * @return {number}
             */
            l: function () {
                return vSettings.days[fmt.w()];
            },
            /**
             * ISO-8601 day of week: `1[Mon]..7[Sun]`
             * @return {number}
             */
            N: function () {
                return fmt.w() || 7;
            },
            /**
             * Day of week: `0[Sun]..6[Sat]`
             * @return {number}
             */
            w: function () {
                return vDate.getDay();
            },
            /**
             * Day of year: `0..365`
             * @return {number}
             */
            z: function () {
                var a = new Date(fmt.Y(), fmt.n() - 1, fmt.j()), b = new Date(fmt.Y(), 0, 1);
                return Math.round((a - b) / DAY);
            },

            //////////
            // WEEK //
            //////////
            /**
             * ISO-8601 week number
             * @return {number}
             */
            W: function () {
                var a = new Date(fmt.Y(), fmt.n() - 1, fmt.j() - fmt.N() + 3), b = new Date(a.getFullYear(), 0, 4);
                return self._lpad(1 + Math.round((a - b) / DAY / 7), 2);
            },

            ///////////
            // MONTH //
            ///////////
            /**
             * Full month name: `January...December`
             * @return {string}
             */
            F: function () {
                return vSettings.months[vDate.getMonth()];
            },
            /**
             * Month w/leading 0: `01..12`
             * @return {string}
             */
            m: function () {
                return self._lpad(fmt.n(), 2);
            },
            /**
             * Shorthand month name; `Jan...Dec`
             * @return {string}
             */
            M: function () {
                return vSettings.monthsShort[vDate.getMonth()];
            },
            /**
             * Month: `1...12`
             * @return {number}
             */
            n: function () {
                return vDate.getMonth() + 1;
            },
            /**
             * Days in month: `28...31`
             * @return {number}
             */
            t: function () {
                return (new Date(fmt.Y(), fmt.n(), 0)).getDate();
            },

            //////////
            // YEAR //
            //////////
            /**
             * Is leap year? `0 or 1`
             * @return {number}
             */
            L: function () {
                var Y = fmt.Y();
                return (Y % 4 === 0 && Y % 100 !== 0 || Y % 400 === 0) ? 1 : 0;
            },
            /**
             * ISO-8601 year
             * @return {number}
             */
            o: function () {
                var n = fmt.n(), W = fmt.W(), Y = fmt.Y();
                return Y + (n === 12 && W < 9 ? 1 : n === 1 && W > 9 ? -1 : 0);
            },
            /**
             * Full year: `e.g. 1980...2010`
             * @return {number}
             */
            Y: function () {
                return vDate.getFullYear();
            },
            /**
             * Last two digits of year: `00...99`
             * @return {string}
             */
            y: function () {
                return fmt.Y().toString().slice(-2);
            },

            //////////
            // TIME //
            //////////
            /**
             * Meridian lower: `am or pm`
             * @return {string}
             */
            a: function () {
                return fmt.A().toLowerCase();
            },
            /**
             * Meridian upper: `AM or PM`
             * @return {string}
             */
            A: function () {
                var n = fmt.G() < 12 ? 0 : 1;
                return vSettings.meridiem[n];
            },
            /**
             * Swatch Internet time: `000..999`
             * @return {string}
             */
            B: function () {
                var H = vDate.getUTCHours() * HOUR, i = vDate.getUTCMinutes() * 60, s = vDate.getUTCSeconds();
                return self._lpad(Math.floor((H + i + s + HOUR) / 86.4) % 1000, 3);
            },
            /**
             * 12-Hours: `1..12`
             * @return {number}
             */
            g: function () {
                return fmt.G() % 12 || 12;
            },
            /**
             * 24-Hours: `0..23`
             * @return {number}
             */
            G: function () {
                return vDate.getHours();
            },
            /**
             * 12-Hours with leading 0: `01..12`
             * @return {string}
             */
            h: function () {
                return self._lpad(fmt.g(), 2);
            },
            /**
             * 24-Hours w/leading 0: `00..23`
             * @return {string}
             */
            H: function () {
                return self._lpad(fmt.G(), 2);
            },
            /**
             * Minutes w/leading 0: `00..59`
             * @return {string}
             */
            i: function () {
                return self._lpad(vDate.getMinutes(), 2);
            },
            /**
             * Seconds w/leading 0: `00..59`
             * @return {string}
             */
            s: function () {
                return self._lpad(vDate.getSeconds(), 2);
            },
            /**
             * Microseconds: `000000-999000`
             * @return {string}
             */
            u: function () {
                return self._lpad(vDate.getMilliseconds() * 1000, 6);
            },

            //////////////
            // TIMEZONE //
            //////////////
            /**
             * Timezone identifier: `e.g. Atlantic/Azores, ...`
             * @return {string}
             */
            e: function () {
                var str = /\((.*)\)/.exec(String(vDate))[1];
                return str || 'Coordinated Universal Time';
            },
            /**
             * DST observed? `0 or 1`
             * @return {number}
             */
            I: function () {
                var a = new Date(fmt.Y(), 0), c = Date.UTC(fmt.Y(), 0),
                    b = new Date(fmt.Y(), 6), d = Date.UTC(fmt.Y(), 6);
                return ((a - c) !== (b - d)) ? 1 : 0;
            },
            /**
             * Difference to GMT in hour format: `e.g. +0200`
             * @return {string}
             */
            O: function () {
                var tzo = vDate.getTimezoneOffset(), a = Math.abs(tzo);
                return (tzo > 0 ? '-' : '+') + this._lpad(Math.floor(a / 60) * 100 + a % 60, 4);
            },
            /**
             * Difference to GMT with colon: `e.g. +02:00`
             * @return {string}
             */
            P: function () {
                var O = fmt.O();
                return (O.substr(0, 3) + ':' + O.substr(3, 2));
            },
            /**
             * Timezone abbreviation: `e.g. EST, MDT, ...`
             * @return {string}
             */
            T: function () {
                var str = (String(vDate).match(self.tzParts) || [""]).pop().replace(self.tzClip, "");
                return str || 'UTC';
            },
            /**
             * Timezone offset in seconds: `-43200...50400`
             * @return {number}
             */
            Z: function () {
                return -vDate.getTimezoneOffset() * 60;
            },

            ////////////////////
            // FULL DATE TIME //
            ////////////////////
            /**
             * ISO-8601 date
             * @return {string}
             */
            c: function () {
                return 'Y-m-d\\TH:i:sP'.replace(backslash, doFormat);
            },
            /**
             * RFC 2822 date
             * @return {string}
             */
            r: function () {
                return 'D, d M Y H:i:s O'.replace(backslash, doFormat);
            },
            /**
             * Seconds since UNIX epoch
             * @return {number}
             */
            U: function () {
                return vDate.getTime() / 1000 || 0;
            }
        };
        return doFormat(vChar, vChar);
    },
    formatDate: function (vDate, vFormat) {
        var self = this, i, n, len, str, vChar, vDateStr = '', BACKSLASH = '\\';
        if (typeof vDate === 'string') {
            vDate = self.parseDate(vDate, vFormat);
            if (!vDate) {
                return null;
            }
        }
        if (vDate instanceof Date) {
            len = vFormat.length;
            for (i = 0; i < len; i++) {
                vChar = vFormat.charAt(i);
                if (vChar === 'S' || vChar === BACKSLASH) {
                    continue;
                }
                if (i > 0 && vFormat.charAt(i - 1) === BACKSLASH) {
                    vDateStr += vChar;
                    continue;
                }
                str = self.parseFormat(vChar, vDate);
                if (i !== (len - 1) && self.intParts.test(vChar) && vFormat.charAt(i + 1) === 'S') {
                    n = parseInt(str) || 0;
                    str += self.dateSettings.ordinal(n);
                }
                vDateStr += str;
            }
            return vDateStr;
        }
        return '';
    }
};

module.exports = DateFormatter;
