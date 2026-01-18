import React, { useMemo, useEffect, useState } from 'react';
import { Modal, message, Tabs, Button } from 'antd';
import * as XLSX from 'xlsx';
import http from "../../util/http";
import "./exeassReport.css"
import ExeassReportUsers from './exeassReportUsers';
import ExeassReportTotals from './exeassReportTotals';
import ExeassReportItems from './exeassReportItems';
import ExeassReportSchedules from './exeassReportSchedules';



const ExeassReport = ({ open, type,id, name, initSchedules, items, users, totals, config, onCancel, onOk }) => {
  useEffect(() => {
    if (open) {
      console.log("the config is:", config);
      console.log("the items is:", items);
      console.log("the users is:", users);
    }

  }, [open])


  const [schedules, setSchedules] = useState(initSchedules);
  const acceptSchedules = (schedules) => {
    setSchedules(schedules);
  }
  const tabItems = [
    {
      key: '1',
      label: '执行计划',
      children: <ExeassReportSchedules open={open} initSchedules={initSchedules} items={items} users={users} totals={totals} config={config} acceptSchedules={acceptSchedules} />
    },
    {
      key: '2',
      label: '项目',
      children: <ExeassReportItems items={items} config={config} />,
    },
    {
      key: '3',
      label: '人员',
      children: <ExeassReportUsers users={users} config={config}/>,
    }, {
      key: '4',
      label: '统计信息',
      children: <ExeassReportTotals totals={totals} config={config} />,
    },
  ];


  const onHandleOk = () => {
    http.post("/api/assproject/save", {id:id, name: name, items: items, users: users, config: config, totals: totals, schedules: schedules }).then((result) => {
      if (result.code != 0) {
        message.error(result.message);
        return;
      }
      message.success("归档成功");
    });
  }

  const exportExcel = () => {
    try {
      const wb = XLSX.utils.book_new();

      // 1. 执行计划
      if (schedules && Array.isArray(schedules) && schedules.length > 0) {
        const sheetData = schedules.map(item => ({
          '服务内容': item.content,
          '人数': item.user_count,
          '单项时长': item.total_hours
        }));
        const ws = XLSX.utils.json_to_sheet(sheetData);
        XLSX.utils.book_append_sheet(wb, ws, '执行计划');
      }

      // 2. 项目
      if (items && Array.isArray(items) && items.length > 0) {
        const sheetData = items.map(item => ({
          '项目名称': item.rule && item.rule[2] ? item.rule[2] : '',
          '数量': item.qty,
          '折扣': item.discount,
          '单项服务时长': item.service_hours,
          '单项报告时长': item.report_hours,
          '总服务时长': item.total_service_hours,
          '总报告时长': item.total_report_hours
        }));
        const ws = XLSX.utils.json_to_sheet(sheetData);
        XLSX.utils.book_append_sheet(wb, ws, '项目');
      }

      // 3. 人员
      if (users && Array.isArray(users) && users.length > 0) {
        const sheetData = users.map(item => ({
          '人员类型': item.user_type === "region" ? "区域人员" : "TC成员",
          '交通类型': item.traffic_type === "local" ? "本地" : "异地",
          '人员数量': item.user_count,
          '天数': item.days,
          '异地大交通时长': item.remote_far_traffic_hours,
          '异地交通费': item.remote_traffic_fee,
          '交通时长': item.transport_hours,
          '差旅费用': item.transport_fee
        }));
        const ws = XLSX.utils.json_to_sheet(sheetData);
        XLSX.utils.book_append_sheet(wb, ws, '人员');
      }

      // 4. 统计信息
      if (totals && config) {
        const sheetData = [
          // 汇总数据
          { '统计项': '所有工时', '数值': ((totals.all_service_hours +
            totals.region_local_transport_hours +
            totals.region_remote_transport_hours +
            totals.tc_local_transport_hours +
            totals.tc_remote_transport_hours +
            totals.all_report_hours +
            totals.all_wait_hours + totals.all_other_hours).toFixed(1)) + 'h' },
          { '统计项': '总服务时长', '数值': totals.all_service_hours + 'h' },
          { '统计项': '交通总用时', '数值': ((totals.region_local_transport_hours + totals.region_remote_transport_hours + totals.tc_local_transport_hours + totals.tc_remote_transport_hours).toFixed(1)) + 'h' },
          { '统计项': '等待总工时', '数值': totals.all_wait_hours.toFixed(1) + 'h' },
          { '统计项': '总报告时长', '数值': totals.all_report_hours.toFixed(1) + 'h' },
          { '统计项': '总Others', '数值': totals.all_other_hours.toFixed(1) + 'h' },
          { '统计项': '差旅总费用', '数值': ((totals.region_local_transport_fee + totals.region_remote_transport_fee + totals.tc_local_transport_fee + totals.tc_remote_transport_fee).toFixed(1)) + '元' },
          {},
          // 区域成员数据
          { '统计项': '区域成员服务时长', '数值': ((totals.all_service_hours - (config.tc_service_hours || 0)).toFixed(1)) + 'h' },
          { '统计项': '区域成员交通用时', '数值': ((totals.region_local_transport_hours + totals.region_remote_transport_hours).toFixed(1)) + 'h' },
          { '统计项': '区域成员等待用时', '数值': ((totals.all_wait_hours - (config.tc_wait_hours || 0)).toFixed(1)) + 'h' },
          { '统计项': '区域成员差旅费用', '数值': ((totals.region_local_transport_fee + totals.region_remote_transport_fee).toFixed(1)) + '元' },
          {},
          // TC成员数据
          { '统计项': 'TC成员服务时长', '数值': (config.tc_service_hours || 0) + 'h' },
          { '统计项': 'TC成员交通用时', '数值': ((totals.tc_local_transport_hours + totals.tc_remote_transport_hours).toFixed(1)) + 'h' },
          { '统计项': 'TC成员等待用时', '数值': (config.tc_wait_hours || 0) + 'h' },
          { '统计项': 'TC成员差旅费用', '数值': ((totals.tc_local_transport_fee + totals.tc_remote_transport_fee).toFixed(1)) + '元' },
        ];
        const ws = XLSX.utils.json_to_sheet(sheetData);
        XLSX.utils.book_append_sheet(wb, ws, '统计信息');
      }

      const fileName = (name || 'report') + '.xlsx';
      XLSX.writeFile(wb, fileName);
      message.success('导出成功：' + fileName);
    } catch (err) {
      console.error(err);
      message.error('导出失败');
    }
  }


  return (
    <Modal width="80%" open={open} title={name}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          返回
        </Button>,
        type == 2 ?null: (<Button key="submit" type="primary" onClick={onHandleOk}>
          {type == 1 ? "归档" : "保存"}
        </Button>) ,
        <Button key="export" onClick={exportExcel}>
          导出
        </Button>,

      ]}
    >
      <div>
        <Tabs defaultActiveKey="1" items={tabItems} />
      </div>

    </Modal >
  );
};

export default ExeassReport;