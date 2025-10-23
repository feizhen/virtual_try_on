# API Contracts

**Feature**: 登录页面设计系统优化
**Date**: 2025-10-22

## Overview

此功能为纯CSS视觉样式优化，不涉及任何API端点变更、请求/响应格式修改或合约定义。

## Contracts

无新增或修改的API合约。

## Notes

登录页面使用的现有API端点（POST `/auth/login`）保持不变。所有请求和响应格式、状态码、错误处理均不受此CSS样式优化影响。

如需了解现有的API合约，请参考：
- `client/src/api/auth.ts` - 前端API客户端
- `server/src/modules/auth/` - 后端认证模块
