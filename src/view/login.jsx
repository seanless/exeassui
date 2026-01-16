import React, { useState } from "react";
import { Form, Input, Button, Card, message } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import http from "../util/http";

const Login = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const res = await http.post("/api/auth/login", {
        username: values.username,
        password: values.password
      }, "apiHost", false);  // false 表示不自动处理登录跳转
      if (res.code === 0) {
        message.success("登录成功");
        var tmpData=res.data;
        console.log("the tmp is:",tmpData)
        // 保存 session_id 到 localStorage
        localStorage.setItem("authorization", tmpData.authorization);
        // 保存用户信息
        localStorage.setItem("user_name", tmpData.user_name);
        navigate("/exeassui/home/exeassindex");
      } else {
        message.error(res.msg || "登录失败");
      }
    } catch (error) {
      message.error("登录请求失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
      }}
    >
      <Card
        title="系统登录"
        style={{
          width: 400,
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)"
        }}
      >
        <Form
          name="login"
          onFinish={onFinish}
          autoComplete="off"
          size="large"
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: "请输入用户名" }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="用户名"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: "请输入密码" }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="密码"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
            >
              登录
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Login;
