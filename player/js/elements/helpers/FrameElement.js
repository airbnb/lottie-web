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
        //TODO change .type to .propType
        if (isVisible || (this._isParent && this.dynamicProperties[i].type === 'transform')) {
            this.dynamicProperties[i].getValue(this.firstFrame);
            if (this.dynamicProperties[i].mdf) {
                this.globalData.mdf = true;
            }
        }
    }
}