class AssetManager {
    constructor() {
        this.successCount = 0;
        this.errorCount = 0;
        this.cache = [];
        this.downloadQueue = [];
        this.playing = false;
    };

    queueDownload(path) {
        console.log("Queueing " + path);
        this.downloadQueue.push(path);
    };

    isDone() {
        return this.downloadQueue.length === this.successCount + this.errorCount;
    };

    downloadAll(callback) {
        if (this.downloadQueue.length === 0) setTimeout(callback, 10);
        for (let i = 0; i < this.downloadQueue.length; i++) {
            var that = this;

            var path = this.downloadQueue[i];
            console.log(path);
            var ext = path.substring(path.length - 3);
            
			switch (ext) {
				case 'png':
					var img = new Image();
					img.addEventListener("load", () => {
                		console.log("Loaded " + img.src);
                		this.successCount++;
                		if (that.isDone()) callback();
            		});

            		img.addEventListener("error", () => {
                		console.log("Error loading " + img.src);
                		this.errorCount++;
                		if (that.isDone()) callback();
           	 		});
           	 	
           	 		img.src = path;
            		this.cache[path] = img;
            		break;
            	case 'wav':
            	case 'mp3':
            		var aud = new Audio();
            		aud.addEventListener("loadeddata", () => {
						console.log("Loaded " + aud.src);
						that.successCount++;
						if (that.isDone()) callback();
					});
					
					aud.addEventListener("error", () => {
						aud.addEventListener("Error loading " + aud.src);
						this.errorCount++;
						if (that.isDone()) callback();
					});
					
					aud.addEventListener("ended", () => {
						aud.pause();
						aud.currentTime = 0;
					});
					
					aud.src = path;
					aud.load();
					
					this.cache[path] = aud;
					break;
			}
        }
    };

    getAsset(path) {
        return this.cache[path];
    };

    playAsset(path) {
        //this flag is temporary
        if (!this.playing){
		    let audio = this.cache["./sfx/cerise.mp3"];//path];
		    audio.currentTime = 0;
		    audio.play();
            this.playing = true;
        }    
	};
	
	muteAudio(mute) {
		for (var key in this.cache) {
			let asset = this.cache[key];
			if (asset instanceof Audio) {
				asset.muted = mute;
			}
		}
	}
    
    adjustVolume(volume) {
		for (var key in this.cache) {
			let asset = this.cache[key];
			if (asset instanceof Audio) {
				asset.volume = volume;
			}
		}
	};
    
    pauseBackgroundMusic() {
		for (var key in this.cache) {
			let asset = this.cache[key];
			if (asset instanceof Audio) {
				asset.pause();
				asset.currentTime = 0;
			}
		}
	};
    
    autoRepeat(path) {
		var aud = this.cache["./sfx/chiffon.mp3"];//path];
		aud.addEventListener("ended", () => {
			aud.play();
		});
	};
};

