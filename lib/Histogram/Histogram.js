"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.Histogram = void 0;

require("core-js/modules/web.dom.iterable");

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireWildcard(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _d3Array = require("d3-array");

var _d3Scale = require("d3-scale");

var _d3Selection = require("d3-selection");

var _d3Axis = require("d3-axis");

var _d3Time = require("d3-time");

var _reactSizeme = require("react-sizeme");

var _utils = require("../utils");

var _constants = require("../constants");

var _histogramBinCalculator = _interopRequireDefault(require("./histogramBinCalculator"));

var _histogramBarGeometry = require("./histogramBarGeometry");

var _d3Zoom = require("d3-zoom");

var _DensityChart = _interopRequireDefault(require("../DensityChart/DensityChart"));

/**
 * Histogram
 *
 * Plots an histogram with zoom and brush features on the x domain.
 * Also plots a density strip plot for context when brushing and zooming the histogram.
 *
 * @author Beatriz Malveiro Jorge (beatriz.jorge@feedzai.com)
 * @author Victor Fernandes (victor.fernandes@feedzai.com) ("productization" process)
 * @author Luis Cardoso (luis.cardoso@feedzai.com)
 */
class Histogram extends _react.PureComponent {
  static getDerivedStateFromProps(props, state) {
    if (props.height < _constants.MIN_TOTAL_HEIGHT) {
      throw new Error(`The minimum height is ${_constants.MIN_TOTAL_HEIGHT}px.`);
    } // Sometimes the width will be zero, for example when switching between storybook
    // stories. In those cases we don't want to do anything so that the histogram
    // does not enter into an invalid state.


    if (props.size.width === 0) {
      return null;
    }

    const nextState = (0, _utils.calculateChartSizesAndDomain)(props, state.data, state.brushTimeDomain);
    return Object.keys(nextState).length > 0 ? nextState : null;
  }

  constructor(props) {
    super(props);
    (0, _defineProperty2.default)(this, "_onDensityChartDomainChanged", brushSelection => {
      const brushSelectionMin = brushSelection[0];
      const brushSelectionMax = brushSelection[1]; // converts for a time-scale

      const brushedDomain = brushSelection.map(this.densityChartXScale.invert);
      (0, _d3Selection.select)(this.histogramChartRef.current).call(this.zoom.transform, _d3Zoom.zoomIdentity.scale(this.state.densityChartDimensions.width / (brushSelectionMax - brushSelectionMin)).translate(-brushSelection[0], 0));

      this._updateBrushedDomainAndReRenderTheHistogramPlot(brushedDomain);
    });
    (0, _defineProperty2.default)(this, "_onResizeZoom", () => {
      // This is an early return in order to avoid processing brush event
      if (_d3Selection.event.sourceEvent && _d3Selection.event.sourceEvent.type === "brush") {
        return;
      }

      const transform = _d3Selection.event.transform; // We apply the zoom transformation to rescale densityChartScale.
      // Then we get the new domain, this is the new domain for the histogram x scale

      const brushedDomain = transform.rescaleX(this.densityChartXScale).domain(); // if the max value of the brushed domain is greater than the max value of the overallTimeDomain imposed
      // by the data we should avoid the scrolling in that area because it doesn't make any sense.

      if (brushedDomain[1] >= this.state.overallTimeDomain.max) {
        // Here we get the delta of the brush domain
        const brushDomainInterval = brushedDomain[1].getTime() - brushedDomain[0].getTime(); // And apply that in this min value of the brush domain in order to keep that interval

        brushedDomain[0] = (0, _d3Time.timeMillisecond)(this.state.overallTimeDomain.max - brushDomainInterval);
        brushedDomain[1] = (0, _d3Time.timeMillisecond)(this.state.overallTimeDomain.max);
      }

      this._updateBrushedDomainAndReRenderTheHistogramPlot(brushedDomain);
    });
    (0, _defineProperty2.default)(this, "_onMouseEnterHistogramBar", evt => {
      const index = +evt.currentTarget.getAttribute("dataindex"); // The `+` converts "1" to 1
      // In order to access into the information in the `SyntheticEvent` inside of the setState callback it inspect
      // necessary store the currentTarget value in a constant. https://reactjs.org/docs/events.html#event-pooling

      const currentTarget = evt.currentTarget;
      this.setState(state => {
        const bar = state.timeHistogramBars[index];
        return {
          showHistogramBarTooltip: true,
          currentBar: bar,
          selectedBarPosition: currentTarget.getBoundingClientRect()
        };
      });
    });
    (0, _defineProperty2.default)(this, "_onMouseLeaveHistogramBar", () => {
      this.setState({
        showHistogramBarTooltip: false
      });
    });
    this.histogramChartRef = _react.default.createRef();
    this.histogramXAxisRef = _react.default.createRef();
    this.histogramYAxisRef = _react.default.createRef(); // We need to compute the widths and domain right at the constructor because we
    // need them to compute the scales correctly, which are needed in the children

    this.state = Object.assign({
      timeHistogramBars: [],
      selectedBarPosition: {},
      showHistogramBarTooltip: false
    }, (0, _utils.calculateChartSizesAndDomain)(props, [], {
      max: -Infinity,
      min: Infinity
    }));

    this._createScaleAndZoom();
  }

  componentDidMount() {
    this._setUpZoomAndChartScales();
  }

  componentDidUpdate(prevProps) {
    const hasWidthChanged = prevProps.size.width !== this.props.size.width;
    const hasDataChanged = prevProps.data.length !== this.props.data.length || !(0, _utils.isHistogramDataEqual)(this.props.xAccessor, this.props.yAccessor, prevProps.data, this.props.data);

    if (hasWidthChanged || hasDataChanged) {
      this._createScaleAndZoom();

      this._setUpZoomAndChartScales();
    }
  }

  componentWillUnmount() {
    this.zoom.on("zoom", null); // This is the way to unbind events in d3
  }
  /**
   * Handles a domain change in the density chart.
   *
   * @param {Array} brushSelection
   * @private
   */


  /**
   * Creates the density chart x axis scale and the histogram zoom.
   * @private
   */
  _createScaleAndZoom() {
    const _this$state$brushTime = this.state.brushTimeDomain,
          min = _this$state$brushTime.min,
          max = _this$state$brushTime.max;
    const _this$state$histogram = this.state.histogramChartDimensions,
          width = _this$state$histogram.width,
          height = _this$state$histogram.height;
    this.densityChartXScale = (0, _d3Scale.scaleTime)().domain([min, max]).range([0, this.state.densityChartDimensions.width]); // max zoom is the ratio of the initial domain extent to the minimum unit we want to zoom to.

    const MAX_ZOOM_VALUE = (max - min) / this.props.minZoomUnit;
    this.zoom = (0, _d3Zoom.zoom)().scaleExtent([_constants.MIN_ZOOM_VALUE, MAX_ZOOM_VALUE]).translateExtent([[0, 0], [width, height]]).extent([[0, 0], [width, height]]).on("zoom", this._onResizeZoom);
  }
  /**
   * Sets up the zoom and the chart scales.
   * @private
   */


  _setUpZoomAndChartScales() {
    (0, _d3Selection.select)(this.histogramChartRef.current).call(this.zoom);

    this._updateHistogramChartScales();
  }
  /**
   * Check if brushed domain changed and if so, updates the component state
   * and calls prop function for interval change.
   *
   * @param {Array<Number>} brushedDomain
   * @private
   */


  _updateBrushedDomainAndReRenderTheHistogramPlot(brushedDomain) {
    const brushedDomainMin = (0, _utils.dateToTimestamp)(brushedDomain[0]);
    const brushedDomainMax = (0, _utils.dateToTimestamp)(brushedDomain[1]);

    if (brushedDomainMin !== this.state.brushTimeDomain.min || brushedDomainMax !== this.state.brushTimeDomain.max) {
      this.setState({
        brushTimeDomain: {
          min: brushedDomainMin,
          max: brushedDomainMax
        },
        showHistogramBarTooltip: false
      }, this._updateHistogramChartScales);
      const fullDomain = this.densityChartXScale.domain();
      const isFullDomain = fullDomain[0].getTime() === brushedDomainMin && fullDomain[1].getTime() === brushedDomainMax;
      this.props.onIntervalChange([brushedDomainMin, brushedDomainMax], isFullDomain);
    }
  }
  /**
   * Defines X and Y scale for histogram bar chart and creates bins for histogram
   * Checks if plot is timebased and sets X axis accordingly.
   *
   * @private
   */


  _updateHistogramChartScales() {
    this.histogramChartXScale = (0, _d3Scale.scaleTime)();
    this.histogramChartXScale.domain([this.state.brushTimeDomain.min, this.state.brushTimeDomain.max]).range([this.state.histogramChartDimensions.width * _constants.X_AXIS_PADDING, this.state.histogramChartDimensions.width * (1 - _constants.X_AXIS_PADDING)]).nice(this.props.defaultBarCount); // Calculating the time histogram bins

    const timeHistogramBars = (0, _histogramBinCalculator.default)({
      xAccessor: this.props.xAccessor,
      yAccessor: this.props.yAccessor,
      histogramChartXScale: this.histogramChartXScale,
      defaultBarCount: this.props.defaultBarCount,
      data: this.props.data
    });
    let maxY;

    if (this.props.data.length === 0) {
      maxY = 1;
    } else {
      maxY = (0, _d3Array.max)(timeHistogramBars, bin => bin.yValue);
    } // Setting the histogram y-axis domain scale


    this.histogramChartYScale = (0, _d3Scale.scaleLinear)().domain([0, maxY]).range([this.state.histogramChartDimensions.heightForBars, 0]);
    this.setState({
      timeHistogramBars
    }, () => {
      this._renderHistogramAxis();
    });
  }
  /**
   * Renders histogram bars from array of histogram bins.
   *
   * @param {Array} timeHistogramBars
   * @returns {Array.<React.Element>|null}
   * @private
   */


  _renderHistogramBars(timeHistogramBars) {
    return timeHistogramBars.map((bar, index) => {
      const _calculatePositionAnd = (0, _histogramBarGeometry.calculatePositionAndDimensions)({
        xScale: this.histogramChartXScale,
        yScale: this.histogramChartYScale,
        heightForBars: this.state.histogramChartDimensions.heightForBars,
        margin: this.props.barOptions.margin,
        bar
      }),
            width = _calculatePositionAnd.width,
            height = _calculatePositionAnd.height,
            x = _calculatePositionAnd.x,
            y = _calculatePositionAnd.y; // Do not render the histogram bars when they have negative values for the
      // width and height


      if (height <= 0 || width <= 0) {
        return null;
      } // If there is no tooltip we don't need the mouse enter and leave handlers


      const hasTooltipBarCustomatizations = typeof this.props.tooltipBarCustomization === "function";
      return _react.default.createElement("rect", {
        key: `histogram-bin-${bar.x0.getTime()}`,
        dataindex: index,
        x: x,
        y: y,
        width: width,
        height: height,
        onMouseEnter: hasTooltipBarCustomatizations ? this._onMouseEnterHistogramBar : null,
        onMouseLeave: hasTooltipBarCustomatizations ? this._onMouseLeaveHistogramBar : null
      });
    });
  }
  /**
   * This function will render the X and Y axis. This means it will set their scales
   * as well as how many ticks, their respective positions and how their text should
   * be formatted.
   *
   * @private
   */


  _renderHistogramAxis() {
    const histogramXAxisScale = (0, _d3Scale.scaleTime)().domain([this.histogramChartXScale.invert(0), this.histogramChartXScale.invert(this.state.histogramChartDimensions.width)]).range([0, this.state.histogramChartDimensions.width]); // Setting the x-axis histogram representation.

    const histogramXAxis = (0, _d3Axis.axisBottom)(histogramXAxisScale).tickValues(this.histogramChartXScale.ticks(this.props.defaultBarCount / _constants.BARS_TICK_RATIO)).tickFormat(this.props.xAxisFormatter);
    (0, _d3Selection.select)(this.histogramXAxisRef.current).call(histogramXAxis);
    const histogramYAxis = (0, _d3Axis.axisLeft)(this.histogramChartYScale).ticks(this.props.yAxisTicks).tickSize(0).tickFormat(this.props.yAxisFormatter);
    (0, _d3Selection.select)(this.histogramYAxisRef.current).call(histogramYAxis);
  }
  /**
   * Renders tooltip corresponding to an histogram bin.
   * Receives an object with all the data of the bin and gets corresponding
   * bar element. Then calls the prop function histogramBarTooltipFormatter
   * to get the tooltip element to be rendered. Updates states with this element
   * and toggles showHistogramBarTooltip.
   *
   * @param {Object} currentBar
   * @private
   */


  _renderBarTooltip(currentBar) {
    const tooltipStyle = {
      position: "fixed",
      left: `${this.state.selectedBarPosition.left + this.state.selectedBarPosition.width / 2}px`,
      top: `${this.state.selectedBarPosition.top - _constants.BAR_TOOLTIP_ARROW_HEIGHT}px`
    };

    if (typeof this.props.tooltipBarCustomization !== "function") {
      return null;
    }

    const tooltipElement = this.props.tooltipBarCustomization(currentBar);
    return _react.default.createElement("div", {
      className: "fdz-css-graph-histogram-bars--tooltip",
      style: tooltipStyle
    }, tooltipElement);
  }
  /**
   * Renders the histogram chart (i.e., the bars and the axis).
   * @returns {React.Element}
   */


  _renderHistogramChart() {
    // Histogram classNames
    const histogramXAxisClassname = "fdz-js-graph-histogram-axis-x fdz-css-graph-histogram-axis-x";
    const histogramYAxisClassname = "fdz-js-graph-histogram-axis-y fdz-css-graph-histogram-axis-y";
    const _this$state = this.state,
          histogramChartDimensions = _this$state.histogramChartDimensions,
          timeHistogramBars = _this$state.timeHistogramBars;
    const _this$props = this.props,
          spaceBetweenCharts = _this$props.spaceBetweenCharts,
          size = _this$props.size;
    return _react.default.createElement("svg", {
      ref: this.histogramChartRef,
      className: "fdz-js-graph-histogram fdz-css-graph-histogram-chart",
      width: size.width,
      height: histogramChartDimensions.height,
      style: {
        marginBottom: spaceBetweenCharts
      }
    }, _react.default.createElement("g", {
      className: "fdz-css-graph-histogram-bars"
    }, this._renderHistogramBars(timeHistogramBars)), _react.default.createElement("g", {
      ref: this.histogramXAxisRef,
      className: histogramXAxisClassname,
      transform: `translate(0, ${histogramChartDimensions.heightForBars})`
    }), _react.default.createElement("g", {
      ref: this.histogramYAxisRef,
      className: histogramYAxisClassname,
      transform: `translate(${_constants.Y_AXIS_PADDING}, ${_constants.Y_AXIS_PADDING})`
    }));
  }
  /**
   * Renders the density chart.
   * @returns {React.Element}
   */


  _renderDensityChart() {
    const _this$props2 = this.props,
          frameStep = _this$props2.frameStep,
          frameDelay = _this$props2.frameDelay,
          xAccessor = _this$props2.xAccessor,
          spaceBetweenCharts = _this$props2.spaceBetweenCharts,
          brushDensityChartColor = _this$props2.brushDensityChartColor,
          brushDensityChartFadedColor = _this$props2.brushDensityChartFadedColor,
          renderPlayButton = _this$props2.renderPlayButton,
          data = _this$props2.data;
    return _react.default.createElement(_DensityChart.default, {
      width: this.state.densityChartDimensions.width,
      height: this.state.densityChartDimensions.height,
      padding: _constants.PADDING,
      brushDomainMin: this.state.brushTimeDomain.min,
      brushDomainMax: this.state.brushTimeDomain.max,
      overallTimeDomainMax: this.state.overallTimeDomain.max,
      frameStep: frameStep,
      frameDelay: frameDelay,
      xAccessor: xAccessor,
      spaceBetweenCharts: spaceBetweenCharts,
      brushDensityChartColor: brushDensityChartColor,
      brushDensityChartFadedColor: brushDensityChartFadedColor,
      densityChartXScale: this.densityChartXScale,
      renderPlayButton: renderPlayButton && data.length > 0,
      data: data,
      onDomainChanged: this._onDensityChartDomainChanged
    });
  }

  render() {
    return _react.default.createElement("div", {
      className: "fdz-css-graph-histogram"
    }, this.state.showHistogramBarTooltip ? this._renderBarTooltip(this.state.currentBar) : null, this._renderHistogramChart(), this._renderDensityChart());
  }

}

exports.Histogram = Histogram;
(0, _defineProperty2.default)(Histogram, "propTypes", {
  data: _propTypes.default.array.isRequired,
  size: _propTypes.default.shape({
    width: _propTypes.default.number.isRequired
  }).isRequired,
  defaultBarCount: _propTypes.default.number,
  xAccessor: _propTypes.default.func.isRequired,
  xAxisFormatter: _propTypes.default.func,
  yAccessor: _propTypes.default.func.isRequired,
  spaceBetweenCharts: _propTypes.default.number,
  barOptions: _propTypes.default.object,
  yAxisTicks: _propTypes.default.number,
  yAxisFormatter: _propTypes.default.func,
  brushDensityChartColor: _propTypes.default.string,
  brushDensityChartFadedColor: _propTypes.default.string,
  tooltipBarCustomization: _propTypes.default.func,
  onIntervalChange: _propTypes.default.func,
  minZoomUnit: _propTypes.default.number,
  frameStep: _propTypes.default.number,
  frameDelay: _propTypes.default.number,
  renderPlayButton: _propTypes.default.bool
});
(0, _defineProperty2.default)(Histogram, "defaultProps", {
  data: [],
  height: _constants.MIN_TOTAL_HEIGHT,
  padding: 10,
  defaultBarCount: 18,
  barOptions: {
    margin: 1
  },
  spaceBetweenCharts: 10,
  yAxisTicks: 3,
  xAxisFormatter: _utils.multiDateFormat,
  yAxisFormatter: _utils.histogramDefaultYAxisFormatter,
  tooltipBarCustomization: null,
  onIntervalChange: () => {},
  minZoomUnit: 1000,
  renderPlayButton: true
});

var _default = (0, _reactSizeme.withSize)()(Histogram);

exports.default = _default;