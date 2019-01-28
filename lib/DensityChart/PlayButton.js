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

// These icon paths were copied from antd
const PAUSE_ICON_PATH = `M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 
64 512 64zm0 820c-205.4 0-372-166.6-372-372s166.6-372 372-372 372 166.6 372 372-166.6 372-372 
372zm-88-532h-48c-4.4 0-8 3.6-8 8v304c0 4.4 3.6 8 8 8h48c4.4 0 8-3.6 8-8V360c0-4.4-3.6-8-8-8zm224 
0h-48c-4.4 0-8 3.6-8 8v304c0 4.4 3.6 8 8 8h48c4.4 0 8-3.6 8-8V360c0-4.4-3.6-8-8-8z`;
const PLAY_ICON_PATHS = [`M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm0 820c-205.4 
    0-372-166.6-372-372s166.6-372 372-372 372 166.6 372 372-166.6 372-372 372z`, `M719.4 499.1l-296.1-215A15.9 15.9 0 0 0 398 297v430c0 13.1 14.8 20.5 25.3 12.9l296.1-215a15.9 
    15.9 0 0 0 0-25.8zm-257.6 134V390.9L628.5 512 461.8 633.1z`];
/**
 * PlayButton
 *
 * Renders a play button that allows to play a time-lapse of the events
 * in the histogram.
 *
 * @author Beatriz Malveiro Jorge (beatriz.jorge@feedzai.com)
 * @author Victor Fernandes (victor.fernandes@feedzai.com)
 * @author Luis Cardoso (luis.cardoso@feedzai.com)
 */

class PlayButton extends _react.PureComponent {
  constructor() {
    super(...arguments);
    (0, _defineProperty2.default)(this, "state", {
      play: false
    });
    (0, _defineProperty2.default)(this, "_onClickPlay", () => {
      const _this$props = this.props,
            width = _this$props.width,
            densityChartXScale = _this$props.densityChartXScale,
            brushDomainMax = _this$props.brushDomainMax,
            brushDomainMin = _this$props.brushDomainMin,
            frameStep = _this$props.frameStep;
      const brushedMaxRange = densityChartXScale(brushDomainMax);
      const brushedMinRange = densityChartXScale(brushDomainMin);
      const frameStart = brushedMinRange;
      const playEnd = width;
      const playStep = width * frameStep;
      this.frameEnd = frameStart;

      if (brushedMaxRange === playEnd) {
        this.frameEnd = frameStart;
      } else {
        this.frameEnd = brushedMaxRange;
      }

      this.setState({
        play: true
      }, () => this._playLapseAtInterval(frameStart, playEnd, playStep));
    });
    (0, _defineProperty2.default)(this, "_onClickStop", () => {
      this._stopLapse();
    });
  }

  /**
   * Plays a frame of the domain-lapse. Updates subset of domain
   * to be displayed and moves brush to new domain.
   *
   * @param {Number} start
   * @param {Number} end
   * @param {Number} step
   * @private
   */
  _playFrame(start, end, step) {
    // If end of frame is at end of play region then stop domain-lapse
    if (this.frameEnd >= end) {
      this._stopLapse();

      return;
    } // Check if adding a step will surprass max domain.


    if (this.frameEnd + step >= end) {
      // If so, set max frame to be max domain
      this.frameEnd = end;
    } else {
      // Otherwise just add a step
      this.frameEnd += step;
    }

    const domain = [start, this.frameEnd]; // Move brush to new frame location

    this.props.moveBrush(domain);
  }
  /**
   * Plays domain-lapse by calling _playFrame at interval
   * to play each frame.
   *
   * @param {Number} start
   * @param {Number} end
   * @param {Number} step
   * @private
   */


  _playLapseAtInterval(start, end, step) {
    this.playInterval = setInterval(() => {
      this._playFrame(start, end, step);
    }, this.props.frameDelay);
  }
  /**
   *  Stops domain-lapse at current frame. This
   * is done by clearing the timeInterval in this.playInterval.
   *
   * @private
   */


  _stopLapse() {
    this.setState({
      play: false
    }, () => clearInterval(this.playInterval));
  }

  render() {
    const onClick = this.state.play ? this._onClickStop : this._onClickPlay;
    let iconElement;

    if (this.state.play) {
      iconElement = _react.default.createElement("svg", {
        viewBox: "64 64 896 896",
        width: "1em",
        height: "1em",
        fill: "currentColor"
      }, _react.default.createElement("path", {
        d: PAUSE_ICON_PATH
      }));
    } else {
      iconElement = _react.default.createElement("svg", {
        viewBox: "64 64 896 896",
        width: "1em",
        height: "1em",
        fill: "currentColor"
      }, _react.default.createElement("path", {
        d: PLAY_ICON_PATHS[0]
      }), _react.default.createElement("path", {
        d: PLAY_ICON_PATHS[1]
      }));
    }

    return _react.default.createElement(_react.default.Fragment, null, _react.default.createElement("button", {
      type: "button",
      className: "ant-btn fdz-css-play-btn ant-btn-icon-only",
      onClick: onClick
    }, _react.default.createElement("i", {
      className: "anticon anticon-play-circle"
    }, iconElement)));
  }

}

exports.default = PlayButton;
(0, _defineProperty2.default)(PlayButton, "propTypes", {
  width: _propTypes.default.number.isRequired,
  brushDomainMax: _propTypes.default.number.isRequired,
  brushDomainMin: _propTypes.default.number.isRequired,
  densityChartXScale: _propTypes.default.func.isRequired,
  moveBrush: _propTypes.default.func.isRequired,
  frameStep: _propTypes.default.number,
  frameDelay: _propTypes.default.number
});
(0, _defineProperty2.default)(PlayButton, "defaultProps", {
  frameStep: 0.025,
  frameDelay: 500
});