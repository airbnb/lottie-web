/**
 * @file 
 * Handles element's layer frame update.
 * Checks layer in point and out point
 *
 */

function FrameElement(){}

/**
 * @function 
 * Initializes frame related properties.
 *
 */

FrameElement.prototype.initFrame = function(){
	//set to true when inpoint is rendered
	this.firstFrame = false;
	//list of animated properties
	this.dynamicProperties = [];
    // If layer has been modified in current tick
    this._mdf = false;
}


/**
 * @function 
 * Calculates all dynamic values
 *
 * @param {number} num
 * current frame number in Layer's time
 * 
 */
FrameElement.prototype.prepareProperties = function(num, isVisible) {
    var i, len = this.dynamicProperties.length;
    for (i = 0;i < len; i += 1) {
        if (isVisible || (this._isParent && this.dynamicProperties[i].propType === 'transform')) {
            this.dynamicProperties[i].getValue();
            if (this.dynamicProperties[i].mdf) {
                this.globalData.mdf = true;
                this._mdf = true;
            }
        }
    }
}