import React, { useMemo, useEffect, useState } from 'react';
import { Table } from 'antd';
import "./exeassReport.css"

const ExeassReportItems = ({ items }) => {
  const columns = [
    { title: "项目名称", dataIndex: "rule", render: (value) => { return value ? value[2] : "" } },
    { title: "数量", dataIndex: "qty" },
    { title: "折扣", dataIndex: "discount" },
    { title: "单项服务时长", dataIndex: "service_hours" },
    { title: "单项报告时长", dataIndex: "report_hours" },
    { title: "总服务时长", dataIndex: "total_service_hours" },
    { title: "总报告时长", dataIndex: "total_report_hours" }
  ];

  return (
    <div style={{ width: "100%" }}>
      <Table
        key="tMain"
        columns={columns}
        dataSource={items}
        pagination={false}>
      </Table>
    </div>

  );
};

export default ExeassReportItems;