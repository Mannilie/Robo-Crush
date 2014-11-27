var HighScore = {
    highScore:[],
};
HighScore.reset = function()
{
    for(var i = 0; i < this.highScore.length; ++i) {
       this.highScore[i].name = "";
	   this.highScore[i].score = 0;
    }
    localStorage.clear();
};
HighScore.sort = function() {
    var running = true;
    while(running) {
        running = false;
        for(var i = 0; i < 5 - 1; ++i) {
            if(this.highScore[i].score < this.highScore[i + 1].score) {
                var temp = this.highScore[i];
                this.highScore[i] = this.highScore[i + 1];
                this.highScore[i + 1] = temp;
                running = true;
            }
        }
    }
};

HighScore.insertScore = function(name, score)
{
    var trimmedName = name.substring(0, 7);
    this.highScore[5].name = trimmedName;
    this.highScore[5].score = score;
    for(var i = 0; i < 6 - 1; ++i) {
        if(this.highScore[i].score < this.highScore[i + 1].score) {
            var temp = this.highScore[i];
            this.highScore[i] = this.highScore[i + 1];
            this.highScore[i + 1] = temp;
        }
    }
    HighScore.sort();
    for(var i = 0; i < 5; ++i) {
        sys.localStorage.setItem('highScore-' + i, this.highScore[i].score);
        sys.localStorage.setItem('name-' + i, this.highScore[i].name);
    }
};
HighScore.init = function()
{    
    for(var i = 0; i < 6; ++i) {
        this.highScore[i] = {name:"",score:0};    
    }
    
    for(var i = 0; i < 5; ++i) 
    {
	   if (sys.localStorage.getItem('highScore-' + i) == null)
	   {
	       sys.localStorage.setItem('name-' + i, "-------");
           sys.localStorage.setItem('highScore-' + i, '0');
	   }
       this.highScore[i].name = sys.localStorage.getItem('name-' + i);
       this.highScore[i].score = parseInt(sys.localStorage.getItem('highScore-' + i));
    }
};
HighScore.getScoreAt = function(index)
{
	return {name:sys.localStorage.getItem('name-' + index), 
            score: sys.localStorage.getItem('highScore-' + index)};
}

