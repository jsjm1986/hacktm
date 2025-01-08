class MBTIModel extends PersonalityModel {
    constructor() {
        super();
        this.dimensions = {
            EI: {
                E: { name: '外向', traits: ['社交能力强', '精力充沛', '行动导向'] },
                I: { name: '内向', traits: ['深思熟虑', '独处充电', '内省'] }
            },
            SN: {
                S: { name: '感知', traits: ['关注细节', '实际', '重视经验'] },
                N: { name: '直觉', traits: ['重视可能性', '创新', '理论思维'] }
            },
            TF: {
                T: { name: '思考', traits: ['逻辑分析', '客观决策', '重视真理'] },
                F: { name: '情感', traits: ['重视和谐', '同理心', '基于价值观决策'] }
            },
            JP: {
                J: { name: '判断', traits: ['计划性强', '果断', '追求秩序'] },
                P: { name: '知觉', traits: ['灵活', '适应性强', '开放性'] }
            }
        };

        this.typeDescriptions = {
            ISTJ: { name: '检查者', traits: ['负责任', '实际', '可靠'] },
            ISFJ: { name: '守护者', traits: ['温暖', '同情心', '服务导向'] },
            INFJ: { name: '提倡者', traits: ['理想主义', '洞察力强', '创造性'] },
            INTJ: { name: '建筑师', traits: ['战略思维', '独立', '追求完美'] },
            ISTP: { name: '鉴赏家', traits: ['灵活', '观察力强', '实践性强'] },
            ISFP: { name: '探险家', traits: ['艺术感', '敏感', '和谐'] },
            INFP: { name: '调停者', traits: ['理想主义', '创造力', '同理心'] },
            INTP: { name: '逻辑学家', traits: ['分析性强', '创新', '追求知识'] },
            ESTP: { name: '企业家', traits: ['果断', '冒险', '现实主义'] },
            ESFP: { name: '表演者', traits: ['热情', '即兴', '实用性'] },
            ENFP: { name: '竞选者', traits: ['热情', '创新', '人际关系好'] },
            ENTP: { name: '辩论家', traits: ['创新', '战略性', '适应性强'] },
            ESTJ: { name: '总经理', traits: ['组织能力强', '实际', '传统'] },
            ESFJ: { name: '执政官', traits: ['友好', '尽责', '合作'] },
            ENFJ: { name: '主人公', traits: ['领导力', '同理心', '鼓舞人心'] },
            ENTJ: { name: '指挥官', traits: ['领导力', '战略性', '果断'] }
        };
    }

    // 分析MBTI类型
    analyzeMBTI(type) {
        if (!this.isValidType(type)) {
            throw new Error('无效的MBTI类型');
        }

        // 分析每个维度
        this.analyzeDimension('EI', type[0]);
        this.analyzeDimension('SN', type[1]);
        this.analyzeDimension('TF', type[2]);
        this.analyzeDimension('JP', type[3]);

        // 添加类型特征
        if (this.typeDescriptions[type]) {
            this.addTrait('MBTI类型', {
                type: type,
                name: this.typeDescriptions[type].name,
                traits: this.typeDescriptions[type].traits
            });
        }

        // 分析认知功能
        this.analyzeCognitiveFunctions(type);

        return this.analyze();
    }

    // 验证MBTI类型是否有效
    isValidType(type) {
        return /^[EI][SN][TF][JP]$/.test(type);
    }

    // 分析单个维度
    analyzeDimension(dimension, preference) {
        const dimensionData = this.dimensions[dimension][preference];
        this.addTrait(dimension, {
            preference: preference,
            name: dimensionData.name,
            traits: dimensionData.traits
        });

        // 添加维度强度影响
        this.addInfluence(`${dimensionData.name}倾向`, 0.25);
    }

    // 分析认知功能
    analyzeCognitiveFunctions(type) {
        const functions = this.getCognitiveFunctions(type);
        functions.forEach((func, index) => {
            this.addTrait('认知功能', {
                function: func,
                position: index + 1,
                strength: (4 - index) / 4
            });
        });
    }

    // 获取认知功能栈
    getCognitiveFunctions(type) {
        const dominant = type[0] + type[1];
        const auxiliary = (type[0] === 'E' ? 'I' : 'E') + (type[2] === 'T' ? 'F' : 'T');
        const tertiary = type[0] + (type[2] === 'T' ? 'F' : 'T');
        const inferior = (type[0] === 'E' ? 'I' : 'E') + type[1];

        return [dominant, auxiliary, tertiary, inferior];
    }
} 