import Matrix from '../../3rd_party/transformation-matrix';
import TransformPropertyFactory from '../../utils/TransformProperty';
import effectTypes from '../../utils/helpers/effectTypes';

function TransformElement() {}

TransformElement.prototype = {
  initTransform: function () {
    var mat = new Matrix();
    this.finalTransform = {
      mProp: this.data.ks ? TransformPropertyFactory.getTransformProperty(this, this.data.ks, this) : { o: 0 },
      _matMdf: false,
      _localMatMdf: false,
      _opMdf: false,
      mat: mat,
      localMat: mat,
      localOpacity: 1,
    };
    if (this.data.ao) {
      this.finalTransform.mProp.autoOriented = true;
    }

    // TODO: check TYPE 11: Guided elements
    if (this.data.ty !== 11) {
      // this.createElements();
    }
  },
  renderTransform: function () {
    this.finalTransform._opMdf = this.finalTransform.mProp.o._mdf || this._isFirstFrame;
    this.finalTransform._matMdf = this.finalTransform.mProp._mdf || this._isFirstFrame;

    if (this.hierarchy) {
      var mat;
      var finalMat = this.finalTransform.mat;
      var i = 0;
      var len = this.hierarchy.length;
      // Checking if any of the transformation matrices in the hierarchy chain has changed.
      if (!this.finalTransform._matMdf) {
        while (i < len) {
          if (this.hierarchy[i].finalTransform.mProp._mdf) {
            this.finalTransform._matMdf = true;
            break;
          }
          i += 1;
        }
      }

      if (this.finalTransform._matMdf) {
        mat = this.finalTransform.mProp.v.props;
        finalMat.cloneFromProps(mat);
        for (i = 0; i < len; i += 1) {
          finalMat.multiply(this.hierarchy[i].finalTransform.mProp.v);
        }
      }
    }
    if (!this.localTransforms || this.finalTransform._matMdf) {
      this.finalTransform._localMatMdf = this.finalTransform._matMdf;
    }
    if (this.finalTransform._opMdf) {
      this.finalTransform.localOpacity = this.finalTransform.mProp.o.v;
    }
  },
  renderLocalTransform: function () {
    if (this.localTransforms) {
      var i = 0;
      var len = this.localTransforms.length;
      this.finalTransform._localMatMdf = this.finalTransform._matMdf;
      if (!this.finalTransform._localMatMdf || !this.finalTransform._opMdf) {
        while (i < len) {
          if (this.localTransforms[i]._mdf) {
            this.finalTransform._localMatMdf = true;
          }
          if (this.localTransforms[i]._opMdf && !this.finalTransform._opMdf) {
            this.finalTransform.localOpacity = this.finalTransform.mProp.o.v;
            this.finalTransform._opMdf = true;
          }
          i += 1;
        }
      }
      if (this.finalTransform._localMatMdf) {
        var localMat = this.finalTransform.localMat;
        this.localTransforms[0].matrix.clone(localMat);
        for (i = 1; i < len; i += 1) {
          var lmat = this.localTransforms[i].matrix;
          localMat.multiply(lmat);
        }
        localMat.multiply(this.finalTransform.mat);
      }
      if (this.finalTransform._opMdf) {
        var localOp = this.finalTransform.localOpacity;
        for (i = 0; i < len; i += 1) {
          localOp *= this.localTransforms[i].opacity * 0.01;
        }
        this.finalTransform.localOpacity = localOp;
      }
    }
  },
  searchEffectTransforms: function () {
    if (this.renderableEffectsManager) {
      var transformEffects = this.renderableEffectsManager.getEffects(effectTypes.TRANSFORM_EFFECT);
      if (transformEffects.length) {
        this.localTransforms = [];
        this.finalTransform.localMat = new Matrix();
        var i = 0;
        var len = transformEffects.length;
        for (i = 0; i < len; i += 1) {
          this.localTransforms.push(transformEffects[i]);
        }
      }
    }
  },
  globalToLocal: function (pt) {
    var transforms = [];
    transforms.push(this.finalTransform);
    var flag = true;
    var comp = this.comp;
    while (flag) {
      if (comp.finalTransform) {
        if (comp.data.hasMask) {
          transforms.splice(0, 0, comp.finalTransform);
        }
        comp = comp.comp;
      } else {
        flag = false;
      }
    }
    var i;
    var len = transforms.length;
    var ptNew;
    for (i = 0; i < len; i += 1) {
      ptNew = transforms[i].mat.applyToPointArray(0, 0, 0);
      // ptNew = transforms[i].mat.applyToPointArray(pt[0],pt[1],pt[2]);
      pt = [pt[0] - ptNew[0], pt[1] - ptNew[1], 0];
    }
    return pt;
  },
  mHelper: new Matrix(),
};

export default TransformElement;
