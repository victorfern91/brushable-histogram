"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isObject = isObject;
exports.histogramDefaultYAxisFormatter = histogramDefaultYAxisFormatter;
exports.multiDateFormat = multiDateFormat;
exports.isHistogramDataEqual = isHistogramDataEqual;
exports.dateToTimestamp = dateToTimestamp;
exports.havePropsChanged = havePropsChanged;
exports.calculateChartsPositionsAndSizing = calculateChartsPositionsAndSizing;
exports.calculateChartSizesAndDomain = calculateChartSizesAndDomain;

var _objectSpread2 = _interopRequireDefault(require("@babel/runtime/helpers/objectSpread"));

var _d3TimeFormat = require("d3-time-format");

var _d3Time = require("d3-time");

var _d3Array = require("d3-array");

var _constants = require("./constants");

/**
 * utils
 *
 * Contains utility methods.
 *
 * @author Beatriz Malveiro Jorge (beatriz.jorge@feedzai.com)
 * @author Victor Fernandes (victor.fernandes@feedzai.com)
 * @author Luis Cardoso (luis.cardoso@feedzai.com)
 */

/**
 * Returns true if the given value is an Object.
 * @param {*} obj
 * @returns {boolean}
 */
function isObject(obj) {
  return Object(obj) === obj;
}
/**
 * The default histogram y axis formatter. Only returns integer values.
 * @param {number} value
 * @returns {String}
 */


function histogramDefaultYAxisFormatter(value) {
  if (value > 0 && Number.isInteger(value)) {
    return value;
  }

  return "";
}

const formatMillisecond = (0, _d3TimeFormat.timeFormat)(".%L"),
      formatSecond = (0, _d3TimeFormat.timeFormat)(":%S"),
      formatMinute = (0, _d3TimeFormat.timeFormat)("%I:%M"),
      formatHour = (0, _d3TimeFormat.timeFormat)("%I %p"),
      formatDay = (0, _d3TimeFormat.timeFormat)("%a %d"),
      formatWeek = (0, _d3TimeFormat.timeFormat)("%b %d"),
      formatMonth = (0, _d3TimeFormat.timeFormat)("%B"),
      formatYear = (0, _d3TimeFormat.timeFormat)("%Y");
/**
 * Formats a date. This is the histogram default x axis formatter.
 *
 * This code is adapted from the D3 documentation.
 *
 * @param {Date} date
 * @returns {string}
 */

function multiDateFormat(date) {
  let formatter;

  if ((0, _d3Time.timeSecond)(date) < date) {
    formatter = formatMillisecond;
  } else if ((0, _d3Time.timeMinute)(date) < date) {
    formatter = formatSecond;
  } else if ((0, _d3Time.timeHour)(date) < date) {
    formatter = formatMinute;
  } else if ((0, _d3Time.timeDay)(date) < date) {
    formatter = formatHour;
  } else if ((0, _d3Time.timeMonth)(date) < date) {
    if ((0, _d3Time.timeWeek)(date) < date) {
      formatter = formatDay;
    } else {
      formatter = formatWeek;
    }
  } else if ((0, _d3Time.timeYear)(date) < date) {
    formatter = formatMonth;
  } else {
    formatter = formatYear;
  }

  return formatter(date);
}
/**
 * Compares the x and y histogram data in two arrays and returns whenever they are the same.
 * @param {function} xAcessor The function that will return the x value.
 * @param {function} yAcessor The function that will return the y value.
 * @param {Array.<Object>} data1 The first data array.
 * @param {Array.<Object>} data2 The second data array.
 * @returns {boolean}
 */


function isHistogramDataEqual(xAcessor, yAcessor, data1, data2) {
  if (Array.isArray(data1) === false || Array.isArray(data2) === false) {
    return false;
  }

  if (data1.length !== data2.length) {
    return false;
  }

  for (let i = 0; i < data1.length; i++) {
    if (xAcessor(data1[i]) !== xAcessor(data2[i])) {
      return false;
    }

    if (yAcessor(data1[i]) !== yAcessor(data2[i])) {
      return false;
    }
  }

  return true;
}
/**
 * Converts a Date object to unix timestamp if the parameter is
 * indeed a date, if it's not then just return the value.
 * @param {Date|number} date
 * @returns {number}
 */


