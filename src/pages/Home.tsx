import React, { useState } from 'react';
import { Loader2, Send, Activity, Clock, FileText, HeartPulse } from 'lucide-react';

// 时辰列表
const SHICHEN = [
  { key: '子', time: '23:00-01:00' },
  { key: '丑', time: '01:00-03:00' },
  { key: '寅', time: '03:00-05:00' },
  { key: '卯', time: '05:00-07:00' },
  { key: '辰', time: '07:00-09:00' },
  { key: '巳', time: '09:00-11:00' },
  { key: '午', time: '11:00-13:00' },
  { key: '未', time: '13:00-15:00' },
  { key: '申', time: '15:00-17:00' },
  { key: '酉', time: '17:00-19:00' },
  { key: '戌', time: '19:00-21:00' },
  { key: '亥', time: '21:00-23:00' },
];

interface DiagnosisResult {
  diagnosis: {
    summary: string;
    analysis: string;
  };
  midnight_noon_ebb_flow_analysis: {
    main_meridian: string;
    reasoning: string;
  };
  treatment_recommendations: {
    clinical: Array<{ type: string; name: string; method?: string; instruction?: string; reason: string }>;
    lifestyle: string[];
    exercise: string[];
  };
}

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DiagnosisResult | null>(null);
  
  // 表单状态
  const [complaint, setComplaint] = useState('');
  const [history, setHistory] = useState('');
  const [tonguePulse, setTonguePulse] = useState('');
  const [visitTime, setVisitTime] = useState('');
  const [onsetTime, setOnsetTime] = useState('');
  const [worseTime, setWorseTime] = useState<string[]>([]);

  const handleWorseTimeToggle = (time: string) => {
    if (worseTime.includes(time)) {
      setWorseTime(worseTime.filter(t => t !== time));
    } else {
      setWorseTime([...worseTime, time]);
    }
  };

  const renderParagraphs = (text: string) => {
    if (!text) return null;
    return text.split('\n').map((paragraph, index) => (
      paragraph.trim() ? (
        <p key={index} className="mb-2 last:mb-0 leading-relaxed">
          {paragraph}
        </p>
      ) : null
    ));
  };

  const handleSubmit = async () => {
    if (!complaint) {
      alert('请输入主诉');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/diagnose', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          medicalRecord: {
            complaint,
            history,
            tonguePulse,
          },
          timeInfo: {
            visitTime,
            onsetTime,
            worseTime,
          },
        }),
      });

      const data = await response.json();
      if (data.success) {
        setResult(data.data);
      } else {
        alert('诊断失败: ' + data.error);
      }
    } catch (error) {
      console.error(error);
      alert('网络错误');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center justify-center gap-3">
            <Activity className="w-8 h-8 text-emerald-600" />
            中医子午流注辅助诊断系统
          </h1>
          <p className="mt-2 text-gray-600">基于AI与经典子午流注理论的智能辅助工具</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 左侧输入区 */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-600" />
              病历信息录入
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">主诉 <span className="text-red-500">*</span></label>
                <textarea
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  rows={2}
                  placeholder="例如：失眠多梦，夜间加重..."
                  value={complaint}
                  onChange={(e) => setComplaint(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">现病史</label>
                <textarea
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  rows={4}
                  placeholder="发病经过、伴随症状等..."
                  value={history}
                  onChange={(e) => setHistory(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">舌脉象</label>
                <input
                  type="text"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="例如：舌红苔黄，脉弦数"
                  value={tonguePulse}
                  onChange={(e) => setTonguePulse(e.target.value)}
                />
              </div>

              <div className="border-t pt-4 mt-6">
                <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-emerald-600" />
                  时间信息
                </h3>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">就诊时辰</label>
                    <select 
                      className="w-full p-2 border border-gray-300 rounded-lg"
                      value={visitTime}
                      onChange={(e) => setVisitTime(e.target.value)}
                    >
                      <option value="">请选择</option>
                      {SHICHEN.map(s => <option key={s.key} value={s.key}>{s.key}时 ({s.time})</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">首发时辰</label>
                    <select 
                      className="w-full p-2 border border-gray-300 rounded-lg"
                      value={onsetTime}
                      onChange={(e) => setOnsetTime(e.target.value)}
                    >
                      <option value="">请选择</option>
                      {SHICHEN.map(s => <option key={s.key} value={s.key}>{s.key}时 ({s.time})</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">症状加重时段 (可多选)</label>
                  <div className="grid grid-cols-4 gap-2">
                    {SHICHEN.map(s => (
                      <button
                        key={s.key}
                        onClick={() => handleWorseTimeToggle(s.key)}
                        className={`p-2 text-sm rounded-md transition-colors ${
                          worseTime.includes(s.key)
                            ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                            : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        {s.key}时
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full mt-6 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                开始智能辩证
              </button>
            </div>
          </div>

          {/* 右侧结果区 */}
          <div className="space-y-6">
            {!result && !loading && (
              <div className="bg-white rounded-xl shadow-sm p-12 border border-gray-100 text-center text-gray-400">
                <HeartPulse className="w-16 h-16 mx-auto mb-4 opacity-20" />
                <p>请输入病历信息并开始诊断</p>
              </div>
            )}

            {loading && (
              <div className="bg-white rounded-xl shadow-sm p-12 border border-gray-100 text-center">
                <Loader2 className="w-12 h-12 mx-auto mb-4 text-emerald-600 animate-spin" />
                <p className="text-gray-600">正在进行子午流注规则分析...</p>
                <p className="text-sm text-gray-400 mt-2">调用AI大模型进行深度辩证</p>
              </div>
            )}

            {result && (
              <>
                {/* 诊断结论 */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-emerald-100 border-l-4 border-l-emerald-500">
                  <h2 className="text-xl font-bold text-gray-900 mb-2">诊断结论</h2>
                  <div className="text-2xl text-emerald-700 font-serif mb-3">{result.diagnosis.summary}</div>
                  <div className="text-gray-600 leading-relaxed">
                    {renderParagraphs(result.diagnosis.analysis)}
                  </div>
                </div>

                {/* 子午流注分析 */}
                <div className="bg-indigo-50 rounded-xl shadow-sm p-6 border border-indigo-100">
                  <h2 className="text-lg font-bold text-indigo-900 mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    子午流注时相分析
                  </h2>
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="bg-white p-5 rounded-xl shadow-sm text-center md:w-48 flex-shrink-0 border border-indigo-50 h-fit">
                      <div className="text-sm text-gray-500 mb-2 font-medium">主时辰经脉</div>
                      <div className="text-2xl font-bold text-indigo-600 break-words">
                        {result.midnight_noon_ebb_flow_analysis.main_meridian}
                      </div>
                    </div>
                    <div className="text-gray-700 text-base leading-relaxed flex-1 bg-white/60 p-5 rounded-xl border border-indigo-50/50">
                      {renderParagraphs(result.midnight_noon_ebb_flow_analysis.reasoning)}
                    </div>
                  </div>
                </div>

                {/* 处置方案 */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                  <h2 className="text-xl font-semibold mb-6">处置方案推荐</h2>
                  
                  <div className="space-y-6">
                    {/* 临床处方 */}
                    <div>
                      <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">临床处方</h3>
                      <div className="grid gap-3">
                        {result.treatment_recommendations.clinical.map((item, idx) => (
                          <div key={idx} className="flex gap-4 p-3 bg-gray-50 rounded-lg border border-gray-100">
                            <span className={`px-2 py-1 rounded text-xs font-medium h-fit ${
                              item.type === '穴位' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                            }`}>
                              {item.type}
                            </span>
                            <div>
                              <div className="font-bold text-gray-900">
                                {item.name} 
                                {item.method && <span className="text-sm font-normal text-gray-500 ml-2">({item.method})</span>}
                              </div>
                              {item.instruction && <div className="text-sm text-amber-600 mt-1">{item.instruction}</div>}
                              <div className="text-sm text-gray-500 mt-1">{renderParagraphs(item.reason)}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* 生活处方 */}
                      <div>
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">生活处方</h3>
                        <ul className="list-disc list-inside space-y-2 text-gray-600">
                          {result.treatment_recommendations.lifestyle.map((item, idx) => (
                            <li key={idx} className="leading-relaxed">{item}</li>
                          ))}
                        </ul>
                      </div>

                      {/* 运动处方 */}
                      <div>
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">运动处方</h3>
                        <ul className="list-disc list-inside space-y-2 text-gray-600">
                          {result.treatment_recommendations.exercise.map((item, idx) => (
                            <li key={idx} className="leading-relaxed">{item}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
