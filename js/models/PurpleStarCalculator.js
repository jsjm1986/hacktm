class PurpleStarCalculator {
    constructor() {
        this.mainStars = ['紫微', '天机', '太阳', '武曲', '天同', '廉贞', '天府', '太阴', '贪狼', '巨门', '天相', '天梁', '七杀', '破军'];
        this.palaces = ['命宫', '兄弟', '夫妻', '子女', '财帛', '疾厄', '迁移', '交友', '官禄', '田宅', '福德', '父母'];
        this.luckyStars = ['文昌', '文曲', '左辅', '右弼', '天魁', '天钺'];
        this.unluckyStars = ['火星', '铃星', '地空', '地劫'];
        
        this.starAttributes = {
            '紫微': { nature: '贵', element: '土', type: '权威' },
            '天机': { nature: '吉', element: '木', type: '智慧' },
            '太阳': { nature: '吉', element: '火', type: '名声' },
            '武曲': { nature: '吉', element: '金', type: '财富' },
            '天同': { nature: '吉', element: '水', type: '人际' },
            '廉贞': { nature: '凶', element: '火', type: '正直' },
            '天府': { nature: '吉', element: '土', type: '财富' },
            '太阴': { nature: '吉', element: '水', type: '情感' },
            '贪狼': { nature: '凶', element: '木', type: '进取' },
            '巨门': { nature: '吉', element: '水', type: '言语' },
            '天相': { nature: '吉', element: '金', type: '助力' },
            '天梁': { nature: '吉', element: '火', type: '管理' },
            '七杀': { nature: '凶', element: '金', type: '权力' },
            '破军': { nature: '凶', element: '水', type: '变革' }
        };
    }

    // 计算命盘
    calculateChart(birthTime) {
        const date = new Date(birthTime);
        return {
            destinyPalace: this.calculateDestinyPalace(date),
            bodyPalace: this.calculateBodyPalace(date),
            mainStars: this.calculateMainStars(date),
            luckyStars: this.calculateLuckyStars(date),
            unluckyStars: this.calculateUnluckyStars(date)
        };
    }

    // 计算命宫
    calculateDestinyPalace(date) {
        // 这里需要复杂的命宫计算算法
        // 简化版本
        const month = date.getMonth() + 1;
        const hour = date.getHours();
        const palaceIndex = (month + Math.floor(hour / 2)) % 12;
        return this.palaces[palaceIndex];
    }

    // 计算身宫
    calculateBodyPalace(date) {
        // 简化版本
        const month = date.getMonth() + 1;
        const hour = date.getHours();
        const palaceIndex = (month + Math.floor(hour / 2) + 6) % 12;
        return this.palaces[palaceIndex];
    }

    // 计算主星分布
    calculateMainStars(date) {
        const starDistribution = {};
        this.palaces.forEach(palace => {
            starDistribution[palace] = this.getStarsInPalace(palace, date);
        });
        return starDistribution;
    }

    // 计算吉星分布
    calculateLuckyStars(date) {
        const luckyStarDistribution = {};
        this.palaces.forEach(palace => {
            luckyStarDistribution[palace] = this.getLuckyStarsInPalace(palace, date);
        });
        return luckyStarDistribution;
    }

    // 计算凶星分布
    calculateUnluckyStars(date) {
        const unluckyStarDistribution = {};
        this.palaces.forEach(palace => {
            unluckyStarDistribution[palace] = this.getUnluckyStarsInPalace(palace, date);
        });
        return unluckyStarDistribution;
    }

    // 获取宫位中的主星
    getStarsInPalace(palace, date) {
        // 简化版本
        const month = date.getMonth() + 1;
        const stars = [];
        const palaceIndex = this.palaces.indexOf(palace);
        const starIndex = (palaceIndex + month) % this.mainStars.length;
        stars.push(this.mainStars[starIndex]);
        return stars;
    }

    // 获取宫位中的吉星
    getLuckyStarsInPalace(palace, date) {
        // 简化版本
        const month = date.getMonth() + 1;
        const stars = [];
        const palaceIndex = this.palaces.indexOf(palace);
        const starIndex = (palaceIndex + month) % this.luckyStars.length;
        stars.push(this.luckyStars[starIndex]);
        return stars;
    }

    // 获取宫位中的凶星
    getUnluckyStarsInPalace(palace, date) {
        // 简化版本
        const month = date.getMonth() + 1;
        const stars = [];
        const palaceIndex = this.palaces.indexOf(palace);
        const starIndex = (palaceIndex + month) % this.unluckyStars.length;
        stars.push(this.unluckyStars[starIndex]);
        return stars;
    }

    // 分析命盘特征
    analyzeChartCharacteristics(chart) {
        return {
            destinyPattern: this.analyzeDestinyPattern(chart),
            lifeDirection: this.analyzeLifeDirection(chart),
            keyPeriods: this.analyzeKeyPeriods(chart)
        };
    }

    // 分析命格特征
    analyzeDestinyPattern(chart) {
        const destinyStars = chart.mainStars[chart.destinyPalace];
        const bodyStars = chart.mainStars[chart.bodyPalace];
        
        return {
            mainCharacteristics: this.getStarCharacteristics(destinyStars),
            personalityTraits: this.getStarCharacteristics(bodyStars),
            overallPattern: this.calculateOverallPattern(destinyStars, bodyStars)
        };
    }

    // 分析人生方向
    analyzeLifeDirection(chart) {
        const careerPalace = chart.mainStars['官禄'];
        const wealthPalace = chart.mainStars['财帛'];
        const relationshipPalace = chart.mainStars['夫妻'];

        return {
            career: this.analyzeCareerDirection(careerPalace),
            wealth: this.analyzeWealthDirection(wealthPalace),
            relationships: this.analyzeRelationshipDirection(relationshipPalace)
        };
    }

    // 分析关键时期
    analyzeKeyPeriods(chart) {
        const periods = [];
        // 简化版本：每12年为一个大运
        for (let age = 0; age <= 72; age += 12) {
            periods.push({
                age: `${age}-${age + 11}岁`,
                characteristics: this.getPeriodCharacteristics(age, chart),
                focus: this.getPeriodFocus(age, chart)
            });
        }
        return periods;
    }

    // 获取星曜特征
    getStarCharacteristics(stars) {
        return stars.map(star => ({
            name: star,
            attributes: this.starAttributes[star],
            influence: this.getStarInfluence(star)
        }));
    }

    // 获取星曜影响
    getStarInfluence(star) {
        const influences = {
            '紫微': '领导能力、权威地位',
            '天机': '智慧、谋略、创新',
            '太阳': '声望、地位、能量',
            '武曲': '财运、执行力、竞争',
            '天同': '人际关系、情感、协调',
            '廉贞': '正直、改革、挑战',
            '天府': '财富、保守、稳定',
            '太阴': '情感、艺术、直觉',
            '贪狼': '进取、欲望、扩张',
            '巨门': '口才、谈判、策略',
            '天相': '贵人、援助、保护',
            '天梁': '管理、威望、正统',
            '七杀': '权力、决断、改革',
            '破军': '变革、创新、突破'
        };
        return influences[star] || '未知影响';
    }

    // 计算整体格局
    calculateOverallPattern(destinyStars, bodyStars) {
        const allStars = [...destinyStars, ...bodyStars];
        const patterns = {
            leadership: this.hasPattern(allStars, ['紫微', '天机', '太阳']),
            wealth: this.hasPattern(allStars, ['武曲', '天府', '太阴']),
            intelligence: this.hasPattern(allStars, ['天机', '巨门', '文昌']),
            power: this.hasPattern(allStars, ['七杀', '破军', '贪狼'])
        };

        return Object.entries(patterns)
            .filter(([_, has]) => has)
            .map(([pattern, _]) => this.getPatternDescription(pattern));
    }

    // 检查是否具有特定格局
    hasPattern(stars, requiredStars) {
        return requiredStars.some(star => stars.includes(star));
    }

    // 获取格局描述
    getPatternDescription(pattern) {
        const descriptions = {
            leadership: '具有领导才能，适合管理决策工作',
            wealth: '财运亨通，善于理财与创造财富',
            intelligence: '智慧超群，适合学术研究与创新',
            power: '权力欲望强，具有改革创新精神'
        };
        return descriptions[pattern];
    }

    // 分析事业方向
    analyzeCareerDirection(stars) {
        return {
            suitable: this.getSuitableCareers(stars),
            timing: this.getCareerTiming(stars),
            advice: this.getCareerAdvice(stars)
        };
    }

    // 分析财富方向
    analyzeWealthDirection(stars) {
        return {
            channels: this.getWealthChannels(stars),
            timing: this.getWealthTiming(stars),
            advice: this.getWealthAdvice(stars)
        };
    }

    // 分析感情方向
    analyzeRelationshipDirection(stars) {
        return {
            characteristics: this.getRelationshipCharacteristics(stars),
            timing: this.getRelationshipTiming(stars),
            advice: this.getRelationshipAdvice(stars)
        };
    }

    // 获取时期特征
    getPeriodCharacteristics(age, chart) {
        // 简化版本
        if (age < 12) return '启蒙成长期';
        if (age < 24) return '学习发展期';
        if (age < 36) return '事业起步期';
        if (age < 48) return '事业发展期';
        if (age < 60) return '事业巅峰期';
        return '回馈总结期';
    }

    // 获取时期重点
    getPeriodFocus(age, chart) {
        // 简化版本
        if (age < 12) return ['性格培养', '兴趣发展'];
        if (age < 24) return ['学业进步', '技能积累'];
        if (age < 36) return ['事业选择', '人脉拓展'];
        if (age < 48) return ['事业发展', '财富积累'];
        if (age < 60) return ['地位巩固', '财富增值'];
        return ['经验传承', '生活享受'];
    }

    // 获取适合的职业
    getSuitableCareers(stars) {
        // 根据星曜特征推荐职业
        const careers = {
            '紫微': ['管理', '领导', '政府工作'],
            '天机': ['研究', '技术', '创新'],
            '太阳': ['公关', '营销', '表演'],
            '武曲': ['金融', '商业', '管理'],
            '天同': ['服务', '教育', '护理'],
            '廉贞': ['改革', '监察', '评估'],
            '天府': ['金融', '房地产', '收藏'],
            '太阴': ['艺术', '设计', '服务'],
            '贪狼': ['销售', '投资', '探索'],
            '巨门': ['传媒', '营销', '外交'],
            '天相': ['医疗', '服务', '咨询'],
            '天梁': ['行政', '管理', '教育'],
            '七杀': ['军警', '体育', '竞技'],
            '破军': ['创业', '改革', '科技']
        };

        return stars.map(star => careers[star] || []).flat();
    }

    // 获取财富时机
    getWealthTiming(stars) {
        // 简化版本
        return {
            favorable: '春季和秋季',
            unfavorable: '冬季',
            advice: '选择适当时机投资和发展'
        };
    }

    // 获取事业时机
    getCareerTiming(stars) {
        // 简化版本
        return {
            favorable: '春季和夏季',
            unfavorable: '冬季',
            advice: '把握机会，稳步发展'
        };
    }

    // 获取事业建议
    getCareerAdvice(stars) {
        return [
            '发挥个人特长，选择适合的发展方向',
            '注重能力提升和经验积累',
            '把握机会，保持进取心'
        ];
    }

    // 获取财富建议
    getWealthAdvice(stars) {
        return [
            '合理规划财务，建立多元收入',
            '注意风险控制，稳健投资',
            '把握机会，适时扩展'
        ];
    }

    // 获取感情特征
    getRelationshipCharacteristics(stars) {
        return [
            '重视情感交流和理解',
            '注重家庭和谐发展',
            '保持良好的人际关系'
        ];
    }

    // 获取感情时机
    getRelationshipTiming(stars) {
        // 简化版本
        return {
            favorable: '春季和秋季',
            unfavorable: '夏季',
            advice: '把握良机，培养感情'
        };
    }

    // 获取感情建议
    getRelationshipAdvice(stars) {
        return [
            '保持真诚的态度',
            '注重沟通和理解',
            '建立稳定的关系'
        ];
    }

    // 获取财富渠道
    getWealthChannels(stars) {
        const channels = [];
        
        // 根据星曜特征分析财富渠道
        stars.forEach(star => {
            switch(star) {
                case '武曲':
                    channels.push('经商投资', '管理决策');
                    break;
                case '天府':
                    channels.push('稳健理财', '房地产');
                    break;
                case '太阳':
                    channels.push('事业发展', '品牌价值');
                    break;
                case '天机':
                    channels.push('技术创新', '知识产权');
                    break;
                case '紫微':
                    channels.push('领导管理', '高端人脉');
                    break;
                case '贪狼':
                    channels.push('市场开拓', '销售营销');
                    break;
                default:
                    channels.push('稳健发展');
            }
        });

        return [...new Set(channels)]; // 去重
    }
} 