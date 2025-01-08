class BaZiCalculator {
    constructor() {
        this.heavenlyStems = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
        this.earthlyBranches = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
        this.elements = ['木', '火', '土', '金', '水'];
        this.elementRelations = {
            '木': { generates: '火', controls: '土', weakenedBy: '金', strengthenedBy: '水' },
            '火': { generates: '土', controls: '金', weakenedBy: '水', strengthenedBy: '木' },
            '土': { generates: '金', controls: '水', weakenedBy: '木', strengthenedBy: '火' },
            '金': { generates: '水', controls: '木', weakenedBy: '火', strengthenedBy: '土' },
            '水': { generates: '木', controls: '火', weakenedBy: '土', strengthenedBy: '金' }
        };
    }

    // 计算八字
    calculateBaZi(birthTime) {
        const date = new Date(birthTime);
        return {
            year: this.calculateYearPillar(date),
            month: this.calculateMonthPillar(date),
            day: this.calculateDayPillar(date),
            hour: this.calculateHourPillar(date)
        };
    }

    // 计算年柱
    calculateYearPillar(date) {
        const year = date.getFullYear();
        const yearStem = this.calculateYearStem(year);
        const yearBranch = this.calculateYearBranch(year);
        return {
            stem: yearStem,
            branch: yearBranch,
            element: this.getStemElement(yearStem)
        };
    }

    // 计算月柱
    calculateMonthPillar(date) {
        const month = date.getMonth() + 1;
        const yearStem = this.calculateYearStem(date.getFullYear());
        const monthStem = this.calculateMonthStem(yearStem, month);
        const monthBranch = this.calculateMonthBranch(month);
        return {
            stem: monthStem,
            branch: monthBranch,
            element: this.getStemElement(monthStem)
        };
    }

    // 计算日柱
    calculateDayPillar(date) {
        const dayStem = this.calculateDayStem(date);
        const dayBranch = this.calculateDayBranch(date);
        return {
            stem: dayStem,
            branch: dayBranch,
            element: this.getStemElement(dayStem)
        };
    }

    // 计算时柱
    calculateHourPillar(date) {
        const hour = date.getHours();
        const dayStem = this.calculateDayStem(date);
        const hourStem = this.calculateHourStem(dayStem, hour);
        const hourBranch = this.calculateHourBranch(hour);
        return {
            stem: hourStem,
            branch: hourBranch,
            element: this.getStemElement(hourStem)
        };
    }

    // 计算年干
    calculateYearStem(year) {
        const stemIndex = (year - 4) % 10;
        return this.heavenlyStems[stemIndex];
    }

    // 计算年支
    calculateYearBranch(year) {
        const branchIndex = (year - 4) % 12;
        return this.earthlyBranches[branchIndex];
    }

    // 计算月干
    calculateMonthStem(yearStem, month) {
        const yearStemIndex = this.heavenlyStems.indexOf(yearStem);
        const monthStemIndex = (yearStemIndex * 2 + month) % 10;
        return this.heavenlyStems[monthStemIndex];
    }

    // 计算月支
    calculateMonthBranch(month) {
        const branchIndex = (month + 1) % 12;
        return this.earthlyBranches[branchIndex];
    }

    // 计算日干
    calculateDayStem(date) {
        // 这里需要一个复杂的算法来计算日干
        // 简化版本
        const dayCount = Math.floor(date.getTime() / (24 * 60 * 60 * 1000));
        const stemIndex = dayCount % 10;
        return this.heavenlyStems[stemIndex];
    }

    // 计算日支
    calculateDayBranch(date) {
        // 这里需要一个复杂的算法来计算日支
        // 简化版本
        const dayCount = Math.floor(date.getTime() / (24 * 60 * 60 * 1000));
        const branchIndex = dayCount % 12;
        return this.earthlyBranches[branchIndex];
    }

    // 计算时干
    calculateHourStem(dayStem, hour) {
        const dayStemIndex = this.heavenlyStems.indexOf(dayStem);
        const hourStemIndex = (dayStemIndex * 2 + Math.floor(hour / 2)) % 10;
        return this.heavenlyStems[hourStemIndex];
    }

    // 计算时支
    calculateHourBranch(hour) {
        const branchIndex = Math.floor((hour + 1) / 2) % 12;
        return this.earthlyBranches[branchIndex];
    }

    // 获取天干五行
    getStemElement(stem) {
        const stemElements = {
            '甲': '木', '乙': '木',
            '丙': '火', '丁': '火',
            '戊': '土', '己': '土',
            '庚': '金', '辛': '金',
            '壬': '水', '癸': '水'
        };
        return stemElements[stem];
    }

    // 分析八字强弱
    analyzeStrength(baZi) {
        const elementCount = {
            '木': 0, '火': 0, '土': 0, '金': 0, '水': 0
        };

        // 统计各个五行的出现次数
        Object.values(baZi).forEach(pillar => {
            elementCount[pillar.element]++;
        });

        return {
            elementCount,
            strongestElement: this.getStrongestElement(elementCount),
            weakestElement: this.getWeakestElement(elementCount)
        };
    }

    // 获取最强的五行
    getStrongestElement(elementCount) {
        return Object.entries(elementCount)
            .sort((a, b) => b[1] - a[1])[0][0];
    }

    // 获取最弱的五行
    getWeakestElement(elementCount) {
        return Object.entries(elementCount)
            .sort((a, b) => a[1] - b[1])[0][0];
    }

    // 分析五行关系
    analyzeElementRelations(mainElement) {
        return {
            beneficial: this.elementRelations[mainElement].strengthenedBy,
            controlling: this.elementRelations[mainElement].controls,
            weakening: this.elementRelations[mainElement].weakenedBy,
            generating: this.elementRelations[mainElement].generates
        };
    }

    // 生成命理建议
    generateAdvice(baZi, strength) {
        const mainElement = strength.strongestElement;
        const relations = this.analyzeElementRelations(mainElement);
        
        return {
            lifeElement: mainElement,
            favorable: {
                elements: [relations.beneficial, relations.generating],
                activities: this.getElementActivities(relations.beneficial),
                timing: this.getElementTiming(relations.beneficial)
            },
            unfavorable: {
                elements: [relations.weakening],
                cautions: this.getElementCautions(relations.weakening)
            },
            balancing: {
                elements: [relations.controlling],
                suggestions: this.getBalancingSuggestions(mainElement)
            }
        };
    }

    // 获取五行相关活动
    getElementActivities(element) {
        const activities = {
            '木': ['创业', '教育', '艺术', '园艺'],
            '火': ['演讲', '营销', '娱乐', '领导'],
            '土': ['房地产', '农业', '建筑', '服务'],
            '金': ['金融', '珠宝', '工程', '科技'],
            '水': ['传媒', '运输', '贸易', '外交']
        };
        return activities[element];
    }

    // 获取五行相关时机
    getElementTiming(element) {
        const timing = {
            '木': '春季、早晨',
            '火': '夏季、中午',
            '土': '季节交替、下午',
            '金': '秋季、傍晚',
            '水': '冬季、夜晚'
        };
        return timing[element];
    }

    // 获取五行相关注意事项
    getElementCautions(element) {
        const cautions = {
            '木': ['避免过度固执', '注意情绪灵活性'],
            '火': ['避免过度急躁', '注意情绪稳定'],
            '土': ['避免过度保守', '注意创新思维'],
            '金': ['避免过度严厉', '注意人际关系'],
            '水': ['避免过度任性', '注意计划执行']
        };
        return cautions[element];
    }

    // 获取平衡建议
    getBalancingSuggestions(element) {
        const suggestions = {
            '木': ['培养耐心', '注重细节', '稳定情绪'],
            '火': ['加强规划', '提升专注', '控制节奏'],
            '土': ['增加灵活性', '开放思维', '尝试创新'],
            '金': ['培养同理心', '增进人际关系', '放松心态'],
            '水': ['加强执行力', '建立规律', '提升责任心']
        };
        return suggestions[element];
    }
} 