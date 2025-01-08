class TaiYiCalculator {
    constructor() {
        this.numbers = ['一', '二', '三', '四', '五', '六', '七', '八', '九'];
        this.elements = ['水', '火', '木', '金', '土'];
        this.cycles = ['长生', '沐浴', '冠带', '临官', '帝旺', '衰', '病', '死', '墓', '绝', '胎', '养'];
        
        this.numberAttributes = {
            '一': { element: '水', nature: '智慧', polarity: '阳' },
            '二': { element: '土', nature: '坤顺', polarity: '阴' },
            '三': { element: '木', nature: '生发', polarity: '阳' },
            '四': { element: '木', nature: '仁德', polarity: '阴' },
            '五': { element: '土', nature: '中和', polarity: '阳' },
            '六': { element: '金', nature: '正义', polarity: '阴' },
            '七': { element: '金', nature: '刚毅', polarity: '阳' },
            '八': { element: '土', nature: '稳重', polarity: '阴' },
            '九': { element: '火', nature: '光明', polarity: '阳' }
        };
    }

    // 计算太乙数
    calculateTaiYi(birthTime) {
        const date = new Date(birthTime);
        return {
            yearNumber: this.calculateYearNumber(date),
            monthNumber: this.calculateMonthNumber(date),
            dayNumber: this.calculateDayNumber(date),
            hourNumber: this.calculateHourNumber(date),
            destinyNumber: this.calculateDestinyNumber(date)
        };
    }

    // 计算年数
    calculateYearNumber(date) {
        const year = date.getFullYear();
        const yearSum = Array.from(year.toString()).reduce((sum, digit) => sum + parseInt(digit), 0);
        return this.reduceToSingleDigit(yearSum);
    }

    // 计算月数
    calculateMonthNumber(date) {
        const month = date.getMonth() + 1;
        return this.reduceToSingleDigit(month);
    }

    // 计算日数
    calculateDayNumber(date) {
        const day = date.getDate();
        return this.reduceToSingleDigit(day);
    }

    // 计算时数
    calculateHourNumber(date) {
        const hour = date.getHours();
        return this.reduceToSingleDigit(hour);
    }

    // 计算命数
    calculateDestinyNumber(date) {
        const year = this.calculateYearNumber(date);
        const month = this.calculateMonthNumber(date);
        const day = this.calculateDayNumber(date);
        const hour = this.calculateHourNumber(date);
        
        return this.reduceToSingleDigit(year + month + day + hour);
    }

    // 将数字化为单数
    reduceToSingleDigit(num) {
        while (num > 9) {
            num = Array.from(num.toString()).reduce((sum, digit) => sum + parseInt(digit), 0);
        }
        return num;
    }

    // 分析数理特征
    analyzeNumerology(numbers) {
        return {
            basicPattern: this.analyzeBasicPattern(numbers),
            lifePattern: this.analyzeLifePattern(numbers),
            timingPattern: this.analyzeTimingPattern(numbers)
        };
    }

    // 分析基本格局
    analyzeBasicPattern(numbers) {
        const destinyNumber = numbers.destinyNumber;
        return {
            number: destinyNumber,
            attributes: this.numberAttributes[this.numbers[destinyNumber - 1]],
            characteristics: this.getNumberCharacteristics(destinyNumber)
        };
    }

    // 分析人生格局
    analyzeLifePattern(numbers) {
        const yearNumber = numbers.yearNumber;
        const monthNumber = numbers.monthNumber;
        const dayNumber = numbers.dayNumber;
        
        return {
            early: this.getLifePhase(yearNumber, 'early'),
            middle: this.getLifePhase(monthNumber, 'middle'),
            late: this.getLifePhase(dayNumber, 'late')
        };
    }

    // 分析时运格局
    analyzeTimingPattern(numbers) {
        const destinyNumber = numbers.destinyNumber;
        return {
            cycles: this.getTimingCycles(destinyNumber),
            peaks: this.getPeakYears(destinyNumber),
            challenges: this.getChallengeYears(destinyNumber)
        };
    }

    // 获取数字特征
    getNumberCharacteristics(number) {
        const characteristics = {
            1: ['智慧聪颖', '创新能力', '领导才能'],
            2: ['和谐平衡', '协作能力', '细心周到'],
            3: ['创造力强', '表达能力', '艺术天赋'],
            4: ['踏实稳重', '执行能力', '组织才能'],
            5: ['适应力强', '变通能力', '沟通技巧'],
            6: ['责任感强', '关怀他人', '审美能力'],
            7: ['分析力强', '研究能力', '洞察力佳'],
            8: ['实践能力', '管理才能', '财务头脑'],
            9: ['理想主义', '同情心强', '影响力大']
        };
        return characteristics[number] || [];
    }

    // 获取人生阶段特征
    getLifePhase(number, phase) {
        const phases = {
            early: {
                1: '早年聪慧，学习能力强',
                2: '早年平稳，家庭和睦',
                3: '早年活跃，创造力强',
                4: '早年务实，基础扎实',
                5: '早年灵活，适应力强',
                6: '早年温和，亲和力强',
                7: '早年独立，思维深刻',
                8: '早年稳重，执行力强',
                9: '早年理想，抱负远大'
            },
            middle: {
                1: '中年智慧，事业有成',
                2: '中年平稳，家庭美满',
                3: '中年发展，创新有为',
                4: '中年踏实，成就稳固',
                5: '中年变通，发展顺利',
                6: '中年和谐，人际良好',
                7: '中年专研，技术精深',
                8: '中年管理，财运亨通',
                9: '中年圆满，影响广泛'
            },
            late: {
                1: '晚年智达，享受生活',
                2: '晚年祥和，颐养天年',
                3: '晚年活力，保持创造',
                4: '晚年稳健，功成名就',
                5: '晚年适意，生活愉快',
                6: '晚年温馨，家庭幸福',
                7: '晚年深邃，智慧圆满',
                8: '晚年富足，安享晚年',
                9: '晚年理想，精神富足'
            }
        };
        return phases[phase][number] || '平稳发展';
    }

    // 获取时运周期
    getTimingCycles(number) {
        const cycles = [];
        for (let age = 0; age <= 80; age += 10) {
            cycles.push({
                age: `${age}-${age + 9}岁`,
                cycle: this.cycles[age % 12],
                focus: this.getCycleFocus(age)
            });
        }
        return cycles;
    }

    // 获取高峰年份
    getPeakYears(number) {
        // 根据命数计算人生高峰期
        const peaks = [];
        const baseYears = [number * 3, number * 4, number * 5];
        
        baseYears.forEach(year => {
            if (year <= 80) {
                peaks.push({
                    age: year,
                    type: this.getPeakType(year),
                    opportunity: this.getPeakOpportunity(year)
                });
            }
        });
        
        return peaks;
    }

    // 获取挑战年份
    getChallengeYears(number) {
        // 根据命数计算人生挑战期
        const challenges = [];
        const baseYears = [number * 2, number * 6, number * 7];
        
        baseYears.forEach(year => {
            if (year <= 80) {
                challenges.push({
                    age: year,
                    type: this.getChallengeType(year),
                    advice: this.getChallengeAdvice(year)
                });
            }
        });
        
        return challenges;
    }

    // 获取周期重点
    getCycleFocus(age) {
        if (age < 10) return ['性格培养', '基础教育'];
        if (age < 20) return ['学习进取', '技能培养'];
        if (age < 30) return ['事业起步', '感情发展'];
        if (age < 40) return ['事业发展', '家庭建设'];
        if (age < 50) return ['事业巅峰', '财富积累'];
        if (age < 60) return ['地位巩固', '子女教育'];
        if (age < 70) return ['事业转型', '健康养生'];
        return ['颐养天年', '智慧传承'];
    }

    // 获取高峰类型
    getPeakType(age) {
        if (age < 30) return '能力发展期';
        if (age < 50) return '事业高峰期';
        return '成就巩固期';
    }

    // 获取高峰机遇
    getPeakOpportunity(age) {
        if (age < 30) return ['学习机会', '能力提升'];
        if (age < 50) return ['事业发展', '财富积累'];
        return ['地位巩固', '经验传承'];
    }

    // 获取挑战类型
    getChallengeType(age) {
        if (age < 30) return '成长挑战期';
        if (age < 50) return '事业挑战期';
        return '转型挑战期';
    }

    // 获取挑战建议
    getChallengeAdvice(age) {
        if (age < 30) return ['保持学习', '提升能力'];
        if (age < 50) return ['把握机会', '稳健发展'];
        return ['及时调整', '保持活力'];
    }

    // 生成运势建议
    generateAdvice(numbers) {
        return {
            general: this.generateGeneralAdvice(numbers),
            specific: this.generateSpecificAdvice(numbers),
            timing: this.generateTimingAdvice(numbers)
        };
    }

    // 生成总体建议
    generateGeneralAdvice(numbers) {
        const destinyNumber = numbers.destinyNumber;
        const attributes = this.numberAttributes[this.numbers[destinyNumber - 1]];
        
        return [
            `发挥${attributes.nature}的特质`,
            `注重${attributes.element}相关的发展方向`,
            '保持积极进取的态度'
        ];
    }

    // 生成具体建议
    generateSpecificAdvice(numbers) {
        const yearNumber = numbers.yearNumber;
        const monthNumber = numbers.monthNumber;
        
        return {
            career: this.getCareerAdvice(yearNumber),
            relationship: this.getRelationshipAdvice(monthNumber),
            development: this.getDevelopmentAdvice(numbers.destinyNumber)
        };
    }

    // 生成时机建议
    generateTimingAdvice(numbers) {
        const dayNumber = numbers.dayNumber;
        const hourNumber = numbers.hourNumber;
        
        return {
            favorable: this.getFavorableTiming(dayNumber),
            unfavorable: this.getUnfavorableTiming(hourNumber),
            precautions: this.getTimingPrecautions(numbers.destinyNumber)
        };
    }

    // 获取事业建议
    getCareerAdvice(number) {
        const advice = {
            1: ['发挥创新能力', '追求专业发展'],
            2: ['注重团队协作', '稳健发展'],
            3: ['发挥创造力', '开拓新领域'],
            4: ['踏实稳重', '循序渐进'],
            5: ['灵活应变', '把握机会'],
            6: ['注重和谐', '追求平衡'],
            7: ['深入研究', '专注发展'],
            8: ['强化管理', '注重效益'],
            9: ['追求理想', '扩大影响']
        };
        return advice[number] || ['稳健发展', '循序渐进'];
    }

    // 获取人际建议
    getRelationshipAdvice(number) {
        const advice = {
            1: ['保持独立', '选择性社交'],
            2: ['和谐为主', '广结善缘'],
            3: ['主动交往', '展现魅力'],
            4: ['诚信为本', '建立信任'],
            5: ['灵活应对', '广交朋友'],
            6: ['真诚关怀', '维护关系'],
            7: ['保持距离', '选择朋友'],
            8: ['稳重待人', '建立网络'],
            9: ['乐于助人', '传播正能量']
        };
        return advice[number] || ['真诚待人', '保持平衡'];
    }

    // 获取发展建议
    getDevelopmentAdvice(number) {
        const advice = {
            1: ['提升专业能力', '培养创新思维'],
            2: ['加强协调能力', '注重细节'],
            3: ['发展创造力', '保持激情'],
            4: ['巩固基础', '提升执行力'],
            5: ['增强适应力', '把握机会'],
            6: ['培养同理心', '提升审美'],
            7: ['深化专业知识', '保持独立'],
            8: ['提升管理能力', '注重效率'],
            9: ['扩大影响力', '追求完美']
        };
        return advice[number] || ['全面发展', '持续进步'];
    }

    // 获取有利时机
    getFavorableTiming(number) {
        const timing = {
            1: '早晨、水旺季节',
            2: '下午、土旺季节',
            3: '上午、木旺季节',
            4: '早晨、木旺季节',
            5: '中午、土旺季节',
            6: '傍晚、金旺季节',
            7: '下午、金旺季节',
            8: '早晨、土旺季节',
            9: '中午、火旺季节'
        };
        return timing[number] || '根据实际情况灵活把握';
    }

    // 获取不利时机
    getUnfavorableTiming(number) {
        const timing = {
            1: '正午、火旺季节',
            2: '深夜、水旺季节',
            3: '傍晚、金旺季节',
            4: '中午、火旺季节',
            5: '凌晨、水旺季节',
            6: '早晨、木旺季节',
            7: '中午、火旺季节',
            8: '傍晚、金旺季节',
            9: '深夜、水旺季节'
        };
        return timing[number] || '避免极端时段';
    }

    // 获取时机注意事项
    getTimingPrecautions(number) {
        const precautions = {
            1: ['避免冲动决策', '注意休息调节'],
            2: ['避免优柔寡断', '把握时机'],
            3: ['避免过于激进', '注意节奏'],
            4: ['避免固步自封', '保持进取'],
            5: ['避免朝三暮四', '保持专注'],
            6: ['避免过分随和', '坚持原则'],
            7: ['避免过于孤僻', '加强交流'],
            8: ['避免过于保守', '适时创新'],
            9: ['避免过于理想', '注重实际']
        };
        return precautions[number] || ['保持平衡', '稳健发展'];
    }
} 