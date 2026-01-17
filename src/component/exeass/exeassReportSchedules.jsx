import React, { useMemo, useEffect, useState } from 'react';
import { Table } from 'antd';
import "./exeassReport.css"

const ExeassReportSchedules = ({open, items,initSchedules, users, totals,config ,acceptSchedules}) => {
  const [schedules, setSchedules] = useState(initSchedules)
  const columns = [
    { title: "服务内容", dataIndex: "content" },
    { title: "人数", dataIndex: "user_count" },
    { title: "单项时长", dataIndex: "total_hours" }
  ];

  useEffect(() => {
    if(open){
      var tmpSchedules = generateAllSchedules();
      setSchedules(tmpSchedules);
      acceptSchedules(tmpSchedules)
      console.log("the new schedule is:",tmpSchedules);
    }

  }, [items, users, totals,open])

  const generateAllSchedules=()=>{
    if(initSchedules&&initSchedules.length>0){
      return initSchedules;
    }

    if(!items||items.length<=0){
      return [];
    }

    if(!users||users.length<=0){
      return [];
    }

    console.log("开始计算生成schedules");

    var tmpSchedules = [];
    var go_traffic = generateGoAndRetunTraffic(1, users);
    if (go_traffic.length > 0) {
      tmpSchedules.push(go_traffic[0]);
    }


    // var service_schedules = generateSchedule(idx, items, users);
    // if (service_schedules.length > 0) {
    //   tmpSchedules = [...tmpSchedules, ...service_schedules];
    //   idx = service_schedules[service_schedules.length - 1].day + 1;
    // }

    var item_hours=generateItemHours(items);
    if (item_hours.length > 0) {
      tmpSchedules.push(item_hours[0]);
    }

    var return_traffic = generateGoAndRetunTraffic(2, users);
    if (return_traffic.length > 0) {
      tmpSchedules.push(return_traffic[0]);
    }

    var report_hours = generateReportHours(items);
    if (report_hours.length > 0) {
      tmpSchedules.push(report_hours[0]);
    }


    var wait_hours = generateWaitHours(totals);
    if (wait_hours.length > 0) {
      tmpSchedules.push(wait_hours[0]);
    }

    var other_hours = generateOtherHours(totals, users);
    if (other_hours.length > 0) {
      tmpSchedules.push(other_hours[0]);
    }
    return tmpSchedules;
  }

  const generateGoAndRetunTraffic=(idx, users)=> {
    var remoteUsers = users.filter(u => u.traffic_type === 'remote');
    if (!remoteUsers || remoteUsers.length <= 0) {
      return [];
    }

    const total_traffic_hours = remoteUsers.reduce((sum, item) => {
      return sum + (item.user_count * item.remote_far_traffic_hours);
    }, 0);

    const total_user_count = remoteUsers.reduce((sum, item) => {
      return sum + item.user_count;
    }, 0);

    return [{
      user_count: total_user_count,
      total_hours: total_traffic_hours,
      content: idx == 1 ? "去交通" : "回交通"
    }]
  }

  const generateReportHours=(items)=> {
    var tmpItems = items.filter(item => item.report_hours > 0);
    if (!tmpItems || tmpItems.length <= 0) {
      return [];
    }
    const total_report_hours = tmpItems.reduce((sum, item) => {
      return sum + (item.qty * item.report_hours);
    }, 0);

    return [{
      total_hours: total_report_hours,
      content: "报告时间"
    }]
  }

  const generateWaitHours=(totals)=> {
    if (totals.total_wait_hours && totals.total_wait_hours > 0) {
      return [{
        total_hours: totals.total_wait_hours,
        content: "等待时间"
      }]
    }
    return [];
  }

  const generateOtherHours=(totals, users)=> {
    if (totals.total_other_hours && totals.total_other_hours > 0) {
      var user_count = users.reduce((sum, item) => {
        return sum + item.user_count;
      }, 0);
      return [{
        total_hours: totals.total_other_hours,
        content: "其他时间"
      }]
    }
    return [];
  }

  const generateItemHours=(items)=> {
    var tmpItems = items.filter(item => item.service_hours > 0);
    if (!tmpItems || tmpItems.length <= 0) {
      return [];
    }
    const total_item_hours = tmpItems.reduce((sum, item) => {
      return sum + (item.qty * item.service_hours*item.discount);
    }, 0);

    return [{
      total_hours: total_item_hours,
      content: "服务时间"
    }]
  }

  // const generateSchedule=(idx, devices, engineers)=> {
  //   // 1. 计算基础总数据
  //   const totalServiceHours = devices.reduce((sum, d) => sum + (d.qty * d.service_hours), 0);
  //   const totalQty = devices.reduce((sum, d) => sum + d.qty, 0);
  //   const maxDays = Math.max(...engineers.map(e => e.days));

  //   // 2. 统计每日的人力资源（人天数）
  //   let dailyResources = [];
  //   let totalManDays = 0;
  //   for (let d = 1; d <= maxDays; d++) {
  //     let localCount = engineers.find(e => e.traffic_type === 'local' && d <= e.days)?.user_count || 0;
  //     let remoteCount = engineers.find(e => e.traffic_type === 'remote' && d <= e.days)?.user_count || 0;
  //     let totalCount = localCount + remoteCount;
  //     let trafficHours = (localCount * 3) + (remoteCount * 2);

  //     dailyResources.push({ day: d, user_count: totalCount, traffic_hours: trafficHours });
  //     totalManDays += totalCount;
  //   }

  //   // 3. 构建任务进度池（将所有设备按工时比例平铺）
  //   // 我们用一个数组记录每种设备类型占据的总工时区间
  //   let taskRanges = [];
  //   let currentMark = 0;
  //   devices.forEach(d => {
  //     let duration = d.qty * d.service_hours;
  //     taskRanges.push({
  //       name: d && d.rule && d.rule[2],
  //       start: currentMark,
  //       end: currentMark + duration
  //     });
  //     currentMark += duration;
  //   });

  //   // 4. 按人力权重分配每一天的工作
  //   let accumulatedHours = 0;

  //   return dailyResources.map(resource => {
  //     // 当天应分摊的总工时
  //     const dayWorkload = totalServiceHours * (resource.user_count / totalManDays);
  //     const startHour = accumulatedHours;
  //     const endHour = accumulatedHours + dayWorkload;

  //     // 当天维修的设备数量（小数）
  //     const dayQty = totalQty * (resource.user_count / totalManDays);

  //     // 找出当天落在了哪些任务区间内
  //     const activeTasks = taskRanges
  //       .filter(task => (startHour < task.end && endHour > task.start))
  //       .map(task => task.name);

  //     accumulatedHours = endHour;

  //     return {
  //       day: resource.day + idx,
  //       user_count: resource.user_count,
  //       total_hours: dayWorkload,
  //       traffic_hours: resource.traffic_hours,
  //       avg_service_hours: dayWorkload / resource.user_count,
  //       device_qty: dayQty, // 保留两位小数
  //       avg_take_hours: (totalServiceHours / totalQty).toFixed(2),
  //       content: activeTasks.join(" / ")
  //     };
  //   });
  // }

  return (
    <div>
      <Table
        key="tMain"
        columns={columns}
        dataSource={schedules}
        pagination={false}>
      </Table>
    </div>
  );
};

export default ExeassReportSchedules;