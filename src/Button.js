var ButtonState = {
    "Idle": 0,
    "Hover": 1,
    "Pressed": 2
};

var Button = cc.Layer.extend({
    _button: null,
    _buttonState: null,
    _buttonLabel: null,
    _buttonLabelString:null,
    //Delegate
    _onClick:null,
    
    _thisClass:null,
    
    _sender:null,
    
    ctor: function(label, btnTexture, sender, position, event) {
        this.init();
        this._super();

        this._sender = sender;
        //Input events
        this.setTouchMode(cc.TOUCH_ALL_AT_ONCE);
        this.setTouchEnabled(true);
        this.setMouseEnabled(true); 
        //////////////////////
        
        this._button = cc.Sprite.create(btnTexture);
        this._button.setPosition(position);
        this._button.setAnchorPoint(0.5, 0.5);
        this._button.setOpacity(255);
        this._onClick = event;
        this.addChild(this._button, 0);

        this.setButtonState(ButtonState.Idle);
        this._buttonLabelString = label;
        this._buttonLabel = cc.LabelTTF.create(label, 'Arial', 32, cc.TEXT_ALLIGNMENT_LEFT);
        this._buttonLabel.setAnchorPoint(0.5, 0.5);
        this._buttonLabel.setOpacity(255);
        this._buttonLabel.setPosition(position);
        this._buttonLabel.setColor(new cc.Color3B(255, 255, 255));
        //this._buttonLabel.enableShadow(cc.size(1, 1), 1, 4);
        this.addChild(this._buttonLabel, 1);

    },
    
    setPosition: function(x, y) {
        this._button.setPosition(x, y);
        this._buttonLabel.setPosition(x, y);
    },
    
    onMouseMoved:function(touch, event) {
        if (this.isPointOver(touch.getLocation())) {
            this.setButtonState(ButtonState.Hover);
        } else {
            this.setButtonState(ButtonState.Idle);
        }
    },

    getLabel:function() {
        return this._buttonLabelString;  
    },
    setLabel: function(string) {
        this._buttonLabel.setString(string);
        this._buttonLabelString = string;
    },
    setFont: function(font) {
        this._buttonLabel.setFont(font);
    },

    setButtonState: function(buttonState) {
        this._buttonState = buttonState;
        switch (buttonState) {
            case ButtonState.Idle:
                this._button.setDisplayFrame(cc.SpriteFrameCache.getInstance().getSpriteFrame("btn_1.png"));
                break;
            case ButtonState.Hover:
                this._button.setDisplayFrame(cc.SpriteFrameCache.getInstance().getSpriteFrame("btn_2.png"));
                break;
            case ButtonState.Pressed:
                this._button.setDisplayFrame(cc.SpriteFrameCache.getInstance().getSpriteFrame("btn_3.png"));
                break;
        }
    },

    onTouchBegan: function(touch, event) {
        if (this.isPointOver(touch.getLocation())) {
            this.setButtonState(ButtonState.Pressed);
        }
    },

    onTouchesMoved:function(touch, event) {
        if (this.isPointOver(touch[0].getLocation())) {
            this.setButtonState(ButtonState.Pressed);
        } else {
            this.setButtonState(ButtonState.Idle);
        }
    },
    
    onTouchesEnded: function(touch, event) {
        this.setButtonState(ButtonState.Idle);
        //Maybe do something here!
        //Perhaps run a 'delegate' here
        if(this.isPointOver(touch[0].getLocation())) {
            if(this._onClick != null)
                this._onClick();
        }
    },


    isPointOver: function(point) {
        var size = this._button.getContentSize();
        size.width *= this._button.getScaleX();
        size.height *= this._button.getScaleY();

        var pos = this._button.getPosition();

        return (point.x < pos.x + size.width / 2 &&
            point.x > pos.x - size.width / 2 &&
            point.y < pos.y + size.height / 2 &&
            point.y > pos.y - size.height / 2);
    },
    //onEnter: function() {
    //    cc.registerTargetedDelegate(1, true, this);
    //    this._super();
    //},
    //onExit: function() {
    //    cc.unregisterTouchDelegate(this);
    //    this._super();
    //},

    removeLabel: function(Label) {},
    setGameData: function(gameData) {
        this._gameData = gameData;
    }
});