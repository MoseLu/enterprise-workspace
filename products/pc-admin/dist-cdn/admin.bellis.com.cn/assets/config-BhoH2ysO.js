import { s as service } from "./eps-B-NJyMre.js";
const getUserFormItems = (departmentOptions = []) => {
  const formItems = [
    {
      prop: "username",
      label: "用户名",
      span: 12,
      component: {
        name: "el-input",
        props: {
          readonly: true,
          placeholder: "系统自动生成"
        }
      }
    },
    {
      prop: "realName",
      label: "中文名",
      span: 12,
      component: {
        name: "el-input",
        props: {
          readonly: true,
          placeholder: "暂无数据"
        }
      }
    },
    {
      prop: "position",
      label: "职位",
      span: 12,
      component: {
        name: "el-input",
        props: {
          readonly: true,
          placeholder: "暂无数据"
        }
      }
    },
    {
      prop: "deptId",
      label: "部门",
      span: 12,
      required: true,
      component: {
        name: "btc-cascader",
        props: {
          placeholder: "请选择部门",
          options: departmentOptions,
          showCount: true,
          clearable: true,
          filterable: true
        }
      }
    },
    {
      prop: "status",
      label: "状态",
      span: 12,
      value: "ACTIVE",
      component: {
        name: "el-radio-group",
        options: [
          { label: "激活", value: "ACTIVE" },
          { label: "禁用", value: "INACTIVE" }
        ]
      }
    }
  ];
  return formItems;
};
const services = {
  sysdepartment: service.admin?.iam?.department,
  sysuser: service.admin?.iam?.user
};
export {
  getUserFormItems as g,
  services as s
};
