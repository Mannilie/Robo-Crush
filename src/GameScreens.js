/*
 * Main Menu Screen
 */
var MainMenuScreen = cc.Scene.extend({
    _buttons: null,
    _background: null,

    _gameTitle: null,
    //Transitions and stuff if you want
    _myName:null,
    
    _sender: null,
    
    ctor: function(sender) {
        this._super();
        this.init();

        this._sender = sender;
        
        var screenSize = cc.Director.getInstance().getWinSize();
        
        /*
         * Screen objects
         */
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

        this._buttons = [];
        
        /*
         * Buttons 
         */
        var mainMenuButtons = []; 
        mainMenuButtons.push(new Button("Play", s_btn_green, this._sender, 
                                        cc.p(screenSize.width * 0.5, screenSize.height * 0.60),
                                        function() { 
                                            this._sender.setGameState(GameState.InGame); }
                                        ));
        
        mainMenuButtons.push(new Button("Survey!", s_btn_green, this._sender, 
                                          cc.p(screenSize.width * 0.5, screenSize.height * 0.40), 
                                          function() { 
                                                window.open("https://docs.google.com/forms/d/17xyI-Svo9ORNWcxMURoohG7r4hBB2-vxV-AvQwhDxK8/viewform?usp=send_form");
                                            }));
        //Create new buttons here
        
        this.addButtons(mainMenuButtons);        
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
var InGameScreen = cc.Scene.extend({
    _buttons: null,
    _background: null,
    _backgroundGrid: null,

    _gemGrid: null,

    _gameData: null,

    _game: null,
    
    _sender:null,

    ctor: function(gameData, sender) {
        this.init();
        this._super();
        
        this._gameData = gameData;
        this._sender = sender;
        
        var screenSize = cc.Director.getInstance().getWinSize();

        this._buttons = [];
        
        /*
         * Screen objects
         */
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
                
        // Buttons
        var inGameButtons = [];
        inGameButtons.push(new Button("Quit", s_btn_green, this._sender,
                                      cc.p(screenSize.width * 0.15, screenSize.height * 0.3),
                                      function() {
                                                    this._sender.setGameState(GameState.MainMenu);
                                                    //this._sender._inGame.reset(); 
                                                    }));
        
        this.addButtons(inGameButtons);
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
var PausedScreen = cc.Scene.extend({
    _buttons: null,
    
    _sender:null,
    
    ctor: function(sender) {
        this.init();
        this._super();
        
        this._sender = sender;
        
        this._buttons = [];
        
        /*
         * Buttons
         */
        var pausedScreenButtons = [];
        pausedScreenButtons.push(new Button("Back", s_btn_green, this._sender,
                                      cc.p(screenSize.width * 0.5, screenSize.height * 0.65),
                                      function() { this._sender.setGameState(GameState.InGame);
                                                                                         }));
        
        //Create new buttons here
        
        this.addButtons(pausedScreenButtons);
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
    _buttons: null,
    _labels:null,
    
    _highScoresManager:null,
    
    ctor: function(sender) {
        this.init();
        this._super();

        this._buttons = [];
        this._labels = [];

        this._sender = sender;
    
        
        var screenSize = cc.Director.getInstance().getWinSize();
        
        this._highScoresManager = new HighScoreManager();
        this.addChild(this._highScoresManager, 1);
        
        /*
         * Buttons
         */
        var leaderBoardButtons = [];
        leaderBoardButtons.push(new Button("Back", s_btn_green, this._sender,
                                          cc.p(screenSize.width * 0.5, screenSize.height * 0.2),
                                          function() { 
                                                this._sender.setGameState(GameState.MainMenu);
                                          }));
        
        //Create new buttons here
        
        this.addButtons(leaderBoardButtons);
    },
    
    addLabel: function(new_labels) {
        this._labels.push(new_labels);
        this.addChild(new_labels);
    },
    addLabels: function(new_labels) {
        for (var i = 0; i < new_labels.length; ++i) {
            this._labels.push(new_labels[i]);
            this.addChild(new_labels[i]);
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
});
/*
 * Game Over Screen
 */
var GameOverScreen = cc.Scene.extend({
    _buttons: null, 
    _labels:null,
    
    _background: null,
    
    _scoreSystem:null,
    
    _sender: null,
    
    ctor: function(sender) {
        this.init();
        this._super();

        this._scoreSystem = ScoreSystem.getInstance();
        
        this._sender = sender;
        
        this._buttons = [];
        this._labels = [];
        
        var screenSize = cc.Director.getInstance().getWinSize();

        /*
         * Buttons
         */
        this._background = new Texture2D(s_gameover_background,
            cc.p(screenSize.width * 0.5, screenSize.height * 0.75));

        this._background.setScale(screenSize.width / this._background.getContentSize().width,
            screenSize.height / this._background.getContentSize().height);

        this.addChild(this._background);
                
        //Labels
        var gameOverLabel = cc.LabelTTF.create("Score: " + this._scoreSystem.getScore(), 'Arial', 32, cc.TEXT_ALLIGNMENT_LEFT);;
        gameOverLabel.setAnchorPoint(0.5, 0.5);
        gameOverLabel.setOpacity(255);
        gameOverLabel.setPosition(cc.p(screenSize.width * 0.5, screenSize.height * 0.4));
        gameOverLabel.setColor(new cc.Color3B(255, 0, 0));
        
        this.addLabel(gameOverLabel);
                            
        // Buttons
        var gameOverButtons = [];
        //Push back new buttons into array  
        
        gameOverButtons.push(new Button("Submit", s_btn_green, this._sender, 
                                          cc.p(screenSize.width * 0.5, screenSize.height * 0.25), 
                                          function() { 
                                                this._sender.setGameState(GameState.LeaderBoards);
                                            }));
        
        gameOverButtons.push(new Button("Retry", s_btn_green, this._sender, 
                                          cc.p(screenSize.width * 0.5, screenSize.height * 0.15), 
                                          function() { 
                                                this._sender.setGameState(GameState.InGame);
                                            }));
        
        gameOverButtons.push(new Button("MainMenu", s_btn_green, this._sender, 
                                          cc.p(screenSize.width * 0.5, screenSize.height * 0.05), 
                                          function() { 
                                                this._sender.setGameState(GameState.MainMenu);
                                            }));
        //Create new buttons here
        
        this.addButtons(gameOverButtons);
        
    },

    addLabel: function(new_labels) {
        this._labels.push(new_labels);
        this.addChild(new_labels);
    },
    addLabels: function(new_labels) {
        for (var i = 0; i < new_labels.length; ++i) {
            this._labels.push(new_labels[i]);
            this.addChild(new_labels[i]);
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
});