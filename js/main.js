document.addEventListener('DOMContentLoaded', () => {
    // 启动说明处理
    const startupOverlay = document.getElementById('startup-overlay');
    const warningOverlay = document.getElementById('warning-overlay');
    const startButton = document.getElementById('start-button');
    const verifyButton = document.getElementById('verify-button');
    const cancelButton = document.getElementById('cancel-button');
    const verificationCode = document.getElementById('verification-code');
    const container = document.querySelector('.container');

    // 初始隐藏主容器
    container.style.display = 'none';

    // 验证码检查函数
    function checkVerificationCode() {
        const correctCode = 'xxx12zzcx';
        const inputCode = verificationCode.value.trim();
        
        if (inputCode === correctCode) {
            warningOverlay.style.opacity = '0';
            warningOverlay.style.transition = 'opacity 1s';
            
            setTimeout(() => {
                warningOverlay.style.display = 'none';
                container.style.display = 'block';
                container.style.opacity = '0';
                container.style.transition = 'opacity 1s';
                requestAnimationFrame(() => {
                    container.style.opacity = '1';
                    // 开始第一个问题
                    askNextQuestion();
                });
            }, 1000);
        } else {
            // 验证失败效果
            verificationCode.classList.add('verification-error');
            verificationCode.value = '';
            verificationCode.placeholder = '验证码错误 - 系统防御已启动';
            
            // 添加抖动效果
            warningOverlay.classList.add('shake');
            setTimeout(() => {
                warningOverlay.classList.remove('shake');
                verificationCode.classList.remove('verification-error');
                verificationCode.placeholder = '请输入验证码';
            }, 1000);
        }
    }

    // 点击开始按钮后的处理
    startButton.addEventListener('click', () => {
        startupOverlay.style.opacity = '0';
        startupOverlay.style.transition = 'opacity 1s';
        
        setTimeout(() => {
            startupOverlay.style.display = 'none';
            warningOverlay.style.display = 'block';
            warningOverlay.style.opacity = '0';
            requestAnimationFrame(() => {
                warningOverlay.style.opacity = '1';
            });
        }, 1000);
    });

    // 验证按钮点击事件
    verifyButton.addEventListener('click', checkVerificationCode);

    // 取消按钮点击事件
    cancelButton.addEventListener('click', () => {
        window.close();
        // 如果window.close()不起作用，显示终止访问信息
        document.body.innerHTML = '<div class="termination-message">系统访问已终止</div>';
    });

    // 验证码输入框回车事件
    verificationCode.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            checkVerificationCode();
        }
    });

    // 对话状态管理
    const dialogueState = {
        currentStage: 'initial',
        currentQuestionIndex: 0,
        repeatCount: 0,
        collectedData: {},
        waitingForFollowUp: false
    };

    const analyzer = new PersonalityAnalyzer();
    const chatMessages = document.getElementById('chat-messages');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');
    const analysisResult = document.getElementById('analysis-result');
    const stageName = document.querySelector('.stage-name');
    const progressPercentage = document.querySelector('.progress-percentage');
    const progressFill = document.querySelector('.progress-fill');

    // 获取当前问题
    function getCurrentQuestion() {
        const stage = analyzer.promptModel.prompts[dialogueState.currentStage];
        if (!stage || !stage.questions) return null;
        return stage.questions[dialogueState.currentQuestionIndex];
    }

    // 显示下一个问题
    function askNextQuestion() {
        const currentStage = analyzer.promptModel.prompts[dialogueState.currentStage];
        if (!currentStage) return;

        // 如果当前问题组已完成，进入下一阶段
        if (dialogueState.currentQuestionIndex >= currentStage.questions.length) {
            if (currentStage.nextStage === 'analyzing') {
                startAnalysis();
                return;
            }
            dialogueState.currentStage = currentStage.nextStage;
            dialogueState.currentQuestionIndex = 0;
            dialogueState.repeatCount = 0;
            updateProgress();
        }

        const question = getCurrentQuestion();
        if (!question) return;

        // 如果是重复问题且达到重复次数，跳到下一个问题
        if (question.repeat && dialogueState.repeatCount >= question.repeat) {
            dialogueState.currentQuestionIndex++;
            dialogueState.repeatCount = 0;
            askNextQuestion();
            return;
        }

        // 显示问题
        let questionText = question.question;
        if (question.repeat && question.repeat > 1) {
            const remaining = question.repeat - dialogueState.repeatCount;
            questionText = `${question.question} (还需要${remaining}个)`;
        }
        addMessage(questionText, false);
        
        if (question.options) {
            addMessage(`可选项: ${question.options.join(' / ')}`, false, true);
        }
    }

    // 处理用户输入
    async function handleUserInput() {
        const message = userInput.value.trim();
        if (!message) return;

        // 禁用输入和发送按钮
        userInput.disabled = true;
        sendButton.disabled = true;

        // 显示用户消息
        addMessage(message, true);
        userInput.value = '';

        // 处理输入
        const question = getCurrentQuestion();
        if (!question) return;

        // 验证输入
        const isValid = validateInput(message, question);
        if (!isValid) {
            addMessage(getValidationMessage(question), false, true);
            userInput.disabled = false;
            sendButton.disabled = false;
            return;
        }

        // 保存数据
        saveAnswer(message, question);

        // 处理后续问题
        if (question.repeat && dialogueState.repeatCount < question.repeat - 1) {
            dialogueState.repeatCount++;
            askNextQuestion();  // 立即显示下一个重复问题
        } else if (question.followUp && message === question.followUp.condition) {
            dialogueState.waitingForFollowUp = true;
            addMessage(question.followUp.question, false);
        } else {
            if (dialogueState.waitingForFollowUp) {
                // 保存跟进问题的答案
                saveAnswer(message, {...getCurrentQuestion(), id: getCurrentQuestion().id + '_followup'});
                dialogueState.waitingForFollowUp = false;
            }
            dialogueState.currentQuestionIndex++;
            dialogueState.repeatCount = 0;
            askNextQuestion();  // 显示下一个问题
        }

        // 重新启用输入
        userInput.disabled = false;
        sendButton.disabled = false;
        userInput.focus();
    }

    // 验证输入
    function validateInput(input, question) {
        switch (question.format) {
            case '单选':
                return question.options.includes(input);
            case '数字':
                return !isNaN(input) && input !== '';
            case 'datetime':
                return validateDateTime(input);
            case 'time':
                return /^\d{2}:\d{2}$/.test(input);
            case 'timeRange':
                return /^\d{2}:\d{2}-\d{2}:\d{2}$/.test(input);
            case 'percentage':
                const num = parseFloat(input);
                return !isNaN(num) && num >= 0 && num <= 100;
            case 'score':
                const score = parseInt(input);
                return !isNaN(score) && score >= question.min && score <= question.max;
            case 'boolean':
                return ['是', '否'].includes(input);
            default:
                return input.length > 0;
        }
    }

    // 验证日期时间
    function validateDateTime(input) {
        // 移除多余的空格
        input = input.trim();
        
        // 尝试不同的日期格式
        const formats = [
            /^\d{4}-\d{1,2}-\d{1,2} \d{1,2}:\d{1,2}$/, // YYYY-M-D H:m
            /^\d{4}\/\d{1,2}\/\d{1,2} \d{1,2}:\d{1,2}$/, // YYYY/M/D H:m
            /^\d{4}\.\d{1,2}\.\d{1,2} \d{1,2}:\d{1,2}$/, // YYYY.M.D H:m
            /^\d{4}年\d{1,2}月\d{1,2}日 \d{1,2}:\d{1,2}$/ // YYYY年M月D日 H:m
        ];

        // 检查是否匹配任一格式
        if (!formats.some(format => format.test(input))) {
            return false;
        }

        // 提取数字
        const numbers = input.match(/\d+/g);
        if (!numbers || numbers.length < 5) {
            return false;
        }

        const year = parseInt(numbers[0]);
        const month = parseInt(numbers[1]);
        const day = parseInt(numbers[2]);
        const hour = parseInt(numbers[3]);
        const minute = parseInt(numbers[4]);

        // 基本范围检查
        if (year < 1900 || year > new Date().getFullYear() ||
            month < 1 || month > 12 ||
            day < 1 || day > 31 ||
            hour < 0 || hour > 23 ||
            minute < 0 || minute > 59) {
            return false;
        }

        // 检查月份对应的天数
        const daysInMonth = new Date(year, month, 0).getDate();
        if (day > daysInMonth) {
            return false;
        }

        return true;
    }

    // 获取验证错误消息
    function getValidationMessage(question) {
        switch (question.format) {
            case '单选':
                return `请从以下选项中选择一个: ${question.options.join(' / ')}`;
            case '数字':
                return '请输入有效的数字';
            case 'datetime':
                return '请输入出生日期和时间，支持以下格式：\n' +
                       '- YYYY-MM-DD HH:mm（如：2000-01-01 12:30）\n' +
                       '- YYYY/MM/DD HH:mm（如：2000/1/1 12:30）\n' +
                       '- YYYY.MM.DD HH:mm（如：2000.1.1 12:30）\n' +
                       '- YYYY年MM月DD日 HH:mm（如：2000年1月1日 12:30）';
            case 'time':
                return '请使用格式: HH:mm';
            case 'timeRange':
                return '请使用格式: HH:mm-HH:mm';
            case 'percentage':
                return '请输入0-100之间的数字';
            case 'score':
                return `请输入${question.min}-${question.max}之间的分数`;
            case 'boolean':
                return '请回答"是"或"否"';
            default:
                return '请输入有效的内容';
        }
    }

    // 保存答案
    function saveAnswer(answer, question) {
        if (!dialogueState.collectedData[dialogueState.currentStage]) {
            dialogueState.collectedData[dialogueState.currentStage] = {};
        }
        
        if (question.repeat) {
            if (!dialogueState.collectedData[dialogueState.currentStage][question.id]) {
                dialogueState.collectedData[dialogueState.currentStage][question.id] = [];
            }
            dialogueState.collectedData[dialogueState.currentStage][question.id].push(answer);
        } else {
            dialogueState.collectedData[dialogueState.currentStage][question.id] = answer;
        }
    }

    // 开始分析
    async function startAnalysis() {
        addMessage("数据采集完成，开始深度分析...", false);
        try {
            // 显示分析结果容器
            const analysisResult = document.getElementById('analysis-result');
            analysisResult.classList.remove('hidden');
            
            // 创建并显示进度条
            const analysisContainer = document.getElementById('analysis-container');
            if (!document.getElementById('analysis-progress')) {
                const progressDiv = document.createElement('div');
                progressDiv.id = 'analysis-progress';
                progressDiv.className = 'analysis-progress';
                progressDiv.innerHTML = `
                    <div class="progress-status">准备开始分析...</div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: 0%"></div>
                    </div>
                    <div class="progress-percent">0%</div>
                `;
                analysisContainer.insertBefore(progressDiv, analysisContainer.firstChild);
            }
            
            // 更新初始进度
            updateAnalysisProgress("开始数据处理...", 10);
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // 更新进度并开始分析
            updateAnalysisProgress("正在进行深度分析...", 30);
            
            // 调用大模型生成分析内容
            const analysisData = await generateAnalysisContent(dialogueState.collectedData);
            
            // 显示结果
            await displayResults(analysisData);
            
                dialogueState.currentStage = 'complete';
            updateProgress();
            
        } catch (error) {
            console.error('分析过程出错:', error);
            addMessage("分析过程中遇到错误，请检查数据完整性。", false);
            updateAnalysisProgress("分析过程出错", 0);
        }
    }

    // 生成分析内容
    async function generateAnalysisContent(userData) {
        try {
            let analysisContent = ''; // 用于存储分析内容

            // 创建进度显示容器
            const progressContainer = document.createElement('div');
            progressContainer.className = 'analysis-progress-container';
            document.body.appendChild(progressContainer);

            // 定义分析阶段
            const analysisStages = [
                { id: 'init', name: '[生物特征识别] 基因数据解析...', percentage: 0 },
                { id: 'bazi', name: '[时空数据分析] 四维时序测算...', percentage: 0 },
                { id: 'ziwei', name: '[天体物理计算] 星体轨道影响计算...', percentage: 0 },
                { id: 'taiyi', name: '[人工智能分析] 人类数据模型模拟...', percentage: 0 },
                { id: 'destiny', name: '[神经网络分析] 概率矩阵计算...', percentage: 0 },
                { id: 'guidance', name: '[量子运算处理] 多维度拟合测试...', percentage: 0 }
            ];

            // 更新进度显示
            function updateProgressDisplay() {
                let html = '<h3>HACKING-LIFE™ 系统运行状态</h3>';
                
                // 添加阶段进度条
                analysisStages.forEach(stage => {
                    const status = stage.percentage === 100 ? 'complete' : 
                                 stage.percentage > 0 ? 'active' : 'pending';
                    
                    html += `
                        <div class="analysis-stage">
                            <div class="stage-header">
                                <span class="stage-name ${status}">${stage.name}</span>
                                <span class="stage-percentage">${stage.percentage}%</span>
                            </div>
                            <div class="progress-bar-detailed">
                                <div class="progress-fill-detailed" style="width: ${stage.percentage}%"></div>
                            </div>
                        </div>
                    `;
                });

                // 添加总体进度
                const totalProgress = Math.round(
                    analysisStages.reduce((sum, stage) => sum + stage.percentage, 0) / 
                    analysisStages.length
                );

                html += `
                    <div class="analysis-status">
                        系统计算进度: ${totalProgress}%
                    </div>
                    <div class="analysis-time">
                        预计剩余计算时间: ${Math.max(1, Math.round((100 - totalProgress) / 10))} 分钟
                    </div>
                `;

                progressContainer.innerHTML = html;
            }

            // 更新特定阶段的进度
            function updateStageProgress(stageId, percentage) {
                const stage = analysisStages.find(s => s.id === stageId);
                if (stage) {
                    stage.percentage = Math.min(100, Math.max(0, percentage));
                    updateProgressDisplay();
                }
            }

            // 开始数据解密
            updateStageProgress('init', 30);
            const systemPrompt = `你是一位专精于人生模型分析的AI科学家，需要通过数据分析和模型预测，对用户的生命轨迹进行科学化解读。

分析要求：
1. 分析方法：
   - 运用生物特征识别系统
   - 应用时空数据分析算法
   - 结合深度学习预测模型
   - 使用神经网络行为分析
   - 整合量子概率计算结果

2. 表达方式：
   - 使用科学化的专业术语
   - 运用数据分析的语言风格
   - 采用模型预测的表达方式
   - 强调算法推演的客观性
   - 突出AI计算的准确性

3. 年度预测模型：
   每年的数据分析必须包含：
   - 综合评分系统（0-100分）
   - 关键时间节点（精确到月）
   - 机遇与挑战预测
   - 多维度分析：
     * 职业发展：职业轨迹预测、能力提升机会、创新突破点
     * 资源优化：资源获取概率、投资收益预测、财务规划建议
     * 情感模式：人际关系发展、情感链接强度、家庭关系动态
     * 健康指数：生理状态预测、心理健康评估、养生方案优化
     * 社交网络：人脉扩展模型、社交效能预测、群体互动分析

4. 分析结构：
   A. 生命模型解析
      - 用数据分析解释个人特征
      - 说明核心竞争优势
      - 预测潜在风险因素
      - 提供发展优化方案

   B. 人生阶段预测
      - 科学划分发展周期
      - 确定各阶段重点任务
      - 预测可能的机遇与挑战

   C. 年度轨迹模拟（按年份展开）
      - 年度综合指数评估
      - 月度关键事件预测
      - 多维度数据分析
      - 优化方案推荐

5. 表达原则：
   - 保持科学严谨的语言风格
   - 对不利因素提供数据支持的应对策略
   - 提供基于算法的可执行建议
   - 使用数据可视化的描述方式
   - 强调预测的概率特性

6. 重点要求：
   - 每个预测都要有时间维度
   - 每个建议都要有执行参数
   - 广泛使用数据化指标
   - 建立清晰的优先级系统
   - 注重预测的可验证性`;
            updateStageProgress('init', 100);

            // 开始时空矩阵分析
            updateStageProgress('bazi', 30);
            const overallPrompt = `请基于以下用户数据进行生命模型分析：
${JSON.stringify(userData, null, 2)}

请按照以下格式进行分析：

1. 生命模型基础分析
   - 个人数据特征分析
   - 核心竞争力评估
   - 潜在风险因素
   - 发展优化建议

2. 关键时间节点预测
   请基于数据模型预测以下时间段的关键事件：
   - 近期预测（12个月内）：按月度列出重要事件概率
   - 中期预测（1-3年）：按季度列出发展机遇概率
   - 远期预测（3-5年）：重要转折点概率分析

3. 年度轨迹模拟
   请对每一年进行数据建模分析：

   【XXXX年】- 综合指数：XX/100
   - 年度特征标签：[列出3-5个关键指标]
   - 发展曲线：
     * 高峰期：X月、X月（原因：xxx）
     * 调整期：X月、X月（原因：xxx）
   
   多维度指标分析：
   a) 职业发展指数 (得分：XX/100)
      - 发展机遇概率：
      - 潜在挑战分析：
      - 优化策略建议：

   b) 资源利用指数 (得分：XX/100)
      - 资源获取预测：
      - 投资收益模型：
      - 风险预警分析：
      - 资源优化建议：

   c) 情感发展指数 (得分：XX/100)
      - 情感链接强度：
      - 人际互动预测：
      - 家庭关系动态：
      - 关系优化建议：

   d) 健康状态指数 (得分：XX/100)
      - 生理指标预警：
      - 潜在风险分析：
      - 健康优化方案：
      - 运动科学建议：

   e) 社交网络指数 (得分：XX/100)
      - 人脉扩展预测：
      - 社交效能分析：
      - 群体互动建议：

   月度数据预测：
   1月：[事件概率与建议]
   2月：[事件概率与建议]
   ...以此类推到12月

   年度优化方案：
   - 最优发展方向：
   - 效能提升参数：
   - 环境适应指数：
   - 资源配置建议：
   - 风险防控措施：`;
            const overallResult = await callAPI(systemPrompt, overallPrompt);
            analysisContent += overallResult + '\n\n';
            updateStageProgress('bazi', 100);

            // 分析各个年龄段
            const ageRanges = [
                { start: 1, end: 12, name: "童年期" },
                { start: 13, end: 18, name: "青少年期" },
                { start: 19, end: 30, name: "成年早期" },
                { start: 31, end: 45, name: "成年中期" },
                { start: 46, end: 60, name: "成年后期" },
                { start: 61, end: 75, name: "老年前期" },
                { start: 76, end: 90, name: "老年中期" },
                { start: 91, end: 100, name: "老年后期" }
            ];

            // 更新其他分析阶段
            updateStageProgress('ziwei', 30);
            updateStageProgress('taiyi', 20);
            updateStageProgress('destiny', 10);

            for (let i = 0; i < ageRanges.length; i++) {
                const range = ageRanges[i];
                const agePrompt = `请基于以下用户数据，对${range.start}-${range.end}岁的${range.name}阶段进行深度数据分析：
${JSON.stringify(userData, null, 2)}

分析框架：

1. 发展阶段特征模型
   A. 生理发展指标
      - 生理系统发育参数
      - 神经系统成熟度
      - 免疫系统状态
      - 生理机能周期

   B. 心理发展指标
      - 认知能力发展
      - 情绪智商指数
      - 社交适应能力
      - 心理韧性系数

   C. 能力发展指标
      - 学习能力曲线
      - 创造力指数
      - 执行力系数
      - 适应力参数

2. 年度数据模型（${range.start}-${range.end}岁每年详细分析）

${range.start}岁发展模型：
A. 综合发展指数（评分：0-100）
   - 年度关键参数：[列出3个核心指标]
   - 月度数据预警：
     * 1月：[数据异常与优化建议]
     * 2月：[数据异常与优化建议]
     * 3月：[数据异常与优化建议]
     * 4月：[数据异常与优化建议]
     * 5月：[数据异常与优化建议]
     * 6月：[数据异常与优化建议]
     * 7月：[数据异常与优化建议]
     * 8月：[数据异常与优化建议]
     * 9月：[数据异常与优化建议]
     * 10月：[数据异常与优化建议]
     * 11月：[数据异常与优化建议]
     * 12月：[数据异常与优化建议]
   - 高能量周期：[识别3-5个最佳发展月份及数据支持]
   - 低能量周期：[识别2-3个需要特别关注的月份及原因]

B. 多维度发展分析
   智力发展指数（评分：0-100）
   - 认知能力提升周期：[具体到月份]
   - 学习效率最优时段：[时间分布]
   - 能力跃迁计划：[月度实施方案]

   情感发展指数（评分：0-100）
   - 情感稳定性曲线：[关键时间点]
   - 社交活跃度预测：[高峰期分析]
   - 亲密关系发展：[关键期预测]

   生理发展指数（评分：0-100）
   - 生理机能周期：[季度预测]
   - 免疫系统波动：[高危时间点]
   - 营养补给方案：[时间表]

   潜能开发指数（评分：0-100）
   - 天赋显现期：[最佳开发时机]
   - 技能培养周期：[学习计划表]
   - 能力突破点：[时间节点]

C. 月度精准预测
   1月数据模型：
   - 关键事件概率：
   - 发展机遇指数：
   - 优化策略：
   
   2月数据模型：
   [相同格式继续，直到12月]

D. 年度发展策略
   - 核心任务时间表：[月度计划]
   - 风险预警机制：[时间点预警]
   - 家庭支持系统：[干预时机]
   - 发展路径规划：[月度实施]

...（以相同格式继续分析到${range.end}岁，保持每年的精确预测）

3. 阶段发展策略
   - 发展路径规划：[年度+月度计划]
   - 能力培养体系：[时间节点部署]
   - 心理建设方案：[关键期干预]
   - 风险防控机制：[预警时间表]
   - 监护人配合策略：[协同时间表]

4. 优化方案
   - 最优时间窗口：[精确到月]
   - 环境适应指数：[季节变化]
   - 发展促进因子：[时机选择]
   - 风险预警指标：[时间预警]
   - 干预方案部署：[执行时间表]`;
                
                // 更新生命周期分析进度
                updateStageProgress('guidance', (i + 1) * 16);
                
                const result = await callAPI(systemPrompt, agePrompt);
                analysisContent += `\n\n${range.name}（${range.start}-${range.end}岁）详细分析：\n${result}`;

                // 同步更新其他分析阶段的进度
                updateStageProgress('ziwei', 30 + i * 12);
                updateStageProgress('taiyi', 20 + i * 13);
                updateStageProgress('destiny', 10 + i * 15);
            }

            // 完成所有分析
            analysisStages.forEach(stage => updateStageProgress(stage.id, 100));
            
            // 延迟移除进度显示
            setTimeout(() => {
                progressContainer.style.opacity = '0';
                setTimeout(() => progressContainer.remove(), 1000);
            }, 2000);

            return analysisContent;

        } catch (error) {
            console.error('生成分析内容时出错:', error);
            throw error;
        }
    }

    // 调用API的辅助函数
    async function callAPI(systemPrompt, userPrompt) {
        const apiUrl = CONFIG.API_ENDPOINT;
        
        const requestBody = {
            model: "deepseek-chat",
            messages: [
                {
                    role: "system",
                    content: systemPrompt
                },
                {
                    role: "user",
                    content: userPrompt
                }
            ],
            temperature: 0.7,
            max_tokens: 2000,
            top_p: 0.95,
            stream: false,
            presence_penalty: 0,
            frequency_penalty: 0
        };

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${CONFIG.API_KEY}`
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            throw new Error(`API调用失败: ${response.status} ${response.statusText}`);
        }

        const result = await response.json();
        
        if (!result.choices || !result.choices[0] || !result.choices[0].message) {
            throw new Error('API返回数据格式不完整');
        }

        return result.choices[0].message.content;
    }

    // 更新分析进度
    function updateAnalysisProgress(status, percent) {
        const progressDiv = document.getElementById('analysis-progress');
        if (!progressDiv) return;

        const statusDiv = progressDiv.querySelector('.progress-status');
        const fillDiv = progressDiv.querySelector('.progress-fill');
        const percentDiv = progressDiv.querySelector('.progress-percent');

        if (statusDiv) statusDiv.textContent = status;
        if (fillDiv) fillDiv.style.width = `${percent}%`;
        if (percentDiv) percentDiv.textContent = `${percent}%`;

        // 添加日志以便调试
        console.log(`Progress updated: ${status} - ${percent}%`);
    }

    // 显示分析结果
    async function displayResults(analysisData) {
        try {
            // 获取分析结果容器
            const analysisResult = document.getElementById('analysis-result');
            analysisResult.classList.remove('hidden');
            analysisResult.classList.add('visible');
            
            // 清空之前的内容
            const analysisContainer = document.getElementById('analysis-container');
            analysisContainer.innerHTML = `
                <div class="analysis-text">
                    ${analysisData.replace(/\n/g, '<br>')}
                </div>
            `;
            
            // 滚动到分析结果
            analysisResult.scrollIntoView({ behavior: 'smooth' });
            
        } catch (error) {
            console.error('显示分析结果时出错:', error);
            addMessage("显示分析结果时遇到错误。", false);
        }
    }

    // 格式化时间
    function formatEventTime(event) {
        if (event.year) {
            return `${event.year}年${event.month ? event.month + '月' : ''}`;
        }
        return event.time || '时间未知';
    }

    // 更新进度
    function updateProgress() {
        const stages = Object.keys(analyzer.promptModel.prompts);
        const currentStageIndex = stages.indexOf(dialogueState.currentStage);
        const totalStages = stages.length;
        const currentStage = analyzer.promptModel.prompts[dialogueState.currentStage];
        
        if (!currentStage) return;

        const questionProgress = dialogueState.currentQuestionIndex / currentStage.questions.length;
        const totalProgress = Math.round(((currentStageIndex + questionProgress) / totalStages) * 100);

        stageName.textContent = `当前阶段：${getStageDisplayName(dialogueState.currentStage)}`;
        progressFill.style.width = `${totalProgress}%`;
        progressPercentage.textContent = `${totalProgress}%`;
    }

    // 获取阶段显示名称
    function getStageDisplayName(stage) {
        const stageNames = {
            initial: '基础数据采集',
            lifePattern: '生命周期分析',
            relationships: '社交网络分析',
            values: '决策模型分析',
            challenges: '发展瓶颈分析',
            analyzing: '深度分析中',
            complete: '分析完成'
        };
        return stageNames[stage] || stage;
    }

    // 添加消息到聊天界面
    function addMessage(content, isUser = false, isGuide = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isUser ? 'user-message' : isGuide ? 'guide-message' : 'ai-message'}`;
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        contentDiv.innerHTML = content.replace(/\n/g, '<br>');
        messageDiv.appendChild(contentDiv);

        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // 格式化时间线部分
    function formatTimelineSection(timeline) {
        if (!timeline || !Array.isArray(timeline)) return '';

        return `<div class="timeline-section">
            <h2>生命阶段</h2>
            <div class="timeline">
                ${timeline.map(event => `
                    <div class="timeline-event">
                        <div class="event-time">${formatEventTime(event)}</div>
                        <div class="event-content">
                            <h3>${event.title || '阶段'}</h3>
                            <p>${event.description || ''}</p>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>`;
    }

    // 事件监听器
    sendButton.addEventListener('click', handleUserInput);
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleUserInput();
        }
    });
}); 