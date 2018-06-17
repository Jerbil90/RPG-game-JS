import {Menu, HeroSelectionMenu, ActionMenu, SpecialMenu, ItemMenu, MonsterTargetMenu, HeroTargetMenu, TurnConfirmButton, BattleSelectMenu} from './Menu';
import {Manager, HeroManager, MonsterManager, LogManager, EnvironmentManager, MenuManager} from './Manager';
import {Screen} from './Screen';
import {StatsSubScreen} from './MainMenuSubScreen/StatsSubScreen';
import {BattleItemSubScreen} from './MainMenuSubScreen/BattleItemSubScreen';
import {InventorySubScreen} from './MainMenuSubScreen/InventorySubScreen';
import {EquipmentSubScreen} from './MainMenuSubScreen/EquipmentSubScreen';
import {SpecialMoveSubScreen} from './MainMenuSubScreen/SpecialMoveSubScreen';

function MainMenuScreen(game) {
  this.game = game;
  this.menuManager = new MainMenuManager(this);
  this.heroManager = new HeroManager(this);
  this.heroManager.load(game.userHeroList);
  Screen.call(this, game);
  this.state = "none";
  this.monsterList = null;
  this.heroManager.load(this.game.userHeroList);
  this.subScreenList = [];
  //console.log("constructing subScreens...");
  this.subScreenList.push(new StatsSubScreen(this.game));
  //console.log("StatsSubScreen successfully constructed!");
  this.subScreenList.push(new InventorySubScreen(this.game));
  //console.log("InventorySubScreen successfully constructed!");
  this.subScreenList.push(new BattleItemSubScreen(this.game));
  //console.log("BattleItemSubScreen successfully constructed!");
  this.subScreenList.push(new EquipmentSubScreen(this.game));
  //console.log("EquipmentSubScreen successfully constructed!");
  this.subScreenList.push(new SpecialMoveSubScreen(this.game));
  //console.log("SpecialSubScreen successfully constructed!");
  this.currentSubScreenIndex = -1;
}
MainMenuScreen.prototype = Object.create(Screen.prototype);
MainMenuScreen.prototype.constructor = MainMenuScreen;
MainMenuScreen.prototype.setMouseDetails = function(x, y) {
  if(this.currentSubScreenIndex == -1) {
    Screen.prototype.setMouseDetails.call(this, x, y);
  }
  else {
    this.subScreenList[this.currentSubScreenIndex].setMouseDetails(x, y);
  }
}
MainMenuScreen.prototype.load = function() {
  this.isActive = true;
  this.state = "loading";
  Screen.prototype.load.call(this);
}
MainMenuScreen.prototype.setUpMenuManager = function() {
  this.menuManager.load();
}
MainMenuScreen.prototype.update = function(gameTime, elapsedTime) {
  if(this.state == "loading") {
    this.state = "waiting for input";
  }
  switch(this.currentSubScreenIndex) {
    case -1:
    Screen.prototype.update.call(this, gameTime, elapsedTime);
    break;
    case 0:
    this.subScreenList[0].update(gameTime, elapsedTime);
    if(this.subScreenList[0].isScreenOver) {
      this.subScreenList[0].isScreenOver = false;
      this.currentSubScreenIndex = -1;
    }
    break;
    case 1:
    this.subScreenList[1].update(gameTime, elapsedTime);
    if(this.subScreenList[1].isScreenOver) {
      this.subScreenList[1].isScreenOver = false;
      this.currentSubScreenIndex = -1;
    }
    break;
    case 2:
    this.subScreenList[2].update(gameTime, elapsedTime);
    if(this.subScreenList[2].isScreenOver) {
      this.subScreenList[2].isScreenOver = false;
      this.currentSubScreenIndex = -1;
    }
    break;
    case 3:
    this.subScreenList[3].update(gameTime, elapsedTime);
    if(this.subScreenList[3].isScreenOver) {
      this.subScreenList[3].isScreenOver = false;
      this.currentSubScreenIndex = -1;
    }
    break;
    case 4:
    this.subScreenList[4].update(gameTime, elapsedTime);
    if(this.subScreenList[4].isScreenOver) {
      this.subScreenList[4].isScreenOver = false;
      this.currentSubScreenIndex = -1;
    }
    break;
  }

  if(this.menuManager.isScreenOver) {
    this.state = "exiting"
    this.isActive = false;
  }
}
MainMenuScreen.prototype.draw = function(ctx) {
  if(this.currentSubScreenIndex == -1) {
    Screen.prototype.draw.call(this, ctx);
  }
  else {
    this.subScreenList[this.currentSubScreenIndex].draw(ctx);
    //console.log("drawing subMenu" + this.currentSubScreenIndex);
  }
}

function MainMenuManager(screen) {
  MenuManager.call(this, screen);
  this.isScreenOver = false;
}
MainMenuManager.prototype = Object.create(MenuManager.prototype);
MainMenuManager.prototype.constructor = MainMenuManager;
MainMenuManager.prototype.load = function() {
  var mainMenu = new MainMenu(this.screen);
  mainMenu.setPosition(30, 30);
  mainMenu.load();
  mainMenu.isActive = true;
  mainMenu.isVisible = true;
  this.assetList.push(mainMenu);
}
MainMenuManager.prototype.select = function(i, j) {
  if(j==0) {
    console.log("Stats Selected");
    this.screen.currentSubScreenIndex = j;
  }
  else if(j==1) {
    console.log("Inventory Selected");
    this.screen.currentSubScreenIndex = j;
  }
  else if(j==2) {
    console.log("Battle Items Selected");
    this.screen.currentSubScreenIndex = j;
  }
  else if(j==3) {
    console.log("Equipment Selected");
    this.screen.currentSubScreenIndex = j;
    this.screen.subScreenList[3].load();
  }
  else if(j==4) {
    console.log("Special Moves Selected");
    this.screen.currentSubScreenIndex = j;
  }
  else if(j==5) {
    console.log("Exit Selected");
    this.isScreenOver = true;
  }
}
MainMenuManager.prototype.handleClick = function() {
  if(this.screen.currentSubScreenIndex == -1) {
    MenuManager.prototype.handleClick.call(this);
  }
  else {
    this.screen.subScreenList[this.screen.currentSubScreenIndex].menuManager.handleClick();
  }
}

function MainMenu(screen) {
  this.screen = screen;
  Menu.call(this, screen);
  this.isActive = true;
  this.isVisible = true;
}
MainMenu.prototype = Object.create(Menu.prototype);
MainMenu.prototype.constructor = MainMenu;
MainMenu.prototype.load = function() {
  let label1 = {name: "Stats", applicableTarget: true};
  let label2 = {name: "Inventory", applicableTarget: true};
  let label5 = {name: "Battle Items", applicableTarget: true};
  let label4 = {name: "Equipment", applicableTarget: true};
  let label3 = {name: "Special Moves", applicableTarget: true};
  let label6 = {name: "Exit", applicableTarget: true};
  let buttonList = [label1, label2, label3, label4, label5, label6];
  this.setOptions(buttonList);
}

export {MainMenuScreen}
