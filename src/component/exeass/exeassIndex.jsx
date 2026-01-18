import React, { useState, useEffect } from 'react'
import { Table, Button, message, Space, Popconfirm,Form ,Input } from 'antd';
import { useNavigate } from "react-router-dom";
import http from "../../util/http";
import ExeassEdit from './exeassEdit';
import ExeassReport from './exeassReport';
import "./exeassindex.css"
const config = require('Config')

const ExeassIndex = () => {
  const navigate = useNavigate();
  const [formRef] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const [editOpen, setEditOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [records, setRecords] = useState([]);
  const [type, setType] = useState(1);  //1，新增  ，3：编辑

  const [record, setRecord] = useState({});

  const columns = [
    { title: "名称", dataIndex: "name" },
    { title: "维护项目", dataIndex: "item_names" },
    { title: "总时长", dataIndex: "all_hours" },
    { title: "服务时长", dataIndex: "all_service_hours" },
    { title: "报告时长", dataIndex: "all_report_hours" },
    { title: "交通时长", dataIndex: "all_transport_hours", },
    { title: "等待时长", dataIndex: "all_wait_hours", },
    { title: "Other时长", dataIndex: "all_other_hours", },
    { title: "差旅费用", dataIndex: "all_transport_fee" },
    { title: "创建者", dataIndex: "creator_name" },
    { title: "创建时间", dataIndex: "create_time" },
    {
      title: "操作", key: "operation", render: (text, record) => {
        return (
          <div className="operation">
            <Space>
              <Button type="primary" size="small" onClick={() => { onDetail(record); }}>查看详情</Button>
              <Button type="primary" size="small" onClick={() => { onEdit(record,3); }}>编辑</Button>
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
    http.post("/api/assproject/query",formRef.getFieldsValue()).then((result) => {
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

  const onUserManage = () => {
    navigate("/exeassui/home/usermanage");
  }

  const onEdit = (pRecord,pType) => {
    setType(pType);
    setRecord(pRecord);
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
        paddingBottom: "20px"
      }}>
        <div className="divSerarch">
          <Form layout="inline" form={formRef} onFinish={() => { onQuery(1) }}>
            <Form.Item name="key" label="项目名称">
              <Input placeholder="项目名称" />
            </Form.Item>

            <Form.Item>
              <Button type="primary" onClick={() => { onQuery(1) }}>
                搜索
              </Button>
            </Form.Item>
            <Form.Item>
              <Button type='primary' onClick={()=>{onEdit(null,1)}}>新建项目</Button>
            </Form.Item>
          </Form>
        </div>

        <div style={{ marginRight: "20px" }}>
          <Button style={{ marginRight: 20 }} onClick={onUserManage}>用户管理</Button>
          <Button onClick={onRule}>规则设置</Button>
        </div>

      </div>
      <div style={{ width: "100%" }}>
        <Table
          key="tMain"
          columns={columns}
          dataSource={records}
          pagination={false}>
        </Table>
      </div>
      <ExeassEdit open={editOpen} type={type} record={record} onCancel={() => setEditOpen(false)} onOk={() => setEditOpen(false)} />
      <ExeassReport type={2}
        open={reportOpen}
        record={record}
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