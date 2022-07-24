const gameEngine = new GameEngine();

const ASSET_MANAGER = new AssetManager();
ASSET_MANAGER.queueDownload("./sprites/goop.png");
ASSET_MANAGER.queueDownload("./sprites/goop2.png");
ASSET_MANAGER.queueDownload("./sprites/jar1.png");
ASSET_MANAGER.queueDownload("./sprites/jar2.png");
ASSET_MANAGER.queueDownload("./sprites/ooze.png");
ASSET_MANAGER.queueDownload("./sprites/fish.png");
ASSET_MANAGER.queueDownload("./sprites/horror_slime.png");
ASSET_MANAGER.queueDownload("./sprites/horror_slime2.png");
ASSET_MANAGER.queueDownload("./sprites/horror_slime_splat.png");
ASSET_MANAGER.queueDownload("./sprites/horror_slime_splat2.png");
ASSET_MANAGER.queueDownload("./sprites/slime.png");
ASSET_MANAGER.queueDownload("./sprites/slime2.png");
ASSET_MANAGER.queueDownload("./sprites/level1_flower1.png");
ASSET_MANAGER.queueDownload("./sprites/level1_flower2.png");
ASSET_MANAGER.queueDownload("./sprites/level1_flower3.png");
ASSET_MANAGER.queueDownload("./sprites/level2_flower1.png");
ASSET_MANAGER.queueDownload("./sprites/level2_flower2.png");
ASSET_MANAGER.queueDownload("./sprites/level2_flower3.png");
ASSET_MANAGER.queueDownload("./sprites/crosshair.png");
ASSET_MANAGER.queueDownload("./sprites/bullet.png");
ASSET_MANAGER.queueDownload("./sprites/bubble.png");
ASSET_MANAGER.queueDownload("./sprites/laser_segments.png");
ASSET_MANAGER.queueDownload("./sprites/enemy_bullet1.png");
ASSET_MANAGER.queueDownload("./sprites/enemy_bullet2.png");
ASSET_MANAGER.queueDownload("./sprites/test_gun.png");
ASSET_MANAGER.queueDownload("./sprites/bubble_gun.png");
ASSET_MANAGER.queueDownload("./sprites/ground_bubble_gun.png");
ASSET_MANAGER.queueDownload("./sprites/uzi.png");
ASSET_MANAGER.queueDownload("./sprites/ground_uzi.png");
ASSET_MANAGER.queueDownload("./sprites/laser.png");
ASSET_MANAGER.queueDownload("./sprites/ground_laser.png");
ASSET_MANAGER.queueDownload("./sprites/health_drop.png");
ASSET_MANAGER.queueDownload("./sprites/hearts.png");
ASSET_MANAGER.queueDownload("./sprites/symbol_flower.png");
ASSET_MANAGER.queueDownload("./sprites/numbers.png");
ASSET_MANAGER.queueDownload("./sprites/bulb1.png");
ASSET_MANAGER.queueDownload("./sprites/bulb2.png");
ASSET_MANAGER.queueDownload("./sprites/level1.png");
ASSET_MANAGER.queueDownload("./sprites/level2.png");
ASSET_MANAGER.queueDownload("./sprites/level1_pillar.png");
ASSET_MANAGER.queueDownload("./sprites/level2_pillar.png");
ASSET_MANAGER.queueDownload("./sprites/level1_plant1.png");
ASSET_MANAGER.queueDownload("./sprites/level2_plant1.png");
ASSET_MANAGER.queueDownload("./sprites/level1_plant2.png");
ASSET_MANAGER.queueDownload("./sprites/level2_plant2.png");
ASSET_MANAGER.queueDownload("./sprites/level1_plant3.png");
ASSET_MANAGER.queueDownload("./sprites/level2_plant3.png");
ASSET_MANAGER.queueDownload("./sprites/level1_rocks.png");
ASSET_MANAGER.queueDownload("./sprites/level2_rocks.png");
ASSET_MANAGER.queueDownload("./sprites/level1_rocks2.png");
ASSET_MANAGER.queueDownload("./sprites/level2_rocks2.png");
ASSET_MANAGER.queueDownload("./sprites/level1_wallplant.png");
ASSET_MANAGER.queueDownload("./sprites/level2_wallplant.png");
ASSET_MANAGER.queueDownload("./sprites/level1_wallplant2.png");
ASSET_MANAGER.queueDownload("./sprites/level2_wallplant2.png");
ASSET_MANAGER.queueDownload("./sprites/level1_wideplant.png");
ASSET_MANAGER.queueDownload("./sprites/level2_wideplant.png");


ASSET_MANAGER.queueDownload("./sprites/placeholder_title.png");
ASSET_MANAGER.queueDownload("./sprites/tint_screen.png");


ASSET_MANAGER.queueDownload("./sfx/cerise.mp3");
ASSET_MANAGER.queueDownload("./sfx/chiffon.mp3");


ASSET_MANAGER.downloadAll(() => {
	ASSET_MANAGER.autoRepeat("./sfx/chiffon.mp3");

	const canvas = document.getElementById("gameWorld");
	const ctx = canvas.getContext("2d");
	ctx.imageSmoothingEnabled = false;
	
	gameEngine.init(ctx);
	gameEngine.addEntity(new SceneManager(gameEngine));
	gameEngine.start();
});
