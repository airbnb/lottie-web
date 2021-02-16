/* global BasicPlayer, createElement */
/* exported playerManager */

function PlayerManager() {}

PlayerManager.prototype.createPlayer = function (type) {
  switch (type) {
    case '1':
      return createElement(BasicPlayer);
    default:
      return null;
  }
};

var playerManager = createElement(PlayerManager);
