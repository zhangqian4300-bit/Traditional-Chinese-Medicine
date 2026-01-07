import { Router, type Request, type Response } from 'express';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import OpenAI from 'openai';

const router = Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 确保环境变量已加载（避免在 app.ts 调用 dotenv.config() 之前被静态导入执行）
dotenv.config();

// 初始化 OpenAI 客户端
// 注意：在实际部署中，确保环境变量已正确设置
const openai = new OpenAI({
  apiKey: process.env.LITELLM_API_KEY,
  baseURL: process.env.LITELLM_API_BASE || 'https://litellm.thesaisai.com',
});

// 读取规则文件内容
const getRuleContent = () => {
  try {
    const filePath = path.join(__dirname, '../data/子午流注辩证方法.txt');
    return fs.readFileSync(filePath, 'utf-8');
  } catch (error) {
    console.error('Error reading rule file:', error);
    return '';
  }
};

router.post('/', async (req: Request, res: Response) => {
  try {
    const { medicalRecord, timeInfo } = req.body;

    if (!medicalRecord || !timeInfo) {
      res.status(400).json({ success: false, error: 'Missing medicalRecord or timeInfo' });
      return;
    }

    const ruleContent = getRuleContent();

    if (!ruleContent) {
      res.status(500).json({ success: false, error: 'Failed to load diagnosis rules' });
      return;
    }

    const systemPrompt = `你是一个专业的中医助手，致力于辅助医生进行诊断。
你的核心能力是基于【子午流注辩证方法】进行疾病定性、原因辩证分析和处置方案推荐。临床处方推荐必须以“就诊时辰（visitTime）”为锚点进行生成，不得建议调整就诊时间；若未提供就诊时辰，则以主时辰经脉推断适配时段并在输出中标注。

请严格依据以下规则内容进行分析：
=== 子午流注辩证方法 ===
${ruleContent}
=== 规则结束 ===

任务要求：
1. 第一步：疾病定性。根据病历信息，判断表里、寒热、虚实、病位（脏腑/经络）。
2. 第二步：子午流注原因辩证。结合时间信息（就诊时辰、首发/加重时辰），利用子午流注规则分析病机，解释症状与时辰的关联。
3. 第三步：处置方案推荐。包括临床处方（穴位、方剂，且需依据就诊时辰标注“apply_time”）、生活处方（作息、饮食）、运动处方、音疗处方（五音对应，包含“tone”“tracks”“schedule”“reason”）。

请以JSON格式输出结果，结构如下：
{
  "diagnosis": {
    "summary": "定性结论（如：肝郁气滞证）",
    "analysis": "定性分析详情"
  },
  "midnight_noon_ebb_flow_analysis": {
    "main_meridian": "主时辰经脉",
    "reasoning": "结合时辰与症状的辩证分析"
  },
  "treatment_recommendations": {
    "clinical": [
      { "type": "穴位", "name": "穴位名", "method": "操作法", "apply_time": "依据就诊时辰的推荐时段", "reason": "选取理由" },
      { "type": "方剂", "name": "方名", "instruction": "加减建议", "apply_time": "依据就诊时辰的推荐时段", "reason": "选取理由" }
    ],
    "lifestyle": ["生活建议1", "生活建议2"],
    "exercise": ["运动建议1", "运动建议2"],
    "audio_therapy": {
      "tone": "五音（角/徵/宫/商/羽）",
      "tracks": ["曲目1", "曲目2"],
      "schedule": ["时段1", "时段2"],
      "reason": "选择该音的依据与疗效说明"
    }
  }
}`;

    const userPrompt = `
病历信息：
${JSON.stringify(medicalRecord)}

时间信息：
${JSON.stringify(timeInfo)}
`;

    const completion = await openai.chat.completions.create({
      model: 'gemini/gemini-3-pro-preview',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_object' },
    });

    const result = completion.choices[0].message.content;
    let parsedResult;
    try {
        parsedResult = JSON.parse(result || '{}');
    } catch (e) {
        parsedResult = { raw: result };
    }

    res.json({ success: true, data: parsedResult });

  } catch (error: any) {
    console.error('Diagnosis error:', error);
    res.status(500).json({ success: false, error: error.message || 'Internal server error' });
  }
});

export default router;
