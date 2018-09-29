const {ccclass, property} = cc._decorator;

@ccclass
export default class AudioMgr extends cc.Component {

    private bgmVolume: number = 0;
    private sfxVolume: number = 0;
    private bgmAudioID: number = -1;

    public init() {
        let t = cc.sys.localStorage.getItem("bgmVolume");
        if (t != null) {
            this.bgmVolume = parseFloat(t);    
        } else {
            this.bgmVolume = 1;
        }

        t = cc.sys.localStorage.getItem("sfxVolume");
        if (t !== null) {
            this.sfxVolume = parseFloat(t);    
        } else {
            this.sfxVolume = 1;
        }

        cc.game.on(cc.game.EVENT_HIDE, () => {
            console.log("cc.audioEngine.pauseAll");
            cc.audioEngine.pauseAll();
        });
        cc.game.on(cc.game.EVENT_SHOW, () => {
            console.log("cc.audioEngine.resumeAll");
            cc.audioEngine.resumeAll();
        });
    }

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // }
    
    public getUrl(url) {
        return cc.loader.getRes("sounds/" + url, cc.AudioClip);
    }
    
    public playBGM(url) {
        const audioUrl = this.getUrl(url);
        console.log(audioUrl);
        if (this.bgmAudioID >= 0) {
            cc.audioEngine.stop(this.bgmAudioID);
        }
        this.bgmAudioID = cc.audioEngine.play(audioUrl, true, this.bgmVolume);
    }
    
    public playSFX(url) {
        const audioUrl = this.getUrl(url);
        const audioId = cc.audioEngine.play(audioUrl, false, 1);    
        
    }
    
    public setSFXVolume(v) {
        if (this.sfxVolume !== v) {
            cc.sys.localStorage.setItem("sfxVolume", v);
            this.sfxVolume = v;
        }
    }
    
    public setBGMVolume(v, force) {
        if (this.bgmAudioID >= 0) {
            if (v > 0) {
                cc.audioEngine.resume(this.bgmAudioID);
            } else {
                cc.audioEngine.pause(this.bgmAudioID);
            }
            // cc.audioEngine.setVolume(this.bgmAudioID,this.bgmVolume);
        }
        if (this.bgmVolume !== v || force) {
            cc.sys.localStorage.setItem("bgmVolume", v);
            this.bgmVolume = v;
            cc.audioEngine.setVolume(this.bgmAudioID, v);
        }
    }
    
    public pauseAll() {
        cc.audioEngine.pauseAll();
    }
    
    public resumeAll() {
        cc.audioEngine.resumeAll();
    }
}
