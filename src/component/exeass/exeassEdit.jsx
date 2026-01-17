import React, { useMemo, useEffect, useState } from 'react';
import { Form, InputNumber, Cascader, Button, Space, Input, Select, Card, Row, Col, Typography, message, Drawer, Modal } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import http from "../../util/http";
import ExeassReport from './exeassReport';
const { Text } = Typography;
import "./exeassEdit.css"

const ExeassEdit = ({ open, onCancel, onOk }) => {
  const [form] = Form.useForm();
  const [rawDataSource, setRawDataSource] = useState([]);
  const items = Form.useWatch('items', form) || [];

  const tc_service_hours = Form.useWatch('tc_service_hours', form);
  const other_hours = Form.useWatch('other_hours', form) || 0;
  const tc_wait_hours = Form.useWatch("tc_wait_hours", form);

  const local_traffic_hours = Form.useWatch('local_traffic_hours', form);
  const remote_close_traffic_hours = Form.useWatch('remote_close_traffic_hours', form);
  const local_sr_price = Form.useWatch('local_sr_price', form);
  const remote_sr_price = Form.useWatch('remote_sr_price', form);
  const name = Form.useWatch('name', form);

  const users = Form.useWatch('users', form) || [];

  const [reportOpen, setReportOpen] = useState(false);
  const [customModalOpen, setCustomModalOpen] = useState(false);
  const [customForm] = Form.useForm();

  const user_metric_default = {
    region_local_user_count: 0,
    region_remote_user_count: 0,
    region_local_days: 0,
    region_remote_days: 0,

    region_local_transport_hours: 0,
    region_remote_transport_hours: 0,
    region_local_transport_fee: 0,
    region_remote_transport_fee: 0,

    tc_local_user_count: 0,
    tc_remote_user_count: 0,
    tc_local_days: 0,
    tc_remote_days: 0,

    tc_local_transport_hours: 0,
    tc_remote_transport_hours: 0,
    tc_local_transport_fee: 0,
    tc_remote_transport_fee: 0
  }

  useEffect(() => {
    onFetchRules();
  }, [])

  const onFetchRules = () => {
    http.post("/api/assrule/query").then((result) => {
      if (result.code != 0) {
        message.error(result.message);
        return;
      }
      setRawDataSource(result.data);
    });
  }

  const treeData = useMemo(() => {
    const tree = [];
    rawDataSource.forEach(item => {
      let level1 = tree.find(n => n.value === item.activity_code);
      if (!level1) {
        level1 = { label: item.activity_code, value: item.activity_code, children: [] };
        tree.push(level1);
      }
      let level2 = level1.children.find(n => n.value === item.family_note);
      if (!level2) {
        level2 = { label: item.family_note, value: item.family_note, children: [] };
        level1.children.push(level2);
      }
      level2.children.push({ label: item.detail, value: item.detail });
    });
    return tree;
  }, [rawDataSource]);

  const calcRuleHours = (record) => {
    if (!record?.rule || !record?.qty) return { service_hours: 0, report_hours: 0 };
    const detailValue = record.rule[record.rule.length - 1];
    const target = rawDataSource.find(i => i.detail === detailValue);
    if (!target) return { service_hours: 0, report_hours: 0 };
    const factor = record.qty * (record.discount ?? 1);
    return { service_hours: target.service_hours * factor, report_hours: target.report_hours * factor };
  };

  const calcUserMetrics = (record) => {
    const { user_count = 0, days = 0, traffic_type, user_type, remote_traffic_fee = 0, remote_far_traffic_hours = 8 } = record || {};
    if (!user_type || !traffic_type || user_count < 1 || days < 1) {
      return user_metric_default;
    }

    var values = structuredClone(user_metric_default)

    if (user_type === 'region') {
      if (traffic_type === 'local') {
        values.region_local_days = days;
        values.region_local_user_count = user_count;
        values.region_local_transport_hours = user_count * days * local_traffic_hours;
        values.region_local_transport_fee = user_count * days * local_sr_price;
      } else if (traffic_type === 'remote') {
        values.region_remote_days = days;
        values.region_remote_user_count = user_count;
        values.region_remote_transport_hours = (user_count * days * remote_close_traffic_hours) + (user_count * 2 * remote_far_traffic_hours);
        values.region_remote_transport_fee = user_count * (days + 1) * remote_sr_price + user_count * 2 * remote_traffic_fee;
      }
    } else if (user_type === 'tc') {
      if (traffic_type === 'local') {
        values.tc_local_days = days;
        values.tc_local_user_count = user_count;
        values.tc_local_transport_hours = user_count * days * local_traffic_hours;
        values.tc_local_transport_fee = user_count * days * local_sr_price;
      } else if (traffic_type === 'remote') {
        values.tc_remote_days = days;
        values.tc_remote_user_count = user_count;
        values.tc_remote_transport_hours = (user_count * days * remote_close_traffic_hours) + (user_count * 2 * remote_far_traffic_hours);
        values.tc_remote_transport_fee = user_count * (days + 1) * remote_sr_price + user_count * 2 * remote_traffic_fee;
      }
    }


    return values;
  };

  const totals = useMemo(() => {
    const ruleTotals = items.reduce((acc, cur) => {
      const { service_hours, report_hours } = calcRuleHours(cur);
      return { service_hours: acc.service_hours + service_hours, report_hours: acc.report_hours + report_hours };
    }, { service_hours: 0, report_hours: 0 });

    const userTotals = users.reduce((acc, cur) => {
      const userMetrics = calcUserMetrics(cur);
      acc.region_local_user_count += userMetrics.region_local_user_count;
      acc.region_remote_user_count += userMetrics.region_remote_user_count;
      acc.tc_local_user_count += userMetrics.tc_local_user_count;
      acc.tc_remote_user_count += userMetrics.tc_remote_user_count;

      acc.region_local_days += userMetrics.region_local_days;
      acc.region_remote_days += userMetrics.region_remote_days;
      acc.tc_local_days += userMetrics.tc_local_days;
      acc.tc_remote_days += userMetrics.tc_remote_days;

      acc.region_local_transport_hours += userMetrics.region_local_transport_hours;
      acc.region_remote_transport_hours += userMetrics.region_remote_transport_hours;
      acc.tc_local_transport_hours += userMetrics.tc_local_transport_hours;
      acc.tc_remote_transport_hours += userMetrics.tc_remote_transport_hours;

      acc.region_local_transport_fee += userMetrics.region_local_transport_fee;
      acc.region_remote_transport_fee += userMetrics.region_remote_transport_fee;
      acc.tc_local_transport_fee += userMetrics.tc_local_transport_fee;
      acc.tc_remote_transport_fee += userMetrics.tc_remote_transport_fee;
      return acc;
    }, structuredClone(user_metric_default));


    let total_other_hours = other_hours * (userTotals.region_local_user_count + userTotals.region_remote_user_count + userTotals.tc_local_user_count + userTotals.tc_remote_user_count);
    return {
      ...ruleTotals,
      ...userTotals,
      total_other_hours: total_other_hours,
      total_wait_hours: (ruleTotals.service_hours + userTotals.region_local_transport_hours + userTotals.region_remote_transport_hours + userTotals.tc_local_transport_hours + userTotals.tc_remote_transport_hours + ruleTotals.report_hours + total_other_hours) / 19
    };
  }, [items, users, rawDataSource, other_hours]);

  const onReport = () => {
    setReportOpen(true);
  }

  const onCustomModalOpen = () => {
    customForm.resetFields();
    setCustomModalOpen(true);
  }

  const onCustomModalOk = () => {
    customForm.validateFields().then((values) => {
      const currentItems = form.getFieldValue('items') || [];
      const newItem = {
        qty: values.qty || 1,
        discount: values.discount || 1,
        service_hours: values.service_hours || 0,
        report_hours: values.report_hours || 0,
        rule: [
          values.activity_code,
          values.family_note,
          values.detail,
        ]
      };
      form.setFieldsValue({ items: [...currentItems, newItem] });
      setCustomModalOpen(false);
      let tmpRules = [...rawDataSource, {
        activity_code: values.activity_code,
        family_note: values.family_note,
        detail: values.detail,
        service_hours: values.service_hours || 0,
        report_hours: values.report_hours || 0,
      }]
      setRawDataSource(tmpRules);
      message.success('已添加自定义条目');
    }).catch((err) => {
      console.error('Validation failed:', err);
    });
  }

  return (
    <Drawer open={open} onClose={onCancel} size={1224} title="新建项目">
      <Form form={form} layout="vertical"
        onValuesChange={(changedValues, allValues) => {
          if (changedValues.items) {
            const newItems = [...allValues.items];
            let needsUpdate = false;
            newItems.forEach((item, index) => {
              if (!item) {
                return;
              }

              if (!item.rule) {
                return;
              }
              const detailValue = item.rule[item.rule.length - 1];
              const target = rawDataSource.find(i => i.detail === detailValue);
              if (item.service_hours !== target.service_hours || item.report_hours !== target.report_hours) {
                newItems[index] = {
                  ...item,
                  service_hours: target.service_hours,
                  report_hours: target.report_hours
                };
                needsUpdate = true;
              }
            });

            if (needsUpdate) {
              form.setFieldsValue({ items: newItems });
            }
          }

          if (changedValues.users) {
            const newUsers = [...allValues.users];
            let needsUpdate = false;
            newUsers.forEach((user, index) => {
              if (!user) {
                return;
              }

              const userMetrics = calcUserMetrics(user);
              if (userMetrics.user_type !== user.user_type
                || user.traffic_type !== userMetrics.traffic_type
                || user.user_count !== userMetrics.user_count
                || user.days !== userMetrics.days
                || user.remote_far_traffic_hours !== userMetrics.remote_far_traffic_hours) {
                newUsers[index] = {
                  ...user,
                  transport_hours: (userMetrics.region_local_transport_hours + userMetrics.region_remote_transport_hours + userMetrics.tc_local_transport_hours + userMetrics.tc_remote_transport_hours).toFixed(2),
                  transport_fee: (userMetrics.region_local_transport_fee + userMetrics.region_remote_transport_fee + userMetrics.tc_local_transport_fee + userMetrics.tc_remote_transport_fee).toFixed(2)
                };
                needsUpdate = true;
              }
            });

            if (needsUpdate) {
              form.setFieldsValue({ users: newUsers });
            }
          }
        }}
      >
        <Form.Item label="项目名称" rules={[{ required: true }]}>
          <Space.Compact style={{ width: '100%' }}>
            <Form.Item name="name" noStyle rules={[{ required: true }]}>
              <Input placeholder="请输入项目名称" style={{ width: 'calc(100% - 100px)' }} />
            </Form.Item>
            <Button type="primary" onClick={onCustomModalOpen}>自定义</Button>
          </Space.Compact>
        </Form.Item>
        <Form.List name="items" initialValue={[{}]}>
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, ...restField }) => {
                const item = items?.[name];
                const rowHours = calcRuleHours(item);

                return (
                  <div key={key} style={{ background: '#f9f9f9', padding: 5, borderRadius: 8 }}>
                    <Space align="start" size="large" wrap>
                        <Form.Item
                          {...restField}
                          label="服务规则 (activity/family/detail)"
                          name={[name, 'rule']}
                          rules={[{ required: true, message: '必选' }]}
                        >
                          <Cascader options={treeData}
                            style={{ width: 600 }}
                            dropdownClassName="custom-cascader-dropdown"
                            placeholder="请选择规则" />
                        </Form.Item>
                      {/* )} */}

                      <Form.Item {...restField} label="数量" name={[name, 'qty']} rules={[{ required: true }]} initialValue={1}>
                        <InputNumber min={1} placeholder="Qty" />
                      </Form.Item>

                      <Form.Item {...restField} label="折扣" name={[name, 'discount']} initialValue={1}>
                        <InputNumber min={0} max={1} step={0.1} placeholder="Discount" />
                      </Form.Item>
                      <span style={{ display: 'none' }}>
                        <Form.Item name={[name, 'service_hours']} hidden><InputNumber /></Form.Item>
                        <Form.Item name={[name, 'report_hours']} hidden><InputNumber /></Form.Item>
                      </span>

                      <div style={{ paddingTop: 30 }}>
                        <Space size="middle">
                          <Text type="secondary">服务时长: <b style={{ color: '#1890ff' }}>{rowHours.service_hours.toFixed(2)}</b></Text>
                          <Text type="secondary">报告时长: <b style={{ color: '#52c41a' }}>{rowHours.report_hours.toFixed(2)}</b></Text>
                          <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => remove(name)}
                          />
                        </Space>
                      </div>
                    </Space>
                  </div>
                );
              })}
              <Button type="dashed" onClick={() => add({ qty: 1, discount: 1 })} block icon={<PlusOutlined />}>
                添加条目
              </Button>
            </>
          )}
        </Form.List>

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
                <div className="stat-value">{(totals.service_hours - tc_service_hours).toFixed(1)}<span className="unit">h</span></div>
              </div>
              <div className="stat-item">
                <div className="stat-label">区域成员交通用时</div>
                <div className="stat-value">{(totals.region_local_transport_hours + totals.region_remote_transport_hours).toFixed(1)}<span className="unit">h</span></div>
              </div>
              <div className="stat-item">
                <div className="stat-label">区域成员等待用时</div>
                <div className="stat-value">{(totals.total_wait_hours - tc_wait_hours).toFixed(1)}<span className="unit">h</span></div>
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
                <div className="stat-value">{tc_service_hours}<span className="unit">h</span></div>
              </div>
              <div className="stat-item">
                <div className="stat-label">TC成员交通用时</div>
                <div className="stat-value">{(totals.tc_local_transport_hours + totals.tc_remote_transport_hours).toFixed(1)}<span className="unit">h</span></div>
              </div>
              <div className="stat-item">
                <div className="stat-label">TC成员等待用时</div>
                <div className="stat-value">{tc_wait_hours}<span className="unit">h</span></div>
              </div>
              <div className="stat-item" style={{ gridColumn: 'span 2' }}></div>
              <div className="stat-item">
                <div className="stat-label">TC成员差旅费用</div>
                <div className="stat-value">{totals.tc_local_transport_fee + totals.tc_remote_transport_fee}<span className="unit">元</span></div>
              </div>
            </div>

          </div>
        </div>

        <div class="plan-container">
          <div class="panel left-panel">
            <div class="panel-title">时长设置</div>
            <div class="form-row three-cols">
              <div class="form-item">
                <Form.Item label="TC成员服务时长" name="tc_service_hours" initialValue={0}>
                  <InputNumber min={0} max={10000000} step={0.1} placeholder="TC成员服务时长" />
                </Form.Item></div>
              <div class="form-item">
                <Form.Item label="TC成员等待时长" name="tc_wait_hours" initialValue={0}>
                  <InputNumber min={0} max={10000000} step={0.1} placeholder="TC成员等待时长" />
                </Form.Item></div>
              <div class="form-item">
                <Form.Item label="others(手续培训）" name="other_hours" initialValue={0}>
                  <InputNumber min={0} max={10000000} step={0.1} placeholder="others(入场手续培训等）" />
                </Form.Item></div>
            </div>
          </div>

          <div class="panel right-panel">
            <div class="panel-title">benchmark</div>
            <div class="form-row four-cols">
              <div class="form-item">
                <Form.Item label="同城交通时长" name="local_traffic_hours" initialValue={3}>
                  <InputNumber min={0} max={10000000} step={0.1} placeholder="同城交通时长" />
                </Form.Item></div>
              <div class="form-item">
                <Form.Item label="异地小交通时长" name="remote_close_traffic_hours" initialValue={2}>
                  <InputNumber min={0} max={10000000} step={0.1} placeholder="异地小交通时长" />
                </Form.Item></div>
              <div class="form-item">
                <Form.Item label="同城SR差旅" name="local_sr_price" initialValue={450}>
                  <InputNumber min={0} max={10000000} step={0.1} placeholder="同城SR差旅" />
                </Form.Item></div>
              <div class="form-item">
                <Form.Item label="异地SR差旅" name="remote_sr_price" initialValue={800}>
                  <InputNumber min={0} max={10000000} step={0.1} placeholder="异地SR差旅" />
                </Form.Item></div>
            </div>
          </div>
        </div>

        <Card style={{ marginTop: 10, background: '#f0f7ff', borderRadius: 8 }}>
          <Form.List name="users" initialValue={[{}]}>
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => {
                  const userMetrics = calcUserMetrics(users[name]);
                  return (
                    <Space key={key} align="start" style={{ display: 'flex', marginBottom: 8, borderBottom: '1px solid #eee', paddingBottom: 8 }}>
                      <Form.Item {...restField} name={[name, 'user_type']} label="人员类型" initialValue="region" rules={[{ required: true, message: '必填' }]}>
                        <Select style={{ width: 120 }} >
                          <Option value="region">区域成员</Option>
                          <Option value="tc">TC成员</Option>
                        </Select>
                      </Form.Item>
                      <Form.Item {...restField} name={[name, 'traffic_type']} label="交通类型" initialValue="local" rules={[{ required: true }]}>
                        <Select style={{ width: 100 }} >
                          <Option value="local">本地</Option>
                          <Option value="remote">异地</Option>
                        </Select>
                      </Form.Item>
                      <Form.Item {...restField} name={[name, 'user_count']} label="人员数量" initialValue={1} rules={[{ required: true, type: 'integer' }]}>
                        <InputNumber min={1} precision={0} />
                      </Form.Item>
                      <Form.Item {...restField} name={[name, 'days']} label="天数" initialValue={1} rules={[{ required: true, type: 'integer' }]}>
                        <InputNumber min={1} precision={0} />
                      </Form.Item>
                      <Form.Item label="异地大交通时长" name={[name, 'remote_far_traffic_hours']} initialValue={8}>
                        <Select style={{ width: 100 }} >
                          <Option value={4}>4</Option>
                          <Option value={5}>5</Option>
                          <Option value={6}>6</Option>
                          <Option value={7}>7</Option>
                          <Option value={8}>8</Option>
                        </Select>
                      </Form.Item>
                      <Form.Item {...restField} name={[name, 'remote_traffic_fee']} label="异地交通费" initialValue={0} rules={[{ required: true, type: 'integer' }]}>
                        <InputNumber min={0} precision={0} />
                      </Form.Item>
                      <span style={{ display: 'none' }}>
                        <Form.Item name={[name, 'transport_hours']} hidden><InputNumber /></Form.Item>
                        <Form.Item name={[name, 'transport_fee']} hidden><InputNumber /></Form.Item>
                      </span>
                      <div style={{ marginTop: 32, minWidth: 280 }}>
                        <Space size="middle">
                          <Text type="secondary">交通用时: <b style={{ color: '#fa8c16' }}>{(userMetrics.region_local_transport_hours + userMetrics.region_remote_transport_hours + userMetrics.tc_local_transport_hours + userMetrics.tc_remote_transport_hours).toFixed(1)}h</b></Text>
                          <Text type="secondary">差旅费用: <b style={{ color: '#eb2f96' }}>¥{(userMetrics.region_local_transport_fee + userMetrics.region_remote_transport_fee + userMetrics.tc_local_transport_fee + userMetrics.tc_remote_transport_fee).toFixed(1)}</b></Text>
                        </Space>
                      </div>
                      <Button type="text" danger icon={<DeleteOutlined />} onClick={() => remove(name)} style={{ marginTop: 30 }} />
                    </Space>
                  );
                })}
                <Button type="dashed" onClick={() => add({ user_type: 'region', traffic_type: 'local', user_count: 1, days: 1, remote_far_traffic_hours: 8 })} block icon={<PlusOutlined />}>添加人员条目</Button>
              </>
            )}
          </Form.List>
        </Card>


        <Form.Item style={{ marginTop: 24 }}>
          <Button type="primary" size="large" onClick={onReport}>生成报告</Button>
        </Form.Item>
      </Form>
      <ExeassReport
        type={1}
        open={reportOpen}
        name={name}
        items={items}
        users={users}
        totals={totals}
        config={{ local_traffic_hours: local_traffic_hours, remote_close_traffic_hours: remote_close_traffic_hours, local_sr_price: local_sr_price, remote_sr_price: remote_sr_price }}
        onCancel={() => { setReportOpen(false) }}
        onOk={() => { setReportOpen(false) }} />

      {/* 自定义条目 Modal */}
      <Modal
        title="添加自定义条目"
        open={customModalOpen}
        onOk={onCustomModalOk}
        onCancel={() => setCustomModalOpen(false)}
        okText="确认"
        cancelText="取消"
      >
        <Form form={customForm} layout="vertical">
          <Form.Item name="activity_code" label="Activity Code" rules={[{ required: true, message: '请输入 Activity Code' }]}>
            <Input placeholder="请输入 Activity Code" />
          </Form.Item>
          <Form.Item name="family_note" label="Family Note" rules={[{ required: true, message: '请输入 Family Note' }]}>
            <Input placeholder="请输入 Family Note" />
          </Form.Item>
          <Form.Item name="detail" label="Detail" rules={[{ required: true, message: '请输入 Detail' }]}>
            <Input placeholder="请输入 Detail" />
          </Form.Item>
          <Form.Item name="service_hours" label="Service Hours" rules={[{ required: true, message: '请输入 Service Hours' }]}>
            <InputNumber min={0} step={0.1} placeholder="服务时长" style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="report_hours" label="Report Hours" rules={[{ required: true, message: '请输入 Report Hours' }]}>
            <InputNumber min={0} step={0.1} placeholder="报告时长" style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="qty" label="数量" initialValue={1} rules={[{ required: true }]}>
            <InputNumber min={1} placeholder="数量" style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="discount" label="折扣" initialValue={1}>
            <InputNumber min={0} max={1} step={0.1} placeholder="折扣" style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </Drawer>
  );
};

export default ExeassEdit;