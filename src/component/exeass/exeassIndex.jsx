import React, { useState, useEffect } from 'react'
import { Table, Button, message, Space, Popconfirm } from 'antd';
import { useNavigate, useLocation } from "react-router-dom";
import http from "../../util/http";
import ExeassEdit from './exeassEdit';
import ExeassReport from './exeassReport';
import "./exeassindex.css"
const config = require('Config')

const ExeassIndex = () => {
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();
  const [editOpen, setEditOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [records, setRecords] = useState([]);

  const [record, setRecord] = useState({});

  const columns = [
    { title: "名称", dataIndex: "name" },
    { title: "维护项目", dataIndex: "item_names" },
    { title: "总时长", dataIndex: "total_hours" },
    { title: "服务时长", dataIndex: "total_service_hours" },
    { title: "报告时长", dataIndex: "total_report_hours" },
    { title: "交通时长", dataIndex: "total_transport_hours", },
    { title: "等待时长", dataIndex: "total_wait_hours", },
    { title: "Other时长", dataIndex: "total_other_hours", },
    { title: "差旅费用", dataIndex: "total_transport_fee" },
    { title: "创建者", dataIndex: "creator_name" },
    { title: "创建时间", dataIndex: "create_time" },
    {
      title: "操作", key: "operation", render: (text, record) => {
        return (
          <div className="operation">
            <Space>
              <Button type="primary" size="small" onClick={() => { onDetail(record); }}>查看详情</Button>
              <Popconfirm title={"确定删除" + record.name} onConfirm={() => onDelete(record)}>
                <Button type="primary" danger size="small">删除</Button>
              </Popconfirm>
            </Space>
          </div>
        );
      },
    },

  ];


  useEffect(() => {
    onQuery();
  }, []);

  const onQuery = () => {
    http.post("/api/assproject/query").then((result) => {
      if (result.code != 0) {
        message.error(result.message);
        return;
      }
      setRecords(result.data);
    });
  };
  const onRule = () => {
    navigate("/exeassui/home/assruleindex");
  }

  const onEdit = () => {
    setEditOpen(true);
  }

  const onDetail = (pRecord) => {
    setRecord(pRecord);
    setReportOpen(true);
  }

  const onDelete = (pRecord) => {
    http.post("/api/assproject/delete/" + pRecord.id).then((result) => {
      if (result.code != 0) {
        message.error(result.message);
        return;
      }
      onQuery();
    });
  }



  return (
    <div style={{ marginLeft: 20, marginRight: 20 }}>
      {contextHolder}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        padding: '0 20px', // 上下为0，左右为20px
        width: '100%',
        paddingBottom:"20px"
      }}>
        <Button type='primary' onClick={onEdit}>新建项目</Button>
        <Button style={{marginRight:"20px"}} onClick={onRule}>规则设置</Button>
      </div>
      <div style={{ width: "100%" }}>
        <Table
          key="tMain"
          columns={columns}
          dataSource={records}
          pagination={false}>
        </Table>
      </div>
      <ExeassEdit open={editOpen} onCancel={() => setEditOpen(false)} onOk={() => setEditOpen(false)} />
      <ExeassReport type={2}
        open={reportOpen}
        onCancel={() => setReportOpen(false)}
        onOk={() => setReportOpen(false)}
        name={record.name}
        items={record.items}
        users={record.users}
        totals={record.totals}
        config={record.config}
        initSchedules={record.schedules}
      />
    </div>
  );
};

export default ExeassIndex;