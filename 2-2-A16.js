const body = document.querySelector('body')
const table = document.querySelector("#app table")
const gameSize = 3
const gameStatus = new Array(Math.pow(gameSize, 2)).fill(0)
const playerStatus = []
const computerStatus = []
let isPlayer = true
let even = false

const gameState = {
  waitFlipCoin: 'waitFlip',
  waitPlayerMove: 'player',
  waitComputerMove: 'computer',
  statusCheck: 'check',
  gameSettled: 'settle'
}

const view = {
  drawStep(target, content) {
    target.innerHTML = `<div class="${content}"/>`
    model.updateGameStatus(target)
    isPlayer = !isPlayer
  },

  //返回table內的innerHTML
  renderGamePlate() {
    let indexSet = Array.from(gameStatus.keys())
    let inner = ''
    for (let i = 0; i < gameSize; i++) {
      let segment = indexSet.splice(0, gameSize)
      inner +=
        segment.reduce((acc, item) => {
          return acc += `<td id="tik${item}" data-id="${item}"></td>`
        }, '<tr>')
      inner += '</tr>'
    }
    return inner
  }
}


const model = {
  //update value of occupation of both sides
  updateGameStatus(target) {
    let statusValue = isPlayer? 1: -1
    gameStatus[Number(target.dataset.id)] = statusValue
  },

  //update occupied position of both sides
  updatePlayerComputerStatue(target) {
    isPlayer? playerStatus.push(Number(target.dataset.id)): computerStatus.push(Number(target.dataset.id))
  }
}

const controller = {
  currentState: gameState.waitFlipCoin,

  gameStartControl(target) {
    if (this.currentState === gameState.waitFlipCoin) {
      if (!target.classList.contains('flipCoin')) {
        alert('請先擲幣決定順序')
        return
      }
      utility.flipCoin()
      isPlayer ? this.currentState = gameState.waitPlayerMove : this.currentState = gameState.waitComputerMove
    } else {
      return
    }
  },

  gamePlayerProceeding(target) {
    if (target.tagName !== "TD" || this.currentState !== gameState.waitPlayerMove) {
      return
    }
    model.updateGameStatus(target)
    model.updatePlayerComputerStatue(target)
    view.drawStep(target, 'circle')
    this.gameStatusCheck()
  },

  gameComputerProceeding () {
    if (this.currentState !== gameState.waitComputerMove) {
      return
    }
    let chance = utility.checkIfChanceWin(-2)
    let danger = utility.checkIfChanceWin(2)
    if (chance[0] || danger[0]) {
      let index = chance[0] ? chance[0].filter(item => gameStatus[item] === 0) : danger[0].filter(item => gameStatus[item] === 0)
      let computerTarget = document.querySelector(`#tik${index[0]}`)
      model.updateGameStatus(computerTarget)
      model.updatePlayerComputerStatue(computerTarget)
      view.drawStep(computerTarget, 'cross')
    } else {
      let availablePosition = utility.checkAvailablePosition()
      let index = availablePosition.includes(4) ? 4 : availablePosition[(Math.floor(Math.random() * availablePosition.length))]
      let computerTarget = document.querySelector(`#tik${index}`)
      model.updateGameStatus(computerTarget)
      model.updatePlayerComputerStatue(computerTarget)
      view.drawStep(computerTarget, 'cross')
    }
    this.gameStatusCheck()
  },

  gameStatusCheck () {
    let status = isPlayer ? computerStatus : playerStatus
    if (utility.checkIfWin(status)) {
      this.currentState = gameState.gameSettled
    } else if (!gameStatus.includes(0)) {
      this.currentState = gameState.gameSettled
      even = true
    } else if (isPlayer) {
      this.currentState = gameState.waitPlayerMove
    } else if (!isPlayer) {
      this.currentState = gameState.waitComputerMove
    }
  },

  gameSettledCheck () {
    if (this.currentState !== gameState.gameSettled) {
      return
    }
    if (even) {
      alert(`平手`)
    } else {
      let winner = isPlayer ? 'computer' : 'Player'
      alert(`${winner}勝`)
    }
    this.currentState = gameState.waitFlipCoin
    even = false
    gameStatus.fill(0, 0)
    while ((i = playerStatus.shift()) !== undefined) {
    }

    while ((i = computerStatus.shift()) !== undefined) {
    }
  }
}

const utility = {
  rowCombination() {
    let row = []
    for (let i = 0; i < gameSize; i++) {
      let temp = []
      for (let j = 0; j < gameSize; j++) {
        temp.push(i * gameSize + j)
      }
      row.push(temp)
    }
    return row
  },

  columnCombination() {
    let column = []
    for (let i = 0; i < gameSize; i++) {
      let temp = []
      for (let j = 0; j < gameSize; j++) {
        temp.push(i + j * gameSize)
      }
      column.push(temp)
    }
    return column
  },

  crossCombination1() {
    let cross = []
    for (let i = 0; i < gameSize; i++) {
      cross.push(i * gameSize + i)
    }
    return cross
  },

  crossCombination2() {
    let cross = []
    for (let i = 0; i < gameSize; i++) {
      cross.push((i + 1) * gameSize - (i + 1))
    }
    return cross
  },

  //combine all rows, columns and cross
  //return [[]]
  allCombine () {
    let all = (this.rowCombination().concat(this.columnCombination()))
    all.push(this.crossCombination1())
    all.push(this.crossCombination2())
    return all
  },

  //input playerStatus or computerStatus to check if there's a win situation
  //return boolean
  checkIfWin (status) {
    let allCombination = this.allCombine()
    return allCombination.some(item => item.every(itemOfitem => status.includes(itemOfitem)))
  },

  //return [[]]
  checkIfChanceWin (count) {
    const allCombination = this.allCombine()
    return allCombination.filter(item => item.reduce((accu, itemOfItem) => {return accu + gameStatus[itemOfItem]}, 0) === count)
  },

  //check all available spots
  checkAvailablePosition () {
    let available = []
    for (let i = 0; i < gameStatus.length; i++) {
      if (gameStatus[i] === 0) {
        available.push(i)
      }
    }
    return available
  },

  flipCoin () {
    table.innerHTML = view.renderGamePlate()
    let number = Math.floor(Math.random() * 100)
    number % 2 === 0? isPlayer = true: isPlayer = false
    number % 2 === 0? alert('Player first'): alert('Computer first')
  }
}

table.innerHTML = view.renderGamePlate()
body.addEventListener("click", function onTableClicked(event) {
  let target = event.target
  controller.gameStartControl(target)
  controller.gamePlayerProceeding(target)
  controller.gameComputerProceeding()
  controller.gameSettledCheck()
})

