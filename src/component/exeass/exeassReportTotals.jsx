import React, { useMemo, useEffect, useState } from 'react';
import { Table } from 'antd';
import "./exeassReport.css"

const ExeassReportTotals = ({ totals,config }) => {
  const columns = [
    { title: "人员类型", dataIndex: "user_type", render: (value) => { return value === "region" ? "区域人员" : "TC成员" } },
    { title: "交通类型", dataIndex: "traffic_type", render: (value) => { return value === "local" ? "本地" : "异地" } },
    { title: "人员数量", dataIndex: "user_count" },
    { title: "天数", dataIndex: "days" },
    { title: "异地大交通时长", dataIndex: "remote_far_traffic_hours" },
    { title: "异地交通费", dataIndex: "remote_traffic_fee" },
    { title: "交通时长", dataIndex: "transport_hours" },
    { title: "差旅费用", dataIndex: "transport_fee" }
  ];

  return (
    <div className="stats-container">
      <div className="stats-grid">

        {/* 第一行：汇总数据 */}
        <div className="stat-item">
          <div className="stat-label">所有工时</div>
          <div className="stat-value text-blue text-large">{(totals.service_hours +
            totals.region_local_transport_hours +
            totals.region_remote_transport_hours +
            totals.tc_local_transport_hours +
            totals.tc_remote_transport_hours +
            totals.report_hours +
            totals.total_wait_hours + totals.total_other_hours).toFixed(1)}<span className="unit">h</span></div>
        </div>
        <div className="stat-item">
          <div className="stat-label">总服务时长</div>
          <div className="stat-value text-blue">{totals.service_hours}<span className="unit">h</span></div>
        </div>
        <div className="stat-item">
          <div className="stat-label">交通总用时</div>
          <div className="stat-value">{(totals.region_local_transport_hours + totals.region_remote_transport_hours + totals.tc_local_transport_hours + totals.tc_remote_transport_hours).toFixed(1)}<span className="unit">h</span></div>
        </div>
        <div className="stat-item">
          <div className="stat-label">等待总工时</div>
          <div className="stat-value">{totals.total_wait_hours.toFixed(1)}<span className="unit">h</span></div>
        </div>
        <div className="stat-item">
          <div className="stat-label">总报告时长</div>
          <div className="stat-value text-green">{totals.report_hours.toFixed(1)}<span className="unit">h</span></div>
        </div>
        <div className="stat-item">
          <div className="stat-label">总Others</div>
          <div className="stat-value">{totals.total_other_hours.toFixed(1)}<span className="unit">h</span></div>
        </div>
        <div className="stat-item">
          <div className="stat-label">差旅总费用</div>
          <div className="stat-value">{(totals.region_local_transport_fee + totals.region_remote_transport_fee + totals.tc_local_transport_fee + totals.tc_remote_transport_fee).toFixed(1)}<span className="unit">元</span></div>
        </div>

        {/* 分隔线占位（Grid 跨列） */}
        <div style={{ gridColumn: '1 / span 7', height: '1px', background: '#f0f0f0', margin: '4px 0' }}></div>

        {/* 第二行：区域成员数据 */}
        <div className="detail-row">
          <div className="stat-item"></div> {/* 第一列留空对齐 */}
          <div className="stat-item">
            <div className="stat-label">区域成员服务时长</div>
            <div className="stat-value">{(totals.service_hours - config.tc_service_hours).toFixed(1)}<span className="unit">h</span></div>
          </div>
          <div className="stat-item">
            <div className="stat-label">区域成员交通用时</div>
            <div className="stat-value">{(totals.region_local_transport_hours + totals.region_remote_transport_hours).toFixed(1)}<span className="unit">h</span></div>
          </div>
          <div className="stat-item">
            <div className="stat-label">区域成员等待用时</div>
            <div className="stat-value">{(totals.total_wait_hours - config.tc_wait_hours).toFixed(1)}<span className="unit">h</span></div>
          </div>
          <div className="stat-item" style={{ gridColumn: 'span 2' }}></div> {/* 跨过报告和Others列 */}
          <div className="stat-item">
            <div className="stat-label">区域成员差旅费用</div>
            <div className="stat-value">{(totals.region_local_transport_fee + totals.region_remote_transport_fee).toFixed(1)}<span className="unit">元</span></div>
          </div>
        </div>

        {/* 第三行：TC成员数据 */}
        <div className="detail-row">
          <div className="stat-item"></div>
          <div className="stat-item">
            <div className="stat-label">TC成员服务时长</div>
            <div className="stat-value">{config.tc_service_hours}<span className="unit">h</span></div>
          </div>
          <div className="stat-item">
            <div className="stat-label">TC成员交通用时</div>
            <div className="stat-value">{(totals.tc_local_transport_hours + totals.tc_remote_transport_hours).toFixed(1)}<span className="unit">h</span></div>
          </div>
          <div className="stat-item">
            <div className="stat-label">TC成员等待用时</div>
            <div className="stat-value">{config.tc_wait_hours}<span className="unit">h</span></div>
          </div>
          <div className="stat-item" style={{ gridColumn: 'span 2' }}></div>
          <div className="stat-item">
            <div className="stat-label">TC成员差旅费用</div>
            <div className="stat-value">{totals.tc_local_transport_fee + totals.tc_remote_transport_fee}<span className="unit">元</span></div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ExeassReportTotals;