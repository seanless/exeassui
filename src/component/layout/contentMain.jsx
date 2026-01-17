import React from 'react'
import { Route, Routes } from 'react-router-dom'
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import zhCN from 'antd/locale/zh_CN';
import { ConfigProvider } from 'antd';
import AsyncComponent from '../../util/asyncComponent';
const ExeassIndex = AsyncComponent(() => import(/* webpackChunkName: "exeassIndex" */ '../exeass/exeassIndex'));
const AssRuleIndex = AsyncComponent(() => import(/* webpackChunkName: "assRuleIndex" */ '../exeass/assRuleIndex'));
const UserManage = AsyncComponent(() => import(/* webpackChunkName: "userManage" */ '../exeass/userManage'));

dayjs.locale('zh-cn');
const ContentMain = () => {
	return (
		<ConfigProvider locale={zhCN}>
			<Routes>
				<Route path={'/exeassindex'} exact={true} element={<ExeassIndex />} />
				<Route path={'/usermanage'} exact={true} element={<UserManage />} />
				<Route path={'/assruleindex'} exact={true} element={<AssRuleIndex />} />
			</Routes>
		</ConfigProvider>
	)
}

export default ContentMain