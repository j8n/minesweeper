var MS = {
	showAll: false,
	createCustom: false,
	printDebug: false,
	side: 25,
	gameIsOver: false,
	game: null,
	flagsNumber: 0,
	firstClick: false,
	timer: null,
	startDate: null,
	nowDate: null,
	time: 0,
	minesElem: null,
	flagsElem: null,
	timeElem: null,
	mainElem: null,
	gameContainer: null,
	boxDebugElem: null,
	newGameElem: null,
	newGameButton: null,
	debugElem: null,
	messageElem: null,
	pointerEnabled: true,

	// mine color
	mineColor: "#f00040",
};


/*********************
	random number
*********************/
MS.randomNumber = function(mn, mx){
	return Math.floor((Math.random() * mx) + mn);
};


/*********************
	print box
*********************/
MS.printBox = function(b){
	var e = MS.boxDebugElem;
	e.innerHTML = "";

	if(!MS.printDebug){
		return;
	}
	
	e.innerHTML += "x: "+b.x;
	e.innerHTML += "<br>";
	e.innerHTML += "y: "+b.y;
	e.innerHTML += "<br>";
	e.innerHTML += "has mine: "+b.hasMine;
	e.innerHTML += "<br>";
	e.innerHTML += "has opened: "+b.opened;
	e.innerHTML += "<br>";
	e.innerHTML += "has flag: "+b.hasFlag;
	e.innerHTML += "<br>";
	e.innerHTML += "has question mark: "+b.hasMark;
	e.innerHTML += "<br>";
};


/*********************
	print main debug
*********************/
MS.printMainDebug = function(minesNumber, width, height){
	var e = MS.debugElem;
	e.innerHTML = "";

	if(!MS.printDebug){
		return;
	}

	e.innerHTML += "width: "+width;
	e.innerHTML += "<br>";
	e.innerHTML += "height: "+height;
	e.innerHTML += "<br>";
	e.innerHTML += "mines: "+minesNumber;
	e.innerHTML += "<br>";
};


/*********************
	printScore
*********************/
MS.printScore = function(){
	MS.minesElem.innerHTML = MS.game.minesNumber;
	MS.flagsElem.innerHTML = MS.flagsNumber;
};


/*********************
	setTime
*********************/
MS.setTime = function(){
	if(MS.gameIsOver){
		return;
	}
	if(!MS.firstClick){
		MS.startDate = new Date();
	}

	MS.nowDate = new Date();
	MS.time = (MS.nowDate - MS.startDate) / 1000;
	MS.time = Math.round(MS.time);
	MS.timeElem.innerHTML = MS.time+" s";

	if(!MS.gameIsOver){
		MS.timer = setTimeout(MS.setTime, 500);
	}

	
};


/*********************
	game over
*********************/
MS.gameOver = function(){
	MS.gameIsOver = true;
	MS.showMines();
	MS.messageElem.innerHTML = "Game Over";
	MS.messageElem.style.color = "#ff0000";
};


/*********************
	allMinesHaveFlags
*********************/
MS.allMinesHaveFlags = function(){
	var mines = MS.getMines();
	var ok = false;

	for(var i=0; i<mines.length; i++){
		var box = mines[i];

		if(!box.hasFlag){
			ok = false;
			return false;
		}
	}
	return true;
};


/*********************
	create share buttons
*********************/
MS.createShareButtons = function(){
	var container = document.createElement("div");
	var difficultyString = "";

	// append container to parent
	MS.messageElem.appendChild(container);

	// set difficulty string
	switch (MS.game.difficultyId){
		case 1:
			difficultyString = "Easy";
		break;
		case 2:
			difficultyString = "Intermediate";
		break;
		case 3:
			difficultyString = "Expert";
		break;
		case 4:
			difficultyString = "Custom";
		break;
	}


	// twitter share button
	var tsb = document.createElement("a");
	tsb.href = "https://twitter.com/intent/tweet?text=Just%20beat%20%23minesweeper%20in%20"+MS.time+"%20seconds%20on%20"+difficultyString+"%20mode%20&via=minesweeperorg&hashtags=minesweeperorg,minesweepergame&url=http%3A%2F%2Fmine-sweeper.org%2F";
	tsb.target = "_blank";
	tsb.id = "twitter-share-button";
	tsb.className = "share-buttons";
	tsb.innerHTML = "Share on twitter";
	container.appendChild(tsb);

	//console.log(twitterButton);
};


