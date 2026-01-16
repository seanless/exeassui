const generateBalancedPlan = (items, users) => {
  // 1. 计算总任务工时
  const totalTaskHours = items.reduce((sum, t) => {
    return sum + t.service_hours;
  }, 0);

  // 2. 计算总人天 (使用之前讨论的人天统计逻辑)
  const totalPersonDays = users.reduce((sum, item) => {
    return sum + (item.user_count * item.days);
  }, 0);

  // 3. 计算每天的人均工时 (关键点)
  const hoursPerPersonPerDay = totalPersonDays > 0
    ? (totalTaskHours / totalPersonDays)
    : 0;

  // 4. 展平任务池
  let taskPool = items.map(t => ({
    name: t.rule ? t.rule[2] : "",
    remaining: t.service_hours
  }));

  // 5. 统计每天的总人力人数
  const dailyStaffCount = {};
  users.forEach(item => {
    for (let i = 1; i <= item.days; i++) {
      dailyStaffCount[i] = (dailyStaffCount[i] || 0) + item.user_count;
    }
  });

  const schedule = [];
  const days = Object.keys(dailyStaffCount).sort((a, b) => a - b);

  // 6. 按照每天的总容量 (人数 * 人均工时) 分配任务
  days.forEach(day => {
    const staffCount = dailyStaffCount[day];
    let availableCapacity = staffCount * hoursPerPersonPerDay; // 当天总可用池

    const dayPlan = {
      day: day,
      staffCount: staffCount,
      avgHoursPerPerson: hoursPerPersonPerDay.toFixed(2),
      tasksAssigned: [],
      totalCapacity: availableCapacity
    };

    while (availableCapacity > 0.01 && taskPool.length > 0) {
      let currentTask = taskPool[0];
      let workToday = Math.min(availableCapacity, currentTask.remaining);

      dayPlan.tasksAssigned.push({
        taskName: currentTask.name,
        hours: Number(workToday.toFixed(2))
      });

      availableCapacity -= workToday;
      currentTask.remaining -= workToday;

      if (currentTask.remaining <= 0.01) {
        taskPool.shift();
      }
    }
    schedule.push(dayPlan);
  });

  return schedule;
}