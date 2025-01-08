class PromptModel {
    constructor() {
        // 添加回答指南
        this.answerGuide = {
            general: [
                "请按照提示格式回答",
                "数据越精确越好"
            ],
            format: {
                date: "YYYY-MM-DD",
                time: "HH:mm"
            }
        };

        // 提示词模板
        this.prompts = {
            initial: {
                questions: [
                    {
                        id: 'gender',
                        question: "请输入性别 [男/女]:",
                        format: "单选",
                        options: ['男', '女'],
                        required: true
                    },
                    {
                        id: 'timeParam',
                        question: "请输入出生时间 [YYYY-MM-DD HH:mm]:",
                        format: "datetime",
                        required: true,
                        description: "精确时间对命理分析很重要"
                    },
                    {
                        id: 'birthPlace',
                        question: "请输入出生地点 [省市区]:",
                        format: "text",
                        required: true,
                        description: "用于命理分析"
                    }
                ],
                nextStage: 'analyzing'
            }
        };

        // 分析维度配置
        this.analysisDimensions = {
            destiny: {
                name: '命理分析',
                aspects: ['八字', '紫微斗数', '太乙神数'],
                weights: {
                    initial: 0.6,
                    current: 0.4
                }
            },
            timing: {
                name: '时运分析',
                aspects: ['大运', '流年', '流月'],
                weights: {
                    initial: 0.7,
                    current: 0.3
                }
            },
            guidance: {
                name: '指导建议',
                aspects: ['主要建议', '注意事项', '开运方法'],
                weights: {
                    initial: 0.5,
                    current: 0.5
                }
            }
        };

        // 信息完整性阈值
        this.completenessThresholds = {
            basic: 0.9,      // 基本信息完整度阈值
            detail: 0.7,     // 详细信息完整度阈值
            overall: 0.8     // 整体完整度阈值
        };

        // 信息权重配置
        this.infoWeights = {
            initial: 1.0,    // 基础命理信息权重
            current: 0.8     // 现状信息权重
        };

        // 模型解释模板
        this.interpretationTemplates = {
            destiny: "从{aspect}分析，您的{trait}特质显著，这表明{implication}。",
            timing: "目前处于{phase}阶段，{aspect}显示{indication}，建议{action}。",
            guidance: "根据{aspect}分析，建议您{suggestion}，同时需要注意{caution}。",
            opportunity: "在{timing}时期会出现{chance}的机会，可以通过{method}来把握。",
            caution: "需要注意{phase}时期的{risk}风险，建议通过{solution}来化解。"
        };
    }

    // 获取阶段提示词
    getPrompt(stage) {
        return this.prompts[stage] || null;
    }

    // 获取关键词权重
    getKeywordWeight(category, keyword) {
        return this.keywordWeights[category]?.[keyword] || 0.5;
    }

    // 获取分析维度
    getAnalysisDimension(dimension) {
        return this.analysisDimensions[dimension] || null;
    }

    // 生成解释文本
    generateInterpretation(template, params) {
        let text = this.interpretationTemplates[template];
        Object.entries(params).forEach(([key, value]) => {
            text = text.replace(`{${key}}`, value);
        });
        return text;
    }

    // 分析关键词匹配度
    analyzeKeywordMatch(text, category) {
        const keywords = Object.keys(this.keywordWeights[category] || {});
        const matches = keywords.filter(keyword => text.includes(keyword));
        const weights = matches.map(keyword => this.getKeywordWeight(category, keyword));
        return {
            matches,
            averageWeight: weights.length ? weights.reduce((a, b) => a + b, 0) / weights.length : 0
        };
    }

    // 生成综合分析
    generateComprehensiveAnalysis(data) {
        const analysis = {
            dimensions: {},
            suggestions: [],
            potentials: [],
            risks: []
        };

        // 分析每个维度
        Object.entries(this.analysisDimensions).forEach(([key, dimension]) => {
            const dimensionAnalysis = {
                name: dimension.name,
                aspects: dimension.aspects.map(aspect => {
                    // 这里可以根据收集到的数据进行更详细的分析
                    return {
                        name: aspect,
                        score: Math.random(), // 示例：实际应该基于数据计算
                        insights: []
                    };
                })
            };
            analysis.dimensions[key] = dimensionAnalysis;
        });

        return analysis;
    }

    // 检查单个阶段的信息完整性
    checkStageCompleteness(stage, data) {
        const stageConfig = this.prompts[stage];
        if (!stageConfig || !data) return { complete: false, score: 0, missingInfo: [] };

        const missingInfo = [];
        let score = 0;
        const questions = stageConfig.questions;
        const maxScore = questions.length;

        questions.forEach(question => {
            const answer = data[question.id];
            if (question.required) {
                if (question.repeat) {
                    // 检查重复问题的答案
                    if (!Array.isArray(answer) || answer.length < question.repeat) {
                        missingInfo.push(`需要${question.repeat}个${question.question}`);
                    } else {
                        score += 1;
                    }
                } else if (question.followUp) {
                    // 检查跟进问题的答案
                    if (!answer) {
                        missingInfo.push(question.question);
                    } else {
                        if (answer === question.followUp.condition) {
                            const followUpAnswer = data[question.id + '_followup'];
                            if (!followUpAnswer) {
                                missingInfo.push(question.followUp.question);
                            } else {
                                score += 1;
                            }
                        } else {
                            score += 1;
                        }
                    }
                } else {
                    // 检查普通问题的答案
                    if (!answer) {
                        missingInfo.push(question.question);
                    } else {
                        score += 1;
                    }
                }
            } else if (answer) {
                // 非必需问题，如果有答案就加分
                score += 0.5;
            }
        });

        const completenessScore = score / maxScore;
        const complete = completenessScore >= this.completenessThresholds.basic;

        return {
            complete,
            score: completenessScore,
            missingInfo
        };
    }

    // 获取匹配类别
    getMatchCategory(stage) {
        const categoryMap = {
            initial: 'personality',
            lifestyle: 'behavior',
            relationships: 'relationships',
            career: 'behavior',
            values: 'values',
            challenges: 'behavior'
        };
        return categoryMap[stage] || 'personality';
    }

    // 生成后续提示
    generateFollowUpPrompt(stage, completenessResult) {
        if (completenessResult.complete) {
            return null;
        }

        let prompt = "为了更好地理解，请补充一些信息：\n";
        
        if (completenessResult.missingInfo.length > 0) {
            prompt += completenessResult.missingInfo.map((info, index) => 
                `${index + 1}. ${info}`
            ).join('\n');
        }

        if (completenessResult.keywordMatches.length === 0) {
            prompt += "\n请尽可能使用具体的描述词，例如：";
            const examples = this.keywordWeights[this.getMatchCategory(stage)];
            if (examples) {
                prompt += Object.keys(examples).slice(0, 3).join('、');
            }
        }

        return prompt;
    }

    // 检查整体信息完整性
    checkOverallCompleteness(collectedData) {
        const stages = Object.keys(this.prompts);
        let totalScore = 0;
        let totalWeight = 0;
        const missingStages = [];

        stages.forEach(stage => {
            if (stage === 'analyzing') return;

            const stageWeight = this.infoWeights[stage] || 1;
            totalWeight += stageWeight;

            if (!collectedData[stage] || Object.keys(collectedData[stage]).length === 0) {
                missingStages.push(stage);
                return;
            }

            const completeness = this.checkStageCompleteness(stage, collectedData[stage]);
            totalScore += completeness.score * stageWeight;
        });

        const overallScore = totalScore / totalWeight;
        const complete = overallScore >= this.completenessThresholds.overall;

        return {
            complete,
            score: overallScore,
            missingStages,
            readyForAnalysis: complete && missingStages.length === 0
        };
    }

    // 生成信息完整性报告
    generateCompletenessReport(collectedData) {
        const report = {
            stages: {},
            overall: null
        };

        // 检查每个阶段
        Object.keys(this.prompts).forEach(stage => {
            if (stage === 'analyzing') return;

            const data = collectedData[stage];
            if (data) {
                report.stages[stage] = this.checkStageCompleteness(stage, data);
            } else {
                report.stages[stage] = {
                    complete: false,
                    score: 0,
                    missingInfo: ['未收集信息']
                };
            }
        });

        // 检查整体完整性
        report.overall = this.checkOverallCompleteness(collectedData);

        return report;
    }
} 