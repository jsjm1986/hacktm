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
                { id: 'bazi', name: '[时空数据分析] 四维时序映射...', percentage: 0 },
                { id: 'ziwei', name: '[天体物理计算] 星体轨道追踪...', percentage: 0 },
                { id: 'taiyi', name: '[深度学习模型] GPT-4数据训练...', percentage: 0 },
                { id: 'destiny', name: '[神经网络分析] 概率矩阵计算...', percentage: 0 },
                { id: 'guidance', name: '[量子运算处理] 平行宇宙模拟...', percentage: 0 }
            ];

            // 更新进度显示
            function updateProgressDisplay() {
                let html = '<h3>QUANTUM-LIFE™ 系统运行状态</h3>';
                
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
            const systemPrompt = `你是一位精通中国传统命理的资深分析师，需要运用多维度的命理理论为用户进行深度分析。

分析理论基础：
1. 八字命理
   - 天干地支五行生克
   - 日主强弱判定
   - 十神制化作用
   - 大运流年解析

2. 紫微斗数
   - 命宫身宫分析
   - 主星组合特征
   - 吉凶星曜作用
   - 四化星解读

3. 太乙命理
   - 三元九运
   - 吉凶方位
   - 五行生克制化
   - 大运流年解析

分析要求：
1. 理论运用
   - 综合运用多种命理体系
   - 交叉验证各项预测
   - 合理解释理论依据
   - 注意各派理论的协调

2. 表达方式
   - 用现代语言解释传统概念
   - 将专业术语转化为生活化表达
   - 预测要具体且可理解
   - 注重实用性和可操作性

3. 分析重点
   - 先总体后细节
   - 突出关键时间点
   - 说明吉凶原理
   - 提供化解建议

4. 内容平衡
   - 客观分析优劣
   - 趋吉避凶并重
   - 多角度论证
   - 保持积极向上`;
            updateStageProgress('init', 100);

            // 开始时空矩阵分析
            updateStageProgress('bazi', 30);
            const overallPrompt = `请基于以下用户信息进行简要分析：
${JSON.stringify(userData, null, 2)}

请用简单的语言总结此人的以下特点：
1. 性格特征（100字以内）
2. 最适合的发展方向（50字以内）
3. 人生重要转折点（最多列出3个）

注意：
- 使用大众能理解的语言
- 避免专业术语
- 内容要具体实用`;

            const overallResult = await callAPI(systemPrompt, overallPrompt);
            analysisContent += overallResult + '\n\n';
            updateStageProgress('bazi', 100);

            // 分析各个年龄段
            const ageRanges = [
                { start: 1, end: 20, name: "成长期" },
                { start: 21, end: 40, name: "发展期" },
                { start: 41, end: 60, name: "成熟期" },
                { start: 61, end: 80, name: "收获期" },
                { start: 81, end: 100, name: "智慧期" }
            ];

            for (let i = 0; i < ageRanges.length; i++) {
                const range = ageRanges[i];
                const agePrompt = `请基于以下用户信息，预测${range.start}-${range.end}岁每一年的具体情况：
${JSON.stringify(userData, null, 2)}

分析要求：
1. 必须从${range.start}岁到${range.end}岁，逐年分析，不能遗漏任何一年
2. 每年的内容控制在50字以内
3. 每年必须包含：
   - 这一年的关键事件或机遇（具体到月份）
   - 需要注意的问题
   - 如何把握机会

格式要求：
每年必须按照以下格式输出，不要添加其他内容：
X岁（20XX年）：
[具体预测内容，包含月份、事件、注意事项和建议]

示例格式：
25岁（2025年）：3月有升职机会，注意提升专业能力。8月适合考证，建议提前准备。年底可能遇到贵人，多参加社交活动。
26岁（2026年）：5月有创业机会，需要做好资金准备。9月适合跳槽，注意提前储备人脉。12月注意健康，建议定期体检。

注意事项：
1. 使用口语化表达
2. 预测要具体明确
3. 建议要可操作
4. 避免玄学术语
5. 每年预测不能重复，要体现年份特点
6. 确保${range.start}到${range.end}岁每一年都有预测`;
                
                // 更新生命周期分析进度
                updateStageProgress('guidance', (i + 1) * 16);
                
                const result = await callAPI(systemPrompt, agePrompt);
                analysisContent += `\n\n${range.name}（${range.start}-${range.end}岁）：\n${result}`;

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