var HealthBar = cc.Sprite.extend({
    screen_size: 0,
    healthbar_expanding: false,

    ctor: function(texture) {
        this._super();
        this.init(texture);
        //Gets screen size
        this.screen_size = cc.Director.getInstance().getWinSize();

        this.setAnchorPoint(0, 0);
        this.setScale(this.screen_size.width * (1 - 0.33), this.screen_size.height * 0.05);
        this.setPosition(this.screen_size.width * 0.32, this.screen_size.height * 0.01);
    },

    update: function(dt) {
        if (this.healthbar_expanding == true) {
            this.setScale(this.getScaleX() + 300 * dt, this.screen_size.height * 0.05);
            if (this.getScaleX() >= this.screen_size.width * (1 - 0.33))
                this.healthbar_expanding = false;
        } else {
            this.setScale(this.getScaleX() - 300 * dt, this.screen_size.height * 0.05);
            if (this.getScaleX() <= 0)
                this.healthbar_expanding = true;
        }
    }
});