import { s as appStorage, _ as __vitePreload } from "./auth-api-CvJd6wHo.js";
import { i as ref, B as BtcMessage, j as computed, aQ as useSmsCode, aV as onBeforeUnmount, aW as h, aX as markRaw, E as ElButton, aY as useBtcForm, b as defineComponent, n as createElementBlock, o as openBlock, q as createBaseVNode, w as toDisplayString, f as createBlock, N as createCommentVNode, P as ElIcon, x as withCtx, t as createVNode, g as unref, aZ as edit_default, y as createTextVNode, a_ as copy_document_default, z as _export_sfc, a$ as BtcAvatar, b0 as ElCol, b1 as ElRow, b2 as BtcBindingDialog, b3 as BtcIdentityVerify, K as onMounted, G as withDirectives, Y as vLoading, b4 as ElTooltip, b5 as view_default, b6 as hide_default, b7 as ElSwitch, b8 as __unplugin_components_3, b9 as _sfc_main$4 } from "./vendor-tN3qNEcA.js";
import "./menu-registry-BOrHQOwD.js";
import { s as service } from "./eps-service-BXEAd5O1.js";
import { B as BtcSmsCodeInput } from "./index-g-SNKt8W.js";
import { u as useMessage } from "./use-message-Dt-sXeNq.js";
import "./echarts-vendor-B3YNM73f.js";
function useProfile() {
  const userInfo = ref({});
  const loading = ref(false);
  const showFullInfo = ref(false);
  const loadUserInfo = async (showFull = false) => {
    const cachedAvatar = appStorage.user.getAvatar();
    const cachedName = appStorage.user.getName();
    if (cachedAvatar || cachedName) {
      userInfo.value = {
        ...userInfo.value,
        ...cachedAvatar && { avatar: cachedAvatar },
        ...cachedName && { name: cachedName }
      };
    }
    const user = appStorage.user.get();
    if (!user) {
      BtcMessage.warning("请先登录");
      return;
    }
    loading.value = true;
    try {
      const profileService = service.admin?.base?.profile;
      if (!profileService?.info) {
        console.error("profileService 不存在，可用服务:", service.admin?.base);
        BtcMessage.warning("用户信息服务不可用");
        return;
      }
      const data = await profileService.info(showFull ? { showFull: true } : void 0);
      userInfo.value = data || {};
      if (data?.avatar) {
        appStorage.user.setAvatar(data.avatar);
      }
      if (data?.name) {
        appStorage.user.setName(data.name);
      }
      window.dispatchEvent(new CustomEvent("userInfoUpdated", {
        detail: {
          avatar: data?.avatar,
          name: data?.name
        }
      }));
    } catch (error) {
      console.error("加载用户信息失败:", error);
      BtcMessage.error(error?.message || "加载用户信息失败");
    } finally {
      loading.value = false;
    }
  };
  const handleToggleShowFull = () => {
    showFullInfo.value = !showFullInfo.value;
    loadUserInfo(showFullInfo.value);
  };
  return {
    userInfo,
    loading,
    showFullInfo,
    loadUserInfo,
    handleToggleShowFull
  };
}
function useFormItems() {
  const formItems = computed(() => [
    {
      prop: "avatar",
      label: "头像",
      span: 24,
      component: {
        name: "btc-upload",
        props: {
          type: "image",
          uploadType: "avatar",
          text: "选择头像",
          size: [100, 100],
          limitSize: 5
        }
      }
    },
    {
      prop: "realName",
      label: "姓名",
      span: 12,
      required: true,
      component: {
        name: "el-input",
        props: {
          placeholder: "请输入姓名"
        }
      }
    },
    {
      prop: "name",
      label: "英文名",
      span: 12,
      required: true,
      component: {
        name: "el-input",
        props: {
          placeholder: "请输入英文名"
        }
      }
    },
    {
      prop: "employeeId",
      label: "工号",
      span: 12,
      component: {
        name: "el-input",
        props: {
          placeholder: "工号",
          disabled: true
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
          placeholder: "请输入职位"
        }
      }
    },
    {
      prop: "email",
      label: "邮箱",
      span: 12,
      component: {
        name: "el-input",
        props: {
          placeholder: "请输入邮箱"
        }
      },
      rules: [
        { type: "email", message: "请输入正确的邮箱地址", trigger: ["blur", "change"] }
      ]
    },
    {
      prop: "phone",
      label: "手机号",
      span: 12,
      component: {
        name: "el-input",
        props: {
          placeholder: "请输入手机号"
        }
      },
      rules: [
        { pattern: /^1[3-9]\d{9}$/, message: "请输入正确的手机号", trigger: "blur" }
      ]
    },
    {
      prop: "initPass",
      label: "密码",
      span: 12,
      component: {
        name: "el-input",
        props: {
          type: "password",
          placeholder: "请输入密码",
          showPassword: true
        }
      },
      rules: [
        { min: 6, message: "密码长度至少6位", trigger: "blur" }
      ]
    }
  ]);
  return {
    formItems
  };
}
function usePhoneVerification() {
  const sendSmsCode = async (data) => {
    const phoneService = service.admin?.base?.phone;
    if (!phoneService?.bind) {
      throw new Error("手机号服务不可用");
    }
    await phoneService.bind({
      phone: data.phone,
      smsType: data.smsType || "bind"
    });
  };
  const phoneUpdateSmsCodeState = useSmsCode({
    sendSmsCode,
    countdown: 60,
    minInterval: 60,
    onSuccess: () => {
      BtcMessage.success("验证码已发送");
    },
    onError: (error) => {
      BtcMessage.error(error.message || "发送验证码失败");
    }
  });
  return {
    phoneUpdateSmsCodeState
  };
}
function useEmailVerification() {
  const emailUpdateCountdown = ref(0);
  const emailUpdateSending = ref(false);
  let emailUpdateTimer = null;
  const clearEmailUpdateTimer = () => {
    if (emailUpdateTimer) {
      clearInterval(emailUpdateTimer);
      emailUpdateTimer = null;
    }
  };
  const resetEmailUpdateCountdown = () => {
    clearEmailUpdateTimer();
    emailUpdateCountdown.value = 0;
    emailUpdateSending.value = false;
  };
  const sendUpdateEmailCode = async (email) => {
    if (emailUpdateCountdown.value > 0 || emailUpdateSending.value) {
      return;
    }
    if (!email || !/^[\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)+$/.test(email)) {
      BtcMessage.warning("请输入正确的邮箱地址");
      return;
    }
    const emailService = service.admin?.base?.email;
    if (!emailService?.bind) {
      BtcMessage.warning("邮箱服务不可用");
      return;
    }
    emailUpdateSending.value = true;
    try {
      await emailService.bind({
        email,
        type: "bind"
      });
      BtcMessage.success("验证码已发送");
      emailUpdateCountdown.value = 60;
      clearEmailUpdateTimer();
      emailUpdateTimer = setInterval(() => {
        emailUpdateCountdown.value--;
        if (emailUpdateCountdown.value <= 0) {
          resetEmailUpdateCountdown();
        }
      }, 1e3);
    } catch (error) {
      BtcMessage.error(error?.message || "发送验证码失败");
    } finally {
      emailUpdateSending.value = false;
    }
  };
  onBeforeUnmount(() => {
    resetEmailUpdateCountdown();
  });
  return {
    emailUpdateCountdown,
    emailUpdateSending,
    sendUpdateEmailCode,
    resetEmailUpdateCountdown
  };
}
function useFormEditor({
  Form,
  formItems,
  userInfo,
  showFullInfo,
  loadUserInfo,
  resetEmailUpdateCountdown
}) {
  const openEditForm = () => {
    resetEmailUpdateCountdown();
    Form.value?.open({
      title: "编辑个人信息",
      width: "800px",
      form: {
        id: userInfo.value.id || "",
        realName: userInfo.value.realName || "",
        name: userInfo.value.name || "",
        employeeId: userInfo.value.employeeId || "",
        position: userInfo.value.position || "",
        email: userInfo.value.email || "",
        phone: userInfo.value.phone || "",
        avatar: userInfo.value.avatar || "",
        initPass: ""
      },
      items: formItems.value,
      props: {
        labelWidth: "100px",
        labelPosition: "top"
      },
      op: {
        buttons: ["save", "close"]
      },
      on: {
        submit: async (data, { close, done }) => {
          try {
            const profileService = service.admin?.base?.profile;
            if (!profileService) {
              BtcMessage.warning("用户信息服务不可用");
              done();
              return;
            }
            const updateData = { ...data };
            if (updateData.phone !== void 0) {
              const originalPhone = userInfo.value.phone;
              const hasOriginalPhone = originalPhone && originalPhone !== "-" && originalPhone.trim() !== "";
              const newPhone = updateData.phone || "";
              if (hasOriginalPhone && newPhone.trim() === "") {
                BtcMessage.warning("手机号不能为空，只能换绑，不能删除");
                done();
                return;
              }
              if (newPhone !== originalPhone && newPhone.trim() !== "") {
                const phoneService = service.admin?.base?.phone;
                if (!phoneService?.update) {
                  BtcMessage.warning("手机号服务不可用");
                  done();
                  return;
                }
                await phoneService.update({
                  phone: newPhone,
                  ...updateData.smsCode ? { smsCode: updateData.smsCode } : {},
                  smsType: "bind"
                });
              }
              delete updateData.phone;
              if (updateData.smsCode) {
                delete updateData.smsCode;
              }
            }
            if (updateData.email !== void 0) {
              const originalEmail = userInfo.value.email;
              const hasOriginalEmail = originalEmail && originalEmail !== "-" && originalEmail.trim() !== "";
              const newEmail = updateData.email || "";
              if (hasOriginalEmail && newEmail.trim() === "") {
                BtcMessage.warning("邮箱不能为空，只能换绑，不能删除");
                done();
                return;
              }
              if (newEmail !== originalEmail && newEmail.trim() !== "") {
                const emailService = service.admin?.base?.email;
                if (!emailService?.update) {
                  BtcMessage.warning("邮箱服务不可用");
                  done();
                  return;
                }
                await emailService.update({
                  email: newEmail,
                  ...updateData.emailCode ? { code: updateData.emailCode } : {},
                  scene: "bind",
                  type: "bind"
                });
              }
              delete updateData.email;
              if (updateData.emailCode) {
                delete updateData.emailCode;
              }
            }
            if (updateData.initPass && updateData.initPass.trim() !== "") {
              await profileService.password({
                initPass: updateData.initPass
              });
              delete updateData.initPass;
              if (updateData.confirmPassword) {
                delete updateData.confirmPassword;
              }
            }
            if (Object.keys(updateData).length > 1 || Object.keys(updateData).length === 1 && !updateData.id) {
              await profileService.update(updateData);
            }
            if (data.avatar) {
              appStorage.user.setAvatar(data.avatar);
            }
            if (data.name) {
              appStorage.user.setName(data.name);
            }
            const { useUser } = await __vitePreload(async () => {
              const { useUser: useUser2 } = await import("https://all.bellis.com.cn/system-app/assets/useUser-DIG-AInn.js");
              return { useUser: useUser2 };
            }, true ? [] : void 0);
            const { getUserInfo, setUserInfo } = useUser();
            const currentUser = getUserInfo();
            if (currentUser) {
              setUserInfo({
                ...currentUser,
                ...data.avatar && { avatar: data.avatar },
                ...data.name && { name: data.name },
                ...data.position && { position: data.position }
              });
            }
            window.dispatchEvent(new CustomEvent("userInfoUpdated", {
              detail: {
                avatar: data.avatar || userInfo.value.avatar,
                name: data.name || userInfo.value.name
              }
            }));
            BtcMessage.success("保存成功");
            close();
            resetEmailUpdateCountdown();
            await loadUserInfo(showFullInfo.value);
          } catch (error) {
            console.error("保存用户信息失败:", error);
            BtcMessage.error(error?.message || "保存失败");
            done();
          }
        }
      }
    });
  };
  const handleEdit = async () => {
    openEditForm();
  };
  return {
    handleEdit
  };
}
const singleFieldConfig = {
  realName: {
    prop: "realName",
    label: "姓名",
    span: 24,
    required: true,
    component: {
      name: "el-input",
      props: {
        placeholder: "请输入姓名"
      }
    }
  },
  name: {
    prop: "name",
    label: "英文名",
    span: 24,
    required: true,
    component: {
      name: "el-input",
      props: {
        placeholder: "请输入英文名"
      }
    }
  },
  position: {
    prop: "position",
    label: "职位",
    span: 24,
    component: {
      name: "el-input",
      props: {
        placeholder: "请输入职位"
      }
    }
  }
};
function createEmailItems({
  sendUpdateEmailCode,
  emailUpdateCountdown,
  emailUpdateSending
}) {
  return [
    {
      prop: "email",
      label: "新邮箱",
      span: 24,
      required: true,
      component: {
        name: "el-input",
        props: {
          placeholder: "请输入新邮箱"
        },
        slots: {
          suffix: ({ scope }) => h(ElButton, {
            link: true,
            size: "small",
            disabled: emailUpdateCountdown.value > 0 || emailUpdateSending.value || !scope.email,
            loading: emailUpdateSending.value,
            onClick: async () => {
              await sendUpdateEmailCode(scope.email);
            }
          }, () => emailUpdateCountdown.value > 0 ? `${emailUpdateCountdown.value}s` : "获取验证码")
        }
      },
      rules: [
        { type: "email", message: "请输入正确的邮箱地址", trigger: ["blur", "change"] }
      ]
    },
    {
      prop: "emailCode",
      label: "验证码",
      span: 24,
      required: true,
      component: {
        vm: markRaw(BtcSmsCodeInput),
        props: {}
      },
      rules: [
        { required: true, message: "请输入验证码", trigger: "blur" },
        { len: 6, message: "验证码长度为6位", trigger: "blur" }
      ]
    }
  ];
}
function createPhoneItems({ phoneUpdateSmsCodeState }) {
  return [
    {
      prop: "phone",
      label: "新手机号",
      span: 24,
      required: true,
      component: {
        name: "el-input",
        props: {
          placeholder: "请输入新手机号"
        },
        slots: {
          suffix: ({ scope }) => h(ElButton, {
            link: true,
            size: "small",
            disabled: !phoneUpdateSmsCodeState.canSend.value || !scope.phone,
            loading: phoneUpdateSmsCodeState.sending.value,
            onClick: async () => {
              if (!scope.phone || !/^1[3-9]\d{9}$/.test(scope.phone)) {
                BtcMessage.warning("请输入正确的手机号");
                return;
              }
              await phoneUpdateSmsCodeState.send(scope.phone, "bind");
            }
          }, () => phoneUpdateSmsCodeState.countdown.value > 0 ? `${phoneUpdateSmsCodeState.countdown.value}s` : "获取验证码")
        }
      },
      rules: [
        { pattern: /^1[3-9]\d{9}$/, message: "请输入正确的手机号", trigger: "blur" }
      ]
    },
    {
      prop: "smsCode",
      label: "验证码",
      span: 24,
      required: true,
      component: {
        vm: markRaw(BtcSmsCodeInput),
        props: {}
      },
      rules: [
        { required: true, message: "请输入验证码", trigger: "blur" },
        { len: 6, message: "验证码长度为6位", trigger: "blur" }
      ]
    }
  ];
}
const passwordItems = [
  {
    prop: "initPass",
    label: "新密码",
    span: 24,
    required: true,
    component: {
      name: "el-input",
      props: {
        type: "password",
        placeholder: "请输入新密码",
        showPassword: true
      }
    },
    rules: [
      { required: true, message: "请输入新密码", trigger: "blur" },
      { min: 6, message: "密码长度至少6位", trigger: "blur" }
    ]
  },
  {
    prop: "confirmPassword",
    label: "确认密码",
    span: 24,
    required: true,
    component: {
      name: "el-input",
      props: {
        type: "password",
        placeholder: "请再次输入新密码",
        showPassword: true
      }
    },
    rules: [
      { required: true, message: "请确认密码", trigger: "blur" },
      {
        validator: (_rule, _value, callback) => {
          callback();
        },
        trigger: "blur"
      }
    ]
  }
];
function resolveFieldConfig(field, context) {
  if (singleFieldConfig[field]) {
    return {
      label: singleFieldConfig[field].label,
      items: [singleFieldConfig[field]]
    };
  }
  if (field === "email") {
    return {
      label: "邮箱",
      items: createEmailItems(context)
    };
  }
  if (field === "phone") {
    return {
      label: "手机号",
      items: createPhoneItems(context)
    };
  }
  if (field === "initPass") {
    return {
      label: "密码",
      items: passwordItems
    };
  }
  return null;
}
function createFieldFormData(field, userInfo, resetEmailUpdateCountdown) {
  const baseData = {
    id: userInfo.value.id || ""
  };
  if (field === "phone") {
    return {
      ...baseData,
      phone: "",
      smsCode: ""
    };
  }
  if (field === "email") {
    resetEmailUpdateCountdown();
    return {
      ...baseData,
      email: "",
      emailCode: ""
    };
  }
  if (field === "initPass") {
    return {
      ...baseData,
      initPass: "",
      confirmPassword: ""
    };
  }
  return {
    ...baseData,
    [field]: userInfo.value[field] || ""
  };
}
function getProfileService() {
  return service.admin?.base?.profile;
}
async function submitPhone(data, context) {
  const originalPhone = context.userInfo.value.phone;
  const hasOriginalPhone = originalPhone && originalPhone !== "-" && originalPhone.trim() !== "";
  const newPhone = data.phone || "";
  if (!newPhone || newPhone.trim() === "") {
    BtcMessage.warning("手机号不能为空");
    return { success: false };
  }
  if (hasOriginalPhone && newPhone.trim() === "") {
    BtcMessage.warning("手机号不能为空，只能换绑，不能删除");
    return { success: false };
  }
  if (!data.smsCode || data.smsCode.length !== 6) {
    BtcMessage.warning("请输入6位验证码");
    return { success: false };
  }
  const phoneService = service.admin?.base?.phone;
  if (!phoneService?.update) {
    BtcMessage.warning("手机号服务不可用");
    return { success: false };
  }
  await phoneService.update({
    phone: data.phone,
    smsCode: data.smsCode,
    smsType: "bind"
  });
  return { success: true, message: "保存成功" };
}
async function submitEmail(data, context) {
  const originalEmail = context.userInfo.value.email;
  const hasOriginalEmail = originalEmail && originalEmail !== "-" && originalEmail.trim() !== "";
  const newEmail = data.email || "";
  if (!newEmail || newEmail.trim() === "") {
    BtcMessage.warning("邮箱不能为空");
    return { success: false };
  }
  if (hasOriginalEmail && newEmail.trim() === "") {
    BtcMessage.warning("邮箱不能为空，只能换绑，不能删除");
    return { success: false };
  }
  if (!data.emailCode || data.emailCode.length !== 6) {
    BtcMessage.warning("请输入6位验证码");
    return { success: false };
  }
  const emailService = service.admin?.base?.email;
  if (!emailService?.update) {
    BtcMessage.warning("邮箱服务不可用");
    return { success: false };
  }
  await emailService.update({
    email: data.email,
    code: data.emailCode,
    scene: "bind",
    type: "bind"
  });
  return { success: true, message: "保存成功" };
}
async function submitPassword(data) {
  if (!data.initPass || data.initPass.trim() === "") {
    BtcMessage.warning("密码不能为空");
    return { success: false };
  }
  if (data.initPass !== data.confirmPassword) {
    BtcMessage.warning("两次输入的密码不一致");
    return { success: false };
  }
  const profileService = getProfileService();
  if (!profileService?.password) {
    BtcMessage.warning("用户信息服务不可用");
    return { success: false };
  }
  const response = await profileService.password({
    initPass: data.initPass
  });
  const message = response?.msg || "密码已更新，请重新登录";
  return { success: true, message };
}
async function submitGeneric(field, data, context) {
  const profileService = getProfileService();
  if (!profileService?.update) {
    BtcMessage.warning("用户信息服务不可用");
    return { success: false };
  }
  const updatePayload = {
    id: context.userInfo.value.id
  };
  updatePayload[field] = data[field];
  await profileService.update(updatePayload);
  if (field === "name" && data.name) {
    appStorage.user.setName(data.name);
    const { useUser } = await __vitePreload(async () => {
      const { useUser: useUser2 } = await import("https://all.bellis.com.cn/system-app/assets/useUser-DIG-AInn.js");
      return { useUser: useUser2 };
    }, true ? [] : void 0);
    const { getUserInfo, setUserInfo } = useUser();
    const currentUser = getUserInfo();
    if (currentUser) {
      setUserInfo({
        ...currentUser,
        name: data.name
      });
    }
    window.dispatchEvent(new CustomEvent("userInfoUpdated", {
      detail: {
        name: data.name,
        avatar: context.userInfo.value.avatar
      }
    }));
  }
  return { success: true, message: "保存成功" };
}
async function submitFieldUpdate(field, data, context) {
  const profileService = getProfileService();
  if (!profileService) {
    BtcMessage.warning("用户信息服务不可用");
    return { success: false };
  }
  if (field === "phone") {
    return submitPhone(data, context);
  }
  if (field === "email") {
    return submitEmail(data, context);
  }
  if (field === "initPass") {
    return submitPassword(data);
  }
  return submitGeneric(field, data, context);
}
function useFieldEditor({
  Form,
  userInfo,
  showFullInfo,
  loadUserInfo,
  phoneUpdateSmsCodeState,
  sendUpdateEmailCode,
  emailUpdateCountdown,
  emailUpdateSending,
  resetEmailUpdateCountdown,
  onRequestVerify,
  onSetVerifyCallback
}) {
  const openFieldEditForm = (field) => {
    const config = resolveFieldConfig(field, {
      phoneUpdateSmsCodeState,
      sendUpdateEmailCode,
      emailUpdateCountdown,
      emailUpdateSending
    });
    if (!config) {
      BtcMessage.warning("该字段不支持编辑");
      return;
    }
    const formData = createFieldFormData(field, userInfo, resetEmailUpdateCountdown);
    Form.value?.open({
      title: `编辑${config.label}`,
      width: "500px",
      form: formData,
      items: config.items,
      props: {
        labelWidth: "100px",
        labelPosition: "top"
      },
      op: {
        buttons: ["save", "close"]
      },
      on: {
        submit: async (data, { close, done }) => {
          try {
            const result = await submitFieldUpdate(field, data, { userInfo });
            if (!result.success) {
              done();
              return;
            }
            BtcMessage.success(result.message || "保存成功");
            close();
            resetEmailUpdateCountdown();
            await loadUserInfo(showFullInfo.value);
          } catch (error) {
            console.error("保存用户信息失败:", error);
            BtcMessage.error(error?.message || "保存失败");
            done();
          }
        }
      }
    });
  };
  const handleEditField = async (field) => {
    if (field === "phone" || field === "email") {
      const currentValue = userInfo.value[field];
      const isEmpty = !currentValue || currentValue === "-" || currentValue.trim() === "";
      if (isEmpty) {
        return;
      }
    }
    const fieldsRequiringVerify = ["phone", "email", "initPass"];
    if (fieldsRequiringVerify.includes(field) && onRequestVerify && onSetVerifyCallback) {
      onSetVerifyCallback(() => {
        openFieldEditForm(field);
      });
      onRequestVerify(field);
      return;
    }
    openFieldEditForm(field);
  };
  const handleBindField = (_field) => {
  };
  return {
    handleEditField,
    handleBindField
  };
}
function useAvatarEditor({
  Form,
  userInfo,
  showFullInfo,
  loadUserInfo
}) {
  const openAvatarEditForm = () => {
    Form.value?.open({
      title: "编辑头像",
      width: "500px",
      form: {
        id: userInfo.value.id || "",
        avatar: userInfo.value.avatar || ""
      },
      items: [
        {
          prop: "avatar",
          label: "头像",
          span: 24,
          component: {
            name: "btc-upload",
            props: {
              type: "image",
              uploadType: "avatar",
              text: "选择头像",
              size: [100, 100],
              limitSize: 5
            }
          }
        }
      ],
      props: {
        labelWidth: "100px",
        labelPosition: "top"
      },
      op: {
        buttons: ["save", "close"]
      },
      on: {
        submit: async (data, { close, done }) => {
          try {
            const profileService = service.admin?.base?.profile;
            if (!profileService) {
              BtcMessage.warning("用户信息服务不可用");
              done();
              return;
            }
            await profileService.update({
              id: userInfo.value.id,
              avatar: data.avatar
            });
            BtcMessage.success("保存成功");
            close();
            await loadUserInfo(showFullInfo.value);
          } catch (error) {
            console.error("保存用户信息失败:", error);
            BtcMessage.error(error?.message || "保存失败");
            done();
          }
        }
      }
    });
  };
  const handleEditAvatar = async () => {
    openAvatarEditForm();
  };
  return {
    handleEditAvatar
  };
}
function useProfileForm(userInfo, showFullInfo, loadUserInfo, onRequestVerify, onSetVerifyCallback) {
  const { Form } = useBtcForm();
  const { formItems } = useFormItems();
  const { phoneUpdateSmsCodeState } = usePhoneVerification();
  const {
    emailUpdateCountdown,
    emailUpdateSending,
    sendUpdateEmailCode,
    resetEmailUpdateCountdown
  } = useEmailVerification();
  const { handleEdit } = useFormEditor({
    Form,
    formItems,
    userInfo,
    showFullInfo,
    loadUserInfo,
    resetEmailUpdateCountdown
  });
  const { handleEditField, handleBindField } = useFieldEditor({
    Form,
    userInfo,
    showFullInfo,
    loadUserInfo,
    phoneUpdateSmsCodeState,
    sendUpdateEmailCode,
    emailUpdateCountdown,
    emailUpdateSending,
    resetEmailUpdateCountdown,
    ...onRequestVerify !== void 0 && { onRequestVerify },
    ...onSetVerifyCallback !== void 0 && { onSetVerifyCallback }
  });
  const { handleEditAvatar } = useAvatarEditor({
    Form,
    userInfo,
    showFullInfo,
    loadUserInfo
  });
  return {
    Form,
    formItems,
    handleEdit,
    handleEditField,
    handleBindField,
    handleEditAvatar
  };
}
const _hoisted_1$2 = { class: "profile-info-item" };
const _hoisted_2$2 = { class: "profile-info-item__key" };
const _hoisted_3$1 = { class: "profile-info-item__value" };
const _hoisted_4$1 = { class: "profile-info-item__content" };
var _sfc_main$3 = /* @__PURE__ */ defineComponent({
  ...{
    name: "ProfileInfoItem"
  },
  __name: "ProfileInfoItem",
  props: {
    label: {},
    value: {},
    editable: { type: Boolean },
    copyable: { type: Boolean },
    bindable: { type: Boolean }
  },
  emits: ["edit", "bind"],
  setup(__props) {
    const props = __props;
    const handleCopy = async () => {
      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(props.value);
          BtcMessage.success("复制成功");
          return;
        }
        const textArea = document.createElement("textarea");
        textArea.value = props.value;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        textArea.style.opacity = "0";
        textArea.style.pointerEvents = "none";
        textArea.setAttribute("readonly", "");
        document.body.appendChild(textArea);
        textArea.select();
        textArea.setSelectionRange(0, 99999);
        const successful = document.execCommand("copy");
        document.body.removeChild(textArea);
        if (successful) {
          BtcMessage.success("复制成功");
        } else {
          BtcMessage.error("复制失败");
        }
      } catch (error) {
        console.error("复制失败:", error);
        BtcMessage.error("复制失败");
      }
    };
    return (_ctx, _cache) => {
      const _component_el_icon = ElIcon;
      const _component_el_button = ElButton;
      return openBlock(), createElementBlock("div", _hoisted_1$2, [
        createBaseVNode("div", _hoisted_2$2, toDisplayString(__props.label), 1),
        createBaseVNode("div", _hoisted_3$1, [
          createBaseVNode("span", _hoisted_4$1, toDisplayString(__props.value), 1),
          __props.editable ? (openBlock(), createBlock(_component_el_icon, {
            key: 0,
            class: "profile-info-item__edit-icon",
            onClick: _cache[0] || (_cache[0] = ($event) => _ctx.$emit("edit"))
          }, {
            default: withCtx(() => [
              createVNode(unref(edit_default))
            ]),
            _: 1
          })) : __props.bindable && (__props.value === "-" || !__props.value || __props.value.trim() === "") ? (openBlock(), createBlock(_component_el_button, {
            key: 1,
            link: "",
            type: "primary",
            size: "small",
            class: "profile-info-item__bind-btn",
            onClick: _cache[1] || (_cache[1] = ($event) => _ctx.$emit("bind"))
          }, {
            default: withCtx(() => [..._cache[2] || (_cache[2] = [
              createTextVNode(" 去绑定 ", -1)
            ])]),
            _: 1
          })) : __props.copyable ? (openBlock(), createBlock(_component_el_icon, {
            key: 2,
            class: "profile-info-item__copy-icon",
            onClick: handleCopy
          }, {
            default: withCtx(() => [
              createVNode(unref(copy_document_default))
            ]),
            _: 1
          })) : createCommentVNode("", true)
        ])
      ]);
    };
  }
});
var ProfileInfoItem = /* @__PURE__ */ _export_sfc(_sfc_main$3, [["__scopeId", "data-v-5ffd569a"]]);
const _hoisted_1$1 = { class: "profile-card" };
const _hoisted_2$1 = { class: "profile-card__content" };
const _hoisted_3 = { class: "profile-card__avatar-section" };
const _hoisted_4 = { class: "profile-card__info-section" };
var _sfc_main$2 = /* @__PURE__ */ defineComponent({
  ...{
    name: "ProfileCard"
  },
  __name: "ProfileCard",
  props: {
    userInfo: {},
    showFullInfo: { type: Boolean },
    rockStyle: { type: Boolean }
  },
  emits: ["edit-field", "bind-field", "avatar-change"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const avatarUrl = computed(() => {
      return props.userInfo?.avatar || "/logo.png";
    });
    const hasPhone = computed(() => {
      const phone = props.userInfo?.phone;
      return !!(phone && phone !== "-" && phone.trim() !== "");
    });
    const hasEmail = computed(() => {
      const email = props.userInfo?.email;
      return !!(email && email !== "-" && email.trim() !== "");
    });
    const handleAvatarChange = async (url) => {
      emit("avatar-change", url);
    };
    return (_ctx, _cache) => {
      const _component_el_col = ElCol;
      const _component_el_row = ElRow;
      return openBlock(), createElementBlock("div", _hoisted_1$1, [
        createBaseVNode("div", _hoisted_2$1, [
          createBaseVNode("div", _hoisted_3, [
            createVNode(unref(BtcAvatar), {
              src: avatarUrl.value,
              size: 78,
              editable: true,
              "upload-service": unref(service),
              "rock-style": __props.rockStyle ?? true,
              "on-upload": handleAvatarChange
            }, null, 8, ["src", "upload-service", "rock-style"])
          ]),
          createBaseVNode("div", _hoisted_4, [
            createVNode(_component_el_row, { gutter: 16 }, {
              default: withCtx(() => [
                createVNode(_component_el_col, { span: 12 }, {
                  default: withCtx(() => [
                    createVNode(ProfileInfoItem, {
                      label: "姓名",
                      value: __props.userInfo.realName || __props.userInfo.name || "-",
                      editable: false
                    }, null, 8, ["value"]),
                    createVNode(ProfileInfoItem, {
                      label: "英文名",
                      value: __props.userInfo.name || "-",
                      editable: false
                    }, null, 8, ["value"]),
                    createVNode(ProfileInfoItem, {
                      label: "工号",
                      value: __props.userInfo.employeeId || "-",
                      editable: false,
                      copyable: !!__props.userInfo.employeeId
                    }, null, 8, ["value", "copyable"]),
                    createVNode(ProfileInfoItem, {
                      label: "职位",
                      value: __props.userInfo.position || "-",
                      editable: false
                    }, null, 8, ["value"])
                  ]),
                  _: 1
                }),
                createVNode(_component_el_col, { span: 12 }, {
                  default: withCtx(() => [
                    createVNode(ProfileInfoItem, {
                      label: "邮箱",
                      value: __props.userInfo.email || "-",
                      editable: hasEmail.value,
                      bindable: true,
                      onEdit: _cache[0] || (_cache[0] = ($event) => _ctx.$emit("edit-field", "email")),
                      onBind: _cache[1] || (_cache[1] = ($event) => _ctx.$emit("bind-field", "email"))
                    }, null, 8, ["value", "editable"]),
                    createVNode(ProfileInfoItem, {
                      label: "手机号",
                      value: __props.userInfo.phone || "-",
                      editable: hasPhone.value,
                      bindable: true,
                      onEdit: _cache[2] || (_cache[2] = ($event) => _ctx.$emit("edit-field", "phone")),
                      onBind: _cache[3] || (_cache[3] = ($event) => _ctx.$emit("bind-field", "phone"))
                    }, null, 8, ["value", "editable"]),
                    createVNode(ProfileInfoItem, {
                      label: "密码",
                      value: __props.userInfo.initPass ? "已设置" : "未设置",
                      editable: "",
                      onEdit: _cache[4] || (_cache[4] = ($event) => _ctx.$emit("edit-field", "initPass"))
                    }, null, 8, ["value"])
                  ]),
                  _: 1
                })
              ]),
              _: 1
            })
          ])
        ])
      ]);
    };
  }
});
var ProfileCard = /* @__PURE__ */ _export_sfc(_sfc_main$2, [["__scopeId", "data-v-e4d1b67b"]]);
var _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "BtcIdentityVerifyWrapper",
  props: {
    modelValue: { type: Boolean },
    userInfo: {},
    skipVerification: { type: Boolean },
    bindField: {},
    editingField: {}
  },
  emits: ["update:modelValue", "success", "cancel"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const visible = computed({
      get: () => props.modelValue,
      set: (val) => emit("update:modelValue", val)
    });
    const accountName = computed(() => appStorage.user.getName() || "您");
    const smsCodeInputComponent = BtcSmsCodeInput;
    const message = useMessage();
    const sendSmsCodeForBind = async (phone) => {
      const phoneService = service.admin?.base?.phone;
      if (!phoneService?.bind) {
        throw new Error("手机号服务不可用");
      }
      await phoneService.bind({
        phone,
        smsType: "bind"
      });
    };
    const sendEmailCodeForBind = async (email, smsType) => {
      const emailService = service.admin?.base?.email;
      if (!emailService?.bind) {
        throw new Error("邮箱服务不可用");
      }
      await emailService.bind({
        email,
        scene: smsType,
        smsType,
        type: smsType
      });
    };
    const sendSmsCodeForVerify = async () => {
      const phoneService = service.admin?.base?.phone;
      if (!phoneService?.send) {
        throw new Error("手机号服务不可用");
      }
      await phoneService.send({
        type: "auth",
        smsType: "auth"
      });
    };
    const sendEmailCodeForVerify = async () => {
      const emailService = service.admin?.base?.email;
      if (!emailService?.send) {
        throw new Error("邮箱服务不可用");
      }
      await emailService.send({
        type: "auth",
        scene: "auth",
        smsType: "auth"
      });
    };
    const sendSmsCode = async (phone, smsType) => {
      if (props.skipVerification && props.bindField === "phone") {
        await sendSmsCodeForBind(phone);
      } else {
        await sendSmsCodeForVerify();
      }
    };
    const sendEmailCode = async (email, smsType) => {
      if (props.skipVerification && props.bindField === "email") {
        await sendEmailCodeForBind(email, smsType || "bind");
      } else {
        await sendEmailCodeForVerify();
      }
    };
    const extractResponse = (result) => {
      if (!result || typeof result !== "object") {
        return { code: void 0, msg: void 0 };
      }
      if ("data" in result && result.data && typeof result.data === "object") {
        const dataObj = result.data;
        return { code: dataObj.code, msg: dataObj.msg };
      }
      return { code: result.code, msg: result.msg };
    };
    const verifySmsCode = async (_phone, smsCode, smsType) => {
      const phoneService = service.admin?.base?.phone;
      if (!phoneService?.verify) {
        throw new Error("手机号服务不可用");
      }
      if (smsType === "auth" || !smsType) {
        const response = await phoneService.verify({
          code: smsCode,
          smsType: smsType || "auth"
        });
        const { code, msg } = extractResponse(response);
        const isSuccess = code === void 0 || code === null || code === 200 || code === 1e3 || code === 2e3;
        if (!isSuccess) {
          message.error(msg || "验证码校验失败");
          return false;
        }
      }
      return true;
    };
    const verifyEmailCode = async (_email, emailCode, smsType) => {
      const emailService = service.admin?.base?.email;
      if (!emailService?.verify) {
        throw new Error("邮箱服务不可用");
      }
      if (smsType === "auth" || !smsType) {
        const response = await emailService.verify({
          code: emailCode,
          scene: smsType || "auth",
          smsType: smsType || "auth"
        });
        const { code, msg } = extractResponse(response);
        const isSuccess = code === void 0 || code === null || code === 200 || code === 1e3 || code === 2e3;
        if (!isSuccess) {
          message.error(msg || "验证码校验失败");
          return false;
        }
      }
      return true;
    };
    const checkPhoneBinding = async ({ type }) => {
      const profileService = service.admin?.base?.profile;
      if (!profileService) {
        throw new Error("用户信息服务不可用");
      }
      return await profileService.verify({ type });
    };
    const checkEmailBinding = async ({ type }) => {
      const profileService = service.admin?.base?.profile;
      if (!profileService) {
        throw new Error("用户信息服务不可用");
      }
      return await profileService.verify({ type });
    };
    const saveBinding = async (params) => {
      const profileService = service.admin?.base?.profile;
      const phoneService = service.admin?.base?.phone;
      const emailService = service.admin?.base?.email;
      if (params.phone && params.smsCode) {
        if (!phoneService?.update) {
          throw new Error("手机号服务不可用");
        }
        await phoneService.update({
          phone: params.phone,
          smsCode: params.smsCode,
          smsType: params.smsType || "bind"
        });
        return;
      }
      if (params.email && params.emailCode) {
        if (!emailService?.update) {
          throw new Error("邮箱服务不可用");
        }
        const response = await emailService.update({
          email: params.email,
          code: params.emailCode,
          scene: params.scene || params.smsType || "bind",
          smsType: params.smsType || "bind"
        });
        const { code, msg } = extractResponse(response);
        if (code && code !== 200 && code !== 1e3 && code !== 2e3) {
          message.error(msg || "换绑失败");
          return;
        }
        return;
      }
      if (!profileService?.update) {
        throw new Error("用户信息服务不可用");
      }
      await profileService.update(params);
    };
    const handleSuccess = () => {
      if (props.skipVerification) {
        emit("success", true);
      } else {
        emit("success", false);
      }
    };
    const handleCancel = () => {
      emit("cancel");
    };
    return (_ctx, _cache) => {
      return __props.skipVerification && __props.bindField && (__props.bindField === "phone" || __props.bindField === "email") ? (openBlock(), createBlock(BtcBindingDialog, {
        key: 0,
        modelValue: visible.value,
        "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => visible.value = $event),
        "user-info": __props.userInfo,
        "account-name": accountName.value,
        "send-sms-code": sendSmsCode,
        "send-email-code": sendEmailCode,
        "verify-sms-code": verifySmsCode,
        "verify-email-code": verifyEmailCode,
        "save-binding": saveBinding,
        "sms-code-input-component": unref(smsCodeInputComponent),
        "bind-field": __props.bindField,
        onSuccess: handleSuccess,
        onCancel: handleCancel
      }, null, 8, ["modelValue", "user-info", "account-name", "sms-code-input-component", "bind-field"])) : (openBlock(), createBlock(BtcIdentityVerify, {
        key: 1,
        modelValue: visible.value,
        "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => visible.value = $event),
        "user-info": __props.userInfo,
        "account-name": accountName.value,
        "send-sms-code": sendSmsCode,
        "send-email-code": sendEmailCode,
        "verify-sms-code": verifySmsCode,
        "verify-email-code": verifyEmailCode,
        "check-phone-binding": checkPhoneBinding,
        "check-email-binding": checkEmailBinding,
        "sms-code-input-component": unref(smsCodeInputComponent),
        "editing-field": __props.editingField,
        onSuccess: handleSuccess,
        onCancel: handleCancel
      }, null, 8, ["modelValue", "user-info", "account-name", "sms-code-input-component", "editing-field"]));
    };
  }
});
const _hoisted_1 = { class: "profile-page" };
const _hoisted_2 = { class: "profile-card__header-left" };
var _sfc_main = /* @__PURE__ */ defineComponent({
  ...{
    name: "Profile"
  },
  __name: "index",
  setup(__props) {
    const { userInfo, loading, showFullInfo, loadUserInfo, handleToggleShowFull } = useProfile();
    const verifyVisible = ref(false);
    let verifySuccessCallback = null;
    const { Form, handleEditField: handleEditFieldFromForm } = useProfileForm(
      userInfo,
      showFullInfo,
      loadUserInfo,
      (field) => {
        editingField.value = field;
        skipVerification.value = false;
        bindField.value = null;
        verifyVisible.value = true;
      },
      (callback) => {
        verifySuccessCallback = callback;
      }
    );
    const handleEditField = (field) => {
      skipVerification.value = false;
      bindField.value = null;
      editingField.value = field;
      handleEditFieldFromForm(field);
    };
    const skipVerification = ref(false);
    const bindField = ref(null);
    const editingField = ref(null);
    const handleBindField = (field) => {
      bindField.value = field;
      editingField.value = null;
      skipVerification.value = true;
      verifyVisible.value = true;
    };
    const handleVerifySuccess = async (isBinding = false) => {
      await loadUserInfo(showFullInfo.value);
      if (isBinding || skipVerification.value) {
        verifySuccessCallback = null;
        skipVerification.value = false;
        bindField.value = null;
        editingField.value = null;
      } else {
        if (verifySuccessCallback) {
          verifySuccessCallback();
          verifySuccessCallback = null;
        }
        editingField.value = null;
      }
      verifyVisible.value = false;
    };
    const getRockStyleEnabled = () => {
      const stored = appStorage.settings.getItem("avatarRockStyle");
      return stored === true || stored === false ? stored : false;
    };
    const rockStyleEnabled = ref(getRockStyleEnabled());
    const handleRockStyleChange = (value) => {
      appStorage.settings.setItem("avatarRockStyle", value);
      window.dispatchEvent(new CustomEvent("avatarRockStyleChanged", { detail: value }));
    };
    const handleAvatarChange = async (avatarUrl) => {
      try {
        const { service: service2 } = await __vitePreload(async () => {
          const { service: service3 } = await import("https://all.bellis.com.cn/system-app/assets/eps-service-BXEAd5O1.js").then(function(n) {
            return n.a;
          });
          return { service: service3 };
        }, true ? [] : void 0);
        const profileService = service2.admin?.base?.profile;
        if (!profileService) {
          BtcMessage.warning("用户信息服务不可用");
          return;
        }
        await profileService.update({
          id: userInfo.value.id,
          avatar: avatarUrl
        });
        appStorage.user.setAvatar(avatarUrl);
        const { useUser } = await __vitePreload(async () => {
          const { useUser: useUser2 } = await import("https://all.bellis.com.cn/system-app/assets/useUser-DIG-AInn.js");
          return { useUser: useUser2 };
        }, true ? [] : void 0);
        const { getUserInfo, setUserInfo } = useUser();
        const currentUser = getUserInfo();
        if (currentUser) {
          setUserInfo({
            ...currentUser,
            avatar: avatarUrl
          });
        }
        window.dispatchEvent(new CustomEvent("userInfoUpdated", {
          detail: {
            avatar: avatarUrl,
            name: userInfo.value.name
          }
        }));
        BtcMessage.success("头像更新成功");
        await loadUserInfo(showFullInfo.value);
      } catch (error) {
        console.error("保存头像失败:", error);
        BtcMessage.error(error?.message || "保存头像失败");
      }
    };
    onMounted(() => {
      loadUserInfo(false);
    });
    return (_ctx, _cache) => {
      const _component_el_switch = ElSwitch;
      const _component_el_tooltip = ElTooltip;
      const _component_el_icon = ElIcon;
      const _component_btc_card = __unplugin_components_3;
      const _component_BtcForm = _sfc_main$4;
      const _directive_loading = vLoading;
      return openBlock(), createElementBlock("div", _hoisted_1, [
        withDirectives((openBlock(), createBlock(_component_btc_card, { class: "profile-card" }, {
          title: withCtx(() => [
            createBaseVNode("div", _hoisted_2, [
              createVNode(_component_el_tooltip, { content: "摇滚风格" }, {
                default: withCtx(() => [
                  createVNode(_component_el_switch, {
                    modelValue: rockStyleEnabled.value,
                    "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => rockStyleEnabled.value = $event),
                    "inline-prompt": "",
                    "active-text": "开",
                    "inactive-text": "关",
                    onChange: handleRockStyleChange
                  }, null, 8, ["modelValue"])
                ]),
                _: 1
              })
            ])
          ]),
          extra: withCtx(() => [
            createVNode(_component_el_tooltip, {
              content: unref(showFullInfo) ? "隐藏完整信息" : "显示完整信息"
            }, {
              default: withCtx(() => [
                createVNode(_component_el_icon, {
                  class: "profile-card__toggle-icon",
                  onClick: unref(handleToggleShowFull)
                }, {
                  default: withCtx(() => [
                    unref(showFullInfo) ? (openBlock(), createBlock(unref(view_default), { key: 0 })) : (openBlock(), createBlock(unref(hide_default), { key: 1 }))
                  ]),
                  _: 1
                }, 8, ["onClick"])
              ]),
              _: 1
            }, 8, ["content"])
          ]),
          default: withCtx(() => [
            createVNode(ProfileCard, {
              "user-info": unref(userInfo),
              "show-full-info": unref(showFullInfo),
              "rock-style": rockStyleEnabled.value,
              onEditField: handleEditField,
              onBindField: handleBindField,
              onAvatarChange: handleAvatarChange
            }, null, 8, ["user-info", "show-full-info", "rock-style"])
          ]),
          _: 1
        })), [
          [_directive_loading, unref(loading)]
        ]),
        createVNode(_component_BtcForm, {
          ref_key: "Form",
          ref: Form
        }, null, 512),
        createVNode(_sfc_main$1, {
          modelValue: verifyVisible.value,
          "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => verifyVisible.value = $event),
          "user-info": {
            id: unref(userInfo).id,
            phone: unref(userInfo).phone,
            email: unref(userInfo).email
          },
          "skip-verification": skipVerification.value,
          "bind-field": bindField.value,
          "editing-field": editingField.value,
          onSuccess: handleVerifySuccess
        }, null, 8, ["modelValue", "user-info", "skip-verification", "bind-field", "editing-field"])
      ]);
    };
  }
});
var index = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-ea5e6e8f"]]);
export {
  index as default
};