/*********************
	show name input
*********************/
MS.showNameInput = function(){
	var label = document.createElement("label");
	label.innerHTML = "Sumbit Name For Score <br>";
	label.style.color = "#404040";
	var nameInput = document.createElement("input");
	nameInput.placeholder = "Name";
	nameInput.onchange = function(){

	}

//	MS.messageElem.appendChild(label);
//	MS.messageElem.appendChild(nameInput);
};


/*********************
	check win
*********************/
MS.checkWin = function(){
	if(MS.allMinesHaveFlags() && MS.flagsNumber === MS.game.minesNumber){
		MS.game.grid.showAll();

		MS.gameOver();
		MS.messageElem.innerHTML = "You Win!";
		MS.messageElem.style.color = "#00e020";

		//MS.createShareButtons();
		MS.showNameInput();


		if(MS.userToken !== undefined && MS.userToken != ""){
			Ajax.incUserGamesWon(MS.userToken);
		}
		
		return true;
	}
};


/*********************
	open zeros
*********************/
MS.openZeros = function(box){
	var toOpen = [box];
	var inc = 0;
	var pushedNum = 0;

	while(toOpen.length != 0){
		var current = toOpen.shift();
		current.opened = true;
		current.show();
		
		//var neighbors = current.getCrossNeighbors();
		var neighbors = current.getNeighbors();

		for(var i=0; i<neighbors.length; i++){
			inc++;
			var neighbor = neighbors[i];
			//console.log(neighbor);
			if(neighbor !== null){
				if(!neighbor.hasMine){
					if(!neighbor.hasFlag){
						if(neighbor.number === 0){
							if(!neighbor.opened){
								neighbor.opened = true;
								toOpen.push(neighbor);
								pushedNum++;
							}						
						}else{
							neighbor.opened = true;
							neighbor.show();
						}
					}
				}
			}
		}
	}
	//alert(inc);
	//alert(pushedNum);
};


/****************************
	get mines
****************************/
MS.getMines = function(){
	var array = [];
	var list = MS.game.grid.boxesList;
	for(var i=0; i<list.length; i++){
		var box = list[i];
		if(box.hasMine){
			array.push(box);
		}
	}
	return array;
};


/****************************
	show mines
****************************/
MS.showMines = function(){
	var list = MS.getMines();
	for(var i=0; i<list.length; i++){
		var box = list[i];
		box.show();
	}
};


