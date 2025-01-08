class PersonalityAnalyzer {
    constructor() {
        this.promptModel = new PromptModel();
        this.baZiCalculator = new BaZiCalculator();
        this.purpleStarCalculator = new PurpleStarCalculator();
        this.taiYiCalculator = new TaiYiCalculator();
    }

    async generateDestinyAnalysis(userData) {
        try {
            if (!userData.timeParam) {
                return {
                    error: "缺少出生时间数据",
                    suggestion: "请提供准确的出生时间以获得完整分析"
                };
            }

            const birthTime = new Date(userData.timeParam);
            const baZiResult = await this.baZiCalculator.calculate(birthTime);
            const purpleStarResult = await this.purpleStarCalculator.calculate(birthTime, userData.birthPlace);
            const taiYiResult = await this.taiYiCalculator.calculate(birthTime);

            // 生成命理格局分析
            const destinyPattern = await this.generateDestinyPattern(baZiResult, purpleStarResult, taiYiResult);
            
            // 生成生命阶段分析
            const lifeStages = await this.generateLifeStages(birthTime, baZiResult, purpleStarResult);
            
            // 生成运势预测
            const predictions = await this.generatePredictions(baZiResult, purpleStarResult, taiYiResult);
            
            // 生成指导建议
            const guidance = await this.generateGuidance(baZiResult, purpleStarResult, userData);

            return {
                destinyPattern,
                lifeStages,
                keyTimings: predictions,
                careerSuggestions: guidance.career,
                wealthChannels: guidance.wealth,
                relationshipAdvice: guidance.relationship
            };
        } catch (error) {
            console.error('Destiny analysis error:', error);
            return {
                error: "分析过程出现错误",
                message: error.message,
                suggestion: "请检查输入数据的完整性和准确性"
            };
        }
    }

    async generateDestinyPattern(baZi, purpleStar, taiYi) {
        // 生成整体命格分析
        const prompt = `基于以下命理数据，请分析此人的整体命格特征：

八字命盘：${JSON.stringify(baZi)}
紫微斗数：${JSON.stringify(purpleStar)}
太乙神数：${JSON.stringify(taiYi)}

请分析：
1. 此人的基础命格
2. 主要性格特征
3. 人生重要转折点
4. 最有利的发展方向
5. 需要特别注意的问题`;

        const analysis = await this.callLargeModel(prompt);
        return {
            mainPattern: analysis.mainPattern,
            subPatterns: analysis.subPatterns,
            strengthLevel: analysis.strengthLevel
        };
    }

    async generateLifeStages(birthTime, baZi, purpleStar) {
        const age = this.calculateAge(birthTime);
        const birthYear = new Date(birthTime).getFullYear();
        const currentYear = new Date().getFullYear();
        
        // 计算命理周期
        const daYun = this.baZiCalculator.calculateDaYun(baZi);
        const liuNian = this.baZiCalculator.calculateLiuNian(baZi);
        const purpleYears = this.purpleStarCalculator.calculateYearlyStars(purpleStar);
        const taiYiYears = this.taiYiCalculator.calculateYearlyPattern(birthTime);

        // 分阶段生成人生轨迹
        const stages = [];
        
        // 第一阶段：童年到青少年（0-20岁）
        const childhoodPrompt = `基于以下命理数据，请详细描述此人从出生到20岁的具体经历：

出生年份：${birthYear}年
命理信息：
大运：${JSON.stringify(daYun)}
流年：${JSON.stringify(liuNian)}
紫微流年：${JSON.stringify(purpleYears)}
太乙流年：${JSON.stringify(taiYiYears)}

请详细描述0-20岁期间每一年的具体经历，包括：
1. 重要事件：具体发生了什么事
2. 生活状态：所处环境、生活情况
3. 面临问题：遇到的困难和挑战
4. 发展进展：学习、成长等方面的进展
5. 人际变化：与家人、同学等的关系
6. 健康状况：身体发育、疾病等情况

请特别关注：
- 出生时的命理特征
- 入学、升学等关键时期
- 大运交接年份的变化
- 家庭环境的影响
- 性格形成的关键期

格式要求：
[年份]年（[年龄]岁）：
1. 重要事件：[具体事件]
2. 生活状态：[具体描述]
3. 面临问题：[具体问题]
4. 发展进展：[具体进展]
5. 人际变化：[具体变化]
6. 健康状况：[具体状况]`;

        // 第二阶段：青年时期（21-40岁）
        const youthPrompt = `基于命理数据，请详细描述此人21-40岁期间的具体经历：

出生年份：${birthYear}年
命理信息：
大运：${JSON.stringify(daYun)}
流年：${JSON.stringify(liuNian)}
紫微流年：${JSON.stringify(purpleYears)}
太乙流年：${JSON.stringify(taiYiYears)}

请详细描述21-40岁期间每一年的具体经历，包括：
1. 重要事件：工作、婚恋等重大事件
2. 生活状态：工作环境、生活质量
3. 面临问题：事业、感情等方面的挑战
4. 发展进展：职业发展、个人成就
5. 人际变化：职场关系、婚恋关系
6. 健康状况：身体状况、压力影响

请特别关注：
- 事业起步和发展
- 婚恋感情经历
- 大运流年的关键变化
- 重要的人生选择
- 财运变化的关键点

格式同上`;

        // 第三阶段：中年时期（41-60岁）
        const middleAgePrompt = `基于命理数据，请详细描述此人41-60岁期间的具体经历：

出生年份：${birthYear}年
命理信息：[命理数据同上]

请详细描述41-60岁期间每一年的具体经历，重点关注：
- 事业的巅峰期和转折
- 家庭关系的变化
- 财富积累的情况
- 健康状况的变化
- 人生重大决策

格式同上`;

        // 第四阶段：老年时期（61-80岁）
        const elderlyPrompt = `基于命理数据，请详细描述此人61-80岁期间的具体经历：

出生年份：${birthYear}年
命理信息：[命理数据同上]

请详细描述61-80岁期间每一年的具体经历，重点关注：
- 退休后的生活安排
- 健康状况的变化
- 家庭关系的发展
- 晚年生活质量
- 精神状态变化

格式同上`;

        try {
            // 分批获取分析结果
            const [childhoodAnalysis, youthAnalysis, middleAgeAnalysis, elderlyAnalysis] = await Promise.all([
                this.callLargeModel(childhoodPrompt),
                this.callLargeModel(youthPrompt),
                this.callLargeModel(middleAgePrompt),
                this.callLargeModel(elderlyPrompt)
            ]);

            // 整合所有阶段的结果
            const allStages = [
                ...this.parseLifeStages(childhoodAnalysis),
                ...this.parseLifeStages(youthAnalysis),
                ...this.parseLifeStages(middleAgeAnalysis),
                ...this.parseLifeStages(elderlyAnalysis)
            ];

            // 按年份排序
            return allStages.sort((a, b) => a.year - b.year);
        } catch (error) {
            console.error('生成生命阶段分析失败:', error);
            throw new Error('生命阶段分析生成失败，请重试');
        }
    }

    parseLifeStages(analysis) {
        const stages = [];
        if (analysis && analysis.yearlyEvents) {
            analysis.yearlyEvents.forEach(event => {
                if (event.year && event.age) {
                    stages.push({
                        year: event.year,
                        age: event.age,
                        events: event.events || '',
                        status: event.status || '',
                        problems: event.problems || '',
                        progress: event.progress || '',
                        relationships: event.relationships || '',
                        health: event.health || ''
                    });
                }
            });
        }
        return stages;
    }

    async generatePredictions(baZi, purpleStar, taiYi) {
        // 生成近期预测
        const prompt = `基于命理数据，请预测未来一年的具体事件：

八字：${JSON.stringify(baZi)}
紫微：${JSON.stringify(purpleStar)}
太乙：${JSON.stringify(taiYi)}

请按月份预测：
1. 每个月会发生的具体事件
2. 每个月需要注意的问题
3. 每个月的机会和风险`;

        const analysis = await this.callLargeModel(prompt);
        
        return [
            {
                timing: "近期",
                detail: analysis.nearTerm || "暂无预测"
            },
            {
                timing: "三个月内",
                detail: analysis.threeMonths || "暂无预测"
            },
            {
                timing: "半年内",
                detail: analysis.sixMonths || "暂无预测"
            }
        ];
    }

    async generateGuidance(baZi, purpleStar, userData) {
        const prompt = `基于此人的命理特征，请提供未来发展的具体指导：

性别：${userData.gender}
八字信息：${JSON.stringify(baZi)}
紫微斗数：${JSON.stringify(purpleStar)}

请从以下方面提供具体的发展建议：
1. 最适合发展的事业方向和具体行业
2. 最有利的财富积累方式和投资领域
3. 最重要的人际关系发展策略和社交方向
4. 需要重点发展的能力和技能
5. 需要特别注意规避的风险和陷阱
6. 关键时期的重要决策参考
7. 长期发展的战略规划建议

请给出具体、可操作的建议，而不是笼统的描述。`;

        const analysis = await this.callLargeModel(prompt);
        
        return {
            career: analysis.career || "暂无建议",
            wealth: analysis.wealth || "暂无建议",
            relationship: analysis.relationship || "暂无建议"
        };
    }

    async callLargeModel(prompt) {
        try {
            const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'api-key': 'c1dd098872184681a8311bc6b4c57f4e'
                },
                body: JSON.stringify({
                    model: "deepseek-chat-67b",
                    messages: [
                        {
                            role: "system",
                            content: "你是一个专业的命理分析师，精通八字、紫微斗数、太乙神数等传统命理体系。你需要基于提供的命理数据进行分析，给出专业、准确、详细的解读。请按照以下格式输出分析结果：\n\n主格局：[主要命理特征]\n\n次格局：\n- [次要特征1]\n- [次要特征2]\n- [次要特征3]\n\n格局强度：[强度评级]\n\n生命阶段：\n[年份]年：[阶段标题]：[具体描述]\n\n运势预测：\n近期：[预测内容]\n三个月内：[预测内容]\n半年内：[预测内容]\n\n事业指引：[具体建议]\n\n财运指引：[具体建议]\n\n人际指引：[具体建议]"
                        },
                        {
                            role: "user",
                            content: prompt
                        }
                    ],
                    temperature: 0.7,
                    max_tokens: 2000,
                    top_p: 0.95,
                    frequency_penalty: 0,
                    presence_penalty: 0
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`API调用失败: ${errorData.error?.message || response.statusText}`);
            }

            const data = await response.json();
            if (!data.choices || !data.choices[0]?.message?.content) {
                throw new Error('API响应格式不正确');
            }

            const analysis = this.parseAnalysisResponse(data.choices[0].message.content);
            return analysis;
        } catch (error) {
            console.error('大模型API调用错误:', error);
            throw new Error('命理分析生成失败，请稍后重试: ' + error.message);
        }
    }

    parseAnalysisResponse(content) {
        try {
            const analysis = {
                yearlyEvents: []
            };

            // 解析年度事件
            const yearPattern = /(\d{4})年（(\d+)岁）：\n([\s\S]*?)(?=\n\d{4}年|$)/g;
            let match;

            while ((match = yearPattern.exec(content)) !== null) {
                const year = parseInt(match[1]);
                const age = parseInt(match[2]);
                const details = match[3];

                const eventDetails = {
                    year: year,
                    age: age,
                    events: this.extractDetail(details, "重要事件"),
                    status: this.extractDetail(details, "生活状态"),
                    problems: this.extractDetail(details, "面临问题"),
                    progress: this.extractDetail(details, "发展进展"),
                    relationships: this.extractDetail(details, "人际变化"),
                    health: this.extractDetail(details, "健康状况")
                };

                analysis.yearlyEvents.push(eventDetails);
            }

            return analysis;
        } catch (error) {
            console.error('解析年度事件失败:', error);
            throw new Error('命理分析结果解析失败');
        }
    }

    extractDetail(text, category) {
        const pattern = new RegExp(`${category}：([^\\n]+)`);
        const match = text.match(pattern);
        return match ? match[1].trim() : '';
    }

    calculateAge(birthTime) {
        const today = new Date();
        const birthDate = new Date(birthTime);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        
        return age;
    }
} 