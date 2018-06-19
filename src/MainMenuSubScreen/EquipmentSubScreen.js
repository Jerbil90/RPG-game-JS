import {Screen} from '../Screen'
import {Manager, HeroManager, MonsterManager, LogManager, EnvironmentManager, MenuManager} from '../Manager'
import {Menu, HeroSelectionMenu, ActionMenu, SpecialMenu, ItemMenu, MonsterTargetMenu, HeroTargetMenu, TurnConfirmButton, BattleSelectMenu} from '../Menu';
import {Item, BattleItem, MinorHealthPotion, Antidote, Equipment} from '../Item'

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
  //console.log("EquipmentSubScreenMenuManager constructor...");
  //console.log(this.heroMenu);
  this.assetList.push(heroMenu);
  var equippedMenu = new EquippedMenu(this.screen);
  this.assetList.push(equippedMenu);
  //equippedMenu.setOptions(this.screen.heroManager.assetList[0].equipment);
  var equipmentMenu = new EquipmentMenu(this.screen);
  equipmentMenu.setPosition(450, 100);
  this.assetList.push(equipmentMenu);
  this.assetList.push(new MainMenuButton(this.screen));
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
  this.assetList[1].isActive = false;
  this.assetList[1].isVisible = false;
  this.assetList[2].isActive = false;
  this.assetList[2].isVisible = false;
  this.assetList[3].isVisible = true;
  this.assetList[3].isActive = true;
  console.log(this.assetList[0]);
}
EquipmentSubScreenMenuManager.prototype.update = function(gameTime, elapsedTime) {
  MenuManager.prototype.update.call(this, gameTime, elapsedTime);
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
    this.assetList[2].isVisible = false;
    this.assetList[2].isActive = false;
    this.assetList[1].resetMenu();
    this.assetList[1].setOptions(this.screen.heroManager.assetList[j].equipment);
    this.currentlySelectedHeroIndex = j;
    this.currentlySelectedEquippedIndex = -1;
    this.setEquippedList();
  }
  else if(i == 0 && this.currentlySelectedHeroIndex == j) {
    console.log("Same Hero selected, unassigning...");
    this.assetList[1].resetMenu();
    this.assetList[1].isVisible = false;
    this.assetList[1].isActive = false;
    this.assetList[2].isVisible = false;
    this.assetList[2].isActive = false;
    this.currentlySelectedHeroIndex = -1;
    this.currentlySelectedEquippedIndex = -1;
  }
  else if(i == 1 && this.currentlySelectedEquippedIndex != j) {
    console.log("New Equipped Slot selected, assigning...");
    this.assetList[2].isVisible = true;
    this.assetList[2].isActive = true;
    this.currentlySelectedEquippedIndex = j;
    this.setValidEquipmentList();
  }
  else if(i == 1 && this.currentlySelectedEquippedIndex == j) {
    console.log("Same Equipped Slot Selected, unassigning");
    this.assetList[2].isActive = false;
    this.assetList[2].isVisible = false;
    this.currentlySelectedEquippedIndex = -1;

  }
  else if(i == 2) {
    console.log("new piece of equipment selected, assigning...");
    this.assetList[2].isActive = false;
    this.assetList[2].isVisible = false;
    this.screen.heroManager.assetList[this.currentlySelectedHeroIndex].equipment.splice(this.currentlySelectedEquippedIndex, 1, this.assetList[i].menuButtonList[j].target);
    this.setEquippedList();
    this.currentlySelectedEquippedIndex = -1;
    this.assetList[1].resetMenu();
    this.assetList[2].resetMenu();
  }
  else if(i == 3) {
    this.screen.isScreenOver = true;
  }
}
EquipmentSubScreenMenuManager.prototype.setEquippedList = function() {
  this.assetList[1].setOptions(this.screen.heroManager.assetList[this.currentlySelectedHeroIndex].equipment);
}
EquipmentSubScreenMenuManager.prototype.setValidEquipmentList = function () {
  var equipmentList = []
  switch(this.currentlySelectedEquippedIndex){
    case 0:
    for(let i = 0 ; i < this.screen.itemList.length ; i++) {
      //if the character is capable of equiping this item in the currentlySelectedEquipped slot
      if(this.screen.heroManager.assetList[this.currentlySelectedHeroIndex].mainHandEquipCheck(this.screen.itemList[i])) {
        //if the player has enough pieces of the given equipment considering how many other heores are currently useing it
        if(this.screen.game.inventory.isEquipmentAvaliable(this.screen.itemList[i], this.screen.heroManager.assetList[this.currentlySelectedHeroIndex].equipment[this.currentlySelectedEquippedIndex])) {
          equipmentList.push(this.screen.itemList[i]);
        }
      }
    }
    break;
    case 1:
    for(let i = 0 ; i < this.screen.itemList.length ; i++) {
      if(this.screen.heroManager.assetList[this.currentlySelectedHeroIndex].offHandEquipCheck(this.screen.itemList[i])) {
        if(this.screen.game.inventory.isEquipmentAvaliable(this.screen.itemList[i], this.screen.heroManager.assetList[this.currentlySelectedHeroIndex].equipment[this.currentlySelectedEquippedIndex])) {
          equipmentList.push(this.screen.itemList[i]);
        }
      }
    }
    break;
    case 2:
    for(let i = 0 ; i < this.screen.itemList.length ; i++) {
      if(this.screen.heroManager.assetList[this.currentlySelectedHeroIndex].headArmourEquipCheck(this.screen.itemList[i])) {
        if(this.screen.game.inventory.isEquipmentAvaliable(this.screen.itemList[i], this.screen.heroManager.assetList[this.currentlySelectedHeroIndex].equipment[this.currentlySelectedEquippedIndex])) {
          equipmentList.push(this.screen.itemList[i]);
        }
      }
    }
    break;
    case 3:
    for(let i = 0 ; i < this.screen.itemList.length ; i++) {
      if(this.screen.heroManager.assetList[this.currentlySelectedHeroIndex].bodyArmourEquipCheck(this.screen.itemList[i])) {
        if(this.screen.game.inventory.isEquipmentAvaliable(this.screen.itemList[i], this.screen.heroManager.assetList[this.currentlySelectedHeroIndex].equipment[this.currentlySelectedEquippedIndex])) {
          equipmentList.push(this.screen.itemList[i]);
        }
      }
    }
    break;
    case 4:
    for(let i = 0 ; i < this.screen.itemList.length ; i++) {
      if(this.screen.heroManager.assetList[this.currentlySelectedHeroIndex].handArmourEquipCheck(this.screen.itemList[i])) {
        if(this.screen.game.inventory.isEquipmentAvaliable(this.screen.itemList[i], this.screen.heroManager.assetList[this.currentlySelectedHeroIndex].equipment[this.currentlySelectedEquippedIndex])) {
          equipmentList.push(this.screen.itemList[i]);
        }
      }
    }
    break;
    case 5:
    for(let i = 0 ; i < this.screen.itemList.length ; i++) {
      if(this.screen.heroManager.assetList[this.currentlySelectedHeroIndex].footArmourEquipCheck(this.screen.itemList[i])) {
        if(this.screen.game.inventory.isEquipmentAvaliable(this.screen.itemList[i], this.screen.heroManager.assetList[this.currentlySelectedHeroIndex].equipment[this.currentlySelectedEquippedIndex])) {
          equipmentList.push(this.screen.itemList[i]);
        }
      }
    }
    break;
    case 6:
    for(let i = 0 ; i < this.screen.itemList.length ; i++) {
      if(this.screen.heroManager.assetList[this.currentlySelectedHeroIndex].accessoryEquipCheck(this.screen.itemList[i])) {
        if(this.screen.game.inventory.isEquipmentAvaliable(this.screen.itemList[i], this.screen.heroManager.assetList[this.currentlySelectedHeroIndex].equipment[this.currentlySelectedEquippedIndex])) {
          equipmentList.push(this.screen.itemList[i]);
        }
      }
    }
    break;
    case 7:
    for(let i = 0 ; i < this.screen.itemList.length ; i++) {
      if(this.screen.heroManager.assetList[this.currentlySelectedHeroIndex].accessoryEquipCheck(this.screen.itemList[i])) {
        if(this.screen.game.inventory.isEquipmentAvaliable(this.screen.itemList[i], this.screen.heroManager.assetList[this.currentlySelectedHeroIndex].equipment[this.currentlySelectedEquippedIndex])) {
          equipmentList.push(this.screen.itemList[i]);
        }
      }
    }
    break;
    default:
    console.log("Error in setValidEquipmentList, invalid currentlySelectedEquippedIndex");
    break;
  }
  this.assetList[2].setOptions(equipmentList);
};