/****************************
	Box Constructor
****************************/
MS.Box = function(parent, x, y, hasMine){
	// @Variables
	var self = this;

	// @Properties
	this.parent = parent;
	this.x = x;
	this.y = y;
	this.hasMine = (hasMine === undefined) ? false : hasMine;
	this.opened = false;
	this.hasFlag = false;
	this.hasMark = false;
	this.number = 0;
	this.state = 0;


	// @colors
	this.defaultColor = "#c0c0c0";
	this.hoverColor = "#e0e0e0";
	this.openedColor = "#ffffff";


	// @Element
	this.elem = document.createElement("div");
	this.elem.style.width = MS.side+"px";
	this.elem.style.height = MS.side+"px";
	this.elem.style.position = "absolute";
	this.elem.style.left = this.x+"px";
	this.elem.style.top = this.y+"px";
	this.elem.style.border = "0.5px solid #707070";
	this.elem.style.backgroundColor = this.defaultColor;
	this.elem.style.textAlign = "center";
	this.elem.style.cursor = "default";
	this.elem.style.verticalAlign = "middle";
	this.parent.appendChild(this.elem);


	// @Methods
	/*************************
		open
	*************************/
	this.open = function(){
		if(!this.opened && !this.hasFlag){
			this.opened = true;
			this.show();

			if(this.hasMine){
				MS.gameOver();
			}else{
				if(this.number === 0){
					MS.openZeros(this);
				}
			}	
		}
	};


	/*************************
		show
	*************************/
	this.show = function(){
		this.elem.innerHTML = "";
		if(this.number !== 0){
			if(this.number == "mine"){
				this.addIcon("mine");
			}else{
				this.elem.innerHTML = this.number;
			}
		}
		this.setColor(this.openedColor);

		if(this.hasMine){
			this.setColor(MS.mineColor);
		}
	};

	/*************************
		add icon
	*************************/
	this.addIcon = function(icon){
		var i = document.createElement("i");
		i.style.fontSize = "12px";
		i.setAttribute("aria-hidden", "true");
		switch (icon) {
			case "flag":
				i.className = "fa fa-flag";
			break;
			case "mine":
				this.elem.style.backgroundImage = "url('sun.png')";
				this.elem.style.backgroundSize = "15px";
				this.elem.style.backgroundRepeat = "no-repeat";
				this.elem.style.backgroundPosition = "center"; 
				return;
			break;
			case "question":
				i.className = "fa fa-question";
			break;
		}
		this.elem.innerHTML = "";
		this.elem.appendChild(i);
	};

	/*************************
		switch state
	*************************/
	this.switchState = function(){
		if(!this.opened){
			switch (this.state){
				case 0:
					this.state = 1;
					this.hasFlag = true;
					this.hasMark = false;
					//this.elem.innerHTML = "⚐";
					this.addIcon("flag");
					MS.flagsNumber++;
				break;
				case 1:
					this.state = 2;
					this.hasFlag = false;
					this.hasMark = true;
					this.addIcon("question");
					MS.flagsNumber--;
				break;
				case 2:
					this.state = 0;
					this.hasFlag = false;
					this.hasMark = false;
					this.elem.innerHTML = "";
				break;
			}
		}
	};


	/*************************
		set Number
	*************************/
	this.setNumber = function(){
		if(this.hasMine){
			this.number = "mine";
			return;
		}

		this.neighbors = this.getNeighbors();
		var n = 0;

		for(var i=0; i<this.neighbors.length; i++){
			var neighbor = this.neighbors[i];
			if(neighbor !== null){
				if(neighbor.hasMine){
					n++;
				}
			}
		}
		this.number = n;
	};


	/*************************
		set color
	*************************/
	this.setColor = function(color){
		this.defaultColor = color;
		this.elem.style.backgroundColor = color;
	};


	/*************************
		get Neighbors
	*************************/
	this.getNeighbors = function(){
		var neighbors = MS.game.grid.getNeighborsOf(this.x, this.y);
		return neighbors;
	};


	/*************************
		get Cross Neighbors
	*************************/
	this.getCrossNeighbors = function(){
		var neighbors = MS.game.grid.getCrossNeighborsOf(this.x, this.y);
		return neighbors;
	};


	// Events
	// on select start event
	this.elem.onselectstart = function(){
		return false;
	};
	// on mouse over
	this.elem.onmouseover = function(){
		if(MS.gameIsOver){
			return;
		};

		this.style.backgroundColor = self.hoverColor;
		MS.printBox(self);
	};
	// on mouse out
	this.elem.onmouseout = function(){
		this.style.backgroundColor = self.defaultColor;

		MS.boxDebugElem.innerHTML = "";
	};

	// on mouse down
	this.elem.onmousedown = function(e){
		if(MS.firstClick === false){
			// set time
			MS.setTime();

			// set first click to true
			MS.firstClick = true;
		}
		




		if(MS.gameIsOver){
			return;
		};

		// left
		if(e.button === 0){
			if(MS.pointerEnabled){
				self.open();
			}else{
				self.switchState();
			}
		}
		// right
		else if(e.button === 2){
			self.switchState();
		}
		e.preventDefault();

		MS.checkWin();
		MS.printScore();
	};

};


