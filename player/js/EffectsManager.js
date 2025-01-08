import {
  extendPrototype,
} from './utils/functionExtensions';
import {
  SliderEffect,
  AngleEffect,
  ColorEffect,
  PointEffect,
  LayerIndexEffect,
  MaskIndexEffect,
  CheckboxEffect,
  NoValueEffect,
} from './effects/SliderEffect';
import DynamicPropertyContainer from './utils/helpers/dynamicProperties';

function EffectsManager(data, element) {
  var effects = data.ef || [];
  this.effectElements = [];
  var i;
  var len = effects.length;
  var effectItem;
  for (i = 0; i < len; i += 1) {
    effectItem = new GroupEffect(effects[i], element);
    this.effectElements.push(effectItem);
  }
}

function GroupEffect(data, element) {
  this.init(data, element);
}

extendPrototype([DynamicPropertyContainer], GroupEffect);

GroupEffect.prototype.getValue = GroupEffect.prototype.iterateDynamicProperties;

GroupEffect.prototype.init = function (data, element) {
  this.data = data;
  this.effectElements = [];
  this.initDynamicPropertyContainer(element);
  var i;
  var len = this.data.ef.length;
  var eff;
  var effects = this.data.ef;
  for (i = 0; i < len; i += 1) {
    eff = null;
    switch (effects[i].ty) {
      case 0:
        eff = new SliderEffect(effects[i], element, this);
        break;
      case 1:
        eff = new AngleEffect(effects[i], element, this);
        break;
      case 2:
        eff = new ColorEffect(effects[i], element, this);
        break;
      case 3:
        eff = new PointEffect(effects[i], element, this);
        break;
      case 4:
      case 7:
        eff = new CheckboxEffect(effects[i], element, this);
        break;
      case 10:
        eff = new LayerIndexEffect(effects[i], element, this);
        break;
      case 11:
        eff = new MaskIndexEffect(effects[i], element, this);
        break;
      case 5:
        eff = new EffectsManager(effects[i], element, this);
        break;
        // case 6:
      default:
        eff = new NoValueEffect(effects[i], element, this);
        break;
    }
    if (eff) {
      this.effectElements.push(eff);
    }
  }
};

class EffectsManager {
  // Add new blur effect
  applyBlurEffect(element, intensity = 5, duration = 1000) {
    const initialFilter = element.style.filter || 'blur(0px)';
    
    return {
      animate: (progress) => {
        const blurAmount = intensity * progress;
        element.style.filter = `blur(${blurAmount}px)`;
      },
      reset: () => {
        element.style.filter = initialFilter;
      }
    };
  }

  // Add color overlay effect
  applyColorOverlay(element, color = '#000000', opacity = 0.5, duration = 1000) {
    const overlay = document.createElement('div');
    overlay.style.position = 'absolute';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = color;
    overlay.style.opacity = '0';
    overlay.style.pointerEvents = 'none';
    
    element.appendChild(overlay);
    
    return {
      animate: (progress) => {
        overlay.style.opacity = (opacity * progress).toString();
      },
      reset: () => {
        element.removeChild(overlay);
      }
    };
  }

  // Add shake effect
  applyShakeEffect(element, intensity = 5, duration = 1000) {
    const originalPosition = {
      x: element.offsetLeft,
      y: element.offsetTop
    };
    
    return {
      animate: (progress) => {
        if (progress < 1) {
          const shakeX = (Math.random() - 0.5) * 2 * intensity;
          const shakeY = (Math.random() - 0.5) * 2 * intensity;
          
          element.style.transform = `translate(${shakeX}px, ${shakeY}px)`;
        } else {
          element.style.transform = 'translate(0, 0)';
        }
      },
      reset: () => {
        element.style.transform = 'translate(0, 0)';
      }
    };
  }
}

export default EffectsManager;
