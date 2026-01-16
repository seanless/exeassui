export const timeTypeMap = {
  // 自定义时间
  0: "自定义",
  // 最近N时间
  330: "最近30分钟",
  401: "最近1小时",
  402: "最近2小时",
  406: "最近6小时",
  412: "最近12小时",
  501: "最近1天",
  502: "最近2天",
  // 特定日期
  580: "今天",
  581: "昨天",
  // 周范围
  680: "这周",
  681: "上周",
  // 月范围
  780: "当前月",
  781: "上个月",
  // 年范围
  980: "当前年",
  981: "去年",
};

export const step_seconds_options = [
  { label: "1秒", value: 1 },
  { label: "5秒", value: 5 },
  { label: "30秒", value: 30 },
  { label: "1分钟", value: 60 },
  { label: "2分钟", value: 120 },
  { label: "3分钟", value: 180 },
  { label: "4分钟", value: 240 },
  { label: "5分钟", value: 300 },
  { label: "15分钟", value: 900 },
  { label: "30分钟", value: 1800 },
  { label: "1小时", value: 3600 },
  { label: "2小时", value: 7200 },
];
