"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _objectSpread2 = _interopRequireDefault(require("@babel/runtime/helpers/objectSpread"));

var _d3Array = require("d3-array");

/**
 * histogramBinCalculator
 *
 * This module contains the histogram bin calculation logic.
 *
 * @author Luis Cardoso (luis.cardoso@feedzai.com)
 */
var _default = (_ref) => {
  let xAccessor = _ref.xAccessor,
      yAccessor = _ref.yAccessor,
      histogramChartXScale = _ref.histogramChartXScale,
      defaultBarCount = _ref.defaultBarCount,
      data = _ref.data;
  // Setting the histogram function/converter
  const histogram = (0, _d3Array.histogram)().value(xAccessor).domain(histogramChartXScale.domain()) // using the x-axis domain
  .thresholds(histogramChartXScale.ticks(defaultBarCount)); // Calculating the time histogram bins

  return histogram(data).map(bar => {
    const yValue = bar.reduce((sum, curr) => sum + yAccessor(curr), 0);
    return (0, _objectSpread2.default)({}, bar, {
      yValue
    });
  });
};

exports.default = _default;