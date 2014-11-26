var MSG_SELECT_GEM = "msg_select_gem";

var MSG_REMOVE_GEM = "msg_remove_gem";
var MSG_MOVE_DONE = "msg_move_done";

var MSG_TOUCH_ENABLED = "msg_touch_enabled";
var MSG_TOUCH_DISABLED = "msg_touch_disabled";

var GemType = {
    "Purple": 0,
    "Blue": 1,
    "Orange": 2,
    "Green": 3,
    "Empty": 4
};

var GemState = {
    "Normal": 0,
    "Exploding": 1,
    "Empty": 2,
    "Moving": 3
};

var Gem = cc.Sprite.extend({
    _screenSize: null,
    _gemType: null,
    //Settings
    _width: null,
    _height: null,
    _row: null,
    _col: null,
    //Game State
    _gemState: null,
    //Gem Effects
    _overlaySprite: null,
    //_touchEnabled: true,
    _explosionSpeed: null,
    _explosionAnimation:null,
    
    //Initialization
    ctor: function() {
        this._super();
        this.init();
        
        this.setGemType(4);

        this._width = 64;
        this._height = 64;

        //Sets screen size
        this._screenSize = cc.Director.getInstance().getWinSize();

        this._explosionSpeed = 0.5;
        
        // initialising the overlay sprite
        this._overlaySprite = cc.Sprite.create();
        this._overlaySprite.setAnchorPoint(0, 0);
        this.addChild(this._overlaySprite);
    },

    //Accessors and Mutators
    setGemState: function(state) {
        if (this._gemState == state)
            return;

        this._gemState = state;
        switch (this._gemState) {
            case GemState.Exploding:
                
                //Sets the overlay sprite
                this._overlaySprite = cc.Sprite.create();
                this._overlaySprite.setAnchorPoint(0, 0);
                this.addChild(this._overlaySprite);
                var Animation = cc.Animation.create(Gem._explosionFrames, this._explosionSpeed);
                var Animate = cc.Animate.create(Animation);
                
                //Fades this sprite out
                this.runAction(cc.FadeOut.create(0.2));
                
                //Plays the explosion animation followed by running the 'onExplodeEnd' function
                this._overlaySprite.runAction(cc.Sequence.create(Animate,
                    cc.FadeOut.create(0.01),
                    cc.CallFunc.create(this.onExplodeEnd.bind(this), this)));
                
                break;
            default:
                break;
        }
    },
    getExplosionSpeed: function() {
        return this._explosionSpeed;
    },
    setExplosionSpeed: function(explosionSpeed) {
        this._explosionSpeed = explosionSpeed;
    },

    getGemState: function() {
        return this._gemState;
    },
    setGemType: function(gemType) {
        this.gem_type = gemType;
        
        //Sets the gem's sprite over to the appropriate gem in sprite sheet loaded previously
        switch (gemType) {
            case GemType.Purple:
                this.setDisplayFrame(cc.SpriteFrameCache.getInstance().getSpriteFrame("Gem_01.png"));
                break;
            case GemType.Blue:
                this.setDisplayFrame(cc.SpriteFrameCache.getInstance().getSpriteFrame("Gem_02.png"));
                break;
            case GemType.Orange:
                this.setDisplayFrame(cc.SpriteFrameCache.getInstance().getSpriteFrame("Gem_03.png"));
                break;
            case GemType.Green:
                this.setDisplayFrame(cc.SpriteFrameCache.getInstance().getSpriteFrame("Gem_04.png"));
                break;
            case GemType.Empty:
                break;
            default:
                throw "bad gem type";
                break;
        }
    },
    getGemType: function() {
        return this.gem_type;
    },
    getRow: function() {
        return this._row;
    },
    setRow: function(row) {
        this._row = row;
    },
    getCol: function() {
        return this._col;
    },
    setCol: function(col) {
        this._col = col;
    },

    getWidth: function() {
        return this._width;
    },
    setWidth: function(width) {
        this._width = width;
    },

    getHeight: function() {
        return this._height;
    },
    setHeight: function(height) {
        this._height = height;
    },

    getWidth: function() {
        return this._width;
    },
    getHeight: function() {
        return this._height;
    },
    getGemPosition: function() {
        return this.getPosition();
    },
    setNormalizedScale: function(x, y) {
        this.setScale(x / this._width, y / this._height);
    },
    ////////////////////////////////////////////////////////////

    //Actions
    moveGem: function(duration, endPosition) {
        //Moves the sprite followed by calling the 'onMoveEnd' function
        var action = cc.Sequence.create(cc.MoveTo.create(duration, endPosition), cc.CallFunc.create(this.onMoveEnd.bind(this), this));
        this.setGemState(GemState.Moving);
        this.runAction(action);
    },
    onMoveEnd: function() {
        this.setGemState(GemState.Stable);
        //Posts notification to GemGrid
        cc.NotificationCenter.getInstance().postNotification(MSG_MOVE_DONE, this);
    },
    onExplodeEnd: function() {
        this.setGemState(GemState.Empty);
        this.setOpacity(255);
        //Posts notification to GemGrid
        cc.NotificationCenter.getInstance().postNotification(MSG_REMOVE_GEM, this);
    },
    //////////////////////////////////////////////////////////////////

    //Other
    randomise: function() {
        this.setOpacity(255);
        //Sets this gem's gemtype to a random gem
        this.setGemType(Math.floor((Math.random() * 4)));
    },
    //////////////////////////
});