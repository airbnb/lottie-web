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
	//layer's visibility related to inpoint and outpoint
	this.isVisible = false;
	//layer's display state
	this.hidden = false;
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
 * Initializes frame related properties.
 *
 * @param {number} num
 * current frame number in Layer's time
 * 
 */

FrameElement.prototype.checkLayerLimits = function(num) {
	if(this.data.ip - this.data.st <= num && this.data.op - this.data.st > num)
    {
        if(this.isVisible !== true){
            this.elemMdf = true;
            this.globalData.mdf = true;
            this.isVisible = true;
            this.firstFrame = true;
            if(this.data.hasMask){
                this.maskManager.firstFrame = true;
            }
        }
    }else{
        if(this.isVisible !== false){
            this.elemMdf = true;
            this.globalData.mdf = true;
            this.isVisible = false;
        }
    }
}

FrameElement.prototype.prepareFrameData = function(num) {
	this.checkLayerLimits(num);
	this.prepareProperties(num);
}

//Calculates all dynamic values
FrameElement.prototype.prepareProperties = function(num) {
    var i, len = this.dynamicProperties.length;
    for(i=0;i<len;i+=1){
        if(this.isVisible || (this._isParent && this.dynamicProperties[i].type === 'transform')){
            this.dynamicProperties[i].getValue();
            //OPTIMIZATION: check if elemMdf is already set to true
            if(this.dynamicProperties[i].mdf){
                this.elemMdf = true;
                this.globalData.mdf = true;
            }
        }
    }
    if(this.data.hasMask && this.isVisible){
        this.maskManager.prepareFrame(num*this.data.sr);
    }

    this.currentFrameNum = num*this.data.sr;
    return this.isVisible;
}