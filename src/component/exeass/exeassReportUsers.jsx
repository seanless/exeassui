import React, { useMemo, useEffect, useState } from 'react';
import { Table } from 'antd';
import "./exeassReport.css"

const ExeassReportUsers = ({ users,config }) => {
  const columns = [
    { title: "人员类型", dataIndex: "user_type", render: (value) => { return value === "region" ? "区域人员" : "TC成员" } },
    { title: "交通类型", dataIndex: "traffic_type", render: (value) => { return value === "local" ? "本地" : "异地" } },
    { title: "人员数量", dataIndex: "user_count" },
    { title: "天数", dataIndex: "days" },
    { title: "单程交通时长", dataIndex: "remote_far_traffic_hours" },
    { title: "单程大交通费", dataIndex: "remote_traffic_fee" },
    { title: "本地交通时长", dataIndex: "total_transport_hours",render:(value,record)=>{return record.user_count*record.days*(record.traffic_type=="local"?config.local_traffic_hours:config.remote_close_traffic_hours)} },
    { title: "异地交通时长", dataIndex: "total_transport_hours",render:(value,record)=>{return record.traffic_type=="local"?0:record.user_count*2*record.remote_far_traffic_hours} },
    { title: "交通总时长", dataIndex: "total_transport_hours" },
    { title: "差旅费用", dataIndex: "total_transport_fee" }
  ];

  return (
    <div style={{ width: "100%" }}>
      <Table
        key="tMain"
        columns={columns}
        dataSource={users}
        pagination={false}>
      </Table>
    </div>
  );
};

export default ExeassReportUsers;