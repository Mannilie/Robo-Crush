var GemCluster = cc.Layer.create({
    _maxNumGems:3,
        
    
    init: function() {
        
    },

    ctor: function() {
        this._super();
        this.init();

        this._gameData = gameData;

        //initialising the selectedGems array
        this._selectedGems = [];
        cc.NotificationCenter.getInstance().addObserver(this, this.selectGem, MSG_SELECT_GEM);
        cc.NotificationCenter.getInstance().addObserver(this, this.onMoveDone, MSG_MOVE_DONE);

        cc.NotificationCenter.getInstance().addObserver(this, this.onSwapDone, MSG_SWAP_DONE);
        cc.NotificationCenter.getInstance().addObserver(this, this.removeExplodedGem, MSG_REMOVE_GEM);

        this._gemsPool = [];

        this._gameState = GameState.Pending;

        this.GameStateLabel = cc.LabelTTF.create('GameState: ' + "Pending", 'Times New Roman', 32, cc.TEXT_ALIGNMENT_LEFT);
        this.GameStateLabel.setColor(new cc.Color3B(255, 0, 0));
        this.GameStateLabel.setAnchorPoint(0.5, 0.5);
        this.GameStateLabel.setPosition(this._screenSize.width * 0.2, this._screenSize.height * 0.93);
        this.GameStateLabel.setZOrder(1);
        this.addChild(this.GameStateLabel);
    },
    
    createGemCluster: function(startRow, startCol) {
        this._gemGrid = [];
        for (var x = 0; x < this._gameData.level.maxRows; ++x) {
            this._gemGrid[i] = [];
            for (var y = 0; y < this._gameData.level.maxCols; ++y) {
                this._gemGrid[x][y] = null;
            }
        }
        var GridOriginX = this._screenSize.width * 0.345;
        var GridOriginY = this._screenSize.height * 0.09;
        for (var row = startRow - 1; row < startRow + 1; ++row) {
            this._gemGrid[row] = [];
            for (var col = startCol; col <= startCol; ++col) {
                var new_gem = new Gem();
                new_gem.setGemType(Math.floor(Math.random() * 4));
                var gem_size = new_gem.getContentSize();

                var rat = cc.size(6 / this._gameData.level.maxCols, 6 / this._gameData.level.maxRows);

                var xScale = new_gem.getWidth() / Gem._explosionFrames[0].getOriginalSize().width;
                var yScale = new_gem.getHeight() / Gem._explosionFrames[0].getOriginalSize().height;

                new_gem._overlaySprite.setScaleX(xScale);
                new_gem._overlaySprite.setScaleY(yScale);

                new_gem.setPosition(GridOriginX + row * (this._width / this._gameData.level.maxRows),
                    GridOriginY + (col + this._gameData.level.maxCols) * (this._height / this._gameData.level.maxCols));

                new_gem.setAnchorPoint(0, 0);
                new_gem.setRow(row);
                new_gem.setCol(col);

                new_gem.setWidth(gem_size.width);
                new_gem.setHeight(gem_size.height);

                new_gem.setScale(rat.width, rat.height);

                var gemX = GridOriginX + row * (this._width / this._gameData.level.maxRows);
                var gemY = GridOriginY + col * (this._height / this._gameData.level.maxCols);

                //Moves the gem and sets it's state to "Moving"
                this._numMoving++;
                new_gem.moveGem(this._gameData.level.swappingTime, new cc.Point(gemX, gemY));

                //TEMP TEXT
                gemX = GridOriginX + row * (this._width / this._gameData.level.maxRows) + 80;
                gemY = GridOriginY + col * (this._height / this._gameData.level.maxCols) + 80;
                var myLabel = cc.LabelTTF.create((col).toString(), 'Times New Roman', 32, cc.TEXT_ALIGNMENT_LEFT);
                myLabel.setColor(new cc.Color3B(255, 0, 0));
                myLabel.setAnchorPoint(0.5, 0.5);
                myLabel.setPosition(gemX - new_gem.getWidth() / 3, gemY - new_gem.getHeight() / 3);
                myLabel.setZOrder(1);
                this.addChild(myLabel);
                var myLabelCol = cc.LabelTTF.create((row).toString(), 'Times New Roman', 32, cc.TEXT_ALIGNMENT_LEFT);
                myLabelCol.setColor(new cc.Color3B(0, 0, 255));
                myLabelCol.setAnchorPoint(0.5, 0.5);
                myLabelCol.setPosition(gemX - new_gem.getWidth(), gemY - new_gem.getHeight());
                myLabelCol.setZOrder(100);
                this.addChild(myLabelCol);
                //////////////////

                this._gemGrid[row][col] = new_gem;
                this.addChild(new_gem, 10);
            }
        }
        ////this.gemGrid[0][5].setColor(new cc.Color3B(0, 0,0));
        //this.checkForMatches();
    },

});