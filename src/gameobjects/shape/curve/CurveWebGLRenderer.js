/**
 * @author       Richard Davey <rich@photonstorm.com>
 * @copyright    2020 Photon Storm Ltd.
 * @license      {@link https://opensource.org/licenses/MIT|MIT License}
 */

var FillPathWebGL = require('../FillPathWebGL');
var GetCalcMatrix = require('../../GetCalcMatrix');
var StrokePathWebGL = require('../StrokePathWebGL');

/**
 * Renders this Game Object with the WebGL Renderer to the given Camera.
 * The object will not render if any of its renderFlags are set or it is being actively filtered out by the Camera.
 * This method should not be called directly. It is a utility function of the Render module.
 *
 * @method Phaser.GameObjects.Curve#renderWebGL
 * @since 3.13.0
 * @private
 *
 * @param {Phaser.Renderer.WebGL.WebGLRenderer} renderer - A reference to the current active WebGL renderer.
 * @param {Phaser.GameObjects.Curve} src - The Game Object being rendered in this call.
 * @param {Phaser.Cameras.Scene2D.Camera} camera - The Camera that is rendering the Game Object.
 * @param {Phaser.GameObjects.Components.TransformMatrix} parentMatrix - This transform matrix is defined if the game object is nested
 */
var CurveWebGLRenderer = function (renderer, src, camera, parentMatrix)
{
    var pipeline = renderer.pipelines.set(this.pipeline);

    var result = GetCalcMatrix(src, camera, parentMatrix);

    var calcMatrix = pipeline.calcMatrix.copyFrom(result.calc);

    var dx = src._displayOriginX + src._curveBounds.x;
    var dy = src._displayOriginY + src._curveBounds.y;

    var alpha = camera.alpha * src.alpha;

    if (src.isFilled)
    {
        FillPathWebGL(pipeline, calcMatrix, src, alpha, dx, dy);
    }

    if (src.isStroked)
    {
        StrokePathWebGL(pipeline, src, alpha, dx, dy);
    }
};

module.exports = CurveWebGLRenderer;
