import {Menu, HeroSelectionMenu, ActionMenu, SpecialMenu, ItemMenu, MonsterTargetMenu, HeroTargetMenu, TurnConfirmButton, BattleSelectMenu} from './Menu';
import {SurManager} from './main';
import {Manager, HeroManager, MonsterManager, LogManager, EnvironmentManager, MenuEnvironmentManager} from './Manager';

function MainMenuScreen(previousScreen) {
  this.previousScreen = previousScreen;
  this.surManager = new MainMenuScreenSurManager(previousScreen);
}
MainMenuScreen.prototype.update = function(gameTime, elapsedTime) {
  this.surManager.update(gameTime, elapsedTime)
}
MainMenuScreen.prototype.draw = function(ctx) {
  this.surManager.draw(ctx);
}

function MainMenuScreenSurManager(previousScreen) {
  SurManager.call(this);
  this.menuManager = new MainMenuScreenMenuManager();
  this.menuManager.setSurManager(this);
  this.menuManager.load();
  this.heroManager = previousScreen.surManager.heroManager;
  this.logManager = previousScreen.logManager;
  this.environmentManager = new MenuEnvironmentManager();
}
MainMenuScreenSurManager.prototype = Object.create(SurManager.prototype);
MainMenuScreenSurManager.prototype.constructor = MainMenuScreenSurManager;

function MainMenuScreenMenuManager() {
  Manager.call(this);
  this.isScreenOver = false;
}
MainMenuScreenMenuManager.prototype = Object.create(Manager.prototype);
MainMenuScreenMenuManager.prototype.constructor = MainMenuScreenMenuManager;
MainMenuScreenMenuManager.prototype.load = function() {
  let mainMenu = new MainMenu();
  mainMenu.setSurManager(this.surManager);
  mainMenu.setPosition(30, 30);
  mainMenu.load();
  mainMenu.isActive = true;
  mainMenu.isVisible = true;
  this.assetList.push(mainMenu);
}
MainMenuScreenMenuManager.prototype.update = function(gameTime, elapsedTime) {
  for(let i = 0 ; i < this.assetList.length ; i++) {
    this.assetList[i].update(gameTime, elapsedTime);
  }
  this.cursorHoverCheck();
  //console.log("MainMenuScreenMenuManager updated successfully");
}
MainMenuScreenMenuManager.prototype.cursorHoverCheck = function() {
  let cursorHover = false;
  for(let i = 0; i<this.assetList.length; i++) {
    this.assetList[i].hoverCheck();
    if (this.assetList[i].cursorHover) {
      cursorHover = true;
      break;
    }
  }
  if(cursorHover) {
    this.surManager.enableHandPointer();
  }
  else {
    this.surManager.disableHandPointer();
  }
}
MainMenuScreenMenuManager.prototype.handleClick = function() {
  for(let i = 0 ; i< this.assetList.length ; i++) {
    for(let j = 0 ; j < this.assetList[i].menuButtonList.length ; j++) {
      if(this.assetList[i].menuButtonList[j].cursorHover) {
        this.assetList[i].select(j);
        if(j==0) {
          console.log("Stats Selected");
        }
        else if(j==1) {
          console.log("Inventory Selected");
        }
        else if(j==2) {
          console.log("Battle Items Selected");
        }
        else if(j==3) {
          console.log("Equipment Selected");
        }
        else if(j==4) {
          console.log("Special Moves Selected");
        }
        else if(j==5) {
          console.log("Exit Selected");
          this.isScreenOver = true;
        }
      }
    }
  }
}
MainMenuScreenMenuManager.prototype.draw = function(ctx) {
  for(let i = 0 ; i < this.assetList.length ; i++) {
    this.assetList[i].draw(ctx);
  }
}

function MainMenu() {
  Menu.call(this);
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
