/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2019 Google Inc.
 * https://developers.google.com/blockly/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview An object that provides constants for rendering blocks in the
 * minimalist renderer.
 */
'use strict';

goog.provide('Blockly.minimalist.ConstantProvider');

goog.require('Blockly.blockRendering.ConstantProvider');
goog.require('Blockly.utils.object');


/**
 * An object that provides constants for rendering blocks in the sample.
 * @constructor
 * @package
 * @extends {Blockly.blockRendering.ConstantProvider}
 */
Blockly.minimalist.ConstantProvider = function() {
  Blockly.minimalist.ConstantProvider.superClass_.constructor.call(this);

  /**
   * Adjust the notch width and height here.
   */
  this.NOTCH_WIDTH = 15;
  this.NOTCH_HEIGHT = 4;

  /**
   * Adjust the left corner radius here.
   */
  this.CORNER_RADIUS = 8;

  /**
   * Adjust the tab width and height here.
   */
  this.TAB_HEIGHT = 15;
  this.TAB_WIDTH = 8;
};
Blockly.utils.object.inherits(Blockly.minimalist.ConstantProvider,
    Blockly.blockRendering.ConstantProvider);

/**
 * Sample notches.
 */

// /**
//  * Rounded notch.
//  * @override
//  */
// Blockly.minimalist.ConstantProvider.prototype.makeNotch = function() {
//   var width = this.NOTCH_WIDTH;
//   var height = this.NOTCH_HEIGHT;
//   var radius = width / 1.9;
//   function makeMainPath(dir) {
//     return Blockly.utils.svgPaths.arc('a', '0 0 ' + (dir > 0 ? '0' : '1'), radius,
//         Blockly.utils.svgPaths.point(dir * width / 2, height / 2)) +
//         Blockly.utils.svgPaths.arc('a', '0 0 ' + (dir > 0 ? '0' : '1'), radius,
//             Blockly.utils.svgPaths.point(dir * width / 2, -height / 2));
//   }
//   var pathLeft = makeMainPath(1);
//   var pathRight = makeMainPath(-1);

//   return {
//     width: width,
//     height: height,
//     pathLeft: pathLeft,
//     pathRight: pathRight
//   };
// };

// /**
//  * Triangle notch.
//  * @override
//  */
// Blockly.minimalist.ConstantProvider.prototype.makeNotch = function() {
//   var width = this.NOTCH_WIDTH;
//   var height = this.NOTCH_HEIGHT;
//   var outerWidth = width / 2;
//   function makeMainPath(dir) {
//     return Blockly.utils.svgPaths.line(
//         [
//           Blockly.utils.svgPaths.point(dir * outerWidth, height),
//           Blockly.utils.svgPaths.point(dir * outerWidth, -height)
//         ]);
//   }
//   var pathLeft = makeMainPath(1);
//   var pathRight = makeMainPath(-1);

//   return {
//     width: width,
//     height: height,
//     pathLeft: pathLeft,
//     pathRight: pathRight
//   };
// };

// /**
//  * Square notch.
//  * @override
//  */
// Blockly.minimalist.ConstantProvider.prototype.makeNotch = function() {
//   var width = this.NOTCH_WIDTH;
//   var height = this.NOTCH_HEIGHT;
//   function makeMainPath(dir) {
//     return Blockly.utils.svgPaths.line(
//         [
//           Blockly.utils.svgPaths.point(0, height),
//           Blockly.utils.svgPaths.point(dir * width, 0),
//           Blockly.utils.svgPaths.point(0, -height)
//         ]);
//   }
//   var pathLeft = makeMainPath(1);
//   var pathRight = makeMainPath(-1);

//   return {
//     width: width,
//     height: height,
//     pathLeft: pathLeft,
//     pathRight: pathRight
//   };
// };


/**
 * Sample puzzle tab.
 */

// /**
//  * Square puzzle tab.
//  * @override
//  */
// Blockly.minimalist.ConstantProvider.prototype.makePuzzleTab = function() {
//   var width = this.TAB_WIDTH;
//   var height = this.TAB_HEIGHT;

//   function makeMainPath(up) {
//     return Blockly.utils.svgPaths.line(
//         [
//           Blockly.utils.svgPaths.point(-width, 0),
//           Blockly.utils.svgPaths.point(0, -1 * up * height),
//           Blockly.utils.svgPaths.point(width, 0)
//         ]);
//   }

//   var pathUp = makeMainPath(1);
//   var pathDown = makeMainPath(-1);

//   return {
//     width: width,
//     height: height,
//     pathDown: pathDown,
//     pathUp: pathUp
//   };
// };

Blockly.minimalist.ConstantProvider.prototype.init = function() {
  Blockly.minimalist.ConstantProvider.superClass_.init.call(this);

  this.TRIANGLE_TAB = this.makeTriangleTab();
};

Blockly.minimalist.ConstantProvider.prototype.makeTriangleTab = function() {
  var width = this.TAB_WIDTH;
  var height = this.TAB_HEIGHT;

  function makeMainPath(up) {
    return Blockly.utils.svgPaths.line(
        [
          Blockly.utils.svgPaths.point(-width, -1 * up * height / 2),
          Blockly.utils.svgPaths.point(width, -1 * up * height / 2)
        ]);
  }

  var pathUp = makeMainPath(1);
  var pathDown = makeMainPath(-1);

  return {
    width: width,
    height: height,
    pathDown: pathDown,
    pathUp: pathUp
  };
};

Blockly.minimalist.ConstantProvider.prototype.shapeFor = function(connection) {

  switch (connection.type) {
    case Blockly.INPUT_VALUE:
      var reason = Blockly.selected && Blockly.selected.outputConnection &&
          Blockly.selected.outputConnection.canConnectWithReason_(connection);

      if (reason === Blockly.Connection.CAN_CONNECT) {
        return this.TRIANGLE_TAB;
      } else {
        return this.PUZZLE_TAB;
      }

    case Blockly.OUTPUT_VALUE:
      var here = Blockly.selected === connection.getSourceBlock();

      if (here) {
        return this.TRIANGLE_TAB;
      }

      var shape = connection.targetConnection && this.shapeFor(connection.targetConnection);

      return shape || this.PUZZLE_TAB;

    case Blockly.PREVIOUS_STATEMENT:
    case Blockly.NEXT_STATEMENT:
      return this.NOTCH;
    default:
      throw Error('Unknown connection type');
  }
};