function dateToTimestamp(date) {
  return date instanceof Date ? date.getTime() : date;
}
/**
 * Compares the props with the given names in the two prop objects and
 * returns whenever they have the same value (shallow comparison).
 *
 * @param {Object} props
 * @param {Object} prevProps
 * @param {Array.<string>} propNames
 * @returns {boolean}
 */


function havePropsChanged(props, prevProps, propNames) {
  for (let i = 0; i < propNames.length; i++) {
    const propName = propNames[i];

    if (prevProps.hasOwnProperty(propName) && props[propName] !== prevProps[propName]) {
      return true;
    }
  }

  return false;
}
/**
 * Receives the size the component should have, the padding and the how much vertical space the
 * histogram and the density plots should take and calculates the charts sizes and positions
 *
 * @param {Object} props
 * @returns {Object}
 * @private
 */


function calculateChartsPositionsAndSizing(props) {
  const height = props.height,
        renderPlayButton = props.renderPlayButton,
        spaceBetweenCharts = props.spaceBetweenCharts,
        size = props.size;
  const width = size.width;
  let playButtonPadding = 0;

  if (renderPlayButton) {
    playButtonPadding = width > _constants.PADDING + _constants.PADDING ? _constants.BUTTON_PADDING : 0;
  }

  const histogramHeight = height - _constants.DENSITY_CHART_HEIGHT_PX - spaceBetweenCharts;
  return {
    histogramChartDimensions: {
      width: width - _constants.PADDING,
      height: histogramHeight,
      heightForBars: histogramHeight - _constants.X_AXIS_HEIGHT
    },
    densityChartDimensions: {
      width: width - _constants.PADDING * 4 - playButtonPadding,
      height: _constants.DENSITY_CHART_HEIGHT_PX
    }
  };
}
/**
 * Calculates the size of the histogram and density charts and the domain.
 * @param {Object} props
 * @param {Array.<Object>} previousData
 * @param {Object} previousBrushTimeDomain
 * @returns {Object}
 */


function calculateChartSizesAndDomain(props, previousData, previousBrushTimeDomain) {
  const _calculateChartsPosit = calculateChartsPositionsAndSizing(props),
        histogramChartDimensions = _calculateChartsPosit.histogramChartDimensions,
        densityChartDimensions = _calculateChartsPosit.densityChartDimensions;

  let nextState = {
    histogramChartDimensions,
    densityChartDimensions
  };

  if (props.data.length === 0) {
    const now = dateToTimestamp(Date.now());
    return (0, _objectSpread2.default)({}, nextState, {
      brushTimeDomain: {
        min: now,
        max: now
      },
      overallTimeDomain: {
        min: now,
        max: now
      }
    });
  }

  const hasDataChanged = !isHistogramDataEqual(props.xAccessor, props.yAccessor, props.data, previousData); // If the new information received is different we need to verify if there is any update in the max and min
  // values for the brush domain.

  if (hasDataChanged) {
    // We need to store the date so that we can compare it to new data comming from `props`
    // to see if we need to recalculate the domain
    nextState = (0, _objectSpread2.default)({}, nextState, {
      data: props.data
    });
    const min = (0, _d3Array.min)(props.data, props.xAccessor); // We're incrementing 1 millisecond in order avoid the last data point to have no width on the histogram

    const max = (0, _d3Array.max)(props.data, props.xAccessor) + 1; // If the brush domain changed we could

    if (min !== previousBrushTimeDomain.min || max !== previousBrushTimeDomain.max) {
      nextState = (0, _objectSpread2.default)({}, nextState, {
        brushTimeDomain: {
          min: dateToTimestamp(min),
          max: dateToTimestamp(max)
        },
        overallTimeDomain: {
          min: dateToTimestamp(min),
          max: dateToTimestamp(max)
        }
      });
    }
  }

  return nextState;
}