let mainArea = document.getElementById("main_area")
let ctx = mainArea.getContext("2d")

// принятые константы
// игровое окно
let width = 700
let height = 500 

mainArea.width = width
mainArea.height = height
let originHeight = 2480 // высота по шаблону
let originWidth = 3508  // ширина по шаблону
let scale = 0.2

// // игровое поле
let areaWidth = round(1650 * scale, 0)  // ширина
let areaHeight = round(1850 * scale, 0) // высота
let areaX1 = 25 // положение игрового поля по Х верхней левой точки
let areaY1 = 83 // положение игрового поля по Y верхней левой точки
let areaX2 = areaX1 + areaWidth // положение игрового поля по Х нижней правой точки
let areaY2 = areaY1 + areaHeight // положение игрового поля по Y нижней правой точки
let mixButtonX = 430 // координата Х кнопки перемешивания
let mixButtonY = 400 // координата Y кнопки перемешивания

// тайлы
let offsetH = 19 // смещение тайлов слева и справа от границы игрового поля
let offsetV = 12 // смещение тайлов сверху и снизу от границы игрового поля
let startX = 39 // начальное положение левого верхненго тайла (1й элемент) по Х
let startY = 95 // начальное положение левого верхненго тайла (1й элемент) по Y
let colorNumber = {0: "blue",
				   1: "green",
				   2: "purple",
				   3: "red",
				   4: "yellow",}

// положение "рабочей зона" игрового поля
let workAreaX1 = areaX1 + offsetH // положение по Х верхней левой точки
let workAreaY1 = areaY1 + offsetV // положение по Y верхней левой точки
let workAreaX2 = areaX2 - offsetH // положение по Х нижней правой точки
let workAreaY2 = areaY2 - offsetV // положение по Y нижней правой точки

// вариативно
let N = 7 // число строк
let M = 7 // число столбцов
let Nn = (N + 2) // число дополнительных столбцов для генерации тайлов
let K = 2 // минимальное число соединенных тейлов для удаления
let speed = 15 // скорость перемещения тайлов
let deleteSpeed = 5 // скорость анимации удаления тайлов

// игра
let totalScore = 0 // очки в начале игры
let endScore = 100 // очки для прохождения игры
let stepsStart = 30 // число ходов в начале игры
let steps = stepsStart // число текущих ходов для набора endScore
let autoMixCountDefault = 1 // число автоматических перемешаваний по умолчанию при невозможности удалить тайлы
let autoMixCount = autoMixCountDefault // число текущих автоматических перемешаваний при невозможности удалить тайлы
let mixClickCountDefault = 2 // число перемешиваний по желанию пользователя
let mixClickCount = mixClickCountDefault // число текущих перемешиваний по желанию пользователя

// главный массив тейлов
let arrTails = generateStartTails(Nn, M)

// создание фона и игрового поля
let bg = new Image()
let area = new Image()

bg.src = "img/bg.png"
area.src = "img/area.png"


// для отладки
// let blocks = generateStartTails(N, M)



mainArea.addEventListener("click", (e) => {
	// получение координат курсора
	let x = e.offsetX;
	let y = e.offsetY;
	// координаты зоны игрового поля в 2х мерном массиве [y, x]
	let indexPart = getCoordinatePartOfArea(x, y)
	// проверка выбора тайла для последующего удаления / не удаления цепочки
	checkTail(indexPart)
	// автоматическое перемешивание по клику если цепочек нет
	autoMix()

	// проверка нажатия на кнопку перемешивания тайлов по желанию игрока
	if(x >= mixButtonX && x <= (mixButtonX + 50) && y >= mixButtonY && y <= (mixButtonY + 50)) {
		autoMix(true)
	}
})

