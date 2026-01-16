import React, { useState, useEffect, useRef } from 'react'
import { Drawer, Button, message, Form, Space, InputNumber, Col, Typography, Anchor, Select } from 'antd';
import http from "../../util/http";
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
const { Text } = Typography;

const ExeassEdit = ({ open, onCancel, onOk }) => {
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm();
  const [rawData, setRawData] = useState([]);

  useEffect(() => {
    onFetchRules();
  }, [])

  const onFetchRules = () => {
    http.post("/api/assrule/query").then((result) => {
      if (result.code != 0) {
        message.error(result.message);
        return;
      }
      setRawData(result.data);
    });
  }

  const activityOptions = [...new Set(rawData.map(item => item.activity_code))].map(v => ({ label: v, value: v }));

  // 处理前两级下拉框变化时的联动逻辑
  const handleValuesChange = (index, fieldName) => {
    const items = form.getFieldValue('items');
    if (fieldName === 'activity_code') {
      items[index].family_note = undefined;
      items[index].detail = undefined;
      items[index].id = undefined;
      items[index].service_hours = 0;
      items[index].report_hours = 0;
    } else if (fieldName === 'family_note') {
      items[index].detail = undefined;
      items[index].id = undefined;
      items[index].service_hours = 0;
      items[index].report_hours = 0;
    }
    form.setFieldsValue({ items: [...items] });
  };

  // 第三级下拉框选中时，锁定 ID 和基准工时
  const handleDetailChange = (value, index) => {
    const currentActivity = form.getFieldValue(['items', index, 'activity_code']);
    const currentFamilyNote = form.getFieldValue(['items', index, 'family_note']);

    const target = rawData.find(item =>
      item.activity_code === currentActivity &&
      item.family_note === currentFamilyNote &&
      item.detail === value
    );

    if (target) {
      const items = form.getFieldValue('items');
      items[index].id = target.id;
      items[index].service_hours = target.service_hours;
      items[index].report_hours = target.report_hours;
      form.setFieldsValue({ items: [...items] });
    }
  };

  // 独立的行计算组件，解决“下坠”显示和“独立计算”问题
  const RowCalculator = ({ index }) => {
    return (
      <Form.Item
        noStyle
        shouldUpdate={(prev, cur) => prev.items?.[index] !== cur.items?.[index]}
      >
        {({ getFieldValue }) => {
          const row = getFieldValue(['items', index]) || {};
          const sH = row.service_hours || 0;
          const rH = row.report_hours || 0;
          const q = row.qty || 0;
          const d = row.discount || 0;

          return (
            <>
              <div style={{ whiteSpace: 'nowrap',marginTop:"-8px" }}>
                <Text type="secondary" style={{ fontSize: '12px' }}>服务时长: </Text>
                <Text strong style={{ color: '#1890ff' }}>{(sH * q * d).toFixed(2)}h</Text>
              </div>
              <div style={{ whiteSpace: 'nowrap' }}>
                <Text type="secondary" style={{ fontSize: '12px' }}>报告时长: </Text>
                <Text strong style={{ color: '#faad14' }}>{(rH * q * d).toFixed(2)}h</Text>
              </div>
            </>
          );
        }}
      </Form.Item>
    );
  };

  const onFinish = () => { }

  return (
    <>
      {contextHolder}
      <Drawer
        title="新建项目"
        size={1444}
        onClose={onCancel}
        open={open}
        styles={{ body: { padding: 0 } }}
        extra={
          <Space>
            <Button onClick={onCancel}>取消</Button>
            <Button onClick={onOk} type="primary">
              保存
            </Button>
          </Space>
        }
      >
        <div style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,      // 确保在最上层
          background: '#fff', // 必须有背景色，否则会透明
          padding: '0 24px',  // 补偿 Drawer 的左右间距
          borderBottom: '1px solid #f0f0f0' // 可选：增加一条分割线
        }}>
          <Anchor
            direction="horizontal"
            getContainer={() => document.querySelector('.ant-drawer-body')}
            items={[
              {
                key: 'activity',
                href: '#activity',
                title: '选择项目',
              },
              {
                key: 'user',
                href: '#user',
                title: '补充信息',
              },
              {
                key: 'report',
                href: '#report',
                title: '报告',
              },
            ]}
          />
        </div>

        <div style={{ padding: '5px' }}>
          <div id="activity">
            <Form
              form={form}
              name="dynamic_form_item"
              onFinish={onFinish}
              autoComplete="off"
              initialValues={{
                items: [{ activity_code: "", family_note: "", detail: "", qty: 1, discount: 1 }]
              }}
            >
              <Form.List name="items" initialValues={[{ qty: 1, discount: 1 }]}>
                {(fields, { add, remove }) => (
                  <>
                    {fields.map(({ key, name, ...restField }) => {
                      const currentActivity = form.getFieldValue(['items', name, 'activity_code']);
                      const currentFamilyNote = form.getFieldValue(['items', name, 'family_note']);

                      const familyNoteOptions = currentActivity
                        ? [...new Set(rawData.filter(i => i.activity_code === currentActivity).map(i => i.family_note))]
                          .map(v => ({ label: v, value: v }))
                        : [];

                      const detailOptions = (currentActivity && currentFamilyNote)
                        ? rawData.filter(i => i.activity_code === currentActivity && i.family_note === currentFamilyNote)
                          .map(i => ({ label: i.detail, value: i.detail }))
                        : [];

                      return (
                        <Space key={key} align="start" style={{ display: 'flex', marginBottom: 0,marginTop:15 }}>
                          <Form.Item {...restField} name={[name, 'id']} hidden><InputNumber /></Form.Item>
                          <Form.Item {...restField} name={[name, 'service_hours']} hidden><InputNumber /></Form.Item>
                          <Form.Item {...restField} name={[name, 'report_hours']} hidden><InputNumber /></Form.Item>
                          <Form.Item {...restField} name={[name, 'activity_code']} label="Activity" rules={[{ required: true }]}>
                            <Select
                              style={{ width: 100 }}
                              options={activityOptions}
                              onChange={() => handleValuesChange(name, 'activity_code')}
                            />
                          </Form.Item>

                          <Form.Item {...restField} name={[name, 'family_note']} label="Family Note">
                            <Select
                              style={{ width: 220 }}
                              disabled={!currentActivity}
                              options={familyNoteOptions}
                              onChange={() => handleValuesChange(name, 'family_note')}
                            />
                          </Form.Item>

                          <Form.Item {...restField} name={[name, 'detail']} label="Detail">
                            <Select
                              style={{ width: 320 }}
                              disabled={!currentFamilyNote}
                              options={detailOptions}
                              onChange={(val) => handleDetailChange(val, name)}
                            />
                          </Form.Item>

                          <Form.Item {...restField} name={[name, 'qty']} label="Qty">
                            <InputNumber min={1} style={{ width: 70 }} />
                          </Form.Item>

                          <Form.Item {...restField} name={[name, 'discount']} label="Discount">
                            <InputNumber min={0} step={0.1} style={{ width: 70 }} />
                          </Form.Item>
                          <RowCalculator index={name} />

                          {/* 删除按钮 */}
                          <Button
                            type="link"
                            danger
                            icon={<MinusCircleOutlined />}
                            onClick={() => remove(name)}
                          />
                        </Space>
                      );
                    })}

                    <Form.Item>
                      <Button
                        type="dashed"
                        onClick={() => add({ qty: 1, discount: 1, service_hours: 0, report_hours: 0 })}
                        block
                        icon={<PlusOutlined />}
                      >
                        添加新条目
                      </Button>
                    </Form.Item>
                  </>
                )}
              </Form.List>

              <Form.Item>
                <Button type="primary" htmlType="submit">
                  提交数据
                </Button>
              </Form.Item>
            </Form>
          </div>
          <div id="user" ></div>
          <div id="report"></div>
        </div>
      </Drawer>
    </>
  );
};

export default ExeassEdit;