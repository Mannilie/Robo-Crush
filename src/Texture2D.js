var Texture2D = cc.Sprite.extend({    
    ctor: function(texture, position) {
        this._super();        
        this.init(texture);
        this.setPosition(position);
        this.setAnchorPoint(0.5, 0.5);
        this.setScale(1);
    },
    
    getWidth:function() {
        return this.getContentSize().width;
    },
    
    getHeight:function() {
        return this.getContentSize().height;
    }
});