// проверка невозможности удалить цепь тейлов
function checkTailsForMix(condition) {
	// условие для перемешивания по желанию пользователя
	if(condition) {
		return true
	}
	// проверка что все ячейка поля заполнены тейлами
	for(let i = (Nn - N); i < arrTails.length; i++) {
		for(let j = 0; j < arrTails[i].length; j++) {
			if(arrTails[i][j]["status"]) {
				continue
			} else {
				return false
			}
		}	
	}

	for(let i = (Nn - N); i < arrTails.length; i++) {
		for(let j = 0; j < arrTails[i].length; j++) {
			let coordinate = [arrTails[i][j]["y"], arrTails[i][j]["x"]]
			let arrCheck = chooseNeibors(coordinate, arrTails[i][j]["colorN"])
			for(let j = 0; j < arrCheck.length; j++) {
				arrCheck[j]["delete"] = false // исправление от метода chooseNeibors()
			}
			if(arrCheck.length >= K) {
				return false
			}	
		}
	}
	return true
}

// перемешивание цветов тайлов
function mixColors() {
	// генерация нового цвета для тайла
	let arrColor = new Array()
	for(let i = (Nn - N); i < arrTails.length; i++) {
		for(let j = 0; j < arrTails[i].length; j++) {
			arrColor.push(arrTails[i][j]["colorN"])
		}
	}

	// создание массива со случайным порядком следования цветов colorN
	let arrColorMixed = new Array()
	while(arrColor.length > 0) {
		let number = Math.floor(Math.random() * arrColor.length)
		arrColorMixed.push(arrColor[number])
		arrColor.splice(number, 1)
	}

	// присваивание элементам arrTails цветов из arrColorMixed
	for(let i = (Nn - N); i < Nn; i++) {
		for(let j = 0; j < arrTails[i].length; j++) {
			arrTails[i][j]["colorN"] = arrColorMixed[0]
			arrColorMixed.splice(0, 1) 
		}
	}
}

// функция автоматического и перемешивания по желанию игрока цветов тайлов
function autoMix(condition) {
	if(checkTailsForMix() && autoMixCount > 0) {
		mixColors()
		autoMixCount--
		alert("TAILS MIXED AUTO!")
	} else if(checkTailsForMix(condition) && mixClickCount != 0) {
		mixColors()
		mixClickCount--
		alert("USER MIXED TAILS!")
	}
	
}

//генерация новых тайлов в первой строке (которая не видна)
function generateNewTails() {
	for(let j = 0; j < arrTails[0].length; j++) {
		if(!arrTails[0][j]["status"]) {
			let colorNumberForTail = Math.floor(Math.random() * (Object.keys(colorNumber).length))
			arrTails[0][j]["colorN"] = colorNumberForTail
			arrTails[0][j]["status"] = true
			arrTails[0][j]["delete"] = false
			arrTails[0][j]["isVisible"] = false
		}
	}
}

// перемещение тайлов вниз (или всплытие пустых ячеек)
function moveTails() {
	// получение массива пустных тайлов
	let emptyTails = new Array()
	for(let i = 0; i < arrTails.length; i++) {
		for(let j = 0; j < arrTails[i].length; j++) {
			if(!arrTails[i][j]["status"]) {
				emptyTails.push(arrTails[i][j])
			}
		}
	}

	for(let i = 0; i < emptyTails.length; i++) {
		let y = emptyTails[i]["y"]
		let x = emptyTails[i]["x"]
		let yPos = arrTails[y][x]["yPos"]
		if(y != 0 && arrTails[y - 1][x]["status"]
			&& arrTails[y - 1][x]["yPos"] < yPos) {
			arrTails[y - 1][x]["yPos"] += speed
		} else if(y != 0 && arrTails[y - 1][x]["status"]
			&& arrTails[y - 1][x]["yPos"] >= yPos) {
			arrTails[y][x]["y"] = arrTails[y - 1][x]["y"]
			arrTails[y][x]["x"] = arrTails[y - 1][x]["x"]
			arrTails[y - 1][x]["y"] = y
			arrTails[y - 1][x]["x"] = x
			arrTails[y - 1][x]["yPos"] = yPos
			arrTails[y][x]["yPos"] -= arrTails[y][x]["height"]
			arrTails[y].splice(x, 1, arrTails[y - 1][x])
			arrTails[y - 1].splice(x, 1, emptyTails[i])
		}
	}
}
	

