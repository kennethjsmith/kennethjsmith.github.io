/**
 * draws bounding box to the screen
 */
const drawBoundingBox = (boundingBox, ctx, game, color) => {
  ctx.save();
  ctx.fillStyle = color;
  ctx.globalAlpha = 0.25;
  ctx.fillRect(boundingBox.x - game.camera.x, boundingBox.y - game.camera.y, boundingBox.width, boundingBox.height);
  ctx.restore();
};

