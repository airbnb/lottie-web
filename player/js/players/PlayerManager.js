function PlayerManager(){}

PlayerManager.prototype.createPlayer = function(type){
    switch(type){
        case '1':
            return createElement(BasicPlayer);
    }
};

var playerManager = createElement(PlayerManager);