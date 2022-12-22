function SlotManager(animationData) {
  this.animationData = animationData;
}
SlotManager.prototype.getProp = function (data) {
  if (this.animationData.slots
    && this.animationData.slots[data.sid]
  ) {
    return Object.assign(data, this.animationData.slots[data.sid].p);
  }
  return data;
};

function slotFactory(animationData) {
  return new SlotManager(animationData);
}

export default slotFactory;
