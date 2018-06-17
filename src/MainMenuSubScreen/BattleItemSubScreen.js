import {Screen} from '../Screen';
import {Manager, HeroManager, MonsterManager, LogManager, EnvironmentManager, MenuManager} from '../Manager'

function BattleItemSubScreen(game) {
  Screen.call(this, game);
  this.menuManager = new BattleItemSubScreenMenuManager(this);
  this.load();
}
BattleItemSubScreen.prototype = Object.create(Screen.prototype);
BattleItemSubScreen.prototype.constructor = BattleItemSubScreen;
BattleItemSubScreen.prototype.load = function() {
  this.itemList = this.game.inventory.fetchBattleItems();
  Screen.prototype.load.call(this);
};

function BattleItemSubScreenMenuManager(screen) {
  MenuManager.call(this, screen)
}
BattleItemSubScreenMenuManager.prototype = Object.create(MenuManager.prototype);
BattleItemSubScreenMenuManager.prototype.constructor = BattleItemSubScreenMenuManager;

export {BattleItemSubScreen}
