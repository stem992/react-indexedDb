class _NomyoIdGeneratorService {
  constructor() {
    this.lastTime = 0;
    this.repeatCounter = 0;
    this.uidLen = 10;
    this.hexLen = 12;
    this.suffixLen = 4;
    this.lastId = "";
  }

  generate(uId) {
    const nowTime = (new Date()).getMilliseconds();
    if (nowTime === this.lastTime) {
      this.repeatCounter++;
    } else {
      this.lastTime = nowTime;
      this.repeatCounter = 0;
    }
    let result = this.lastTime.toString(16);
    if (result.length < this.hexLen) {
      const append = "0".repeat(this.hexLen - result.length);
      result = append + result;
    }

    let suffix = this.repeatCounter.toString(16);
    if (suffix.length < this.suffixLen) {
      const append = "0".repeat(this.suffixLen - suffix.length);
      suffix = append + suffix;
    }

    let prefix = uId;
    if (prefix.length < this.uidLen) {
      const append = "0".repeat(this.uidLen - prefix.length);
      prefix = append + prefix;
    }

    const id = prefix + result + suffix;
    if (id === this.lastId) {
      console.log("QUALCOSA NON VA nell'id Generator!");
    }
    return id;
  }
}

export const NomyoIdGeneratorService = new _NomyoIdGeneratorService();