// удалить тейл при нажатии
function checkTail(coordinate) {
	for(let i = (Nn - N); i < Nn; i++) {
		for(let j = 0; j < M; j++) {
			if(i == coordinate[0] && j == coordinate[1]) {
				let colorN = arrTails[i][j]["colorN"]
				let color = colorNumber[arrTails[i][j]["colorN"]]
				deleteNeibors(coordinate, colorN)
			}
		}
	}
}

// выбор соседних тайлов по цвету
function chooseNeibors(coordinate, colorN) {
	let xOrigin = coordinate[1]
	let yOrigin = coordinate[0]
	// массив со связанными тейлами
	let chainTails = new Array()
	chainTails.push(arrTails[yOrigin][xOrigin])

	// заполнение массива связанными тайлами
	for(let i = 0; i < chainTails.length; i++) {
		let x = chainTails[i]["x"]
		let y = chainTails[i]["y"]
		// проверка тайлов по часовой стрелки, начиная с верхнего
		for(let j = 1; j <= 4; j++) {
			// проверка тайла выше
			if(j == 1 && y != (Nn - N)
				&& arrTails[y - 1][x]["colorN"] == colorN && !arrTails[y - 1][x]["delete"]
				&& arrTails[y - 1][x]["isVisible"] && arrTails[y - 1][x]["status"]) {
				arrTails[y - 1][x]["delete"] = true
				chainTails.push(arrTails[y - 1][x])
			}
			// проверка тайла справа
			if(j == 2 && x != (arrTails[y].length - 1)
				&& arrTails[y][x + 1]["colorN"] == colorN && !arrTails[y][x + 1]["delete"]
				&& arrTails[y][x + 1]["isVisible"] && arrTails[y][x + 1]["status"]) {
				arrTails[y][x + 1]["delete"] = true
				chainTails.push(arrTails[y][x + 1])
			}
			// проверка тайла снизу
			if(j == 3 && y != (arrTails.length - 1) 
				&& arrTails[y + 1][x]["colorN"] == colorN && !arrTails[y + 1][x]["delete"]
				&& arrTails[y + 1][x]["isVisible"] && arrTails[y + 1][x]["status"]) {
				arrTails[y + 1][x]["delete"] = true
				chainTails.push(arrTails[y + 1][x])
			}
			// проверка тайла слева
			if(j == 4 && x != 0  
				&& arrTails[y][x - 1]["colorN"] == colorN && !arrTails[y][x - 1]["delete"]
				&& arrTails[y][x - 1]["isVisible"] && arrTails[y][x - 1]["status"]) {
				arrTails[y][x - 1]["delete"] = true
				chainTails.push(arrTails[y][x - 1])
			}
		}
	}
	return chainTails
}

// проверка соседнего тейла по цвету и удаление
function deleteNeibors(coordinate, colorN) {
	// массив со связанными тайлами
	let chainTails = chooseNeibors(coordinate, colorN)

	// удаление повторяющихся тайлов
	for(let i = 0; i < (chainTails.length - 1); i++) {
		for(let j = i + 1; j < chainTails.length; j++) {
			if(chainTails[i]["x"] == chainTails[j]["x"] && chainTails[i]["y"] == chainTails[j]["y"]) {
				chainTails.splice(j, 1)
			}
		}
	}
	// проверка длины связанных тайлов на минимально возможную
	if(chainTails.length >= K) {
		steps--
		totalScore += solveScore(chainTails)
		// присваивание тайлам статуса false - функция drawTails картинки таких тайлов анимированно удаляет
		for(let i = 0; i < chainTails.length; i++) {
			chainTails[i]["status"] = false
		}
	}	
		
}

