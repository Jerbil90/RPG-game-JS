import {Screen} from '../Screen'

function SaveMenuSubScreen(game) {
  this.game = game;
  this.dataManager = game.saveDataManager;
}
SaveMenuSubScreen.prototype = Object.create(Screen.prototype);
SaveMenuSubScreen.prototype.constructor = SaveMenuSubScreen;
SaveMenuSubScreen.prototype.load = function() {
  //this.dataManager
}
