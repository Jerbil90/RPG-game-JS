//MENU CLASS/////////////////////////

//This is the constructor function for the Menu class, this class is the parent of all menus that the user will use throughout the game
function Menu() {
  this.counter = 0;
  this.isVisible = true;
  this.isActive = true;
  this.position = {x:0,y:0};
  this.cursorHover = false;
  this.menuClicked = false;
  this.menuColor = "rgb(200, 0, 0)";
  this.target = -1;
  this.targetAcquired = false;
  //this holds references to the actual instances of objects that are refered to by the menu
  this.optionList = [];
  //this holds the menuButtons that will make up the basis for the user interface
  this.menuButtonList = [];
}
//This method is reposible for setting a reference to the surmanager, this allows the menu to talk to the managers to request lists of items/heros/enemies etc
Menu.prototype.setSurManager = function(surManager) {
  this.surManager = surManager;
}
//This method is for setting the position of the menu, it is used by the child menus for setting position based on what type of menu it is
Menu.prototype.setPosition = function(x, y) {
  this.position.x = x;
  this.position.y = y;
}
//This method is used to set the options that the menu will be providing to the user
Menu.prototype.setOptions = function(options) {
  this.optionList = options;
  this.compileMenu();
}
//This method is called after a new options list is set, it is responsible for completing the menuButtonsList and giving them the proper location
Menu.prototype.compileMenu = function(){
  this.menuButtonList = [];
  let i = 0;
  for(i = 0;i<this.optionList.length;i++) {
    let menuButton = new MenuButton(this.optionList[i]);
    menuButton.setPosition(this.position.x+5, this.position.y+5 + (25*i));
    menuButton.setSurManager(this.surManager);
    this.menuButtonList.push(menuButton);
  }
}
Menu.prototype.select = function(i) {
  if(this.target!=i) {
    this.target = i;
    this.targetAcquired = true;
    this.menuButtonList[i].isClicked = true;
    for(let j = 0; j<this.menuButtonList.length;j++) {
      if(i!=j) {
        this.menuButtonList[j].isClicked = false;
      }
    }
  }
  else {
    this.target = -1;
    this.targetAcquired = false;
    this.menuButtonList[i].isClicked = false;
  }
}
Menu.prototype.update = function(gameTime, elapsedTime) {
  this.verifyApplicability();
  if(this.isActive) {
	  let i = 0;
    for(i = 0 ; i < this.menuButtonList.length;i++) {
      this.menuButtonList[i].update(gameTime, elapsedTime);
    }

  }
  else {
    this.resetMenu();
  }
}
Menu.prototype.verifyApplicability = function() {
	let i = 0;
  for(i = 0 ; i < this.menuButtonList.length;i++) {
    this.menuButtonList[i].verifyApplicability();
  }
}
Menu.prototype.hoverCheck = function(){
  this.cursorHover = false;
  if(this.isActive) {
	  let i = 0;
    for(i = 0; i < this.menuButtonList.length; i++) {
      this.menuButtonList[i].hoverCheck();
      if (this.menuButtonList[i].cursorHover){
        this.cursorHover = true;
      }
    }
  }
}
Menu.prototype.clickCheck = function () {
  this.menuClicked = false;
  if(this.isActive) {
	  let i = 0 ;
    for(i = 0 ; i<this.menuButtonList.length; i++) {
      if(this.menuButtonList[i].isClicked) {
        this.menuClicked = true;
      }
    }
  }
}
//This method clears the user selection without changing the menu
Menu.prototype.resetMenu = function() {
  this.menuClicked = false;
  this.target = -1;
  let i = 0;
  for(i = 0 ; i<this.menuButtonList.length; i++) {
    this.menuButtonList[i].isClicked = false;
    this.menuButtonList[i].cursorHover = false;
  }
}
//This method allows the menuManager to set the menu to be clicked on a particular target
Menu.prototype.setSelection = function(target) {
	let i = 0;
  for(i = 0 ; i<this.menuButtonList.length; i++) {
    if(this.menuButtonList[i].target == target) {
      this.menuButtonList[i].isClicked = true;
    }
  }
  this.menuClicked = true;
}
//This method allows the menuManager to set the menu to be clickewd via index
Menu.prototype.setSelectionByIndex = function (i) {
  this.menuButtonList[i].isClicked = true;
}
Menu.prototype.setSelectionByString = function(label) {
	let i = 0;
  for(i = 0 ; i<this.menuButtonList.length; i++) {
    if(this.menuButtonList[i].label == label) {
      this.menuButtonList[i].isClicked = true;
    }
  }
}
//This is the menu's main draw method
Menu.prototype.draw = function(ctx) {
  if(this.isVisible) {
    ctx.fillStyle = this.menuColor;
    ctx.fillRect(this.position.x, this.position.y, 160, 240);
	let i = 0;
    for(i = 0 ; i<this.menuButtonList.length; i++) {
      this.menuButtonList[i].draw(ctx);
    }
  }
}