// расчет очков
function solveScore(arr) {
	let score = 0
	let size = arr.length
	switch(arr.length) {
		case (K):
		score = 1
		break

		case (K + 1):
		score = 3
		break

		case (K + 2):
		score = 5
		break

		case (K + 3):
		score = 7
		break

		case (size):
		score = size * 2
		break
	}
	return score
}

// отрисовка счета
function drawScore() {
	ctx.font = "30px Bradley Hand"
	ctx.fillStyle = "#FFFFFF"
	ctx.fillText(totalScore + "/" + endScore, round(2520 * scale, 0), round(1420 * scale, 0))
}

// отрисовка кнопки перемешивания и числа оставшихся перемешиваний
function drawClickMix() {
	ctx.font = "30px Bradley Hand"
	ctx.fillStyle = "#FFFFFF"
	ctx.fillText("Mix", mixButtonX, mixButtonY)
	ctx.font = "20px Bradley Hand"
	ctx.fillStyle = "#FFFFFF"
	ctx.fillText(mixClickCount, mixButtonX + 10, mixButtonY + 30)
}

// отрисовка оставшихся шагов до завершения игры
function drawSteps() {
	ctx.font = "50px Bradley Hand"
	ctx.fillStyle = "#FFFFFF"
	ctx.fillText(steps, round(2640 * scale, 0), round(950 * scale, 0))
	ctx.font = "25px Bradley Hand"
	ctx.fillStyle = "#000000"
	ctx.fillText("Ходы:", round(2550 * scale, 0), round(510 * scale, 0))
}

// проверка завершения игры
function checkEndGame() {
	if(steps == 0 || (autoMixCount == 0 && mixClickCount == 0)) {
		alert("GAME OVER")
		document.location.reload()
	} else if (totalScore >= endScore) {
		alert("YOU ARE WINNER!")
		document.location.reload()
	} 
}

// линия прогресса
function drawLineProgress() {
	let maxLength = 231
	let currentLength = (maxLength / endScore) * totalScore + 202
	ctx.beginPath()
	ctx.moveTo(202, 32)
	ctx.lineTo(currentLength, 32)
	ctx.strokeStyle = "#00FF00"
	ctx.lineCap = "round"
	ctx.lineWidth = 15
	ctx.stroke()
	ctx.closePath()
}

// двумерный массив из объектов-тайлов в начале игры
function generateStartTails(N, M) {
	let arrTails = new Array()
	for (let i = 0; i < N; i++) {
		let line = new Array();
		for (let j = 0; j < M; j++) {
			let colorNumberForTail = Math.floor(Math.random() * (Object.keys(colorNumber).length))
			let tail = {"id": j  + i * M,
						"x": j,
						"y": i,
						"colorN": colorNumberForTail,
						"status": true,
						"delete": false,
						"xPos": false,
						"yPos": false,
						"height": false,
						"isVisible": false}
			line.push(tail);
		}
		arrTails.push(line);
	}
	return arrTails;
}