function EquippedMenu(screen) {
  this.screen = screen;
  Menu.call(this, screen);
  this.setPosition(150, 100);
  this.equippedLabels = [];
  this.equippedLabels.push("Main-H");
  this.equippedLabels.push("Off-H");
  this.equippedLabels.push("Head");
  this.equippedLabels.push("Body");
  this.equippedLabels.push("Hand");
  this.equippedLabels.push("Foot");
  this.equippedLabels.push("Acc1");
  this.equippedLabels.push("Acc2");
}
EquippedMenu.prototype = Object.create(Menu.prototype);
EquippedMenu.prototype.constructor = EquippedMenu;
EquippedMenu.prototype.draw = function(ctx) {

  if(this.isVisible) {
    ctx.fillStyle = this.menuColor;
    ctx.fillRect(this.position.x-80, this.position.y, 240, 240);
    for(let i = 0 ; i < this.menuButtonList.length ; i++) {
      ctx.font = "20px serif";
      ctx.fillText(this.equippedLabels[i], this.position.x-75, this.position.y+5 + 25*i);
      this.menuButtonList[i].draw(ctx);
    }
  }
}

//This is the menu that the player choses which item to equip
function EquipmentMenu(screen) {
  Menu.call(this, screen);
}
EquipmentMenu.prototype = Object.create(Menu.prototype);
EquipmentMenu.prototype.constructor = EquipmentMenu;
//in addition to the pieces of equipment the player can chose none to remove a piece of equipment
EquipmentMenu.prototype.setOptions = function(options) {
  var optionListPlus = [];
  optionListPlus.push(new Equipment("none"));
  for(let i = 0 ; i < options.length ; i++) {
    optionListPlus.push(options[i]);
  }
  this.optionList = optionListPlus;
  this.compileMenu();
}

function MainMenuButton(screen) {
  Menu.call(this, screen);
  this.setPosition(0, 390);
  this.setOptions([{applicableTarget: true, name: "Main Menu"}]);
}
MainMenuButton.prototype = Object.create(Menu.prototype);
MainMenuButton.prototype.constructor = MainMenuButton;

export {EquipmentSubScreen}
