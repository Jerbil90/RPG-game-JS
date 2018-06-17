import {Screen} from '../Screen'
import {Manager, HeroManager, MonsterManager, LogManager, EnvironmentManager, MenuManager} from '../Manager'
import {Menu, HeroSelectionMenu, ActionMenu, SpecialMenu, ItemMenu, MonsterTargetMenu, HeroTargetMenu, TurnConfirmButton, BattleSelectMenu} from '../Menu';


function EquipmentSubScreen(game) {
  this.name = "equipmentScreen";
  Screen.call(this, game);
  this.heroManager = new HeroManager(this);
  this.setUpHeroManager();
  this.menuManager = new EquipmentSubScreenMenuManager(this);
  this.load();
}
EquipmentSubScreen.prototype = Object.create(Screen.prototype);
EquipmentSubScreen.prototype.constructor = EquipmentSubScreen;
EquipmentSubScreen.prototype.load = function () {
  this.itemList = this.game.inventory.fetchEquipment();
  Screen.prototype.load.call(this);
  this.isActive = true;
  this.state = "waiting for input";
};
EquipmentSubScreen.prototype.setUpHeroManager = function() {
  var partyHeroes = this.getPartyHeros();
  this.heroManager.load(partyHeroes);
}
EquipmentSubScreen.prototype.setUpMenuManager = function() {
  this.menuManager.load();
}
EquipmentSubScreen.prototype.update = function(gameTime, elapsedTime) {
  Screen.prototype.update.call(this, gameTime, elapsedTime);
  //console.log("updating equpiment subscreen, menuState: " + this.menuManager.assetList[0].isActive);
}

function EquipmentSubScreenMenuManager(screen) {
  MenuManager.call(this, screen);
  var heroMenu = new Menu(this.screen);
  heroMenu.setOptions(this.screen.heroManager.assetList);
  this.assetList.push(heroMenu);
  var equippedMenu = new Menu(this.screen);
  this.assetList.push(equippedMenu);
  //equippedMenu.setOptions(this.screen.heroManager.assetList[0].equipment);
  var equipmentMenu = new Menu(this.screen);
  this.assetList.push(equipmentMenu);
  this.currentValidEquipment = [];
  this.currentlySelectedHeroIndex = -1;
  this.currentlySelectedEquippedIndex = -1;
  //equipmentMenu.setOptions(this.currentValidEquipment);
}
EquipmentSubScreenMenuManager.prototype = Object.create(MenuManager.prototype);
EquipmentSubScreenMenuManager.prototype.constructor = EquipmentSubScreenMenuManager;
EquipmentSubScreenMenuManager.prototype.load = function() {
  this.resetAll();
  this.assetList[0].isActive = true;
  this.assetList[0].isVisible = true;
}
EquipmentSubScreenMenuManager.prototype.update = function(gameTime, elapsedTime) {
  MenuManager.prototype.update.call(this, gameTime, elapsedTime);
  console.log("updating EquipmentMenuManager, x: " + this.screen.mousex + "\ty: " + this.screen.mousey);
}
EquipmentSubScreenMenuManager.prototype.checkValidEquipment = function() {
  this.currentValidEquipment = [];
  for(let i = 0 ; i < this.screen.itemList.length ; i++) {
    if(this.screen.heroManager.assetList[this.currentlySelectedHeroIndex].canUseThisEquipment(this.screen.itemList[i])) {
      this.currentValidEquipment.push(this.screen.itemList[i]);
    }
  }
}
EquipmentSubScreenMenuManager.prototype.select = function(i, j) {
  if(i == 0 && this.currentlySelectedHeroIndex != j) {
    console.log("New Hero selected, assigning...");
    this.assetList[1].isActive = true;
    this.assetList[1].isVisible = true;
    this.assetList[1].resetMenu();
    this.assetList[1].setOptions(this.heroManager.assetList[j].equipment);
  }
  else if(i == 0 && this.currentlySelectedHeroIndex == j) {
    console.log("Same Hero selected, unassigning...");
    this.assetList[1].resetMenu();
    this.assetList[1].isVisible = false;
    this.assetList[1].isActive = false;
    this.assetList[2].isVisible = false;
    this.assetList[2].isActive = false;
  }
  else if(i == 1 && this.currentlySelectedEquippedIndex != j) {
    console.log("New Equipped Slot selected, assigning...");
    this.assetList[2].isVisible = true;
    this.assetList[2].isActive = true;
  }
  else if(i == 1 && this.currentlySelectedEquippedIndex == j) {
    console.log("Same Equipped Slot Selected, unassigning");
    this.assetList[2].isActive = false;
    this.assetList[2].isVisble = false;
  }
  else if(i == 2) {
    console.log("new piece of equipment selected, assigning...");
  }
}

export {EquipmentSubScreen}