/****************************
	Grid Constructor
****************************/
MS.Grid = function(width, height, minesNumber, parent){
	// @Variables
	var width = width;
	var height = height;
	var self = this;


	// @Properties
	this.width = width;
	this.height = height;
	this.minesNumber = minesNumber;
	this.parent = parent;
	this.boxesList = [];


	/*********************
		set

		@public method
	*********************/
	this.set = function(){
		create();
		setMines();
		setAdjacentMinesNumbers();

		if(MS.showAll){
			this.showAll();
		}
		//console.log(this.boxesList);
	};


	/*********************
		create

		@private method
	*********************/
	function create(){
		for(var w=0; w<self.width; w++){
			for(var h=0; h<self.height; h++){
				var x = w*MS.side;
				var y = h*MS.side;
				var b = new MS.Box(self.parent, x, y);
				self.boxesList.push(b);
			}
		};
	};


	/*********************
		set Grid Mines

		@private method
	*********************/
	function setMines(){
		// local array to hold boxes
		var array = [];

		// push all boxes to a local array
		self.boxesList.forEach(function(item){
			array.push(item);
		});

		for(var i=0; i<self.minesNumber; i++){
			var ok = false;
			do {
				var randomIndex = MS.randomNumber(0, array.length-1);
				var box = array[randomIndex];
				if(!box.hasMine){
					box.hasMine = true;
					ok = true;
				}
			} while(!ok);
		}
	};



	/*********************
		setA djacent Mines Numbers

		@private method
	*********************/
	function setAdjacentMinesNumbers(){
		for(var i=0; i<self.boxesList.length; i++){
			var b = self.boxesList[i];
			b.setNumber();
		}
	};



	/*********************
		open all

		@private method
	*********************/
	this.showAll = function(){
		for(var i=0; i<self.boxesList.length; i++){
			var box = self.boxesList[i];
			if(box.number === 0){
				box.setColor("#f0f0f0");
			}else{
				box.elem.innerHTML = box.number;
				if(box.hasMine){
					box.setColor(MS.mineColor);
				}
			}
		}
	};



	/*********************
		get box

		@public method
	*********************/
	this.getBox = function(x, y){
		for(var i=0; i<this.boxesList.length; i++){
			var b = this.boxesList[i];

			if(x === b.x && y === b.y){
				return b;
			}
		}
		return null;
	};


	/*********************
		get neighbors

		@public method
	*********************/
	this.getNeighborsOf = function(x, y){
		var x = x;
		var y = y;
		var neighbors = [
			this.getBox(x, 					y - MS.side	),
			this.getBox(x + MS.side, 		y - MS.side ),
			this.getBox(x + MS.side, 		y    		),
			this.getBox(x + MS.side, 		y + MS.side ),
			this.getBox(x, 					y + MS.side ),
			this.getBox(x - MS.side,	 	y + MS.side ),
			this.getBox(x - MS.side, 		y    		),
			this.getBox(x - MS.side, 		y - MS.side ),
		];
		return neighbors;
	};



	/*********************
		get cross neighbors

		@public method
	*********************/
	this.getCrossNeighborsOf = function(x, y){
		var x = x;
		var y = y;
		var neighbors = [
			this.getBox(x, 					y - MS.side	),
			this.getBox(x + MS.side, 		y    		),
			this.getBox(x, 					y + MS.side ),
			this.getBox(x - MS.side, 		y    		),
		];
		return neighbors;
	};

};


/****************************
	Game Constructor
****************************/
MS.Game = function(options){
	// set MS game instance from the start
	MS.game = this;


	// @Arguments
	var options = options || {};
	var width = options.width || 20;
	var height = options.height || 20;
	var minesNumber = options.minesNumber || 35;
	var difficultyId = options.difficultyId || 1;

	

	// @Properties
	this.width = width;
	this.height = height;
	this.boxesList = [];
	this.minesNumber = minesNumber;
	this.difficultyId = difficultyId;
	//console.log("difficultyId: "+this.difficultyId);


	// set parent dimensions
	MS.gameContainer.style.width = MS.side * this.width+"px";
	MS.gameContainer.style.height = MS.side * this.height+"px";
	
	//MS.mainElem.style.width = MS.side * this.width+"px";
	//MS.mainElem.style.height = MS.side * this.height+"px";

	// create a new grid
	this.grid = new MS.Grid(this.width, this.height, this.minesNumber, MS.gameContainer);
	// set up the grid
	this.grid.set();

	
	// print main debug
	MS.printMainDebug(this.minesNumber, this.width, this.height);

	// print score
	MS.printScore();
};