var HighScoreManager = cc.Layer.extend({
    _labels:null,
    _scoreSystem:null,
    _screenSize:null,
    
    _offset:null,
    
    _scoreLabels:null,
    
    loadScoreData:function() {        
        HighScore.init();
    },
    
    ctor:function() {
        this._super();
        this.init();
        
        this.loadScoreData();
        
        this.setKeyboardEnabled(true);
        
        this._labels = [];
        this._scoreLabels = [];
        
        this._scoreSystem = ScoreSystem.getInstance();
        
        this._offset = 32;
        
        this._screenSize = cc.Director.getInstance().getWinSize();
        
        //High Scores label
        this.addLabel("High Scores", 
                      cc.p(this._screenSize.width * 0.5, this._screenSize.height * 0.8), 
                      new cc.Color3B(255, 255, 255),
                      0.5, 0.5);
        //Number:
        this.addLabel("No.", 
                      cc.p(this._screenSize.width * 0.2, this._screenSize.height * 0.7), 
                      new cc.Color3B(255, 0, 0),
                      0, 0);
        
        //Name:
        this.addLabel("Name:", 
                      cc.p(this._screenSize.width * 0.4, this._screenSize.height * 0.7), 
                      new cc.Color3B(255, 0, 0),
                      0, 0);
        
        //Score:
        this.addLabel("Score:", 
                      cc.p(this._screenSize.width * 0.7, this._screenSize.height * 0.7), 
                      new cc.Color3B(255, 0, 0),
                      0, 0);
        
        this.addNumberText("1.", 0, new cc.Color3B(255, 0, 0));
        this.addNumberText("2.", 1, new cc.Color3B(255, 0, 0));
        this.addNumberText("3.", 2, new cc.Color3B(255, 0, 0));
        this.addNumberText("4.", 3, new cc.Color3B(255, 0, 0));
        this.addNumberText("5.", 4, new cc.Color3B(255, 0, 0));
                
        this.addScoreText(HighScore.getScoreAt(0), 0, this._screenSize.width * 0.4, new cc.Color3B(255, 0, 0));
        this.addScoreText(HighScore.getScoreAt(1), 1, this._screenSize.width * 0.4, new cc.Color3B(255, 0, 0));
        this.addScoreText(HighScore.getScoreAt(2), 2, this._screenSize.width * 0.4, new cc.Color3B(255, 0, 0));
        this.addScoreText(HighScore.getScoreAt(3), 3, this._screenSize.width * 0.4, new cc.Color3B(255, 0, 0));
        this.addScoreText(HighScore.getScoreAt(4), 4, this._screenSize.width * 0.4, new cc.Color3B(255, 0, 0));
        
        //Input Text
        this._inputText = cc.TextFieldTTF.create("Type Name", cc.size(200,40), cc.TEXT_ALLIGNMENT_CENTER,"Arial", 32);
        this._inputText.setPosition(cc.p(this._screenSize.width * 0.5, this._screenSize.height * 0.35));
        this._inputText.setAnchorPoint(0.5, 0.5);
        
        this._inputText.attachWithIME();
        this._inputText.setDelegate(this);
        //Adds input text to node scene
        this.addChild(this._inputText);
    },
    
    updateScores:function() {
        for(var i = 0; i < this._scoreLabels.length; ++i) {
            this.removeChild(this._scoreLabels[i])
        }
        this.addScoreText(HighScore.getScoreAt(0), 0, this._screenSize.width * 0.4, new cc.Color3B(255, 0, 0));
        this.addScoreText(HighScore.getScoreAt(1), 1, this._screenSize.width * 0.4, new cc.Color3B(255, 0, 0));
        this.addScoreText(HighScore.getScoreAt(2), 2, this._screenSize.width * 0.4, new cc.Color3B(255, 0, 0));
        this.addScoreText(HighScore.getScoreAt(3), 3, this._screenSize.width * 0.4, new cc.Color3B(255, 0, 0));
        this.addScoreText(HighScore.getScoreAt(4), 4, this._screenSize.width * 0.4, new cc.Color3B(255, 0, 0));
    },
    
    addScoreText:function(labelText, placement, XLocation, color) {
        var nameLbl = cc.LabelTTF.create(labelText.name, 'Arial', 32, cc.TEXT_ALLIGNMENT_LEFT);
        nameLbl.setPosition(cc.p(XLocation, this._screenSize.height * 0.65 - (placement * this._offset)));
        nameLbl.setColor(color);
        nameLbl.setAnchorPoint(0, 0);
        nameLbl.setOpacity(255);
        this._scoreLabels.push(nameLbl);
        this.addChild(nameLbl);
        
        var scoreLbl = cc.LabelTTF.create(labelText.score, 'Arial', 32, cc.TEXT_ALLIGNMENT_LEFT);
        scoreLbl.setPosition(cc.p(this._screenSize.width * 0.7, this._screenSize.height * 0.65 - (placement * this._offset)));
        scoreLbl.setColor(color);
        scoreLbl.setAnchorPoint(0, 0);
        scoreLbl.setOpacity(255);
        this._scoreLabels.push(scoreLbl);
        this.addChild(scoreLbl);
    },
    
    addNumberText:function(labelText, placement, color) {
        var label = cc.LabelTTF.create(labelText, 'Arial', 32, cc.TEXT_ALLIGNMENT_LEFT);
        label.setPosition(cc.p(this._screenSize.width * 0.2, this._screenSize.height * 0.65 - (placement * this._offset)));
        label.setColor(color);
        label.setAnchorPoint(0, 0);
        label.setOpacity(255);
        this._labels.push(label);
        this.addChild(label);
    },
    
    addLabel:function(labelText, position, color, anchorX, anchorY) {
        var label = cc.LabelTTF.create(labelText, 'Arial', 32, cc.TEXT_ALLIGNMENT_LEFT);
        label.setPosition(position);
        label.setColor(color);
        label.setAnchorPoint(anchorX, anchorY);
        label.setOpacity(255);
        this._labels.push(label);
        this.addChild(label);
    },
    onExit:function() {
        this.removeChild(this._scoreSystem);    
    },
    //Text Input Handling
    onTextFieldAttachWithIME:function(sender) {
        return false;
    },
    onTextFieldDetachWithIME:function(sender) {
        return false;
    },
    onTextFieldInsertText:function(sender, text, len) {
        if(text == "\n") {
            HighScore.insertScore(sender.getString(), this._scoreSystem.getScore());
            this.updateScores();            
            this.removeChild(this._inputText);
        }
        return false;
    },
    onDraw:function(sender) {
        return false;    
    },
});