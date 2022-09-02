function SlotManager(animationData) {
  this.animationData = animationData;
}
SlotManager.prototype.getProp = function (data) {
  if (this.animationData.slots
    && this.animationData.slots[data.pid]
  ) {
    return Object.assign(data, this.animationData.slots[data.pid].p);
  }
  return data;
};

function slotFactory(animationData) {
  return new SlotManager(animationData);
}

export default slotFactory;
