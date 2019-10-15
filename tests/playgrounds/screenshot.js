/**
 * @license
 * Copyright 2019 Google LLC
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
 * @fileoverview Download screenshot.
 * @author samelh@google.com (Sam El-Husseini)
 */
'use strict';

/**
 * Convert an SVG datauri into a PNG datauri.
 * @param {string} data SVG datauri.
 * @param {number} width Image width.
 * @param {number} height Image height.
 * @param {?string} code Extra code chunk to add to the PNG.
 * @param {!Function} callback Callback.
 */
function svgToPng_(data, width, height, code, callback) {
  var canvas = document.createElement("canvas");
  var context = canvas.getContext("2d");
  var img = new Image();

  var pixelDensity = 10;
  canvas.width = width * pixelDensity;
  canvas.height = height * pixelDensity;
  img.onload = function() {
    context.drawImage(
        img, 0, 0, width, height, 0, 0, canvas.width, canvas.height);
    try {
      if (code) {
        Blockly.utils.PNG.fromCanvas(canvas, function(png) {
          png.setCodeChunk(code);
          var blob = png.toBlob();
          callback(URL.createObjectURL(blob));
        });
      } else {
        var dataUri = canvas.toDataURL('image/png');
        callback(dataUri);
      }
    } catch (err) {
      console.warn('Error converting the workspace svg to a png', err);
    }
  };
  img.src = data;
}

/**
 * Create an SVG of the blocks on the workspace.
 * @param {!Blockly.WorkspaceSvg} workspace The workspace.
 * @param {!Function} callback Callback.
 */
function workspaceToSvg_(workspace, callback) {

  // Go through all text areas and set their value.
  var textAreas = document.getElementsByTagName("textarea");
  for (var i = 0; i < textAreas.length; i++) {
    textAreas[i].innerHTML = textAreas[i].value;
  }

  var bBox = workspace.getBlocksBoundingBox();
  var x = bBox.left;
  var y = bBox.top;
  var width = bBox.right - x;
  var height = bBox.bottom - y;

  var blockCanvas = workspace.getCanvas();
  var clone = blockCanvas.cloneNode(true);
  clone.removeAttribute('transform');

  var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  svg.appendChild(clone);
  svg.setAttribute('viewBox',
      x + ' ' + y + ' ' + width + ' ' + height);

  svg.setAttribute('class', 'blocklySvg');
  svg.setAttribute('width', width);
  svg.setAttribute('height', height);
  svg.setAttribute("style", 'background-color: transparent');

  var css = [].slice.call(document.head.querySelectorAll('style'))
      .filter(function(el) {
        return /\.blocklySvg/.test(el.innerText);
      })[0];
  var style = document.createElement('style');
  style.innerHTML = css.innerText;
  svg.insertBefore(style, svg.firstChild);

  var svgAsXML = (new XMLSerializer).serializeToString(svg);
  svgAsXML = svgAsXML.replace(/&nbsp/g, '&#160');
  var data = 'data:image/svg+xml,' + encodeURIComponent(svgAsXML);

  svgToPng_(data, width, height, null, callback);
}

/**
 * Create an SVG of a block on the workspace.
 * @param {!Blockly.BlockSvg} block The block.
 * @param {!Function} callback Callback.
 */
function blockToSvg_(block, callback) {

  // Go through all text areas and set their value.
  var textAreas = document.getElementsByTagName("textarea");
  for (var i = 0; i < textAreas.length; i++) {
    textAreas[i].innerHTML = textAreas[i].value;
  }

  var bBox = block.getBoundingRectangle();
  // TODO: It would be nice to have a common method on WorkspaceSvg & BlockSvg for this
  var x = 0;
  var y = 0;
  var width = bBox.right - bBox.left;
  var height = bBox.bottom - bBox.top;

  // TODO: It would be nice to have a common method on WorkspaceSvg & BlockSvg for this
  var blockCanvas = block.getSvgRoot();
  var clone = blockCanvas.cloneNode(true);
  clone.removeAttribute('transform');
  Blockly.utils.dom.removeClass(clone, 'blocklySelected');

  var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  svg.appendChild(clone);
  svg.setAttribute('viewBox',
      x + ' ' + y + ' ' + width + ' ' + height);

  svg.setAttribute('class', 'blocklySvg');
  svg.setAttribute('width', width);
  svg.setAttribute('height', height);
  svg.setAttribute("style", 'background-color: transparent');

  var css = [].slice.call(document.head.querySelectorAll('style'))
      .filter(function(el) {
        return /\.blocklySvg/.test(el.innerText);
      })[0];
  var style = document.createElement('style');
  style.innerHTML = css.innerText;
  svg.insertBefore(style, svg.firstChild);

  var svgAsXML = (new XMLSerializer).serializeToString(svg);
  svgAsXML = svgAsXML.replace(/&nbsp/g, '&#160');
  var data = 'data:image/svg+xml,' + encodeURIComponent(svgAsXML);

  var blockXML = document.createElement('xml');
  blockXML.appendChild(Blockly.Xml.blockToDom(block, true));
  var blockCode = Blockly.Xml.domToText(blockXML);

  svgToPng_(data, width, height, blockCode, callback);
}

