class ZodiacModel extends PersonalityModel {
    constructor() {
        super();
        this.zodiacSigns = {
            aries: {
                name: '白羊座',
                traits: ['冲动', '勇敢', '直接'],
                element: '火',
                quality: '基本'
            },
            taurus: {
                name: '金牛座',
                traits: ['稳重', '务实', '固执'],
                element: '土',
                quality: '固定'
            },
            gemini: {
                name: '双子座',
                traits: ['灵活', '好奇', '善变'],
                element: '风',
                quality: '可变'
            },
            cancer: {
                name: '巨蟹座',
                traits: ['敏感', '保护欲强', '情感丰富'],
                element: '水',
                quality: '基本'
            },
            leo: {
                name: '狮子座',
                traits: ['自信', '领导力强', '慷慨'],
                element: '火',
                quality: '固定'
            },
            virgo: {
                name: '处女座',
                traits: ['完美主义', '分析能力强', '实际'],
                element: '土',
                quality: '可变'
            },
            libra: {
                name: '天秤座',
                traits: ['公平', '和谐', '优雅'],
                element: '风',
                quality: '基本'
            },
            scorpio: {
                name: '天蝎座',
                traits: ['神秘', '洞察力强', '执着'],
                element: '水',
                quality: '固定'
            },
            sagittarius: {
                name: '射手座',
                traits: ['乐观', '冒险', '自由'],
                element: '火',
                quality: '可变'
            },
            capricorn: {
                name: '摩羯座',
                traits: ['野心', '责任感', '自律'],
                element: '土',
                quality: '基本'
            },
            aquarius: {
                name: '水瓶座',
                traits: ['独特', '创新', '人道主义'],
                element: '风',
                quality: '固定'
            },
            pisces: {
                name: '双鱼座',
                traits: ['富同情心', '直觉强', '艺术感'],
                element: '水',
                quality: '可变'
            }
        };
    }

    // 分析星座组合
    analyzeZodiacCombination(sunSign, moonSign, ascendant) {
        const sunSignData = this.zodiacSigns[sunSign];
        const moonSignData = this.zodiacSigns[moonSign];
        const ascendantData = this.zodiacSigns[ascendant];

        // 添加太阳星座特质
        this.addTrait('太阳星座', {
            sign: sunSignData.name,
            traits: sunSignData.traits,
            element: sunSignData.element
        });

        // 添加月亮星座特质
        this.addTrait('月亮星座', {
            sign: moonSignData.name,
            traits: moonSignData.traits,
            element: moonSignData.element
        });

        // 添加上升星座特质
        this.addTrait('上升星座', {
            sign: ascendantData.name,
            traits: ascendantData.traits,
            element: ascendantData.element
        });

        // 分析元素组合
        this.analyzeElements(sunSignData.element, moonSignData.element, ascendantData.element);

        return this.analyze();
    }

    // 分析元素组合
    analyzeElements(sunElement, moonElement, ascendantElement) {
        const elements = [sunElement, moonElement, ascendantElement];
        const elementCount = elements.reduce((acc, curr) => {
            acc[curr] = (acc[curr] || 0) + 1;
            return acc;
        }, {});

        // 添加元素影响
        Object.entries(elementCount).forEach(([element, count]) => {
            this.addInfluence(`${element}元素`, count / 3);
        });
    }
} 