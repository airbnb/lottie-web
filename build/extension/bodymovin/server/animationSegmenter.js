const layerTypes = {
	precomp : 0,
    solid : 1,
    still : 2,
    nullLayer : 3,
    shape : 4,
    text : 5,
    audio : 6,
    pholderVideo : 7,
    imageSeq : 8,
    video : 9,
    pholderStill : 10,
    guide : 11,
    adjustment : 12,
    camera : 13,
    light : 14
}

let animationSegments

function random(len) {
    var sequence = 'abcdefghijklmnoqrstuvwxyz1234567890', returnString = '', i;
    for (i = 0; i < len; i += 1) {
        returnString += sequence.charAt(Math.floor(Math.random() * sequence.length));
    }
    return returnString;
}

function addCompsToSegment(layers, comps, segmentComps) {
    var i, len = layers.length, j, jLen;
    for (i = 0; i < len; i += 1) {
        if (layers[i].ty === layerTypes.precomp) {
            j = 0;
            jLen = comps.length;
            while (j < jLen) {
                if (comps[j].id === layers[i].refId) {
                    segmentComps.push(comps.splice(j, 1)[0]);
                    addCompsToSegment(segmentComps[segmentComps.length - 1].layers, comps, segmentComps);
                    break;
                }
                j += 1;
            }
        }
    }
}

function moveCompsAssetsToCompsArray(data) {
	if(!data.assets) {
		return;
	}
	var assets = data.assets;
	var comps = [];
	var i = 0, len = assets.length;
	var splicedComp;
	while (i < len) {
		if (assets[i].layers) {
			splicedComp = assets.splice(i, 1);
			comps.push(splicedComp[0]);
			i -= 1;
			len -= 1;
		}
		i += 1;
	}
	data.comps = comps;
}

function splitAnimation(data, time) {
	moveCompsAssetsToCompsArray(data);
    var comps = data.comps;
    var layers = data.layers;
    var frameRate = data.fr;
    var totalFrames = data.op - data.ip;
    var i, len = layers.length, j, jLen;
    var currentSegment = time * frameRate;
    var segmentLength = time * frameRate;
    animationSegments = [];
    var currentPeriod, segments, segmentComps;
    for (i = 0; i < len; i += 1) {
        if (layers[i].ip < currentSegment) {
            if (layers[i].ty === layerTypes.precomp) {
                if (!segmentComps) {
                    segmentComps = [];
                }
                j = 0;
                jLen = comps.length;
                while (j < jLen) {
                    if (comps[j].id === layers[i].refId) {
                        segmentComps.push(comps.splice(j, 1)[0]);
                        addCompsToSegment(segmentComps[segmentComps.length - 1].layers, comps, segmentComps);
                        break;
                    }
                    j += 1;
                }
            }
        }
    }

    if (data.assets && segmentComps && segmentComps.length) {
        data.assets = data.assets.concat(segmentComps);
        if (data.comps) {
            delete data.comps;
        }
    } else if(segmentComps) {
        data.assets = segmentComps;
    }
    
    var timeData;
    
    while (currentSegment < totalFrames) {
        currentPeriod = null;
        segmentComps = null;
        for (i = 0; i < len; i += 1) {
            if (layers[i].ip >= currentSegment && layers[i].ip < currentSegment + segmentLength) {
                if (!segments) {
                    segments = [];
                }
                if (layers[i].ty === layerTypes.precomp) {
                    if (!segmentComps) {
                        segmentComps = [];
                    }
                    j = 0;
                    jLen = comps.length;
                    while (j < jLen) {
                        if (comps[j].id === layers[i].refId) {
                            segmentComps.push(comps.splice(j, 1)[0]);
                            addCompsToSegment(segmentComps[segmentComps.length - 1].layers, comps, segmentComps);
                            break;
                        }
                        j += 1;
                    }
                }
                if (!currentPeriod) {
                    timeData = currentSegment / frameRate;
                    currentPeriod = {
                        layers: []
                    };
                }
                var randomId = random(10);
                layers[i].id = randomId;
                currentPeriod.layers.push(layers[i]);
                layers[i] = {
                    id: randomId,
                    ty: 99
                };
            }
        }
        if (currentPeriod) {
            currentPeriod.assets = segmentComps;
            animationSegments.push(currentPeriod);
            segments.push({
                time: timeData
            });
        }
        currentSegment += segmentLength;
    }
    data.segments = segments;
}

function split(data, time) {
	splitAnimation(data, time)
	
	//
	return {
		main: data,
		segments: [...animationSegments],
	};
}

module.exports = split;