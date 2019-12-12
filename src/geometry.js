export default class TargetSurfaceGeometry {
    constructor(width, targetWidth, scale) {
        this.scale = scale;
        this.ratio = targetWidth / width;
    }

    transform(val) {
        return val * this.ratio / this.scale;
    }

    transformPoint(x, y) {
        return [this.transform(x), this.transform(y)];
    }

    cellPixelSize(targetLetterSize) {
        return targetLetterSize / this.ratio * this.scale;
    }
}