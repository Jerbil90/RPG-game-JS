function SaveDataManager(game) {
  this.game = game;
  this.areaSaveStateList = [];
}
SaveDataManager.prototype.firstTimeSetUp = function() {

}
SaveDataManager.prototype.saveData = function (name) {
  myStorage = window.localStorage;
  var areaTotal = 2;
  for (let  i = 0 ; i < areaTotal ; i++) {
    this.areaSaveStateList.saveAreaState();
  }
}


export {SaveDataManager}
