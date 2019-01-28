"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireWildcard(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _PlayButton = _interopRequireDefault(require("./PlayButton"));

var _d3Selection = require("d3-selection");

var _canvasRenderUtils = require("../canvasRenderUtils");

var _utils = require("../utils");

var _d3Brush = require("d3-brush");

/**
 * DensityChart
 *
 * Plots a density strip plot for context when brushing and zooming the histogram.
 *
 * @author Beatriz Malveiro Jorge (beatriz.jorge@feedzai.com)
 * @author Victor Fernandes (victor.fernandes@feedzai.com)
 * @author Luis Cardoso (luis.cardoso@feedzai.com)
 */
class DensityChart extends _react.PureComponent {
  constructor(props) {
    super(props);
    (0, _defineProperty2.default)(this, "_onResizeBrush", () => {
      // This occurs always when the user change the brush domain manually
      const event = this._getD3Event();

      if (event.sourceEvent && event.sourceEvent.type === "zoom") {
        return;
      }

      let brushSelection;

      if (Array.isArray(event.selection)) {
        brushSelection = event.selection;
      } else {
        // When we don't have any selection we should select everything
        brushSelection = this.props.densityChartXScale.range();
      }

      this.props.onDomainChanged(brushSelection);
    });
    (0, _defineProperty2.default)(this, "_moveBrush", domain => {
      if (this.props.data.length === 0) {
        return;
      }

      (0, _d3Selection.select)(this.densityBrushRef.current).call(this.brush.move, domain);
    });
    this.densityChartRef = _react.default.createRef();
    this.densityBrushRef = _react.default.createRef();
  }

  componentDidMount() {
    this.densityChartCanvasContext = (0, _canvasRenderUtils.getRenderContext)(this.densityChartRef.current);
    const _this$props = this.props,
          width = _this$props.width,
          height = _this$props.height,
          densityChartXScale = _this$props.densityChartXScale;
    this.brush = (0, _d3Brush.brushX)().extent([[0, 0], [width, height]]).on("brush end", this._onResizeBrush);

    this._updateBrush();

    this._moveBrush(densityChartXScale.range());

    this._drawDensityChart();
  }

  componentDidUpdate(prevProps) {
    let min = this.props.brushDomainMin;
    let max = this.props.brushDomainMax;
    const densityChartXScale = this.props.densityChartXScale;

    if (max >= this.props.overallTimeDomainMax) {
      const delta = this.props.brushDomainMax - this.props.brushDomainMin;
      min = this.props.overallTimeDomainMax - delta;
      max = this.props.overallTimeDomainMax;
    }

    this._updateBrush();

    this._moveBrush([densityChartXScale(min), densityChartXScale(max)]); // We only need to re-render the density chart if the data, the weight, the height or
    // the chart x scale have changed.


    if (this._shouldRedrawDensityChart(prevProps)) {
      this._drawDensityChart();
    }
  }

  componentWillUnmount() {
    clearInterval(this.playInterval);
    this.brush.on("brush end", null); // This is the way to unbind events in d3
  }
  /**
   * Handles brush events. It will update this.state.brushedDomain according to the
   * transformation on the event.
   *
   * @private
   */


  /**
   * Returns the D3 event object
   *
   * Used for stubbing in tests.
   *
   * @returns {Object|null}
   */
  _getD3Event() {
    return _d3Selection.event;
  }
  /**
   * Reapplies the brush
   * @private
   */


  _updateBrush() {
    if (this.props.data.length === 0) {
      return;
    }

    (0, _d3Selection.select)(this.densityBrushRef.current).call(this.brush);
  }
  /**
   * Moves brush on density strip plot to given domain
   * @private
   * @param {Array<Number>} domain
   */


  /**
   * Returns whenever it is necessary to re-render the density chart, based on the current and previous
   * props.
   * @param {Object} prevProps
   * @returns {boolean}
   */
  _shouldRedrawDensityChart(prevProps) {
    return (0, _utils.havePropsChanged)(this.props, prevProps, ["brushDomainMin", "brushDomainMax", "data", "width", "height", "densityChartXScale"]);
  }
  /**
   * Draws density strip plot in canvas.
   * (Using canvas instead of svg for performance reasons as number of datapoints
   * can be very large)
   *
   * @private
   */


