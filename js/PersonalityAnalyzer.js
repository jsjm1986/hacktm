class PersonalityAnalyzer {
    constructor() {
        this.promptModel = new PromptModel();
        this.baZiCalculator = new BaZiCalculator();
        this.purpleStarCalculator = new PurpleStarCalculator();
        this.taiYiCalculator = new TaiYiCalculator();
    }

    // 生成最终分析
    async generateFinalAnalysis(collectedData) {
        const report = this.promptModel.generateCompletenessReport(collectedData);
        if (!report.overall.readyForAnalysis) {
            throw new Error("数据不完整，无法生成分析");
        }

        // 基础数据解析
        const basicData = collectedData.initial;
        const birthTime = basicData.timeParam ? new Date(basicData.timeParam) : null;
        const age = parseInt(basicData.age);
        const currentYear = new Date().getFullYear();
        const birthYear = birthTime ? birthTime.getFullYear() : (currentYear - age);

        // 命理分析
        const destinyAnalysis = await this.generateDestinyAnalysis(birthTime, age);

        // 生成完整分析报告
        return {
            traits: this.analyzeTraits(collectedData),
            influences: this.analyzeInfluences(collectedData),
            timeline: this.generateLifeTimeline(collectedData, birthYear, destinyAnalysis),
            predictions: this.generatePredictions(collectedData, destinyAnalysis),
            recommendations: this.generateRecommendations(collectedData, destinyAnalysis)
        };
    }

    // 生成命理分析
    async generateDestinyAnalysis(birthTime, age) {
        if (!birthTime) return null;

        // 八字分析
        const baZi = this.baZiCalculator.calculateBaZi(birthTime);
        const baZiStrength = this.baZiCalculator.analyzeStrength(baZi);
        const baZiAdvice = this.baZiCalculator.generateAdvice(baZi, baZiStrength);

        // 紫微斗数分析
        const purpleStarChart = this.purpleStarCalculator.calculateChart(birthTime);
        const purpleStarAnalysis = this.purpleStarCalculator.analyzeChartCharacteristics(purpleStarChart);

        // 太乙神数分析
        const taiYiNumbers = this.taiYiCalculator.calculateTaiYi(birthTime);
        const taiYiAnalysis = this.taiYiCalculator.analyzeNumerology(taiYiNumbers);
        const taiYiAdvice = this.taiYiCalculator.generateAdvice(taiYiNumbers);

        return {
            baZi: {
                chart: baZi,
                strength: baZiStrength,
                advice: baZiAdvice
            },
            purpleStar: {
                chart: purpleStarChart,
                analysis: purpleStarAnalysis
            },
            taiYi: {
                numbers: taiYiNumbers,
                analysis: taiYiAnalysis,
                advice: taiYiAdvice
            }
        };
    }

    // 生成人生时间线
    generateLifeTimeline(collectedData, birthYear, destinyAnalysis) {
        const timeline = {
            '已经历': this.analyzePastPhases(collectedData, birthYear, destinyAnalysis),
            '当前阶段': this.analyzeCurrentPhase(collectedData, destinyAnalysis),
            '未来发展': this.analyzeFuturePhases(collectedData, destinyAnalysis)
        };
        return timeline;
    }

    // 分析过去阶段
    analyzePastPhases(data, birthYear, destinyAnalysis) {
        const currentYear = new Date().getFullYear();
        const age = currentYear - birthYear;
        const pastPhases = [];

        // 童年期 (0-12岁)
        if (age > 12) {
            pastPhases.push({
                phase: '童年期',
                period: `${birthYear}-${birthYear + 12}`,
                key: '早期性格形成期',
                characteristics: this.analyzePhaseCharacteristics(data, 'childhood', destinyAnalysis),
                majorEvents: this.predictMajorEvents('childhood', destinyAnalysis),
                influences: this.analyzePhaseInfluences('childhood', destinyAnalysis)
            });
        }

        // 青少年期 (13-18岁)
        if (age > 18) {
            pastPhases.push({
                phase: '青少年期',
                period: `${birthYear + 13}-${birthYear + 18}`,
                key: '价值观形成期',
                characteristics: this.analyzePhaseCharacteristics(data, 'youth', destinyAnalysis),
                majorEvents: this.predictMajorEvents('youth', destinyAnalysis),
                influences: this.analyzePhaseInfluences('youth', destinyAnalysis)
            });
        }

        // 成年早期 (19-30岁)
        if (age > 30) {
            pastPhases.push({
                phase: '成年早期',
                period: `${birthYear + 19}-${birthYear + 30}`,
                key: '能力发展期',
                characteristics: this.analyzePhaseCharacteristics(data, 'youngAdult', destinyAnalysis),
                majorEvents: this.predictMajorEvents('youngAdult', destinyAnalysis),
                influences: this.analyzePhaseInfluences('youngAdult', destinyAnalysis)
            });
        }

        return pastPhases;
    }

    // 分析当前阶段
    analyzeCurrentPhase(data, destinyAnalysis) {
        const currentPhase = {
            '主要特征': this.getCurrentCharacteristics(data, destinyAnalysis),
            '关键挑战': this.getCurrentChallenges(data, destinyAnalysis),
            '发展机遇': this.getCurrentOpportunities(data, destinyAnalysis),
            '优势资源': this.getCurrentResources(data, destinyAnalysis)
        };
        return currentPhase;
    }

    // 分析未来阶段
    analyzeFuturePhases(data, destinyAnalysis) {
        return {
            '近期发展': this.analyzeNearFuture(data, destinyAnalysis),
            '中期规划': this.analyzeMidTermPlan(data, destinyAnalysis),
            '长期愿景': this.analyzeLongTermVision(data, destinyAnalysis)
        };
    }

    // 分析阶段特征
    analyzePhaseCharacteristics(data, phase, destinyAnalysis) {
        if (!destinyAnalysis) return [];

        const characteristics = [];
        
        // 整合八字分析
        if (destinyAnalysis.baZi) {
            const baZiAdvice = destinyAnalysis.baZi.advice;
            characteristics.push(`八字显示：${baZiAdvice.lifeElement}特质突出`);
        }

        // 整合紫微斗数分析
        if (destinyAnalysis.purpleStar) {
            const purpleStarPattern = destinyAnalysis.purpleStar.analysis.destinyPattern;
            characteristics.push(`紫微分析：${purpleStarPattern.mainCharacteristics[0].influence}`);
        }

        // 整合太乙神数分析
        if (destinyAnalysis.taiYi) {
            const taiYiPattern = destinyAnalysis.taiYi.analysis.lifePattern;
            characteristics.push(`太乙预示：${taiYiPattern[phase] || '稳定发展'}`);
        }

        return characteristics;
    }

    // 预测重大事件
    predictMajorEvents(phase, destinyAnalysis) {
        if (!destinyAnalysis) return [];

        const events = [];
        
        // 整合八字预测
        if (destinyAnalysis.baZi) {
            events.push(`命理指引：${destinyAnalysis.baZi.advice.favorable.timing}`);
        }

        // 整合紫微斗数预测
        if (destinyAnalysis.purpleStar) {
            const purpleStarEvents = destinyAnalysis.purpleStar.analysis.keyPeriods;
            events.push(`星盘显示：${purpleStarEvents[0].characteristics}`);
        }

        // 整合太乙神数预测
        if (destinyAnalysis.taiYi) {
            const taiYiEvents = destinyAnalysis.taiYi.analysis.timingPattern.cycles;
            events.push(`数理预测：${taiYiEvents[0].cycle}`);
        }

        return events;
    }

    // 分析阶段影响
    analyzePhaseInfluences(phase, destinyAnalysis) {
        if (!destinyAnalysis) return [];

        const influences = [];
        
        // 整合八字影响
        if (destinyAnalysis.baZi) {
            influences.push(`五行特征：${destinyAnalysis.baZi.strength.strongestElement}旺相`);
        }

        // 整合紫微斗数影响
        if (destinyAnalysis.purpleStar) {
            const starInfluences = destinyAnalysis.purpleStar.analysis.lifeDirection;
            influences.push(`星耀影响：${starInfluences.career.suitable[0]}`);
        }

        // 整合太乙神数影响
        if (destinyAnalysis.taiYi) {
            const numberInfluences = destinyAnalysis.taiYi.advice.specific;
            influences.push(`数理指引：${numberInfluences.career[0]}`);
        }

        return influences;
    }

    // 获取当前特征
    getCurrentCharacteristics(data, destinyAnalysis) {
        const characteristics = [];
        
        // 基础特征
        if (data.values) {
            if (data.values.careerScore >= 8) characteristics.push('事业导向');
            if (data.values.familyScore >= 8) characteristics.push('家庭导向');
            if (data.values.personalScore >= 8) characteristics.push('成长导向');
        }

        // 命理特征
        if (destinyAnalysis) {
            if (destinyAnalysis.baZi) {
                characteristics.push(`命理特质：${destinyAnalysis.baZi.advice.lifeElement}`);
            }
            if (destinyAnalysis.purpleStar) {
                characteristics.push(`星盘特征：${destinyAnalysis.purpleStar.analysis.destinyPattern.mainCharacteristics[0].influence}`);
            }
            if (destinyAnalysis.taiYi) {
                characteristics.push(`数理特点：${destinyAnalysis.taiYi.analysis.basicPattern.characteristics[0]}`);
            }
        }

        return characteristics.join('、') || '暂无显著特征';
    }

    // 获取当前挑战
    getCurrentChallenges(data, destinyAnalysis) {
        const challenges = [];

        // 基础挑战
        if (data.challenges && data.challenges.mainBottleneck) {
            challenges.push(`当前瓶颈：${data.challenges.mainBottleneck}`);
            challenges.push(`影响程度：${data.challenges.bottleneckLevel}/10`);
        }

        // 命理挑战
        if (destinyAnalysis) {
            if (destinyAnalysis.baZi) {
                challenges.push(`命理提示：${destinyAnalysis.baZi.advice.unfavorable.cautions[0]}`);
            }
            if (destinyAnalysis.purpleStar) {
                const starChallenges = destinyAnalysis.purpleStar.analysis.keyPeriods;
                challenges.push(`星盘警示：${starChallenges[0].focus[1]}`);
            }
            if (destinyAnalysis.taiYi) {
                const numberChallenges = destinyAnalysis.taiYi.analysis.timingPattern.challenges;
                challenges.push(`数理预警：${numberChallenges[0].advice[0]}`);
            }
        }

        return challenges.join('\\n');
    }

    // 获取当前机遇
    getCurrentOpportunities(data, destinyAnalysis) {
        const opportunities = [];

        // 基础机遇
        if (data.challenges && data.challenges.opportunity === '是') {
            opportunities.push(`当前机遇：${data.challenges.opportunity_followup}`);
        }

        // 命理机遇
        if (destinyAnalysis) {
            if (destinyAnalysis.baZi) {
                opportunities.push(`命理指引：${destinyAnalysis.baZi.advice.favorable.activities[0]}`);
            }
            if (destinyAnalysis.purpleStar) {
                const starOpportunities = destinyAnalysis.purpleStar.analysis.lifeDirection;
                opportunities.push(`星盘提示：${starOpportunities.career.timing.favorable}`);
            }
            if (destinyAnalysis.taiYi) {
                const numberOpportunities = destinyAnalysis.taiYi.analysis.timingPattern.peaks;
                opportunities.push(`数理良机：${numberOpportunities[0].opportunity[0]}`);
            }
        }

        return opportunities.join('\\n') || '暂无明显机遇';
    }

    // 获取当前资源
    getCurrentResources(data, destinyAnalysis) {
        const resources = [];

        // 基础资源
        if (data.relationships && data.relationships.closeContacts > 5) {
            resources.push('强社交网络');
        }
        if (data.values && data.values.rationalRate > 70) {
            resources.push('理性决策能力');
        }

        // 命理资源
        if (destinyAnalysis) {
            if (destinyAnalysis.baZi) {
                resources.push(`命理优势：${destinyAnalysis.baZi.advice.favorable.elements[0]}相助`);
            }
            if (destinyAnalysis.purpleStar) {
                const starResources = destinyAnalysis.purpleStar.analysis.destinyPattern;
                resources.push(`星盘助力：${starResources.overallPattern[0]}`);
            }
            if (destinyAnalysis.taiYi) {
                const numberResources = destinyAnalysis.taiYi.analysis.basicPattern;
                resources.push(`数理支持：${numberResources.characteristics[0]}`);
            }
        }

        return resources.join('、') || '需要进一步发掘资源';
    }

    // 分析近期发展
    analyzeNearFuture(data, destinyAnalysis) {
        const predictions = [];

        // 基础预测
        if (data.values && data.challenges) {
            const careerFocus = parseInt(data.values.careerScore);
            const hasOpportunity = data.challenges.opportunity === '是';
            
            if (careerFocus >= 8 && hasOpportunity) {
                predictions.push('事业发展处于上升期');
            }
        }

        // 命理预测
        if (destinyAnalysis) {
            if (destinyAnalysis.baZi) {
                predictions.push(`命理预示：${destinyAnalysis.baZi.advice.favorable.timing}`);
            }
            if (destinyAnalysis.purpleStar) {
                predictions.push(`星盘指引：${destinyAnalysis.purpleStar.analysis.lifeDirection.career.timing.advice}`);
            }
            if (destinyAnalysis.taiYi) {
                predictions.push(`数理预测：${destinyAnalysis.taiYi.advice.timing.favorable}`);
            }
        }

        return predictions.join('\\n');
    }

    // 分析中期规划
    analyzeMidTermPlan(data, destinyAnalysis) {
        const plans = [];

        // 基础规划
        if (data.values && data.challenges) {
            const personalScore = parseInt(data.values.personalScore);
            if (personalScore >= 8) {
                plans.push('注重个人成长与能力提升');
            }
        }

        // 命理规划
        if (destinyAnalysis) {
            if (destinyAnalysis.baZi) {
                plans.push(`命理建议：${destinyAnalysis.baZi.advice.balancing.suggestions[0]}`);
            }
            if (destinyAnalysis.purpleStar) {
                plans.push(`星盘规划：${destinyAnalysis.purpleStar.analysis.lifeDirection.career.advice[0]}`);
            }
            if (destinyAnalysis.taiYi) {
                plans.push(`数理指导：${destinyAnalysis.taiYi.advice.specific.development[0]}`);
            }
        }

        return plans.join('\\n');
    }

    // 分析长期愿景
    analyzeLongTermVision(data, destinyAnalysis) {
        const visions = [];

        // 基础愿景
        if (data.values) {
            const careerScore = parseInt(data.values.careerScore);
            const personalScore = parseInt(data.values.personalScore);
            
            if (careerScore >= 8) {
                visions.push('追求事业成就与社会影响');
            }
            if (personalScore >= 8) {
                visions.push('致力个人成长与自我实现');
            }
        }

        // 命理愿景
        if (destinyAnalysis) {
            if (destinyAnalysis.baZi) {
                visions.push(`命理指引：${destinyAnalysis.baZi.advice.favorable.activities[0]}`);
            }
            if (destinyAnalysis.purpleStar) {
                visions.push(`星盘启示：${destinyAnalysis.purpleStar.analysis.destinyPattern.overallPattern[0]}`);
            }
            if (destinyAnalysis.taiYi) {
                visions.push(`数理展望：${destinyAnalysis.taiYi.analysis.lifePattern.late}`);
            }
        }

        return visions.join('\\n');
    }

    // 分析性格特征
    analyzeTraits(destinyAnalysis) {
        if (!destinyAnalysis) return [];

        const traits = [];

        // 整合八字分析的性格特征
        if (destinyAnalysis.baZi) {
            const baZiAdvice = destinyAnalysis.baZi.advice;
            traits.push({
                source: '八字分析',
                traits: [
                    `${baZiAdvice.lifeElement}性格特质`,
                    `具有${baZiAdvice.favorable.elements[0]}的特点`,
                    `需要平衡${baZiAdvice.unfavorable.elements[0]}的影响`
                ]
            });
        }

        // 整合紫微斗数的性格特征
        if (destinyAnalysis.purpleStar) {
            const purpleStarPattern = destinyAnalysis.purpleStar.analysis.destinyPattern;
            traits.push({
                source: '紫微分析',
                traits: [
                    purpleStarPattern.mainCharacteristics[0].influence,
                    purpleStarPattern.personalityTraits[0].influence,
                    ...purpleStarPattern.overallPattern
                ]
            });
        }

        // 整合太乙神数的性格特征
        if (destinyAnalysis.taiYi) {
            const taiYiPattern = destinyAnalysis.taiYi.analysis.basicPattern;
            traits.push({
                source: '太乙分析',
                traits: taiYiPattern.characteristics
            });
        }

        return traits;
    }

    // 分析影响因素
    analyzeInfluences(destinyAnalysis) {
        if (!destinyAnalysis) return [];

        const influences = [];

        // 整合八字影响
        if (destinyAnalysis.baZi) {
            influences.push({
                source: '八字影响',
                factors: [
                    {
                        type: '有利因素',
                        elements: destinyAnalysis.baZi.advice.favorable.elements,
                        timing: destinyAnalysis.baZi.advice.favorable.timing
                    },
                    {
                        type: '不利因素',
                        elements: destinyAnalysis.baZi.advice.unfavorable.elements,
                        cautions: destinyAnalysis.baZi.advice.unfavorable.cautions
                    }
                ]
            });
        }

        // 整合紫微斗数影响
        if (destinyAnalysis.purpleStar) {
            const lifeDirection = destinyAnalysis.purpleStar.analysis.lifeDirection;
            influences.push({
                source: '紫微影响',
                factors: [
                    {
                        type: '事业影响',
                        direction: lifeDirection.career.suitable,
                        timing: lifeDirection.career.timing
                    },
                    {
                        type: '财运影响',
                        direction: lifeDirection.wealth.channels,
                        timing: lifeDirection.wealth.timing
                    },
                    {
                        type: '人际影响',
                        direction: lifeDirection.relationships.characteristics,
                        timing: lifeDirection.relationships.timing
                    }
                ]
            });
        }

        // 整合太乙神数影响
        if (destinyAnalysis.taiYi) {
            influences.push({
                source: '太乙影响',
                factors: [
                    {
                        type: '时运影响',
                        cycles: destinyAnalysis.taiYi.analysis.timingPattern.cycles,
                        peaks: destinyAnalysis.taiYi.analysis.timingPattern.peaks
                    },
                    {
                        type: '发展影响',
                        advice: destinyAnalysis.taiYi.advice.specific,
                        timing: destinyAnalysis.taiYi.advice.timing
                    }
                ]
            });
        }

        return influences;
    }

    // 生成预测分析
    generatePredictions(data, destinyAnalysis) {
        if (!destinyAnalysis) return {};

        return {
            近期预测: {
                事业发展: this.predictCareerDevelopment(destinyAnalysis),
                财运变化: this.predictWealthChanges(destinyAnalysis),
                人际关系: this.predictRelationshipChanges(destinyAnalysis)
            },
            关键时期: {
                有利时机: this.predictFavorablePeriods(destinyAnalysis),
                注意事项: this.predictCautionPeriods(destinyAnalysis)
            }
        };
    }

    // 预测事业发展
    predictCareerDevelopment(destinyAnalysis) {
        const predictions = [];

        if (destinyAnalysis.baZi) {
            predictions.push(`命理显示：${destinyAnalysis.baZi.advice.favorable.activities[0]}`);
        }
        if (destinyAnalysis.purpleStar) {
            const career = destinyAnalysis.purpleStar.analysis.lifeDirection.career;
            predictions.push(`星盘指引：${career.timing.advice}`);
        }
        if (destinyAnalysis.taiYi) {
            predictions.push(`数理预测：${destinyAnalysis.taiYi.advice.specific.career[0]}`);
        }

        return predictions;
    }

    // 预测财运变化
    predictWealthChanges(destinyAnalysis) {
        const predictions = [];

        if (destinyAnalysis.baZi) {
            predictions.push(`命理显示：有利于${destinyAnalysis.baZi.advice.favorable.elements[0]}相关发展`);
        }
        if (destinyAnalysis.purpleStar) {
            const wealth = destinyAnalysis.purpleStar.analysis.lifeDirection.wealth;
            predictions.push(`星盘指引：${wealth.timing.advice}`);
        }
        if (destinyAnalysis.taiYi) {
            predictions.push(`数理预测：${destinyAnalysis.taiYi.advice.specific.development[0]}`);
        }

        return predictions;
    }

    // 预测人际关系
    predictRelationshipChanges(destinyAnalysis) {
        const predictions = [];

        if (destinyAnalysis.baZi) {
            predictions.push(`命理显示：${destinyAnalysis.baZi.advice.balancing.suggestions[0]}`);
        }
        if (destinyAnalysis.purpleStar) {
            const relationships = destinyAnalysis.purpleStar.analysis.lifeDirection.relationships;
            predictions.push(`星盘指引：${relationships.timing.advice}`);
        }
        if (destinyAnalysis.taiYi) {
            predictions.push(`数理预测：${destinyAnalysis.taiYi.advice.specific.relationship[0]}`);
        }

        return predictions;
    }

    // 预测有利时期
    predictFavorablePeriods(destinyAnalysis) {
        const periods = [];

        if (destinyAnalysis.baZi) {
            periods.push(`命理显示：${destinyAnalysis.baZi.advice.favorable.timing}`);
        }
        if (destinyAnalysis.purpleStar) {
            const timing = destinyAnalysis.purpleStar.analysis.keyPeriods[0];
            periods.push(`星盘指引：${timing.characteristics}`);
        }
        if (destinyAnalysis.taiYi) {
            periods.push(`数理预测：${destinyAnalysis.taiYi.analysis.timingPattern.peaks[0].opportunity[0]}`);
        }

        return periods;
    }

    // 预测需注意时期
    predictCautionPeriods(destinyAnalysis) {
        const periods = [];

        if (destinyAnalysis.baZi) {
            periods.push(`命理提醒：${destinyAnalysis.baZi.advice.unfavorable.cautions[0]}`);
        }
        if (destinyAnalysis.purpleStar) {
            const timing = destinyAnalysis.purpleStar.analysis.keyPeriods[0];
            periods.push(`星盘警示：${timing.focus[1]}`);
        }
        if (destinyAnalysis.taiYi) {
            periods.push(`数理警示：${destinyAnalysis.taiYi.analysis.timingPattern.challenges[0].advice[0]}`);
        }

        return periods;
    }

    // 生成建议
    generateRecommendations(data, destinyAnalysis) {
        if (!destinyAnalysis) return {};

        return {
            核心建议: this.generateCoreAdvice(destinyAnalysis),
            发展方向: this.generateDevelopmentAdvice(destinyAnalysis),
            注意事项: this.generateCautionAdvice(destinyAnalysis),
            开运方法: this.generateEnhancementMethods(destinyAnalysis)
        };
    }

    // 生成核心建议
    generateCoreAdvice(destinyAnalysis) {
        const advice = [];

        if (destinyAnalysis.baZi) {
            advice.push(`命理建议：发挥${destinyAnalysis.baZi.advice.favorable.elements[0]}特质`);
        }
        if (destinyAnalysis.purpleStar) {
            const pattern = destinyAnalysis.purpleStar.analysis.destinyPattern;
            advice.push(`星盘建议：${pattern.mainCharacteristics[0].influence}`);
        }
        if (destinyAnalysis.taiYi) {
            advice.push(`数理建议：${destinyAnalysis.taiYi.advice.general[0]}`);
        }

        return advice;
    }

    // 生成发展建议
    generateDevelopmentAdvice(destinyAnalysis) {
        const advice = [];

        if (destinyAnalysis.baZi) {
            advice.push(`命理指引：${destinyAnalysis.baZi.advice.balancing.suggestions[0]}`);
        }
        if (destinyAnalysis.purpleStar) {
            const direction = destinyAnalysis.purpleStar.analysis.lifeDirection;
            advice.push(`星盘指引：${direction.career.advice[0]}`);
        }
        if (destinyAnalysis.taiYi) {
            advice.push(`数理指引：${destinyAnalysis.taiYi.advice.specific.development[0]}`);
        }

        return advice;
    }

    // 生成注意事项
    generateCautionAdvice(destinyAnalysis) {
        const cautions = [];

        if (destinyAnalysis.baZi) {
            cautions.push(`命理警示：${destinyAnalysis.baZi.advice.unfavorable.cautions[0]}`);
        }
        if (destinyAnalysis.purpleStar) {
            const periods = destinyAnalysis.purpleStar.analysis.keyPeriods;
            cautions.push(`星盘警示：${periods[0].focus[1]}`);
        }
        if (destinyAnalysis.taiYi) {
            cautions.push(`数理警示：${destinyAnalysis.taiYi.analysis.timingPattern.challenges[0].advice[0]}`);
        }

        return cautions;
    }

    // 生成开运方法
    generateEnhancementMethods(destinyAnalysis) {
        const methods = [];

        if (destinyAnalysis.baZi) {
            methods.push(`命理开运：选择${destinyAnalysis.baZi.advice.favorable.elements[0]}相关行业`);
        }
        if (destinyAnalysis.purpleStar) {
            const direction = destinyAnalysis.purpleStar.analysis.lifeDirection;
            methods.push(`星盘开运：${direction.career.suitable[0]}`);
        }
        if (destinyAnalysis.taiYi) {
            methods.push(`数理开运：${destinyAnalysis.taiYi.advice.specific.career[0]}`);
        }

        return methods;
    }
} 