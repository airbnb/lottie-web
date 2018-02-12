function addDynamicProperty(prop) {
	if(this.dynamicProperties.indexOf(prop) === -1) {
        this.dynamicProperties.push(prop);
        this.container.addDynamicProperty(this);
    }
}