/*********************
	new game
*********************/
MS.newGame = function(userToken){
	if(userToken !== undefined && userToken != ""){
		MS.userToken = userToken;
	}


	// erase console
	console.clear();


	/**************************************/
	// get main container
	MS.mainElem = document.getElementById("main");

	// get gameContainer
	MS.gameContainer = document.getElementById("game-container");

	// get box debug element
	MS.boxDebugElem = document.getElementById("box-debug");

	// get debug element
	MS.debugElem = document.getElementById("debug");

	// get new game element
	MS.newGameElem = document.getElementById("new-game");

	// new game button
	MS.newGameButton = document.getElementById("new-game-button");

	// message elem
	MS.messageElem = document.getElementById("message");

	// mines element
	MS.minesElem = document.getElementById("mines");

	// flags element
	MS.flagsElem = document.getElementById("flags");

	// time element
	MS.timeElem = document.getElementById("time");

	// get select input
	var selectInput = document.getElementById("select");

	// custom game buttons container
	var customgamebuttonscontainer = document.getElementById("custom-game-buttons-container");

	// custom properties
	var customWidth = document.getElementById("custom-width");
	var customHeight = document.getElementById("custom-height");
	var customMines = document.getElementById("custom-mines");

	// mine image
	//MS.mineImage = new Image();
	//MS.mineImage.src = "sun.png";

	/**************************************/



	/**************************************/
	// set gameIsOver to false
	MS.gameIsOver = false;

	// reset game
	MS.game = null;

	// reset falgs number
	MS.flagsNumber = 0;

	// reset text of messageElem
	MS.messageElem.innerHTML = "";

	// reset color of messageElem
	MS.messageElem.style.color = "#ffffff";

	// set game container
	MS.gameContainer.innerHTML = "";

	// reset first click
	MS.firstClick = false;

	// reset time
	MS.timer = null;
	MS.startDate = null;
	MS.nowDate = null;
	MS.time = 0;

	// print time
	MS.timeElem.innerHTML = "0 s";
	/**************************************/



	/**************************************/
	/************************
		Set events
	************************/
	// On context menu event
	document.body.oncontextmenu = function(){
		return false;
	}
	// set onselectstart for body and parent
	document.body.onselectstart = function(e){
		e.preventDefault();
		return false;
	};
	MS.gameContainer.onselectstart = function(e){
		e.preventDefault();
		return false;
	};
	// new game button on click
	MS.newGameButton.onclick = function(){
		MS.newGame();
	};
	// select input on change
	selectInput.onchange = function(){
		if(this.value == 4){
			customgamebuttonscontainer.style.display = "inline";
		}else{
			customgamebuttonscontainer.style.display = "none";
		}
	};

	// set buttons 
	MS.setButtons();

	// set events
	MS.setEvents();
	/**************************************/



	/**************************************/
	if(MS.createCustom){
		MS.game = new MS.Game({
			width: 15,
			height: 15,
			minesNumber: 15,
		});
		return;
	}

	var value = parseInt(selectInput.value);
	var options = {difficultyId: value};
	//console.log(value);

	//alert("game created");

	switch (value) {
		case 1:
			options.width = 9;
			options.height = 9;
			options.minesNumber = 10;
		break;
		case 2:
			options.width = 16;
			options.height = 16;
			options.minesNumber = 40;
		break;
		case 3:
			options.width = 30;
			options.height = 16;
			options.minesNumber = 99;
		break;
		case 4:
			options.width = customWidth.value;
			options.height = customHeight.value;
			options.minesNumber = customMines.value;
		break;
	}


	if(options.width > 50){
		options.width = 50;
		customWidth.value = 50;
	}

	if(options.height > 25){
		options.height = 25;
		customHeight.value = 25;
	}

	MS.game = new MS.Game(options);

};

/*********************
	set buttons
*********************/
MS.setButtons = function(){
	var pointerButton = document.getElementById("pointer-button");
	var flagButton = document.getElementById("flag-button");
	var pointerButtonI = document.getElementById("pointer-button-i");
	var flagButtonI = document.getElementById("flag-button-i");


	function activatePointerButton(){
		MS.pointerEnabled = true;
		pointerButtonI.style.color = "#303030";
		flagButtonI.style.color = "#b0b0b0";
		//pointerButton.style.border = "1px solid #d0d0d0";
		//flagButton.style.border = "1px solid #909090";
	};


	function activateFlagButton(){
		MS.pointerEnabled = false;
		pointerButtonI.style.color = "#b0b0b0";
		flagButtonI.style.color = "#303030";
		//pointerButton.style.border = "1px solid #909090";
		//flagButton.style.border = "1px solid #d0d0d0";
	};

	pointerButton.onclick = function(){
		activatePointerButton();
	}
	flagButton.onclick = function(){
		activateFlagButton();
	}



	activatePointerButton();
};

/**********************
	set events
**********************/
MS.setEvents = function(){
	function getUnicode(e){
		var unicode = e.keyCode ? e.keyCode : e.charCode;
		return unicode;
	}
	document.body.onkeydown = function(e){
		key = getUnicode(e);
		switch (key){
			// spacebar
			case 32:
				MS.newGame();
			break;
		}
	}
};
