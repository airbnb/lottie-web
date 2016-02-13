// Ease and Wizz 2.0 : outBack : First two keyframes only
// Ian Haigh (http://ianhaigh.com/easeandwizz/)
// Last built: 2009-01-08T11:11:55+11:00

// some defaults
var p = 0.8;		// period for elastic
var a = 50;			// amplitude for elastic
var s = 1.70158;	// overshoot amount for "back"

function outBack(t, b, c, d, a, p) {
    if (s == null) s = 1.70158;
    return c*((t=t/d-1)*t*((s+1)*t + s) + 1) + b;
}

function easeAndWizz() {
    try {
        var key1 = key(1);
        var key2 = key(2);
    } catch(e) {
        return null;
    }

    // determine how many dimensions the keyframes need
    var dim = 1; // It's gotta have at least ONE dimension
    try {
        key(1)[1];
        dim = 2;
        key(1)[2];
        dim = 3;
    } catch(e) {}

    t = time - key1.time;
    d = key2.time - key1.time;

    sX = key1[0];
    eX = key2[0] - key1[0];

    if (dim >= 2) {
        sY = key1[1];
        eY = key2[1] - key1[1];

        if (dim >= 3) {
            sZ = key1[2];
            eZ = key2[2] - key1[2];
        }
    }

    if ((time < key1.time) || (time > key2.time)) {
        return value;
    } else {
        val1 = outBack(t, sX, eX, d, a, p, s);
        switch (dim) {
            case 1:
                return val1;
                break;
            case 2:
                val2 = outBack(t, sY, eY, d, a, p, s);
                return [val1, val2];
                break;
            case 3:
                val2 = outBack(t, sY, eY, d, a, p, s);
                val3 = outBack(t, sZ, eZ, d, a, p, s);
                return [val1, val2, val3];
                break;
            default:
                return null;
        }
    }
}

(easeAndWizz() || value);

