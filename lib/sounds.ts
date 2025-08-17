// --- Sound Data URIs ---
// Using data URIs for simple sounds to avoid needing external files.

// A crisp, short UI click/blip.
const uiClickSoundData = "data:audio/wav;base64,UklGRlIAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQwwAAAAAP//AwAAAQ==/wEC/+8CAf/yAgH/+gIB//QCAv/yAgH/9gIB//YCAv/2AgL/9gIC//YCAf/2AgH/9gIB//YCAv/yAgL/9AIC//MCAv/uAgL/6wIC/+kCAv/pAgL/6QIC/+kCAv/pAgL/6gIC/+gCAv/oAgL/6AIC/+cCAv/nAgL/5wIC/+cCAv/nAgL/5gIC/+YCAv/mAgL/5QIC/+QCAv/jAgL/4w==";
// A futuristic hum/power-up for starting a process.
const generateStartSoundData = "data:audio/wav;base64,UklGRlQBAABXQVZFZm10IBAAAAABAAIARKwAAIhYAQAEABAAZGF0YQxAAAAAgIaG/v+Ghv7/hob+/4aG/v+Gh/7/hof+/4aH/v+Gh/7/h4f+/4eH/v+Hh/7/h4f+/4iH/v+Ih/7/iIf+/4iI/v+IiP7/iIj+/4iI/v+JiP7/iYj+/4mI/v+JiP7/iYn+/4mJ/v+Jif7/iYn+/4qJ/v+Kif7/ion+/4qJ/v+Kif7/ion+/4qJ/v+Kif7/ion+/4qJ/v+Kif7/ion+/4qJ/v+Kif7/ion+/4qJ/v+Jif7/iYn+/4mJ/v+JiP7/iYj+/4mI/v+JiP7/iIj+/4iI/v+IiP7/iIf+/4iH/v+Ih/7/h4f+/4eH/v+Hh/7/h4f+/4aH/v+Gh/7/hof+/4aG/v+Ghv7/hob+/4aG/v8=";
// A pleasant chime for success.
const successChimeSoundData = "data:audio/wav;base64,UklGRjQAAABXQVZFZm10IBAAAAABAAEAUSsAAJFrAAACABAATElTVBoAAABJTkZPSVNGVAAAAA4AAABTb25pYyBQaSBTY2FuIURhdGExAAAAAgD/AP8A/wD/AP8A/gD9APYA7QDoAOAAxwCSAIoAfgCLAJcAnACgAKgAqgCeAJYAlgCfAKUApwCkAKAAngCaAJwAngCiAKgAqwCrAKkApwClAKEAoACeAJwAlwCSAIwAfgBvAGkAagBnAGkAbQBuAG8AcgBzAHQAcQBxAHEAcgByAHEAcQBxAHIAcwBzAHEA";
// A short, electronic buzz for errors.
const errorBuzzSoundData = "data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQ4AAAAAAAD//wD/AP8A/AD/APkA/w==";
// A quick "whoosh" for UI transitions.
const switchWhooshSoundData = "data:audio/wav;base64,UklGRjwAAABXQVZFZm10IBAAAAABAAEAUSsAAJFrAAACABAATElTVBoAAABJTkZPSVNGVAAAAA4AAABTb25pYyBQaSBTY2FuIURhdGExAAAAAP8A/wD+AP8A+gD/APgA/wD2AP8A9QD/APQA/wDyAP8A8AD/APAA/wDwAP8A8AD/APAA/wDwAP8A8AD/APAA/wDxAP8A8gD/APMA/wD0AP8A9gD/APkA/wD+AP8A/wD/";
// A low thud for deleting items.
const deleteThudSoundData = "data:audio/wav;base64,UklGRiIAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQQAAAAAAAD//v/+/wD/AP4A/QD6APsA+wD6APoA+QD5APkA+AD3APYA9gD1APMA8gDxAPAA7gDrAOkA5w==";
// A positive "plink" for adding an item.
const addItemSoundData = "data:audio/wav;base64,UklGRjAAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAA//4BAf/5AgH/9gIC//YCAv/wAgL/6wID/+YCA//lAgP/5AID/+UCA//lAgP/5gID/+cCA//oAgP/6wID//ACA//zAgL//AIC//QCAv/7AgL//wIB";
// A futuristic data transfer sound for downloads.
const downloadSoundData = "data:audio/wav;base64,UklGRigBAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAP//AAAAAAEA/v/+APz/9ADs//sA6//5AOz//ADt//kA7//8AO//+wDw//kA8f/zAPL/9gD0//YA9f/yAPb/8QD3//AA+P/wAPn/+AD7//gA/P/2AP7/+gD//fkA////AP/9/QD9/vYA+v7wAPf+7wD0/usA8v7qAPL+6gDy/usA8/7sAPP+7wDx/vIA8P7yAPL+8gDz/vMA8/7zAPP+8gDz/vMA8/7yAPP+7wDz/uwA8/7rAPP+6QDz/uUA8v7kAPL+4wDy/uIA8v7hAPL+4ADy/uAA8v7gAPL+4ADx/uAA8P7gAPH+4ADx/uAA8f7gAPH+4ADx/uEA8f7hAPL+4gDy/uQA8v7lAPL+5gDy/ucA8/7oAPP+6wDz/uwA8/7uAPL+8ADy/vIA8/7yAPP+8wDz/vMA8/7zAPL+8wDy/vMA8v7zAPL+8gDy/vAA8v7tAPL+6wDy/ukA8/7kAPL+3wDx/tsA8P7XAPD+0gDw/s4A8P7KAPL+xgDx/sAA8f68APH+twDx/rYA8f60APH+swDx/rEA8f6vAPH+qgDx/qc=";


export enum Sfx {
  Click = 'click',
  Generate = 'generate',
  Success = 'success',
  Error = 'error',
  Switch = 'switch',
  Login = 'login',
  Logout = 'logout',
  Open = 'open',
  Close = 'close',
  Delete = 'delete',
  Add = 'add',
  Download = 'download',
}

class SoundManager {
  private sounds: Map<Sfx, HTMLAudioElement> = new Map();
  private isMuted = false;

  constructor() {
    this.load(Sfx.Click, uiClickSoundData);
    this.load(Sfx.Generate, generateStartSoundData);
    this.load(Sfx.Success, successChimeSoundData);
    this.load(Sfx.Error, errorBuzzSoundData);
    this.load(Sfx.Switch, switchWhooshSoundData);
    this.load(Sfx.Login, successChimeSoundData);
    this.load(Sfx.Logout, switchWhooshSoundData);
    this.load(Sfx.Open, switchWhooshSoundData);
    this.load(Sfx.Close, switchWhooshSoundData);
    this.load(Sfx.Delete, deleteThudSoundData);
    this.load(Sfx.Add, addItemSoundData);
    this.load(Sfx.Download, downloadSoundData);
  }

  private load(key: Sfx, src: string) {
    const audio = new Audio(src);
    audio.preload = 'auto';
    this.sounds.set(key, audio);
  }

  play(key: Sfx) {
    if (this.isMuted) return;
    const sound = this.sounds.get(key);
    if (sound) {
      sound.currentTime = 0; // Rewind to start
      sound.play().catch(error => {
        // Autoplay policy might block it. This is expected and can be ignored.
      });
    }
  }

  toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }
}

export const soundManager = new SoundManager();
