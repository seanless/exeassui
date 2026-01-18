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
      children: <ExeassReportUsers users={users} />,
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

      // 执行计划 (schedules state)
      if (schedules && Array.isArray(schedules) && schedules.length > 0) {
        const ws = XLSX.utils.json_to_sheet(schedules);
        XLSX.utils.book_append_sheet(wb, ws, '执行计划');
      }

      // 项目 (items prop)
      if (items && Array.isArray(items) && items.length > 0) {
        const ws = XLSX.utils.json_to_sheet(items);
        XLSX.utils.book_append_sheet(wb, ws, '项目');
      }

      // 人员 (users prop)
      if (users && Array.isArray(users) && users.length > 0) {
        const ws = XLSX.utils.json_to_sheet(users);
        XLSX.utils.book_append_sheet(wb, ws, '人员');
      }

      // 统计信息 (totals prop) - could be object or array
      if (totals) {
        if (Array.isArray(totals)) {
          const ws = XLSX.utils.json_to_sheet(totals);
          XLSX.utils.book_append_sheet(wb, ws, '统计信息');
        } else if (typeof totals === 'object') {
          const arr = Object.keys(totals).map((k) => ({ key: k, value: totals[k] }));
          const ws = XLSX.utils.json_to_sheet(arr);
          XLSX.utils.book_append_sheet(wb, ws, '统计信息');
        }
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