// рисование тейлов при старте игры и в ходе игры
function drawTails() {
	let tailSizeX = Math.floor((workAreaX2 - workAreaX1) / M)
	let tailSizeY = Math.floor((workAreaY2 - workAreaY1) / N)
	for (let i = 0; i < Nn; i++) {
		for (let j = 0; j < M; j++) {
			let colorN = arrTails[i][j]["colorN"]
			let imgTail = new Image()
			// Для анимации исчезнорвения
			if(colorN || colorN == 0) {
				imgTail.src = "img/blocks/" + colorNumber[colorN] + ".png"
			}
			let x = workAreaX1 + j * tailSizeX
			let y = 0
			if(i < (Nn - N)) {
				y = workAreaY1 - ((Nn - N) - i) * tailSizeY
			} else if(i >= (Nn - N)) {
				y = workAreaY1 + (i - (Nn - N)) * tailSizeY
			}
			// рисование тайлов при старте
			if(arrTails[i][j]["status"] && !arrTails[i][j]["xPos"] && !arrTails[i][j]["yPos"]) {
				arrTails[i][j]["xPos"] = x
				arrTails[i][j]["yPos"] = y
				arrTails[i][j]["height"] = tailSizeY
				ctx.drawImage(imgTail, x, y, tailSizeX, tailSizeY)
			// рисование тайлов при наличии координат
			} else if(arrTails[i][j]["status"] && arrTails[i][j]["xPos"] && arrTails[i][j]["yPos"] 
						&& arrTails[i][j]["isVisible"]) {
				ctx.drawImage(imgTail, arrTails[i][j]["xPos"], arrTails[i][j]["yPos"], tailSizeX, tailSizeY) 
			// рисование тайлов при падении из невидимой верхней зоны
			} else if(arrTails[i][j]["status"] && arrTails[i][j]["xPos"] && arrTails[i][j]["yPos"] >= workAreaY1
						&& !arrTails[i][j]["isVisible"]) {
				arrTails[i][j]["isVisible"] = true
				ctx.drawImage(imgTail, arrTails[i][j]["xPos"], arrTails[i][j]["yPos"], tailSizeX, tailSizeY)
			} else if(arrTails[i][j]["delete"]) {
				// картинки для анимации исчезновения тайлов
				let colorDelete = arrTails[i][j]["colorN"]
				ctx.drawImage(imgTail, arrTails[i][j]["xPos"], arrTails[i][j]["yPos"], tailSizeX/3, tailSizeY/3)
				ctx.drawImage(imgTail, (arrTails[i][j]["xPos"] + tailSizeX*(2/3)), 
					arrTails[i][j]["yPos"], tailSizeX/3, tailSizeY/3)
				ctx.drawImage(imgTail, arrTails[i][j]["xPos"], 
					(arrTails[i][j]["yPos"] + tailSizeY*(2/3)), tailSizeX/3, tailSizeY/3)
				ctx.drawImage(imgTail, arrTails[i][j]["xPos"] + tailSizeX*(2/3), 
					(arrTails[i][j]["yPos"] + tailSizeY*(2/3)), tailSizeX/3, tailSizeY/3)
				ctx.drawImage(imgTail, arrTails[i][j]["xPos"] + tailSizeX*(1/3), 
					(arrTails[i][j]["yPos"] + tailSizeY*(1/3)), tailSizeX/3, tailSizeY/3)
				// удаление свойтсва цвета для прекращения анимации
				delete arrTails[i][j]["colorN"]
			}
		}
	}
}


function draw() {
	ctx.clearRect(0, 0, mainArea.width, mainArea.height) // очистка поля
	ctx.drawImage(bg, 0, 0, width, height) // загрузка заднего фона
	ctx.drawImage(area, areaX1, areaY1, areaWidth, areaHeight) // загрузка игрового поля
	drawTails()
	moveTails()
	generateNewTails()
	drawScore()
	drawSteps()
	checkEndGame()
	drawLineProgress()
	drawClickMix()


	requestAnimationFrame(draw)
}

// запуск главного метода рисования при загрузки поля
area.onload = draw

// получение координаты курсора в системе координат матрицы getArrayNumbersOfPart() в пределе "рабочей зоны" с тайлами
function getCoordinatePartOfArea(x, y) {
	if(x >= workAreaX1 && x <= workAreaX2 && y >= workAreaY1 && y <= workAreaY2) {
		let zoneW = round((workAreaX2 - workAreaX1) / M, 1);
		let zoneH = round((workAreaY2 - workAreaY1) / N, 1);
		return [Math.floor(((y - workAreaY1) / zoneH) + (Nn - N)), Math.floor((x - workAreaX1) / zoneW)]
	} return false
}

//Математические сервисы
//округление десятичых чисел по математическим правилам до decimals знаков после запятой
function round(value, decimals) {
	return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals);
};