import React, { useState, useEffect } from 'react';
import { Table, Button, message, Space, Popconfirm, Modal, Form, Input, Select, InputNumber } from 'antd';
import { useNavigate } from "react-router-dom";
import http from "../../util/http";

const { Option } = Select;

const UserManage = () => {
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();
  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [passwordUserId, setPasswordUserId] = useState(null);
  const [records, setRecords] = useState([]);
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();

  const userTypes = [
    { label: '普通用户', value: 1 },
    { label: '管理员', value: 2 },
  ];

  const userStates = [
    { label: '正常', value: 0 },
    { label: '禁用', value: 1 },
  ];

  const columns = [
    { title: "ID", dataIndex: "id", width: 80 },
    { title: "用户名", dataIndex: "user_name" },
    {
      title: "用户类型",
      dataIndex: "user_type",
      render: (user_type) => {
        return user_type === 2 ? '管理员' : '普通用户';
      }
    },
    {
      title: "状态",
      dataIndex: "state",
      render: (state) => {
        return state === 0 ? '正常' : '禁用';
      }
    },
    { title: "创建时间", dataIndex: "create_time" },
    {
      title: "操作",
      key: "operation",
      width: 280,
      render: (text, record) => {
        return (
          <div className="operation">
            <Space>
              <Button type="primary" size="small" onClick={() => onEdit(record)}>编辑</Button>
              <Popconfirm title="确定重置此用户的密码?" onConfirm={() => onResetPassword(record)}>
                <Button type="primary" size="small">重置密码</Button>
              </Popconfirm>
              <Popconfirm title="确定删除该用户?" onConfirm={() => onDelete(record)}>
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
    http.post("/api/user/list", { page: 1, limit: 100 }).then((result) => {
      if (result.code != 0) {
        message.error(result.message);
        return;
      }
      setRecords(result.data);
    });
  };

  const onAdd = () => {
    setEditMode(false);
    setCurrentUser(null);
    form.resetFields();
    setModalOpen(true);
  };

  const onEdit = (record) => {
    setEditMode(true);
    setCurrentUser(record);
    form.setFieldsValue({
      id: record.id,
      username: record.username,
      user_type: record.user_type,
      state: record.state,
    });
    setModalOpen(true);
  };

  const onDelete = (record) => {
    http.post(`/api/user/delete/${record.id}`).then((result) => {
      if (result.code != 0) {
        message.error(result.message);
        return;
      }
      message.success('删除成功');
      onQuery();
    });
  };

  const onResetPassword = (record) => {
    http.post("/api/user/resetpassword/" + record.id).then((result) => {
      if (result.code != 0) {
        message.error(result.message);
        return;
      }
      message.success('更新成功');
    });
  };

  const onModalOk = () => {
    form.validateFields().then((values) => {
      if (editMode) {
        // 编辑用户
        http.post("/api/user/update", {
          id: values.id,
          user_name: values.user_name,
          user_type: values.user_type
        }).then((result) => {
          if (result.code != 0) {
            message.error(result.message);
            return;
          }
          message.success('更新成功');
          setModalOpen(false);
          onQuery();
        });
      } else {
        // 新增用户
        http.post("/api/user/create", {
          user_name: values.user_name,
          user_type: values.user_type,
        }).then((result) => {
          if (result.code != 0) {
            message.error(result.message);
            return;
          }
          message.success('创建成功');
          setModalOpen(false);
          onQuery();
        });
      }
    });
  };

  const onPasswordModalOk = () => {
    passwordForm.validateFields().then((values) => {
      http.post("/api/user/reset-password", {
        user_id: passwordUserId,
        new_password: values.new_password,
      }).then((result) => {
        if (result.code != 0) {
          message.error(result.message);
          return;
        }
        message.success('密码重置成功');
        setPasswordModalOpen(false);
      });
    });
  };

  const onBack = () => {
    navigate("/exeassui/home/exeassindex");
  };

  return (
    <div style={{ marginLeft: 20, marginRight: 20 }}>
      {contextHolder}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        padding: '0 20px',
        width: '100%',
        paddingBottom: "20px"
      }}>
        <Button type='primary' onClick={onAdd}>新增</Button>
        <Button onClick={onBack}>返回主页</Button>
      </div>

      <div style={{ width: "100%" }}>
        <Table
          key="tUser"
          columns={columns}
          dataSource={records}
          pagination={false}
          rowKey="id"
        />
      </div>

      {/* 新增/编辑用户 Modal */}
      <Modal
        title={editMode ? "编辑用户" : "新增用户"}
        open={modalOpen}
        onOk={onModalOk}
        onCancel={() => setModalOpen(false)}
        okText="确认"
        cancelText="取消"
      >
        <Form form={form} layout="vertical">
          <Form.Item name="id" hidden>
            <InputNumber />
          </Form.Item>
          <Form.Item
            name="user_name"
            label="用户名"
            rules={[
              { required: true, message: '请输入用户名' },
              { min: 3, message: '用户名至少3个字符' },
              { max: 20, message: '用户名最多20个字符' }
            ]}
          >
            <Input placeholder="请输入用户名" />
          </Form.Item>
          <Form.Item
            name="user_type"
            label="用户类型"
            initialValue={1}
            rules={[{ required: true, message: '请选择用户类型' }]}
          >
            <Select placeholder="请选择用户类型">
              {userTypes.map(type => (
                <Option key={type.value} value={type.value}>{type.label}</Option>
              ))}
            </Select>
          </Form.Item>

        </Form>
      </Modal>
    </div>
  );
};

export default UserManage;
