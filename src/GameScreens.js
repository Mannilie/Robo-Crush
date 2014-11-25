/*
 * Main Menu Screen
 */
var MainMenuScreen = cc.Layer.extend({
    _buttons: [],
    _background: null,

    _gameTitle: null,
    //Transitions and stuff if you want
    _myName:null,
    ctor: function() {
        this._super();
        this.init();

        var screenSize = cc.Director.getInstance().getWinSize();

        //Backgrounds
        this._background = new Texture2D(s_mainmenu_background,
            cc.p(screenSize.width / 2, screenSize.height / 2));

        this._gameTitle = new Texture2D(s_mainmenu_title,
            cc.p(screenSize.width / 2, screenSize.height * 0.8));
        this._background.setScale(screenSize.width / this._background.getWidth(), screenSize.height / this._background.getHeight());
        this._gameTitle.setScale(415 / this._gameTitle.getWidth(), 47 / this._gameTitle.getHeight());

        this._myName = new Texture2D(s_my_name,
            cc.p(screenSize.width / 2, screenSize.height * 0.2));
        
        this._myName.setScale(350 / this._gameTitle.getWidth(), 43 / this._gameTitle.getHeight());
        
        this.addChild(this._background, 0);
        this.addChild(this._gameTitle, 1);
        this.addChild(this._myName, 2);
    },

    addButton: function(new_btn) {
        this._buttons.push(new_btn);
        this.addChild(new_btn);
    },

    addButtons: function(new_btns) {
        for (var i = 0; i < new_btns.length; ++i) {
            this._buttons.push(new_btns[i]);
            this.addChild(new_btns[i]);
        }
    },
});

/*
 * In Game Screen
 */
var InGameScreen = cc.Layer.extend({
    _buttons: [],
    _background: null,
    _backgroundGrid: null,

    _gemGrid: null,

    _gameData: null,

    _game: null,

    _pausedUpdate: false,

    loadLevels: function() {
        var data = cc.FileUtils.getInstance().getTextFileData(s_gameData);
        this._gameData = eval("(" + data + ")");
    },

    ctor: function(sender) {
        this.init();
        this._super();
        this.loadLevels();

        var screenSize = cc.Director.getInstance().getWinSize();

        //Backgrounds
        this._background = new Texture2D(s_background,
            cc.p(screenSize.width / 2, screenSize.height / 2));
        this._backgroundGrid = new Texture2D(s_background_grid,
            cc.p(screenSize.width / 2, screenSize.height / 2));
        this._background.setScale(screenSize.width / this._background.getContentSize().width,
            screenSize.height / this._background.getContentSize().height);
        this._backgroundGrid.setScale(screenSize.width / this._backgroundGrid.getContentSize().width,
            screenSize.height / this._backgroundGrid.getContentSize().height);

        //this._healthbar = new HealthBar(s_health_bar);        

        cc.SpriteFrameCache.getInstance().addSpriteFrames(s_gemsP, s_gems);
        cc.SpriteFrameCache.getInstance().addSpriteFrames(s_explosionP, s_explosion);
        this._gemGrid = new GemGrid(this._gameData);
        this._gemGrid.generateCluster(Math.floor(this._gameData.level.maxRows / 2), this._gameData.level.maxCols - 1);
        this._gemGrid._sender = sender;
        this._gemGrid._endGame = function() {
            this._sender.setGameState(GameState.GameOver);
        }

        //Object linking
        this.addChild(this._background);
        this.addChild(this._backgroundGrid);
        this.addChild(this._gemGrid);
    },

    pauseUpdate: function(bool) {
        this._pausedUpdate = bool;
        if (bool) {
            this._gemGrid.setTouchEnabled(false);
            this._gemGrid.setKeyboardEnabled(false);
        } else {
            this._gemGrid.setTouchEnabled(true);
            this._gemGrid.setKeyboardEnabled(true);
        }
    },

    disableButtons: function(bool) {
        if (bool) {
            for (var i = 0; i < this._buttons.length; ++i) {
                this._buttons[i].setTouchEnabled(false);
                this._buttons[i].setKeyboardEnabled(false);
                this._buttons[i].setMouseEnabled(false); 
            }
        } else {
            for (var i = 0; i < this._buttons.length; ++i) {
                this._buttons[i].setTouchEnabled(true);
                this._buttons[i].setKeyboardEnabled(true);
                this._buttons[i].setMouseEnabled(true); 
            }
        }
    },

    update: function(dt) {
        if (this._pausedUpdate)
            return;

        var childNode = this._children;
        for (var i = 0; i < childNode.length; i++) {
            var child = childNode[i];
            child.update(dt);
        }
    },

    addButton: function(new_btn) {
        this._buttons.push(new_btn);
        this.addChild(new_btn);
    },

    addButtons: function(new_btns) {
        for (var i = 0; i < new_btns.length; ++i) {
            this._buttons.push(new_btns[i]);
            this.addChild(new_btns[i]);
        }
    },

    reset: function() {
        this._gemGrid.reset();
    }
});

/*
 * Paused Screen
 */
var PausedScreen = cc.Layer.extend({
    _buttons: [],

    ctor: function() {
        this.init();
        this._super();
    },

    addButton: function(new_btn) {
        this._buttons.push(new_btn);
        this.addChild(new_btn);
    },

    addButtons: function(new_btns) {
        for (var i = 0; i < new_btns.length; ++i) {
            this._buttons.push(new_btns[i]);
            this.addChild(new_btns[i]);
        }
    },
});

/*
 * Leaderboard Screen
 */
var LeaderBoardScreen = cc.Layer.extend({
    _buttons: [],

    ctor: function() {
        this.init();
        this._super();
    },

    addButton: function(new_btn) {
        this._buttons.push(new_btn);
        this.addChild(new_btn);
    },

    addButtons: function(new_btns) {
        for (var i = 0; i < new_btns.length; ++i) {
            this._buttons.push(new_btns[i]);
            this.addChild(new_btns[i]);
        }
    },
});

/*
 * Game Over Screen
 */
var GameOverScreen = cc.Layer.extend({
    _buttons: [],
    _background: null,

    ctor: function() {
        this.init();
        this._super();

        var screenSize = cc.Director.getInstance().getWinSize();

        this._background = new Texture2D(s_gameover_background,
            cc.p(screenSize.width * 0.5, screenSize.height * 0.7));

        this._background.setScale(screenSize.width / this._background.getContentSize().width,
            screenSize.height / this._background.getContentSize().height);

        this.addChild(this._background);
    },

    addButton: function(new_btn) {
        this._buttons.push(new_btn);
        this.addChild(new_btn);
    },

    addButtons: function(new_btns) {
        for (var i = 0; i < new_btns.length; ++i) {
            this._buttons.push(new_btns[i]);
            this.addChild(new_btns[i]);
        }
    },
});