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
	//used to update dynamic properties when inpoint or outpoint are rendered. Check if it can be removed
	this.elemMdf = false;
	//set to true when inpoint is rendered
	this.firstFrame = false;
	//current frame number and last frame number. Used in HBaseElement. Check if needed.
	this.currentFrameNum = -99999;
	this.lastNum = -99999;
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
    for(i=0;i<len;i+=1){
        if(isVisible || (this._isParent && this.dynamicProperties[i].type === 'transform')){
            this.dynamicProperties[i].getValue();
            //OPTIMIZATION: check if validating that elemMdf is already set to true would be quicker
            if(this.dynamicProperties[i].mdf){
                this.elemMdf = true;
                this.globalData.mdf = true;
            }
        }
    }

    this.currentFrameNum = num*this.data.sr;
}