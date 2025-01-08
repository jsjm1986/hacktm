class BaZiModel extends PersonalityModel {
    constructor() {
        super();
        this.elements = {
            金: {
                traits: ['果断', '坚毅', '理性'],
                favorable: ['土', '金'],
                unfavorable: ['火']
            },
            木: {
                traits: ['成长', '包容', '灵活'],
                favorable: ['水', '木'],
                unfavorable: ['金']
            },
            水: {
                traits: ['智慧', '流动', '感性'],
                favorable: ['金', '水'],
                unfavorable: ['土']
            },
            火: {
                traits: ['热情', '冲动', '活跃'],
                favorable: ['木', '火'],
                unfavorable: ['水']
            },
            土: {
                traits: ['稳重', '务实', '保守'],
                favorable: ['火', '土'],
                unfavorable: ['木']
            }
        };
    }

    // 分析八字
    analyzeBaZi(yearPillar, monthPillar, dayPillar, hourPillar) {
        // 分析天干
        this.analyzeCelestialStems([
            yearPillar.stem,
            monthPillar.stem,
            dayPillar.stem,
            hourPillar.stem
        ]);

        // 分析地支
        this.analyzeEarthlyBranches([
            yearPillar.branch,
            monthPillar.branch,
            dayPillar.branch,
            hourPillar.branch
        ]);

        // 分析五行组合
        this.analyzeElementCombinations();

        return this.analyze();
    }

    // 分析天干
    analyzeCelestialStems(stems) {
        const stemElements = stems.map(stem => this.getStemElement(stem));
        stemElements.forEach((element, index) => {
            this.addTrait('天干', {
                position: ['年', '月', '日', '时'][index],
                element: element,
                traits: this.elements[element].traits
            });
        });
    }

    // 分析地支
    analyzeEarthlyBranches(branches) {
        const branchElements = branches.map(branch => this.getBranchElement(branch));
        branchElements.forEach((element, index) => {
            this.addTrait('地支', {
                position: ['年', '月', '日', '时'][index],
                element: element,
                traits: this.elements[element].traits
            });
        });
    }

    // 获取天干五行
    getStemElement(stem) {
        const stemElements = {
            甲: '木', 乙: '木',
            丙: '火', 丁: '火',
            戊: '土', 己: '土',
            庚: '金', 辛: '金',
            壬: '水', 癸: '水'
        };
        return stemElements[stem];
    }

    // 获取地支五行
    getBranchElement(branch) {
        const branchElements = {
            子: '水', 丑: '土', 寅: '木',
            卯: '木', 辰: '土', 巳: '火',
            午: '火', 未: '土', 申: '金',
            酉: '金', 戌: '土', 亥: '水'
        };
        return branchElements[branch];
    }

    // 分析五行组合
    analyzeElementCombinations() {
        const elementCount = {};
        Object.keys(this.traits).forEach(category => {
            this.traits[category].forEach(trait => {
                const element = trait.element;
                elementCount[element] = (elementCount[element] || 0) + 1;
            });
        });

        // 计算五行强弱
        Object.entries(elementCount).forEach(([element, count]) => {
            this.addInfluence(`${element}五行`, count / 8);
        });
    }
} 