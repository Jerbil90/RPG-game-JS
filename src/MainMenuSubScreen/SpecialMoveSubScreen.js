import {Screen} from '../Screen'
import {Manager, HeroManager, MonsterManager, LogManager, EnvironmentManager, MenuManager} from '../Manager'

function SpecialMoveSubScreen(game) {
  Screen.call(this, game);
  this.menuManager = new SpecialMoveSubScreenMenuManager(this);
  this.heroManager = new HeroManager(this);
  this.heroManager.load(this.game.userHeroList);
  this.load();
}
SpecialMoveSubScreen.prototype = Object.create(Screen.prototype);
SpecialMoveSubScreen.prototype.constructor = SpecialMoveSubScreen;

function SpecialMoveSubScreenMenuManager(screen) {
  MenuManager.call(this, screen)
}
SpecialMoveSubScreenMenuManager.prototype = Object.create(MenuManager.prototype);
SpecialMoveSubScreenMenuManager.prototype.constructor = SpecialMoveSubScreenMenuManager;

export {SpecialMoveSubScreen}
