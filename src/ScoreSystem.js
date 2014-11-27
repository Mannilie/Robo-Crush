var MSG_REMOVE_SCORE_LABEL = "msg_remove_score_label";
var MSG_REMOVE_SCALED_LABEL = "msg_remove_scaled_label";

var ScoreSystem = cc.Layer.extend({
    _scoreLabelPos: [],
    _scoreLabel: null,
    _score: 0,
    _scoreAddedLabels: [],
    _gameData: null,
    //Stores the different announcement strings for transitions
    _scoreAnnouncers: [],
    _anouncerLabels: [],
    ctor: function() {
        this.init();
        this._super();
    },
    
    initialise:function(gameData) {
        this._gameData = gameData;    
        
        this._scoreLabel = cc.LabelTTF.create("Score: " + this._score, this._gameData.UI.defaultFont, 32, cc.TEXT_ALLIGNMENT_LEFT);
        this._scoreLabel.setAnchorPoint(0.5, 0.5);
        this._scoreLabel.setOpacity(255);
        this._scoreLabel.setColor(new cc.Color3B(255, 0, 0));
        this._scoreLabel.enableShadow(cc.size(1, 1), 1, 4);
        this.addChild(this._scoreLabel);

        cc.NotificationCenter.getInstance().addObserver(this, this.removeLabel, MSG_REMOVE_SCORE_LABEL);
        cc.NotificationCenter.getInstance().addObserver(this, this.removeScaledLabel, MSG_REMOVE_SCALED_LABEL);

        this._scoreAnnouncers = this._gameData.level.scoreAnnouncers;
    },
    
    playAnouncer: function(anouncerNo, position, scaleAmount) {
        if (anouncerNo >= this._scoreAnnouncers.length)
            anouncerNo = this._scoreAnnouncers.length - 1;

        if(anouncerNo == 1) {
            cc.AudioEngine.getInstance().playEffect(s_multi);   
        }
        else if(anouncerNo == 2) {
            cc.AudioEngine.getInstance().playEffect(s_ultra);  
        }
        else if(anouncerNo == 3) {
            cc.AudioEngine.getInstance().playEffect(s_fantastic);  
        }
        
        var labelAnnouncer = new AnnouncerLabel();
        labelAnnouncer.setPosition(position);
        labelAnnouncer.setString(this._scoreAnnouncers[anouncerNo]);
        labelAnnouncer.resizeLabel(this._gameData.UI.LabelSpeed, scaleAmount);
        this._anouncerLabels.push(labelAnnouncer);
        this.addChild(labelAnnouncer, 1);

        return true;
    },
    addScore: function(score, fromPosition) {
        this._score += score;

        this._scoreLabel.setString("Score: " + this._score);
        
        var addedScoreLabel = new ScoreLabel("+" + score.toString());
        addedScoreLabel.setPosition(fromPosition);
        addedScoreLabel.moveLabel(this._gameData.UI.LabelSpeed, this._scoreLabel.getPosition());
        this.addChild(addedScoreLabel, 1);
        this._scoreAddedLabels.push(addedScoreLabel);
    },
    removeScaledLabel: function(Label) {
        this.removeChild(Label);
        this._anouncerLabels.popObj(Label);
    },
    removeLabel: function(Label) {
        this.removeChild(Label);
        this._scoreAddedLabels.popObj(Label);
    },
    setPosition: function(x, y) {
        this._scoreLabel.setPosition(x, y);
    },
    getScore:function() {
        return this._score;  
    },
    resetScore: function() {
        this._score = 0;
        this._scoreLabel.setString("Score: " + this._score);
    }
});

//Makes Score System a Singleton
ScoreSystem.instance = null;
ScoreSystem.getInstance = function() {
    if(ScoreSystem.instance === null) {
        ScoreSystem.instance = new ScoreSystem();   
    }
    return ScoreSystem.instance;
}

var ScoreLabel = cc.Layer.extend({
    _Label: null,
    _gameData:null,
    ctor: function(scoreText, font) {
        this.init();
        this._super();

        this._Label = cc.LabelTTF.create(scoreText, font, 32, cc.TEXT_ALLIGNMENT_LEFT);
        this._Label.setColor(new cc.Color3B(255, 0, 0)); //Set color based on number value! It'll look cool!
        this._Label.setAnchorPoint(0.5, 0.5);
        this._Label.setOpacity(255);
        this.addChild(this._Label, 1);
    },
    moveLabel: function(duration, endPosition) {
        this._Label.setOpacity(255);
        this._Label.runAction(
            cc.Sequence.create(
                cc.MoveTo.create(duration, endPosition),
                cc.CallFunc.create(this.onMoveEnd.bind(this), this)));
    },
    onMoveEnd: function() {
        this._Label.setOpacity(0);
        cc.NotificationCenter.getInstance().postNotification(MSG_REMOVE_SCALED_LABEL, this);
    },
    setString: function(string) {
        this._Label.setString(string);
    },
    setPosition: function(position) {
        this._Label.setPosition(position);
    }
});

var AnnouncerLabel = cc.Layer.extend({
    _Label: null,
    _originScale: null,
    ctor: function() {
        this.init();
        this._super();

        this._Label = cc.LabelTTF.create('', 'Arial', 32, cc.TEXT_ALLIGNMENT_LEFT);
        this._Label.setColor(new cc.Color3B(255, 0, 0)); //Set color based on number value! It'll look cool!
        this._Label.setAnchorPoint(0.5, 0.5);
        this._Label.setOpacity(255);
        this.addChild(this._Label, 1);

        this._originScale = this._Label.getScale();
    },
    resizeLabel: function(duration, scale) {
        this._Label.setScale(this._originScale);
        this._Label.runAction(
            cc.Sequence.create(
                cc.ScaleTo.create(duration, scale),
                cc.FadeOut.create(0.5),
                cc.CallFunc.create(this.onResizeEnd.bind(this), this)));
    },
    onResizeEnd: function() {
        this._Label.setScale(this._originScale);
        cc.NotificationCenter.getInstance().postNotification(MSG_REMOVE_SCALED_LABEL, this);
    },
    moveLabel: function(duration, endPosition) {
        this._Label.setOpacity(255);
        this._Label.runAction(
            cc.Sequence.create(
                cc.MoveTo.create(duration, endPosition),
                cc.CallFunc.create(this.onMoveEnd.bind(this), this)));
    },
    onMoveEnd: function() {
        this._Label.setOpacity(0);
        cc.NotificationCenter.getInstance().postNotification(MSG_REMOVE_SCALED_LABEL, this);
    },
    setString: function(string) {
        this._Label.setString(string);
    },
    setPosition: function(position) {
        this._Label.setPosition(position);
    }
});