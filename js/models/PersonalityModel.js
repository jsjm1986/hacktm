class PersonalityModel {
    constructor() {
        this.traits = {};
        this.influences = [];
    }

    // 添加特质
    addTrait(category, trait) {
        if (!this.traits[category]) {
            this.traits[category] = [];
        }
        this.traits[category].push(trait);
    }

    // 添加影响因素
    addInfluence(factor, weight) {
        this.influences.push({ factor, weight });
    }

    // 获取特质分析
    analyze() {
        return {
            traits: this.traits,
            influences: this.influences
        };
    }

    // 清除数据
    clear() {
        this.traits = {};
        this.influences = [];
    }
} 