function HeroSelectionMenu() {
  Menu.call(this);
}
HeroSelectionMenu.prototype = Object.create(Menu.prototype);
HeroSelectionMenu.prototype.constructor = HeroSelectionMenu;
HeroSelectionMenu.prototype.load = function(HeroList) {
  this.setOptions(HeroList);
}

function ActionMenu() {
  Menu.call(this);
}
ActionMenu.prototype = Object.create(Menu.prototype);
ActionMenu.prototype.constructor = ActionMenu;
ActionMenu.prototype.load = function() {
  this.isVisible = false;
  this.isActive = false;
  this.setPosition(160, 240);
  this.menuColor = "rgb(255, 231, 97)";
  let label1 = {name: "Attack", applicableTarget: true};
  let label2 = {name: "Special", applicableTarget: true};
  let label3 = {name: "Item", applicableTarget: true};
  let label4 = {name: "Retreat", applicableTarget: true};
  let buttonList = [label1, label2, label3, label4];
  this.setOptions(buttonList);
}

function SpecialMenu() {
  Menu.call(this);
}
SpecialMenu.prototype = Object.create(Menu.prototype);
SpecialMenu.prototype.constructor = SpecialMenu
SpecialMenu.prototype.load = function() {
  this.isActive = false;
  this.isVisible = false;
  this.setPosition(160, 240);
}
SpecialMenu.prototype.setOptions = function(options) {
  let optionListPlus = [];
  optionListPlus.push({name: "Back", applicableTarget: true});
  let i = 0;
  for(i = 0 ; i < options.length ; i++) {
    optionListPlus.push(options[i]);
  }
  this.optionList = optionListPlus;
  this.compileMenu();
}

function ItemMenu() {
  Menu.call(this);
}
ItemMenu.prototype = Object.create(Menu.prototype);
ItemMenu.prototype.constructor = ItemMenu;
ItemMenu.prototype.load = function () {
  this.isActive = false;
  this.isVisible = false;
  this.setPosition(160, 240);
  this.setOptions(this.surManager.battleItems);
}
ItemMenu.prototype.setOptions = function(options) {
  options.unshift({name: "Back", applicableTarget: true});
  this.optionList = options;
  this.compileMenu();
}
ItemMenu.prototype.checkRemainingItems = function(currentHero){
	let i = 0;
  for(i = 1 ; i < this.optionList.length ; i++) {
    this.menuButtonList[i].target.checkAvailability(this.surManager.heroManager.assetList, currentHero);
  }
  this.verifyApplicability();
}

function MonsterTargetMenu() {
  Menu.call(this);
}
MonsterTargetMenu.prototype = Object.create(Menu.prototype);
MonsterTargetMenu.constructor = MonsterTargetMenu;
MonsterTargetMenu.prototype.load = function() {
  this.isActive = false;
  this.isVisible = false;
  this.setPosition(320, 240);
  this.setOptions(this.surManager.monsterManager.assetList);
}

function HeroTargetMenu() {
  Menu.call(this);
}
HeroTargetMenu.prototype = Object.create(Menu.prototype);
HeroTargetMenu.prototype.constructor = HeroTargetMenu;
HeroTargetMenu.prototype.load = function() {
  this.isActive = false;
  this.isVisible = false;
  this.setPosition(320, 240);
  this.setOptions(this.surManager.heroManager.assetList);
}