/**
 * Download a screenshot of the blocks on a Blockly workspace.
 * @param {!Blockly.WorkspaceSvg} workspace The Blockly workspace.
 */
Blockly.downloadScreenshot = function(workspace) {
  workspaceToSvg_(workspace, function(datauri) {
    var a = document.createElement('a');
    a.download = 'screenshot.png';
    a.target = '_self';
    a.href = datauri;
    document.body.appendChild(a);
    a.click();
    a.parentNode.removeChild(a);
  });
};

/**
 * Download an image of a specific block on a Blockly workspace.
 * @param {!Blockly.BlockSvg} block The Block.
 */
Blockly.downloadBlock = function(block) {
  blockToSvg_(block, function(datauri) {
    var a = document.createElement('a');
    a.download = block.type + '.png';
    a.target = '_self';
    a.href = datauri;
    document.body.appendChild(a);
    a.click();
    a.parentNode.removeChild(a);
  });
};

/**
 * Bind drop events
 * @param {!Blockly.WorkspaceSvg} workspace The workspace
 * @param {!Element} el The root workspace element
 */
Blockly.bindDropEvents = function(workspace, el) {

  el.addEventListener('dragover', function(e) {
    console.log('DRAGOVER', e);
    e.preventDefault();
  });
  el.addEventListener('drop', function(e) {
    e.preventDefault();

    var metrics = workspace.getMetrics();
    var point = Blockly.utils.mouseToSvg(e, workspace.getParentSvg(), workspace.getInverseScreenCTM());
    point.x = (point.x + metrics.viewLeft) / workspace.scale;
    point.y = (point.y + metrics.viewTop) / workspace.scale;

    if (e.dataTransfer.types.indexOf('Files') >= 0) {
      if (e.dataTransfer.files.item(0).type === 'image/png') {
        Blockly.importPngAsBlock(workspace, point, e.dataTransfer.files.item(0));
      }
    } else if (e.dataTransfer.types.indexOf('text/uri-list') >= 0) {
      var data = e.dataTransfer.getData('text/uri-list');
      if (data.match(/\.png$/)) {
        e.preventDefault();
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
          if (xhr.readyState === 4 && xhr.status === 200) {
            Blockly.importPngAsBlock(workspace, point, xhr.response);
          }
        };
        xhr.responseType = 'blob';
        xhr.open('GET', data, true);
        xhr.send();
      }
    }
  });
};

/**
 * Imports a block from a PNG file if the code chunk is present.
 * @param {!Blockly.WorkspaceSvg} workspace the target workspace for the block
 * @param {Blockly.utils.Coordinate} xy the coordinate to place the block
 * @param {Blob} png the blob representing the PNG file
 */
Blockly.importPngAsBlock = function(workspace, xy, png) {
  Blockly.utils.PNG.fromBlob(png, function(png) {
    var xmlChunk = png.getCodeChunk();
    if (xmlChunk) {
      var xmlText = new TextDecoder().decode(xmlChunk.data);
      var xml = /** @type {!Element} */ Blockly.Xml.textToDom(xmlText);
      xml = xml.firstElementChild;
      var block = /** @type {Blockly.BlockSvg} */ Blockly.Xml.domToBlock(xml, workspace);
      block.moveBy(xy.x, xy.y);
      block.initSvg();
      block.render();
    }
  });
};
