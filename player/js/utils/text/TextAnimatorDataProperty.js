function TextAnimatorDataProperty(elem, animatorProps, dynamicProperties) {
	var defaultData = {propType:false};
	var getProp = PropertyFactory.getProp;
	var animatables = animatorProps.a;
	this.a = {
		r: animatables.r ? getProp(elem, animatables.r, 0, degToRads, dynamicProperties) : defaultData,
		rx: animatables.rx ? getProp(elem, animatables.rx, 0, degToRads, dynamicProperties) : defaultData,
		ry: animatables.ry ? getProp(elem, animatables.ry, 0, degToRads, dynamicProperties) : defaultData,
		sk: animatables.sk ? getProp(elem, animatables.sk, 0, degToRads, dynamicProperties) : defaultData,
		sa: animatables.sa ? getProp(elem, animatables.sa, 0, degToRads, dynamicProperties) : defaultData,
		s: animatables.s ? getProp(elem, animatables.s, 1, 0.01, dynamicProperties) : defaultData,
		a: animatables.a ? getProp(elem, animatables.a, 1, 0, dynamicProperties) : defaultData,
		o: animatables.o ? getProp(elem, animatables.o, 0, 0.01, dynamicProperties) : defaultData,
		p: animatables.p ? getProp(elem,animatables.p, 1, 0, dynamicProperties) : defaultData,
		sw: animatables.sw ? getProp(elem, animatables.sw, 0, 0, dynamicProperties) : defaultData,
		sc: animatables.sc ? getProp(elem, animatables.sc, 1, 0, dynamicProperties) : defaultData,
		fc: animatables.fc ? getProp(elem, animatables.fc, 1, 0, dynamicProperties) : defaultData,
		fh: animatables.fh ? getProp(elem, animatables.fh, 0, 0, dynamicProperties) : defaultData,
		fs: animatables.fs ? getProp(elem, animatables.fs, 0, 0.01, dynamicProperties) : defaultData,
		fb: animatables.fb ? getProp(elem, animatables.fb, 0, 0.01, dynamicProperties) : defaultData,
		t: animatables.t ? getProp(elem, animatables.t, 0, 0, dynamicProperties) : defaultData
	}

	this.s = TextSelectorProp.getTextSelectorProp(elem,animatorProps.s, dynamicProperties);
    this.s.t = animatorProps.s.t;
}