function TurnConfirmButton() {
  Menu.call(this);
  this.isVisible = false
  this.isActive = false;
}
TurnConfirmButton.prototype = Object.create(new Menu());
TurnConfirmButton.prototype.constructor = TurnConfirmButton;
TurnConfirmButton.prototype.load = function() {
  this.setPosition(480, 240);
  let label = [{name: "Confirm Turn", applicableTarget: true}];
  this.setOptions(label);
}

function BattleSelectMenu() {
  Menu.call(this);
  this.isVisible = true;
  this.isActive = true;
}
BattleSelectMenu.prototype = Object.create(Menu.prototype);
BattleSelectMenu.prototype.constructor = BattleSelectMenu;
BattleSelectMenu.prototype.load = function() {
  let label1 = {name: "Grass (Easy)", applicableTarget: true};
  let label2 = {name: "Grass (Moderate)", applicableTarget: true};
  let label3 = {name: "Grass (Difficult)", applicableTarget: true};
  let label4 = {name: "Beach (Easy)", applicableTarget: true};
  let label5 = {name: "Beach (Moderate)", applicableTarget: true};
  let label6 = {name: "Beach (Difficult)", applicableTarget: true};
  let buttonList = [label1, label2, label3, label4, label5, label6];
  this.setOptions(buttonList);
}

//This is the constructor for the MenuButton class, this class is responsible for describing a button that represents a selection on a menu
function MenuButton(target) {
  this.position = {x:0,y:0};
  this.rectangle = {x:0,y:0,l:150,h:22};
  this.target = target;
  this.label = target.name;
  this.isVisible = true;
  this.isActive = true;
  this.color = "rgb(0,0,200)";
  this.cursorHover = false;
  this.isClicked = false;
}
//This method is used by the Menu class to assign a position to the menu button
MenuButton.prototype.setPosition = function(x, y) {
  this.rectangle.x = x;
  this.rectangle.y = y;
}
MenuButton.prototype.verifyApplicability = function() {
  if(this.target.applicableTarget) {
    this.isActive = true;
  }
  else{
    this.isActive = false;
  }
}
MenuButton.prototype.setSurManager = function(surManager) {
  this.surManager = surManager;
}
MenuButton.prototype.hoverCheck = function() {
  this.cursorHover = false;
  if(this.isActive){
    let mousex = this.surManager.mousex;
    let mousey = this.surManager.mousey;
    //check for collision and set cursorHover
    if(mousex>this.rectangle.x && mousex<this.rectangle.x+this.rectangle.l && mousey>this.rectangle.y && mousey<this.rectangle.y+this.rectangle.h) {
      this.cursorHover = true;
    }
  }
  else {
    this.cursorHover = false;
  }
  if(!this.isVisible) {
    this.cursorHover = false;
  }
}
MenuButton.prototype.update = function(gameTime, elapsedTime) {
  if(this.isActive){
    if(this.cursorHover) {
      this.color = "rgb(100, 0, 100)";
    }
    else {
      this.color = "rgb(0,0,200)";
    }
  }
  else {
    this.color = "rgb(0, 0, 200)";
  }
  if(this.isClicked){
    this.color = "rgb(0, 150, 150)";
    if(this.cursorHover){
      this.color = "rgb(0, 210, 210)";
    }
    if(!this.isActive) {
      this.color = "rgb(0, 0, 200)";
    }
  }
}
MenuButton.prototype.draw = function(ctx) {
  if(this.isVisible){
    ctx.fillStyle = this.color;
    ctx.fillRect(this.rectangle.x, this.rectangle.y, this.rectangle.l, this.rectangle.h);
    ctx.font = "20px serif";
    ctx.fillStyle = "rgb(200,200,200)";

    ctx.fillText(this.label, this.rectangle.x+3, this.rectangle.y+17);
    if(!this.isActive){
      ctx.beginPath();
      ctx.strokeStyle = "rgb(200, 200, 200)";
      ctx.lineWidth = 2;
      ctx.moveTo(this.rectangle.x, this.rectangle.y + 12);
      ctx.lineTo(this.rectangle.x + 150, this.rectangle.y +12);
      ctx.stroke();
    }
  }
}

export {Menu, HeroSelectionMenu, ActionMenu, SpecialMenu, ItemMenu, MonsterTargetMenu, HeroTargetMenu, TurnConfirmButton, BattleSelectMenu}
