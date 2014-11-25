var GridState = {
    "Idle": 0,
    "Waiting": 1,
    "Processing": 2,
};

var ClusterSide = {
    "Left": 0,
    "Right": 1,
    "Down": 2,
    "Up": 3
};

var GemGrid = cc.Layer.extend({
    //Screen Dimensions
    _screenSize:        null, //0
    _gridOriginX:       null,
    _gridOriginY:       null,
    
    //Grid
    _gemGrid:           null, //[][]
    _width:             null, 
    _height:            null,
    //Gem States Counter
    _numMoving:         null, //0
    _numExploding:      null, //0
    //Gem grave yard
    _gemsPool:          null, //[]
    //Game Data and Grid State
    _gameData:          null,
    _gridState:         null, 
    //Gem cluster
    _gemCluster:        null, //[]
    //Keyboard
    _keyboardEnabled:   null, //true
    //TEMP LABELS
    GameStateLabel:     null,
    _ScoreSystem:       null, 

    _playerScore:       null, //0
    _scoreMultiplier:   null, //1
    _anouncerCounter:   null, //0

    _shiftTimer:        null, //0
    _shiftSpeed:        null, //1

    _initialTouchPos:   null, //[]
    _currentTouchPos:   null, //[]
    _isTouchDown:       null, //false

    _gemTypes:          null, //[]
    
    //Next Gem Panel
    _nextGemCluster:    null, //[]
    _nextGemClusterPos: null, //[]

    _previousGemCluster: null,//[]

    _sender:            null,
    _endGame:           null,

    _keys:              null, //[]
    
    //Initialiser
    ctor: function(gameData) {
        this._super();
        this.init();
        
        //Obtains screen dimensions
        this._screenSize    = cc.Director.getInstance().getWinSize();
        
        //Obtains Screen Dimensions
        this._gridOriginX = this._screenSize.width * 0.345;
        this._gridOriginY = this._screenSize.height * 0.09;
        
        //Sets up grid physical dimensions
        this._width         = 480;
        this._height        = 480;
        //Obtains game data
        this._gameData      = gameData;
        
        this._keys          = [];
        //Touch and Keyboard Events
        this.setTouchMode(cc.TOUCH_ALL_AT_ONCE);
        this.setTouchEnabled(true);
        this.setKeyboardEnabled(true);

        //Sets up explosion sprites
        Gem._explosionFrames = [];
        var frame;
        for (var i = 1; i < 10; i++) {
            frame = cc.SpriteFrameCache.getInstance().getSpriteFrame(i + ".png");
            Gem._explosionFrames.push(frame);
        }
        //////////////////////////////////

        //Sets up Observers - Notification Center
        cc.NotificationCenter.getInstance().addObserver(this, this.selectGem, MSG_SELECT_GEM);
        cc.NotificationCenter.getInstance().addObserver(this, this.onMoveDone, MSG_MOVE_DONE);
        cc.NotificationCenter.getInstance().addObserver(this, this.onSwapDone, MSG_SWAP_DONE);
        cc.NotificationCenter.getInstance().addObserver(this, this.removeExplodedGem, MSG_REMOVE_GEM);
        ////////////////////////////////////////
    
        //Touch events
        this._initialTouchPos       = [];
        this._currentTouchPos       = [];
        this._isTouchDown           = false;

        //Initialises Gem grid, Clusters & Grave yard (this._gemsPool)
        this._gemCluster            = [];
        this._previousGemCluster    = [];
        
        this._nextGemCluster        = [];
        this._nextGemClusterPos     = [];
        
        this._gemsPool              = [];
        this._gemGrid               = [];
        for (var x = 0; x < this._gameData.level.maxRows; ++x) {
            this._gemGrid[x] = [];
            for (var y = 0; y < this._gameData.level.maxCols + 3; ++y) {
                this._gemGrid[x][y] = null;
            }
        }
        //////////////////////////////////////////////
        
         
        this._shiftSpeed = 1;
        this._shiftTimer = 0;
        
        this._numMoving = 0;
        this._numExploding = 0;
        
        //UI ELEMENTS
        this._previousGemCluster    = this._gemCluster;
    
        this._nextGemClusterPos[0]  = this._screenSize.width * 0.14;
        this._nextGemClusterPos[1]  = this._screenSize.height * 0.6;
        
        this.GameStateLabel         = cc.LabelTTF.create('Next Gems:', 'Arial', 32, cc.TEXT_ALLIGNMENT_LEFT);
        this.GameStateLabel.setAnchorPoint(0.5, 0.5);
        this.GameStateLabel.setColor(new cc.Color3B(255, 0, 0));
        this.GameStateLabel.setPosition(this._nextGemClusterPos[0] + 30, this._nextGemClusterPos[1] + 200);
        this.GameStateLabel.setZOrder(5);
        this.addChild(this.GameStateLabel);

        this._ScoreSystem           = new ScoreSystem(gameData);
        this._ScoreSystem.setPosition(this._screenSize.width * 0.15, this._screenSize.height * 0.5);
        
        this.addChild(this._ScoreSystem, 1);        
        //Sets Game State to Pending
        this._gridState             = GridState.Pending;
    },
    
    //Reset
    reset: function() {
        this._endGame(); //Changes game screen over to 'Game Over'
        this._ScoreSystem.resetScore();
        
        //Removes all the gems
        this.removeAllGemsFromGrid();
         
        this._shiftSpeed = 1;
        this._shiftTimer = 0;
        
        //Resets the gems states
        this._numMoving = 0;
        this._numExploding = 0;
        
        this._previousGemCluster[0] = {};
        this._previousGemCluster[0].row = 0;
        this._previousGemCluster[0].col = 0;
        this._previousGemCluster[1] = {};
        this._previousGemCluster[1].row = 0;
        this._previousGemCluster[1].col = 0;
        this._previousGemCluster[2] = {};
        this._previousGemCluster[2].row = 0;
        this._previousGemCluster[2].col = 0;
    
        //Sets Game State to Pending
        this._gridState             = GridState.Pending;
    },
    
    //Update
    update: function(dt) {

        this._shiftTimer += this._shiftSpeed;
        if (this._shiftTimer > this._gameData.level.shiftDelay) {
            //Checks if Gems are currently NOT in a busy state
            if (this._numMoving == 0 && this._numExploding == 0) {
                //Checks if any of the Gems in the cluster were shifted Down this frame
                if (!this.shiftAllGems()) {
                    this._keyboardEnabled = false;
                    this._shiftSpeed = 15;
                    this.runAction(cc.Sequence.create(cc.CallFunc.create(this.checkForMatches.bind(this), this),
                        cc.CallFunc.create(function() {
                            this._gridState = GridState.Idle;
                        }, this))); //Checks for Gem matches
                }

                //if (this.shiftGems() && !matches)
                //    return;
                //
                //if (!this.checkForMoves() && !this._noMoreMoves) {
                //    //cc.AudioEngine.getInstance().playEffect(s_noMoreMoves);
                //    this._noMoreMoves = true;
                //}

            } else {
                this._gridState = GridState.Processing;
            }
            this._shiftTimer = 0;
        }

        if (this._numMoving == 0 && this._numExploding == 0) {
            //Checks if the Game's state is IDLE
            if (this._gridState == GridState.Idle) {
                this._shiftSpeed = 1;
                this._scoreMultiplier = 1;
                this._anouncerCounter = 0;
                for (var i = 0; i < this._gemCluster.length; ++i) {
                    this._previousGemCluster[i].row = this._gemCluster[i].row;
                    this._previousGemCluster[i].col = this._gemCluster[i].col;
                }
                
                this._keyboardEnabled = true;
                //Generates a new Cluster 
                this.generateCluster(Math.floor(this._gameData.level.maxRows / 2), this._gameData.level.maxCols - 1);
                this._gridState = GridState.Waiting;
            }
        }


        //Check Touch Inputs
        if (this._isTouchDown == true && this._keyboardEnabled == true) {
            if (this._initialTouchPos[0] - this._currentTouchPos[0] > this._screenSize.width * 0.05) {
                this.shiftGemsLeft();
                this._isTouchDown = false;
            } else if (this._initialTouchPos[0] - this._currentTouchPos[0] < -this._screenSize.width * 0.05) {
                this.shiftGemsRight();
                this._isTouchDown = false;
            }


            if (this._initialTouchPos[1] - this._currentTouchPos[1] > this._screenSize.height * 0.05) {
                this._shiftSpeed = 15;
                this._isTouchDown = false;
            } else if (this._initialTouchPos[1] - this._currentTouchPos[1] < -this._screenSize.height * 0.05) {
                this.shuffleGemsUp();
                this._isTouchDown = false;
            }
        }
    },

    //Generation of cluster
    generateCluster: function(startRow, startCol) {
        
        if (this.checkClusterOutOfGrid(this._previousGemCluster)) {
            this.reset();
        }
        
        //Gets Grid Origin
        var GridOriginX = this._screenSize.width * 0.345;
        var GridOriginY = this._screenSize.height * 0.09;

        var Matches = true;

        //This needs to be done AFTER cluster is made for NEXT gem to be generated
        if (this._gemTypes == null)
            this.generateNextGemTypes();

        var GemNo = 0;
        //Empty's prior cluster
        this._gemCluster.length = 0;

        //Iterates through all rows and columns of the Grid
        for (var row = startRow; row < startRow + 1; ++row) {
            for (var col = startCol; col < startCol + 3; ++col) {
                //Creates a new Gem
                var new_gem = null;
                if (this._gemsPool.length != 0) {
                    new_gem = this._gemsPool.pop();
                } else {
                    new_gem = new Gem(false); //Sets touchable to TRUE
                }
                //Gives Gem a random type
                new_gem.setGemType(this._gemTypes[GemNo]);
                GemNo++;
                //Sets Gem Width and Height
                var gem_size = new_gem.getContentSize();
                new_gem.setWidth(gem_size.width);
                new_gem.setHeight(gem_size.height);

                //Sets Gem to Grid Scale Ratio
                var scaleRatio = cc.size(6 / this._gameData.level.maxCols, 6 / this._gameData.level.maxRows);
                new_gem.setScale(scaleRatio.width, scaleRatio.height);

                //Sets Position
                new_gem.setPosition(GridOriginX + row * (this._width / this._gameData.level.maxRows),
                    GridOriginY + (col + this._gameData.level.maxCols) * (this._height / this._gameData.level.maxCols));

                //Sets origin of sprite
                new_gem.setAnchorPoint(0, 0);
                //Sets Row and Col
                new_gem.setRow(row);
                new_gem.setCol(col);

                //Sets Gem's Overlay sprite scale
                var xScale = new_gem.getWidth() / Gem._explosionFrames[0].getOriginalSize().width;
                var yScale = new_gem.getHeight() / Gem._explosionFrames[0].getOriginalSize().height;
                new_gem._overlaySprite.setScaleX(xScale);
                new_gem._overlaySprite.setScaleY(yScale);

                //Sets the explosion animation speed
                new_gem.setExplosionSpeed(this._gameData.level.explosionSpeed);

                //Obtains Gem's appropriate grid location based on 'row' and 'col'
                var gemX = GridOriginX + row * (this._width / this._gameData.level.maxRows);
                var gemY = GridOriginY + col * (this._height / this._gameData.level.maxCols);
                //Moves the gem and sets it's state to "Moving"
                //this._numMoving++;
                //new_gem.moveGem(this._gameData.level.fallingTime, new cc.Point(gemX, gemY));
                new_gem.setPosition(new cc.p(gemX, gemY));
                
                //Adds Gem to grid for displaying
                if (this._gemGrid[row][col] !== null) {
                    this._gemsPool.push(this._gemGrid[row][col]);
                    this.removeChild(this._gemGrid[row][col]);
                    this._gemGrid[row][col] = null;
                }

                this._gemGrid[row][col] = new_gem;
                this.addChild(this._gemGrid[row][col]);

                //Adds Gem to Cluster for movement
                this._gemCluster.push({
                    row: new_gem.getRow(),
                    col: new_gem.getCol(),
                });
            }
        }



        this.generateNextGemTypes();
    },
    generateNextGemTypes: function() {
        var Matches = true;
        this._gemTypes = [];

        while (Matches) {
            for (var i = 0; i < 3; ++i) {
                this._gemTypes[i] = Math.floor((Math.random() * 4));
            }
            if (this._gemTypes[0] == this._gemTypes[1] && this._gemTypes[2] == this._gemTypes[1])
                Matches = true;
            else
                Matches = false;
        }

        //Gets Grid Origin
        var nextGemOriginX = this._nextGemClusterPos[0];
        var nextGemOriginY = this._nextGemClusterPos[1];

        var GemNo = 0;

        if (this._nextGemCluster.length == 0) {
            for (var i = 0; i < 3; ++i) {
                this._nextGemCluster[i] = new Gem(false);
                this.addChild(this._nextGemCluster[i], 1);
            }
        }

        for (var i = 0; i < 3; ++i) {
            var new_gem = this._nextGemCluster[i];
            //Gives Gem a random type
            new_gem.setGemType(this._gemTypes[GemNo]);
            GemNo++;
            //Sets Gem Width and Height
            var gem_size = new_gem.getContentSize();
            new_gem.setWidth(gem_size.width);
            new_gem.setHeight(gem_size.height);
            //Sets Gem to Grid Scale Ratio
            var scaleRatio = cc.size(6 / this._gameData.level.maxCols, 6 / this._gameData.level.maxRows);
            new_gem.setScale(scaleRatio.width, scaleRatio.height);
            //Sets Position
            //Sets Position
            new_gem.setPosition(nextGemOriginX,
                nextGemOriginY + i * (this._height / this._gameData.level.maxCols));
            //Sets origin of sprite
            new_gem.setAnchorPoint(0, 0);

            ////Sets Gem's Overlay sprite scale
            //var xScale = new_gem.getWidth() / Gem._explosionFrames[0].getOriginalSize().width;
            //var yScale = new_gem.getHeight() / Gem._explosionFrames[0].getOriginalSize().height;
            //new_gem._overlaySprite.setScaleX(xScale);
            //new_gem._overlaySprite.setScaleY(yScale);


            this._nextGemCluster[i] = new_gem;
        }
    },
    
    /* 
     * Cluster Functions
     */
    removeClusterFromGrid: function(cluster) {
        for (var i = 0; i < cluster.length; ++i) {
            var row = cluster[i].row;
            var col = cluster[i].col;
            this._gemsPool.push(this._gemGrid[row][col]);
            this.removeChild(this._gemGrid[row][col]);
            this._gemGrid[row][col] = null;
        }
    },
    checkClusterOutOfGrid:function(prevCluster) { //PERFECT
        for (var i = 0; i < prevCluster.length; ++i) {
            if (prevCluster[i].col >= this._gameData.level.maxCols) {
                return true;
            }
        }
        return false;
    },
    checkClusterCollision: function(prevCluster, currCluster) {
        for (var i = 0; i < prevCluster.length; ++i) {
            for (var x = 0; x < currCluster.length; ++x) {
                if (prevCluster[i].row == currCluster[i].row &&
                    prevCluster[i].col == currCluster[i].col) {
                    return true;
                }
            }
        }
        return false;
    },
    
    //GEMS
    removeAllGemsFromGrid: function() {
    for (var row = 0; row < this._gameData.level.maxRows; ++row) {
            for (var col = 0; col < this._gameData.level.maxCols + 3; ++col) {
                if (this._gemGrid[row][col] != null) {
                    this._gemsPool.push(this._gemGrid[row][col]);
                    this.removeChild(this._gemGrid[row][col]);
                    this._gemGrid[row][col] = null;
                }
            }
        }
    },
    
    ////////////////////////////////////
    
    /*
     * Keyboard and Touch Input Handlers
     */
        
    onEnter: function() {
        cc.registerTargetedDelegate(1, true, this);
        this._super();
    },
    onExit: function() {
        cc.unregisterTouchDelegate(this);
        this._super();
    },
    onKeyUp: function(key) {
        if (this._keyboardEnabled == false)
            return;

        switch (key) {
            case 37:
                this._keys.popObj(37);
                break;
            case 38:
                this._keys.popObj(38);
                break;
            case 39:
                this._keys.popObj(39);
                break;
            case 40:
                this._keys.popObj(40);
                break;
        }
    },
    onKeyDown: function(key) {
        //if (this._keyboardEnabled == false)
        //    return;

        if(this._keys.contains(key))
            return;
        
        switch (key) {
            case 37:
                this.shiftGemsLeft();
                this._keys.push(37);
                break;
            case 38:
                this.shuffleGemsUp();
                this._keys.push(38);
                break;
            case 39:
                this.shiftGemsRight();
                this._keys.push(39);
                break;
            case 40:
                this._shiftSpeed = 15;
                this._keys.push(40);
                break;
        }
    },
    //Touch Events
    onTouchBegan: function(touch, event) {
        this._initialTouchPos[0] = touch.getLocation().x;
        this._initialTouchPos[1] = touch.getLocation().y;

        this._currentTouchPos[0] = touch.getLocation().x;
        this._currentTouchPos[1] = touch.getLocation().y;

        this._isTouchDown = true;
    },
    onTouchesMoved: function(touch, event) {
        this._currentTouchPos[0] = touch[0].getLocation().x;
        this._currentTouchPos[1] = touch[0].getLocation().y;
    },
    onTouchesEnded: function(touch, event) {
        this._isTouchDown = false;
    },
    onTouchesCancelled: function(touch, event) {
        this._onTouchesEnded(touch, event);
    },
    //////////////////////////////

    setRowsAndCols: function(row1, col1, row2, col2) {
        for (var i = 0; i < this._gemCluster.length; ++i) {
            if (this._gemCluster[i].row == row1 &&
                this._gemCluster[i].col == col1) {
                this._gemCluster[i].row = row2;
                this._gemCluster[i].col = col2;
                return true;
            }
        }
        return false;
    },

     //Shift Gems
    shiftAllGems: function() {

        //Obtains Screen Dimensions
        var GridOriginX = this._screenSize.width * 0.345;
        var GridOriginY = this._screenSize.height * 0.09;

        //Check to see if any Gems were shifted after this function
        var anyShifts = false;

        //Iterates through all rows and columns of the Grid
        for (var row = 0; row < this._gameData.level.maxRows; ++row) {
            for (var col = 0; col < this._gameData.level.maxCols + 3; ++col) {
                //Checks if there is a Gem in current Row and Col of Grid
                if (this._gemGrid[row][col] !== null) {
                    //Checks if the position BELOW Gem is empty
                    if (this._gemGrid[row][col - 1] === null) {
                        //Shifts current Gem down one position
                        this._gemGrid[row][col - 1] = this._gemGrid[row][col];
                        this._gemGrid[row][col - 1].setRow(row);
                        this._gemGrid[row][col - 1].setCol(col - 1);

                        this.setRowsAndCols(row, col, row, col - 1);

                        //Sets OLD position to null
                        this._gemGrid[row][col] = null;
                        //Finally Moves Gem over to new Position
                        var gemX = GridOriginX + row * (this._width / this._gameData.level.maxRows);
                        var gemY = GridOriginY + (col - 1) * (this._height / this._gameData.level.maxCols);
                        //this._numMoving++;
                        //
                        //this._gemGrid[row][col - 1].moveGem(this._gameData.level.fallingTime, new cc.p(gemX, gemY));
                        this._gemGrid[row][col - 1].setPosition(new cc.p(gemX, gemY))
                        //Yes there was a Shift
                        anyShifts = true;
                    }
                }
            }
        }

        return anyShifts;
    },
    shiftClusterDown: function() {
        //Check to see if any Gems were shifted after this function
        var anyShifts = false;

        //Checks if there are any Gems below ANY of the Gems in the Cluster
        if (this.hasCollisions(ClusterSide.Down))
            return false;

        //Iterates through all Gems inside of Cluster
        for (var i = 0; i < this._gemCluster.length; ++i) {
            var row = this._gemCluster[i].row;
            var col = this._gemCluster[i].col;
            //Shifts current Gem DOWN one position
            this._gemGrid[row][col - 1] = this._gemGrid[row][col];
            this._gemGrid[row][col - 1].setRow(row);
            this._gemGrid[row][col - 1].setCol(col - 1);

            this.setRowsAndCols(row, col, row, col - 1);
            //this._numMoving++;
            //this._gemGrid[row][col - 1].moveGem(this._gameData.level.fallingTime, this._gemGrid[row][col].getPosition());
            this._gemGrid[row][col - 1].setPosition(this._gemGrid[row][col].getPosition());
            //Sets OLD position to null
            this._gemGrid[row][col] = null;
            anyShifts = true;
        }

        this.moveAllGems();

        return anyShifts;
    },
    
    shiftGemsLeft: function() {
        var anyShifts = false;

        //Checks if there are any Gems next to ANY of the Gems in the Cluster
        if (this.hasCollisions(ClusterSide.Left))
            return false;

        //Iterates through all Gems inside of Cluster
        for (var i = 0; i < this._gemCluster.length; ++i) {
            var row = this._gemCluster[i].row;
            var col = this._gemCluster[i].col;
            //Shifts current Gem LEFT one position
            this._gemGrid[row - 1][col] = this._gemGrid[row][col];
            this._gemGrid[row - 1][col].setRow(row - 1);
            this._gemGrid[row - 1][col].setCol(col);

            this.setRowsAndCols(row, col, row - 1, col);

            //Sets OLD position to null
            this._gemGrid[row][col] = null;
            //Finally Moves Gem over to new Position
            anyShifts = true;
        }

        this.moveAllGems();
        return anyShifts;
    },
    shiftGemsRight: function() {
        if (this.hasCollisions(ClusterSide.Right))
            return false;

        //Iterates through all Gems inside of Cluster
        for (var i = 0; i < this._gemCluster.length; ++i) {
            var row = this._gemCluster[i].row;
            var col = this._gemCluster[i].col;
            //Shifts current Gem RIGHT one position
            this._gemGrid[row + 1][col] = this._gemGrid[row][col];
            this._gemGrid[row + 1][col].setRow(row + 1);
            this._gemGrid[row + 1][col].setCol(col);

            this.setRowsAndCols(row, col, row + 1, col);
            //Sets OLD position to null
            this._gemGrid[row][col] = null;
        }
        this.moveAllGems();

        return true;
    },

    shuffleGemsUp: function() {
        //Check to see if any Gems were shifted after this function
        var anyShifts = false;

        //Checks if there are any Gems above ANY of the Gems in the Cluster
        if (this.hasCollisions(ClusterSide.Up))
            return false;

        //this._gemCluster.push(this._gemCluster.shift());


        //Iterates through all Gems inside of Cluster
        for (var i = this._gemCluster.length - 1; i >= 0; --i) {
            //Starts with TOP element
            var row = this._gemCluster[i].row;
            var col = this._gemCluster[i].col;
            //Shifts current Gem UP one position
            this._gemGrid[row][col + 1] = this._gemGrid[row][col];
            this._gemGrid[row][col + 1].setRow(row);
            this._gemGrid[row][col + 1].setCol(col + 1);

            this.setRowsAndCols(row, col, row, col + 1);

            //Sets OLD position to null
            this._gemGrid[row][col] = null;
            //Finally Moves Gem over to new Position
            anyShifts = true;
        }
        var row1 = this._gemCluster[0].row;
        var col1 = this._gemCluster[0].col;
        //Starts with TOP element
        var row2 = this._gemCluster[this._gemCluster.length - 1].row;
        var col2 = this._gemCluster[this._gemCluster.length - 1].col;
        //Shifts current Gem UP one position
        this._gemGrid[row1][col1 - 1] = this._gemGrid[row2][col2];
        this._gemGrid[row1][col1 - 1].setRow(row1);
        this._gemGrid[row1][col1 - 1].setCol(col1 - 1);

        this.setRowsAndCols(row2, col2, row1, col1 - 1);
        ////Sets the cluster's row and col
        //this._gemCluster[this._gemCluster.length - 1].setRow(row1);
        //this._gemCluster[this._gemCluster.length - 1].setCol(col1 - 1);
        //Sets OLD position to null
        this._gemGrid[row2][col2] = null;
        //Finally Moves Gem over to new Position        
        this._gemCluster.push(this._gemCluster.shift());
        this._gemCluster.push(this._gemCluster.shift());

        
        this.moveAllGems();
        
        //PLACEMENT TEMP
        this._gemCluster[0].placement = 'top';
        this._gemCluster[1].placement = 'middle';
        this._gemCluster[2].placement = 'bottom';

        return anyShifts;
    },

    moveAllGems: function() {
        for (var i = 0; i < this._gemCluster.length; ++i) {
            var row = this._gemCluster[i].row;
            var col = this._gemCluster[i].col;
            if (this._gemGrid[row][col] !== null) {
                var gemX = this._gridOriginX + row * (this._width / this._gameData.level.maxRows);
                var gemY = this._gridOriginY + col * (this._height / this._gameData.level.maxCols);
                //this._numMoving++;
                
                this._gemGrid[row][col].setPosition(new cc.p(gemX, gemY));
                //this._gemGrid[row][col].moveGem(this._gameData.level.fallingTime, new cc.p(gemX, gemY));
            }
        }
        for (var i = 0; i < this._gemCluster.length; ++i) {
            for (var x = 0; x < this._gemCluster.length; ++x) {
                if (this._gemCluster[i].col > this._gemCluster[x]) {
                    var temp = this._gemCluster[i];
                    this._gemCluster[i] = this._gemCluster[x];
                    this._gemCluster[x] = temp;
                }
            }
        }
    },

    hasCollisions: function(side) {
        if (side == ClusterSide.Up) {
            var row = this._gemCluster[this._gemCluster.length - 1].row;
            var col = this._gemCluster[this._gemCluster.length - 1].col;

            if (this._gemGrid[row][col + 1] !== null)
                return true;
        }

        for (var i = 0; i < this._gemCluster.length; ++i) {
            if (this._gemCluster[i] !== null) {
                var row = this._gemCluster[i].row;
                var col = this._gemCluster[i].col;
                switch (side) {
                    //Checks if one the positions around Gem are empty (DOWN, LEFT and RIGHT only)
                    case ClusterSide.Down:
                        if (col <= 0)
                            return true;

                        if (this._gemGrid[row][col - 1] !== null)
                            return true;
                        break;
                    case ClusterSide.Left:
                        if (row <= 0)
                            return true;

                        if (this._gemGrid[row - 1][col] !== null)
                            return true;
                        break;
                    case ClusterSide.Right:
                        if (row >= this._gameData.level.maxRows - 1)
                            return true;

                        if (this._gemGrid[row + 1][col] !== null)
                            return true;
                        break;
                }
            }
        }
        return false;
    },
    
    checkForMatches: function() {
        var matched = false;
        var matches = [];
        //Iterates through all Gems in the Grid
        for (var row = 0; row < this._gameData.level.maxRows; row++) {
            for (var col = 0; col < this._gameData.level.maxCols - 2; col++) {
                //Checks if the 3 Gems being compared each iteration are VALID
                if (
                    (this._gemGrid[row][col] !== null) &&
                    (this._gemGrid[row][col + 1] !== null) &&
                    (this._gemGrid[row][col + 2] !== null) &&
                    (this._gemGrid[row][col].getGemType() === this._gemGrid[row][col + 1].getGemType()) &&
                    (this._gemGrid[row][col].getGemType() === this._gemGrid[row][col + 2].getGemType())
                ) {
                    matched = true;
                    //Checks if the Matched Gems are already in the 'Matches' array. 
                    //If they cannot be found, then push the Gem into array
                    if (!matches.contains(this._gemGrid[row][col]))
                        matches.push(this._gemGrid[row][col]);
                    if (!matches.contains(this._gemGrid[row][col + 1]))
                        matches.push(this._gemGrid[row][col + 1]);
                    if (!matches.contains(this._gemGrid[row][col + 2]))
                        matches.push(this._gemGrid[row][col + 2]);
                }
            }
        }
        //Iterates through all Gems in the Grid
        for (var col = 0; col < this._gameData.level.maxCols; col++) {
            for (var row = 0; row < this._gameData.level.maxRows - 2; row++) {
                if (
                    //Checks if the 3 Gems being compared each iteration are VALID
                    (this._gemGrid[row][col] !== null) &&
                    (this._gemGrid[row + 1][col] !== null) &&
                    (this._gemGrid[row + 2][col] !== null) &&
                    (this._gemGrid[row][col].getGemType() === this._gemGrid[row + 1][col].getGemType()) &&
                    (this._gemGrid[row][col].getGemType() === this._gemGrid[row + 2][col].getGemType())
                ) {
                    matched = true;
                    //Checks if the Matched Gems are already in the 'Matches' array. 
                    //If they cannot be found, then push the Gem into array
                    if (!matches.contains(this._gemGrid[row][col]))
                        matches.push(this._gemGrid[row][col]);
                    if (!matches.contains(this._gemGrid[row + 1][col]))
                        matches.push(this._gemGrid[row + 1][col]);
                    if (!matches.contains(this._gemGrid[row + 2][col]))
                        matches.push(this._gemGrid[row + 2][col]);
                }
            }
        }

        //Iterates through all Gems in the Grid and checks for one diagonal place
        for (var col = 1; col < this._gameData.level.maxCols - 1; col++) {
            for (var row = 1; row < this._gameData.level.maxRows - 1; row++) {
                if (
                    //Checks if the 3 Gems being compared each iteration are VALID
                    (this._gemGrid[row][col] !== null) &&
                    (this._gemGrid[row - 1][col + 1] !== null) &&
                    (this._gemGrid[row + 1][col - 1] !== null) &&
                    (this._gemGrid[row][col].getGemType() === this._gemGrid[row - 1][col + 1].getGemType()) &&
                    (this._gemGrid[row][col].getGemType() === this._gemGrid[row + 1][col - 1].getGemType())
                ) {
                    matched = true;
                    //Checks if the Matched Gems are already in the 'Matches' array. 
                    //If they cannot be found, then push the Gem into array
                    if (!matches.contains(this._gemGrid[row][col]))
                        matches.push(this._gemGrid[row][col]);
                    if (!matches.contains(this._gemGrid[row - 1][col + 1]))
                        matches.push(this._gemGrid[row - 1][col + 1]);
                    if (!matches.contains(this._gemGrid[row + 1][col - 1]))
                        matches.push(this._gemGrid[row + 1][col - 1]);
                }
            }
        }

        //Iterates through all Gems in the Grid
        for (var row = 1; row < this._gameData.level.maxRows - 1; row++) {
            for (var col = 1; col < this._gameData.level.maxCols - 1; col++) {
                if (
                    //Checks if the 3 Gems being compared each iteration are VALID
                    (this._gemGrid[row][col] !== null) &&
                    (this._gemGrid[row + 1][col + 1] !== null) &&
                    (this._gemGrid[row - 1][col - 1] !== null) &&
                    (this._gemGrid[row][col].getGemType() === this._gemGrid[row + 1][col + 1].getGemType()) &&
                    (this._gemGrid[row][col].getGemType() === this._gemGrid[row - 1][col - 1].getGemType())
                ) {
                    matched = true;
                    //Checks if the Matched Gems are already in the 'Matches' array. 
                    //If they cannot be found, then push the Gem into array
                    if (!matches.contains(this._gemGrid[row][col]))
                        matches.push(this._gemGrid[row][col]);
                    if (!matches.contains(this._gemGrid[row + 1][col + 1]))
                        matches.push(this._gemGrid[row + 1][col + 1]);
                    if (!matches.contains(this._gemGrid[row - 1][col - 1]))
                        matches.push(this._gemGrid[row - 1][col - 1]);
                }
            }
        }

        var scoreAdded = 0;
        //Loops through all matches found in grid
        for (var i = 0; i < matches.length; i++) {
            this._numExploding++;
            //Sets the Gem's state to Exploding
            matches[i].setGemState(GemState.Exploding);

            scoreAdded += (this._scoreMultiplier * this._gameData.level.startingScore);
            this._playerScore += (this._scoreMultiplier * this._gameData.level.startingScore);
            //Score exponentially increases with the amount of gems matched this iteration
            //ADD SCORE HERE!!!<------------
            //DOUBLE SCORE BASED ON GAME STATES! i.e, Double points based on sequential matches (cascades)
        }
        if (matched) {
            this._ScoreSystem.addScore(scoreAdded, matches[Math.floor(matches.length / 2)].getPosition());
            this._scoreMultiplier++;

            var GridOriginX = this._screenSize.width * 0.345;
            var GridOriginY = this._screenSize.height * 0.09;

            this._ScoreSystem.playAnouncer(this._anouncerCounter,
                cc.p(GridOriginX + this._width / 2, GridOriginY + this._height / 2),
                3);
            this._anouncerCounter++;
        }

        return matched;
    },

    checkClusterForMatches: function() {
        //Checks if the 3 Gems being compared each iteration are VALID
        if (this._gemCluster[0] !== null &&
            this._gemCluster[1] !== null &&
            this._gemCluster[2] !== null &&
            this._gemCluster[0].getGemType() === this._gemCluster[1].getGemType() &&
            this._gemCluster[0].getGemType() === this._gemCluster[2].getGemType()) {
            return true;
        }
        return false;
    },
    //////////////////

    
    removeByRowCol: function(arr, row, col) {
        var i = arr.length;
        while (i--) {
            if (arr[i].row == row &&
                arr[i].col == col) {
                arr.splice(i, 1);
            }
        }
        return arr;
    },
    
    onMoveDone: function() {
        this._numMoving--;
    },
    removeExplodedGem: function(gem) {
        this._gemsPool.push(gem);
        this.removeChild(gem);
        this._gemGrid[gem.getRow()][gem.getCol()] = null;
        this.removeByRowCol(this._gemCluster, gem.getRow(), gem.getCol());
        this._numExploding--;
    },
    //////////////////////////////

});