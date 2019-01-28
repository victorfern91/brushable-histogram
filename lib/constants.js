"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PADDING = exports.MIN_TOTAL_HEIGHT = exports.DENSITY_CHART_HEIGHT_PX = exports.MIN_ZOOM_VALUE = exports.BAR_TOOLTIP_ARROW_HEIGHT = exports.BARS_TICK_RATIO = exports.BUTTON_PADDING = exports.Y_AXIS_PADDING = exports.X_AXIS_PADDING = exports.X_AXIS_HEIGHT = void 0;

/**
 * contants
 *
 * Contains contants used for rendering.
 *
 * @author Beatriz Malveiro Jorge (beatriz.jorge@feedzai.com)
 * @author Victor Fernandes (victor.fernandes@feedzai.com)
 * @author Luis Cardoso (luis.cardoso@feedzai.com)
 */
// We reserve some space for the x adn y axis ticks.
const X_AXIS_HEIGHT = 18;
exports.X_AXIS_HEIGHT = X_AXIS_HEIGHT;
const X_AXIS_PADDING = .02;
exports.X_AXIS_PADDING = X_AXIS_PADDING;
const Y_AXIS_PADDING = 3;
exports.Y_AXIS_PADDING = Y_AXIS_PADDING;
const BUTTON_PADDING = 20; // We place as many ticks as a third of the number of bars, enough to give context and not overlap.

exports.BUTTON_PADDING = BUTTON_PADDING;
const BARS_TICK_RATIO = 3; // Magical value so that the tooltip is positioned correctly vertically

exports.BARS_TICK_RATIO = BARS_TICK_RATIO;
const BAR_TOOLTIP_ARROW_HEIGHT = -10;
exports.BAR_TOOLTIP_ARROW_HEIGHT = BAR_TOOLTIP_ARROW_HEIGHT;
const MIN_ZOOM_VALUE = 1; // The density chart has a fixed height

exports.MIN_ZOOM_VALUE = MIN_ZOOM_VALUE;
const DENSITY_CHART_HEIGHT_PX = 20; // The minimum total height of the chart

exports.DENSITY_CHART_HEIGHT_PX = DENSITY_CHART_HEIGHT_PX;
const MIN_TOTAL_HEIGHT = 100; // An internal magic value used to align things horizontally

exports.MIN_TOTAL_HEIGHT = MIN_TOTAL_HEIGHT;
const PADDING = 10;
exports.PADDING = PADDING;