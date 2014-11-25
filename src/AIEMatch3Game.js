var GameState = {
    "MainMenu": 0,
    "InGame":1,
    "Paused":2,
    "GameOver":3,
    "LeaderBoards":4, //Possibly
};

var AIEMatch3Game = cc.Layer.extend({
    _mainMenu:null,
    _inGame:null,
    _paused:null,
    _leaderBoards:null,
    _gameOver:null,
    
    _gameState:null,
    
    ctor:function()
    {
        //calls the base constructor of Cocos2D
        this._super();

        var screenSize = cc.Director.getInstance().getWinSize();
        
        cc.SpriteFrameCache.getInstance().addSpriteFrames(s_buttonsP, s_btn_green);
    
        /**
         * Sets up Main Menu Screen   
         **/
        this._mainMenu = new MainMenuScreen();
        // Buttons
        var mainMenuButtons = []; //Creates a button array
        mainMenuButtons.push(new Button("Play", s_btn_green, this, 
                                        cc.p(screenSize.width * 0.5, screenSize.height * 0.60),
                                        function() { 
                                            this._sender.setGameState(GameState.InGame); }
                                        ));
        
        mainMenuButtons.push(new Button("Survey!", s_btn_green, this, 
                                          cc.p(screenSize.width * 0.5, screenSize.height * 0.40), 
                                          function() { 
                                                window.open("https://docs.google.com/forms/d/17xyI-Svo9ORNWcxMURoohG7r4hBB2-vxV-AvQwhDxK8/viewform?usp=send_form");
                                            }));
        //Create new buttons here
        
        this._mainMenu.addButtons(mainMenuButtons);
        
        
        /**
         * Sets up In Game Screen   
         **/
        this._inGame = new InGameScreen(this);
        
        // Buttons
        var inGameButtons = [];
        inGameButtons.push(new Button("Quit", s_btn_green, this,
                                      cc.p(screenSize.width * 0.15, screenSize.height * 0.3),
                                      function() { this._sender._inGame.reset();
                                                    //this._sender.setGameState(GameState.); 
                                                    }));
        
        //BROKEN
        //inGameButtons.push(new Button("Pause", s_btn_green, this,
        //                             cc.p(screenSize.width * 0.5, screenSize.height * 0.7),
        //                             function() { 
        //                                 this._sender.setGameState(GameState.Paused);
        //                                 this._sender._inGame.pauseUpdate(true);
        //                                 this._sender._inGame.disableButtons(true);
        //                             }));
        
        //Create new buttons here
        
        this._inGame.addButtons(inGameButtons);
        
        /**
         * Sets up Paused Screen   
         **/
        this._paused = new PausedScreen();
        
        // Buttons
        var pausedScreenButtons = [];
        pausedScreenButtons.push(new Button("Back", s_btn_green, this,
                                      cc.p(screenSize.width * 0.5, screenSize.height * 0.65),
                                      function() { this._sender.setGameState(GameState.InGame);
                                                 this._sender._inGame.pauseUpdate(false); 
                                                 this._sender._inGame.disableButtons(false);}));
        
        //Create new buttons here
        
        this._paused.addButtons(pausedScreenButtons);
        
        /**
         * Sets up Leaderboards Screen   
         **/
        this._leaderBoards = new LeaderBoardScreen();
        // Buttons 
        var leaderBoardButtons = [];
        leaderBoardButtons.push(new Button("Back", s_btn_green, this,
                                          cc.p(screenSize.width * 0.2, screenSize.height * 0.4),
                                          function() { this._sender.setGameState(GameState.MainMenu);}));
        
        //Create new buttons here
        
        this._leaderBoards.addButtons(leaderBoardButtons);
        
        /**
         * Sets up Game Over Screen   
         **/
        this._gameOver = new GameOverScreen();
        // Buttons
        var gameOverButtons = [];
        
        gameOverButtons.push(new Button("Retry", s_btn_green, this, 
                                          cc.p(screenSize.width * 0.5, screenSize.height * 0.4), 
                                          function() { 
                                                this._sender.setGameState(GameState.InGame);
                                            }));
        
        
        gameOverButtons.push(new Button("Survey!", s_btn_green, this, 
                                          cc.p(screenSize.width * 0.5, screenSize.height * 0.3), 
                                          function() { 
                                                window.open("https://docs.google.com/forms/d/17xyI-Svo9ORNWcxMURoohG7r4hBB2-vxV-AvQwhDxK8/viewform?usp=send_form");
                                            }));
        
        gameOverButtons.push(new Button("MainMenu", s_btn_green, this, 
                                          cc.p(screenSize.width * 0.5, screenSize.height * 0.2), 
                                          function() { 
                                                this._sender.setGameState(GameState.MainMenu);
                                            }));
        //Create new buttons here
        
        this._gameOver.addButtons(gameOverButtons);
        
        
        
        //Sets the current Game State
        this.setGameState(GameState.MainMenu);
        
        //Schedules update for all children
        this.schedule(this.update, 0);
    },
    
    update:function(dt){       
        //Updates all of the children
        var childNode = this._children;
        for (var i = 0; i < childNode.length; i++){
            var child = childNode[i];
            child.update(dt);
        }
    },
    
    setGameState:function(gameState) {
        this._gameState = gameState;
        this.removeAllChildren();
        switch(gameState) {
            case GameState.MainMenu:
                this.addChild(this._mainMenu);
                break;
            case GameState.InGame:
                this.addChild(this._inGame);
                break;
            case GameState.Paused:
                this.addChild(this._paused);
                break;    
            case GameState.LeaderBoards:
                this.addChild(this._leaderBoards);
                break;
            case GameState.GameOver:
                this.addChild(this._gameOver);
                break;
        }
    },
        
    resetGame:function() {
        this._inGame.resetGame();  
    }
});