import React, { useMemo, useEffect, useState } from 'react';
import { Modal, message, Tabs, Button } from 'antd';
import http from "../../util/http";
import "./exeassReport.css"
import ExeassReportUsers from './exeassReportUsers';
import ExeassReportTotals from './exeassReportTotals';
import ExeassReportItems from './exeassReportItems';
import ExeassReportSchedules from './exeassReportSchedules';



const ExeassReport = ({ open, type, name, initSchedules, items, users, totals, config, onCancel, onOk }) => {
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
    http.post("/api/assproject/save", { name: name, items: items, users: users, config: config, totals: totals, schedules: schedules }).then((result) => {
      if (result.code != 0) {
        message.error(result.message);
        return;
      }
      message.success("归档成功");
    });
  }


  return (
    <Modal width="80%" open={open} title={name}
      onCancel={onCancel}
      footer={[
        <Button key="back" onClick={onCancel}>
          返回
        </Button>,
        type == 1 ? (<Button key="submit" type="primary" onClick={onHandleOk}>
          归档
        </Button>) : null

      ]}
    >
      <div>
        <Tabs defaultActiveKey="1" items={tabItems} />
      </div>

    </Modal >
  );
};

export default ExeassReport;