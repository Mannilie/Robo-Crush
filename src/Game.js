var GameScene = cc.Scene.extend(
{
	onEnter:function()
	{
		this._super();

		var layer = new AIEMatch3Game();
		layer.init();
		this.addChild(layer);
	}
});