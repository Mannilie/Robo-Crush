var GameState = {
    "MainMenu": 0,
    "InGame": 1,
    "Paused": 2,
    "GameOver": 3,
    "LeaderBoards": 4, //Possibly
};

var AIEMatch3Game = cc.Layer.extend({
    _gameState: null,

    ctor: function() {
        //calls the base constructor of Cocos2D
        this._super();

        //Gets screen size
        var screenSize = cc.Director.getInstance().getWinSize();

        //Adds the button sprite sheet to project
        cc.SpriteFrameCache.getInstance().addSpriteFrames(s_buttonsP, s_btn_green);

        //Sets the current Game State
        this.setGameState(GameState.MainMenu);
    },

    setGameState: function(gameState) {
        this._gameState = gameState;
        switch (gameState) {
            case GameState.MainMenu:
                /**
                 * Sets up Main Menu Screen
                 **/
                var mainmenu = new MainMenuScreen(this);
                cc.Director.getInstance().replaceScene(cc.TransitionPageTurn.create(1.0, mainmenu, true)); //Screen Transition
                break;
            case GameState.InGame:
                /**
                 * Sets up In Game Screen
                 **/
                var ingame = new InGameScreen(this);
                cc.Director.getInstance().replaceScene(cc.TransitionPageTurn.create(1.0, ingame, true)); //Screen Transition
                break;
            case GameState.Paused:
                /**
                 * Sets up Paused Screen
                 **/
                var paused = new PausedScreen(this);
                cc.Director.getInstance().replaceScene(paused); //Screen Transition
                break;
            case GameState.LeaderBoards:
                /**
                 * Sets up Leaderboards Screen
                 **/
                var leaderboards = new LeaderBoardScreen(this);
                cc.Director.getInstance().replaceScene(leaderboards); //Screen Transition
                break;
            case GameState.GameOver:
                /**
                 * Sets up Game Over Screen
                 **/
                var gameover = new GameOverScreen(this);
                cc.Director.getInstance().replaceScene(gameover); //Screen Transition
                break;
        }
    },

    resetGame: function() {
        this._inGame.resetGame();
    }
});