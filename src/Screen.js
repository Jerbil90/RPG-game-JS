import {Manager, HeroManager, MonsterManager, LogManager, EnvironmentManager, MenuManager} from './Manager';
import $ from 'jquery';
//The screen class is responsible for updating and drawing all the managers, and will be given special tasks when succeded by their children
function Screen(game){
  this.game = game;
  this.environmentManager = new EnvironmentManager(this);
  //this.load();
  this.isActive = false;
  this.state = "none";
  this.lastMouseX = 0;
  this.lastMouseY = 0;
  this.mousex = 0;
  this.mousey = 0;


}
Screen.prototype.enableHandPointer = function() {
  $("#gameArea").addClass("handPointer");
}
Screen.prototype.disableHandPointer = function() {
  $("#gameArea").removeClass("handPointer");
}
Screen.prototype.setMouseDetails = function(x, y) {
  this.lastMouseY = this.mousey;
  this.lastMouseX = this.mousex;
  this.mousex = x;
  this.mousey = y;
}
Screen.prototype.activate = function () {
  this.isActive = true;
};
Screen.prototype.deactivate = function () {
  this.isActive = false;
};
//The screen calls the setUpmethods of all managers
Screen.prototype.load = function() {
  this.setUpHeroManager();
  this.setUpEnvironmentManager();
  this.setUpMonsterManager();
  this.setUpMenuManager();
}
//no all screens will have heros on them
Screen.prototype.setUpHeroManager = function() {

}
//All screens will need some dort of background
Screen.prototype.setUpEnvironmentManager = function() {
  this.environmentManager.load(this.game.state);
}
//not all screens will have monsters on them
Screen.prototype.setUpMonsterManager = function() {

}
//not all screens will have menus on them, even so, each screen will load a specific type of menuManager
Screen.prototype.setUpMenuManager = function () {

};
//this method updates the environmentManager and any other managers that are there
Screen.prototype.update = function(gameTime, elapsedTime) {
  this.environmentManager.update(gameTime, elapsedTime);
  if (this.heroManager != null) {
    this.heroManager.update(gameTime, elapsedTime);
  }
  if (this.monsterManager != null) {
    this.monsterManager.update(gameTime, elapsedTime);
  }
  if (this.menuManager != null) {
    this.menuManager.update(gameTime, elapsedTime);
  }
}
//this method draws the environment and any other managers there are present
Screen.prototype.draw = function(ctx) {
  this.environmentManager.draw(ctx);
  if(this.heroManager != null) {
    this.heroManager.draw(ctx);
  }
  if(this.monsterManager != null) {
    this.monsterManager.draw(ctx);
  }
  if(this.menuManager != null) {
    this.menuManager.draw(ctx);
  }
}

export {Screen}
