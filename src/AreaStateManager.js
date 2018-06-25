function AreaStateManager(game) {
  this.game = game;
  this.areaSaveStateList = [];
}
AreaStateManager.prototype.newGame = function() {
  this.areaSaveStateList.push(new AreaSaveState(0));
  this.areaSaveStateList.push(new AreaSaveState(1));

  for(let i = 0 ; i < this.areaSaveStateList.length ; i++) {
    this.areaSaveStateList[i].firstTimeSetUp();
  }
}
AreaStateManager.prototype.loadGame = function() {
  for(let i = 0 ; i < 2 ; i++) {
    this.areaSaveStateList[i].loadAreaState();
  }
}
AreaStateManager.prototype.fetchAreaSaveStateList = function() {
  return this.areaSaveStateList;
}
AreaStateManager.prototype.checkChest = function(id) {
  if(this.areaSaveStateList[this.game.worldAreaID].chestStatusList[id]){
    return true;
  }
}
AreaStateManager.prototype.openChest = function(id) {
  this.areaSaveStateList[this.game.worldAreaID].chestStatusList[id] = false;
}


function AreaSaveState(id) {
  this.id = id;
  this.chestStatusList = [];
  this.nPCStatusList = [];
}
AreaSaveState.prototype.firstTimeSetUp = function() {
  this.chestStatusList.push(true);
  this.nPCStatusList.push(0);
}
AreaSaveState.prototype.loadAreaState = function() {
  var myStorage = window.localStorage;
  var keyString = "area" + this.id + "chest0";
  this.chestStatusList.push(myStorage.getItem(keyString));
  keyString = "area" + this.id + "npc0";
  this.nPCStatusList.push(myStorage.getItem(keyString));
}
AreaSaveState.prototype.saveAreaState = function () {
  var myStorage = window.localStorage;
  var keyString = "area" + this.id + "chest0";
  myStorage.setItem(keyString, this.chestStatusList[0]);
  keyString = "area" + this.id + "npc0";
  myStorage.setItem(keyString, this.nPCStatusList[0]);
}

export {AreaStateManager}
