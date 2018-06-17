import {Screen} from '../Screen'
import {Manager, HeroManager, MonsterManager, LogManager, EnvironmentManager, MenuManager} from '../Manager'

function StatsSubScreen(game) {
  Screen.call(this, game);
  this.menuManager = new StatsSubScreenMenuManager(this);
  this.heroManager = new HeroManager(this);
}
StatsSubScreen.prototype = Object.create(Screen.prototype);
StatsSubScreen.prototype.constructor = StatsSubScreen;

function StatsSubScreenMenuManager(screen) {
  MenuManager.call(this, screen)
}
StatsSubScreenMenuManager.prototype = Object.create(MenuManager.prototype);
StatsSubScreenMenuManager.prototype.constructor = StatsSubScreenMenuManager;

export {StatsSubScreen}