  _drawDensityChart() {
    const _this$props2 = this.props,
          width = _this$props2.width,
          height = _this$props2.height,
          densityChartXScale = _this$props2.densityChartXScale,
          brushDomainMax = _this$props2.brushDomainMax,
          brushDomainMin = _this$props2.brushDomainMin,
          xAccessor = _this$props2.xAccessor,
          data = _this$props2.data,
          brushDensityChartColor = _this$props2.brushDensityChartColor,
          brushDensityChartFadedColor = _this$props2.brushDensityChartFadedColor;
    (0, _canvasRenderUtils.clearCanvas)(this.densityChartCanvasContext, width, height);

    for (let i = 0; i < data.length; ++i) {
      const x = xAccessor(data[i]);
      const isInsideOfBrushDomain = x >= brushDomainMin && x < brushDomainMax;
      (0, _canvasRenderUtils.drawRect)(this.densityChartCanvasContext, // canvas context
      densityChartXScale(x), // x
      0, // y
      2, // width
      height, // height
      {
        fillStyle: isInsideOfBrushDomain ? brushDensityChartColor : brushDensityChartFadedColor
      });
    }
  }
  /**
   * Renders the play button that allows to replay a time-lapse of the events.
   * @returns {React.Element|null}
   */


  _renderPlayButton() {
    const _this$props3 = this.props,
          width = _this$props3.width,
          densityChartXScale = _this$props3.densityChartXScale,
          brushDomainMax = _this$props3.brushDomainMax,
          brushDomainMin = _this$props3.brushDomainMin,
          frameStep = _this$props3.frameStep,
          frameDelay = _this$props3.frameDelay,
          renderPlayButton = _this$props3.renderPlayButton;

    if (!renderPlayButton) {
      return null;
    }

    return _react.default.createElement(_PlayButton.default, {
      width: width,
      densityChartXScale: densityChartXScale,
      brushDomainMin: brushDomainMin,
      brushDomainMax: brushDomainMax,
      frameStep: frameStep,
      frameDelay: frameDelay,
      moveBrush: this._moveBrush
    });
  }

  render() {
    let leftPadding = 0;
    const _this$props4 = this.props,
          width = _this$props4.width,
          height = _this$props4.height,
          padding = _this$props4.padding;

    if (!this.props.renderPlayButton) {
      leftPadding = padding * 2;
    }

    const densityChartCanvasStyle = {
      left: leftPadding
    };
    return _react.default.createElement("div", {
      className: "fdz-css-graph-histogram-density__wrapper"
    }, this._renderPlayButton(), _react.default.createElement("div", {
      className: "fdz-css-graph-histogram-density",
      style: {
        position: "relative"
      }
    }, _react.default.createElement("canvas", {
      ref: this.densityChartRef,
      className: "fdz-css-graph-histogram-density__canvas",
      width: width,
      height: height,
      style: densityChartCanvasStyle,
      "aria-label": "Density Chart"
    }), _react.default.createElement("svg", {
      ref: this.densityBrushRef,
      className: "fdz-css-graph-histogram-brush",
      width: width,
      height: height,
      style: {
        position: "absolute",
        left: leftPadding,
        top: 0
      },
      alt: "Density Chart Brush"
    })));
  }

}

exports.default = DensityChart;
(0, _defineProperty2.default)(DensityChart, "propTypes", {
  data: _propTypes.default.arrayOf(_propTypes.default.object).isRequired,
  width: _propTypes.default.number.isRequired,
  height: _propTypes.default.number.isRequired,
  padding: _propTypes.default.number.isRequired,
  overallTimeDomainMax: _propTypes.default.number,
  brushDomainMin: _propTypes.default.number.isRequired,
  brushDomainMax: _propTypes.default.number.isRequired,
  densityChartXScale: _propTypes.default.func.isRequired,
  onDomainChanged: _propTypes.default.func.isRequired,
  xAccessor: _propTypes.default.func.isRequired,
  frameStep: _propTypes.default.number,
  frameDelay: _propTypes.default.number,
  brushDensityChartColor: _propTypes.default.string,
  brushDensityChartFadedColor: _propTypes.default.string,
  renderPlayButton: _propTypes.default.bool
});
(0, _defineProperty2.default)(DensityChart, "defaultProps", {
  renderPlayButton: true,
  overallTimeDomainMax: -Infinity,
  brushDensityChartColor: "rgba(33, 150, 243, 0.2)",
  brushDensityChartFadedColor: "rgba(176, 190, 197, 0.2)"
});