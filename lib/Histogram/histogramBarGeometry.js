"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.calculateDimensions = calculateDimensions;
exports.calculatePositionAndDimensions = calculatePositionAndDimensions;

/**
 * histogramBarGeometry
 *
 * This module contains the histogram bar position and dimension calculation.
 *
 * @author Luis Cardoso (luis.cardoso@feedzai.com)
 */

/**
  * Calculates the dimensions for the given `bar` given the scales and other parameters.
  * @returns {Object}
  */
function calculateDimensions(_ref) {
  let xScale = _ref.xScale,
      yScale = _ref.yScale,
      heightForBars = _ref.heightForBars,
      margin = _ref.margin,
      bar = _ref.bar;
  const width = xScale(bar.x1) - xScale(bar.x0) - margin;
  const height = heightForBars - yScale(bar.yValue);
  return {
    width,
    height
  };
}
/**
  * Calculates the position and dimensions for the given `bar` given the scales and other parameters.
  * @returns {Object}
  */


function calculatePositionAndDimensions(_ref2) {
  let xScale = _ref2.xScale,
      yScale = _ref2.yScale,
      heightForBars = _ref2.heightForBars,
      margin = _ref2.margin,
      bar = _ref2.bar;

  const _calculateDimensions = calculateDimensions({
    xScale,
    yScale,
    heightForBars,
    margin,
    bar
  }),
        width = _calculateDimensions.width,
        height = _calculateDimensions.height;

  const x = xScale(bar.x0) + margin / 2;
  const y = yScale(bar.yValue);
  return {
    width,
    height,
    x,
    y
  };
}