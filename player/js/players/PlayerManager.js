import BasicPlayer from './BasicPlayer';

function PlayerManager() {}

PlayerManager.prototype.createPlayer = function (type) {
  switch (type) {
    case '1':
      return createElement(BasicPlayer);
    default:
      return null;
  }
};

const playerManager = createElement(PlayerManager);

export default playerManager;
