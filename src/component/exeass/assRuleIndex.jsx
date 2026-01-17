import React, { useState, useEffect } from 'react'
import { Upload, Button, message, Form, Table, Input } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from "react-router-dom";
import http from "../../util/http";
import "./exeassindex.css"
import { DateUtil } from '../../util/dateUtil';
const config = require('Config')

const AssRuleIndex = () => {
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm();
  const [costsheetInfo, setCostsheetInfo] = useState({})
  const [records, setRecords] = useState([])
  const [searchText, setSearchText] = useState('')

  const props = {
    name: 'file',
    action: config.apiHost + '/api/rule/upload',
    headers: {
    },
    onChange(info) {
      if (info.file.status !== 'uploading') {
        console.log(info.file, info.fileList);
      }
      if (info.file.status === 'done') {
        var result = info.file.response;
        if (result.code > 50) {
          messageApi.error(result.message);
          return;
        }
        setCostsheetInfo(info.file.response.data)
        setNeedInfos(info.file.response.data.need_infos)
        if (info.file.response.data.alert_messages && info.file.response.data.alert_messages.length > 0) {
          messageApi.error(info.file.response.data.alert_messages.join("\r\n"));
        } else {
          message.success(`${info.file.name} 文件读取成功`);
        }

      } else if (info.file.status === 'error') {
        message.error(`${info.file.name} 文件上传失败.`);
      }
    },
  };

  const columns = [
    { title: "id", dataIndex: "id" },
    { title: "Activity_Code", dataIndex: "activity_code" },
    { title: "FAMILY", dataIndex: "family" },
    { title: "Family 注释", dataIndex: "family_note" },
    { title: "需求描述", dataIndex: "detail" },
    { title: "Min. SR", dataIndex: "min_sr" },
    { title: "Service hours", dataIndex: "service_hours" },
    { title: "报告时间", dataIndex: "report_hours" },
    { title: "插入时间", dataIndex: "create_time", render: (value) => DateUtil.formatDateTime(value), }
  ];



  useEffect(() => {
    onQuery();
  }, []);

  const onQuery = () => {
    http.post("/api/assrule/query").then((result) => {
      if (result.code != 0) {
        message.error(result.message);
        return;
      }
      setRecords(result.data);
    });
  };

  const filteredRecords = records.filter((r) => {
    if (!searchText) return true;
    return r.detail && r.detail.toString().toLowerCase().includes(searchText.toLowerCase());
  });

  return (
    <div style={{ marginLeft: 20, marginRight: 20 }}>
      {contextHolder}
      <div className="pdf-header">
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 20px', // 上下为0，左右为20px
          width: '100%',
          paddingBottom: "20px"
        }}>
          <Form form={form} layout='inline' style={{ margin: 0 }}>
            <Form.Item style={{ marginBottom: 0 }}>
              <Input
                placeholder="搜索需求描述"
                allowClear
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={{ width: 300 }}
              />
            </Form.Item>
          </Form>

          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <Button onClick={() => { navigate("/exeassui/home/exeassindex") }}>返回项目</Button>
            <Upload {...props}>
              <Button icon={<UploadOutlined />}>初始化产线</Button>
            </Upload>
          </div>
        </div>
      </div>
      
      <div className='four-column-container'>
        <Table
          key="tMain"
          columns={columns}
          dataSource={filteredRecords}
          pagination={false}>
        </Table>
      </div>

    </div>
  );
};

export default AssRuleIndex;