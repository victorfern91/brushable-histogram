"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getRenderContext = getRenderContext;
exports.clearCanvas = clearCanvas;
exports.drawRect = drawRect;

var _utils = require("./utils");

/**
 * canvasRenderUtils
 *
 * Contains utility methods used to render on a `<canvas>` element.
 *
 * @author Beatriz Malveiro Jorge (beatriz.jorge@feedzai.com)
 * @author Victor Fernandes (victor.fernandes@feedzai.com)
 * @author Luis Cardoso (luis.cardoso@feedzai.com)
 */

/**
 * Returns the canvas 2d context of the given canvas element.
 *
 * We have this call in a separated method so that it can stubbed in unit tests.
 *
 * @param {HTMLElement} element
 * @returns {Object}
 */
function getRenderContext(element) {
  return element.getContext("2d");
}
/**
 * Clears the given canvas.
 * @param {Object} context
 * @param {number} width
 * @param {number} height
 */


function clearCanvas(context, width, height) {
  context.save();
  context.clearRect(0, 0, width, height);
}
/**
 * Renders a rectangle in Canvas
 *
 * @param {Object} canvasContext
 * @param {number} x
 * @param {number} y
 * @param {number} width
 * @param {number} height
 * @param {Object} options
 */


function drawRect(canvasContext) {
  let x = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
  let y = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
  let width = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;
  let height = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 0;
  let options = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : null;
  canvasContext.beginPath();
  canvasContext.fillStyle = (0, _utils.isObject)(options) && options.fillStyle ? options.fillStyle : "transparent";
  canvasContext.fillRect(x, y, width, height);
}