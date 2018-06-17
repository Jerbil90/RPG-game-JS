import {Screen} from '../Screen'
import {Manager, HeroManager, MonsterManager, LogManager, EnvironmentManager, MenuManager} from '../Manager'

function InventorySubScreen(game) {
  Screen.call(this, game);
  this.menuManager = new InventorySubScreenMenuManager(this);
  this.itemList = this.game.userItemList;
  this.load();
}
InventorySubScreen.prototype = Object.create(Screen.prototype);
InventorySubScreen.prototype.constructor = InventorySubScreen;

function InventorySubScreenMenuManager(screen) {
  MenuManager.call(this, screen)
}
InventorySubScreenMenuManager.prototype = Object.create(MenuManager.prototype);
InventorySubScreenMenuManager.prototype.constructor = InventorySubScreenMenuManager;

export {InventorySubScreen}
