import type { Router } from 'vue-router';

/**
 * 设置路由错误处理
 */
export function setupErrorHandler(router: Router) {
  router.onError((error: Error) => {
    // 如果是组件加载失败，尝试重新加载或重定向到登录页
    if (error.message && error.message.includes('Failed to fetch dynamically imported module')) {
      const currentRoute = router.currentRoute.value;
      if (currentRoute && currentRoute.matched.length > 0) {
        const route = currentRoute.matched[currentRoute.matched.length - 1];

        // 关键：如果是登录页组件加载失败，尝试重定向到登录页（使用 replace 避免历史记录）
        if (route && (route.path === '/login' || currentRoute.path === '/login')) {
          setTimeout(() => {
            try {
              const loginRoute = router.resolve('/login');
              if (loginRoute && loginRoute.matched.length > 0) {
                // 关键：使用 Vue Router 的 replace 方法，避免页面刷新
                router.replace('/login').catch((err) => {
                  if (import.meta.env.DEV) {
                    console.error('[errorHandler] router.replace 失败，但不使用 window.location.href 避免页面刷新:', err);
                  }
                });
              } else {
                // 如果路由不存在，尝试使用 router.push
                router.push('/login').catch((err) => {
                  if (import.meta.env.DEV) {
                    console.error('[errorHandler] router.push 失败，但不使用 window.location.href 避免页面刷新:', err);
                  }
                });
              }
            } catch (error) {
              if (import.meta.env.DEV) {
                console.error('[errorHandler] 处理登录重定向失败，但不使用 window.location.href 避免页面刷新:', error);
              }
            } finally {
              const loadingEl = document.getElementById('Loading');
              if (loadingEl) {
                loadingEl.style.setProperty('display', 'none', 'important');
              }
            }
          }, 100);
          return;
        }
      }

      // 如果组件加载失败且不是登录页，尝试重定向到登录页
      if (currentRoute && currentRoute.path !== '/login') {
        // 将相对路径转换为完整 URL
        import('@btc/shared-core/utils/redirect').then(({ convertPathToFullUrl }) => {
          convertPathToFullUrl(currentRoute.fullPath).then((fullCallbackUrl) => {
            setTimeout(() => {
              try {
                const loginRoute = router.resolve('/login');
                if (loginRoute && loginRoute.matched.length > 0) {
                  // 关键：使用 Vue Router 的 replace 方法，避免页面刷新
                  router.replace({
                    path: '/login',
                    query: { oauth_callback: fullCallbackUrl },
                  }).catch((err) => {
                    if (import.meta.env.DEV) {
                      console.error('[errorHandler] router.replace 失败，但不使用 window.location.href 避免页面刷新:', err);
                    }
                  });
                } else {
                  // 如果路由不存在，尝试使用 router.push
                  router.push({
                    path: '/login',
                    query: { oauth_callback: fullCallbackUrl },
                  }).catch((err) => {
                    if (import.meta.env.DEV) {
                      console.error('[errorHandler] router.push 失败，但不使用 window.location.href 避免页面刷新:', err);
                    }
                  });
                }
              } catch (error) {
                if (import.meta.env.DEV) {
                  console.error('[errorHandler] 处理登录重定向失败，但不使用 window.location.href 避免页面刷新:', error);
                }
              } finally {
                const loadingEl = document.getElementById('Loading');
                if (loadingEl) {
                  loadingEl.style.setProperty('display', 'none', 'important');
                }
              }
            }, 100);
          }).catch(() => {
            // 如果转换失败，使用原始路径
            setTimeout(() => {
              try {
                const loginRoute = router.resolve('/login');
                if (loginRoute && loginRoute.matched.length > 0) {
                  // 关键：使用 Vue Router 的 replace 方法，避免页面刷新
                  router.replace({
                    path: '/login',
                    query: { oauth_callback: currentRoute.fullPath },
                  }).catch((err) => {
                    // 如果 router.replace 失败，记录错误但不使用 window.location.href
                    if (import.meta.env.DEV) {
                      console.error('[errorHandler] router.replace 失败，但不使用 window.location.href 避免页面刷新:', err);
                    }
                  });
                } else {
                  // 如果路由不存在，尝试使用 router.push
                  router.push({
                    path: '/login',
                    query: { oauth_callback: currentRoute.fullPath },
                  }).catch((err) => {
                    if (import.meta.env.DEV) {
                      console.error('[errorHandler] router.push 失败，但不使用 window.location.href 避免页面刷新:', err);
                    }
                  });
                }
              } catch (error) {
                // 如果所有方法都失败，记录错误但不使用 window.location.href
                if (import.meta.env.DEV) {
                  console.error('[errorHandler] 处理登录重定向失败，但不使用 window.location.href 避免页面刷新:', error);
                }
              } finally {
                const loadingEl = document.getElementById('Loading');
                if (loadingEl) {
                  loadingEl.style.setProperty('display', 'none', 'important');
                }
              }
            }, 100);
          });
        }).catch(() => {
          // 如果导入失败，使用原始路径
          setTimeout(() => {
            try {
              const loginRoute = router.resolve('/login');
              if (loginRoute && loginRoute.matched.length > 0) {
                // 关键：使用 Vue Router 的 replace 方法，避免页面刷新
                router.replace({
                  path: '/login',
                  query: { oauth_callback: currentRoute.fullPath },
                }).catch((err) => {
                  // 如果 router.replace 失败，尝试使用 router.push
                  router.push({
                    path: '/login',
                    query: { oauth_callback: currentRoute.fullPath },
                  }).catch((pushErr) => {
                    if (import.meta.env.DEV) {
                      console.error('[errorHandler] router.push 也失败，但不使用 window.location.href 避免页面刷新:', pushErr);
                    }
                  });
                });
              } else {
                // 如果路由不存在，尝试使用 router.push
                router.push({
                  path: '/login',
                  query: { oauth_callback: currentRoute.fullPath },
                }).catch((err) => {
                  if (import.meta.env.DEV) {
                    console.error('[errorHandler] router.push 失败，但不使用 window.location.href 避免页面刷新:', err);
                  }
                });
              }
            } catch (error) {
              if (import.meta.env.DEV) {
                console.error('[errorHandler] 处理登录重定向失败，但不使用 window.location.href 避免页面刷新:', error);
              }
            } finally {
              const loadingEl = document.getElementById('Loading');
              if (loadingEl) {
                loadingEl.style.setProperty('display', 'none', 'important');
              }
            }
          }, 100);
        });
      }
      return;
    }

    // 处理 __vccOpts 错误（Vue 组件未正确加载）
    if (error.message && (error.message.includes('__vccOpts') || error.message.includes('Cannot read properties of undefined') || error.message.includes("Cannot use 'in' operator"))) {
      const currentRoute = router.currentRoute.value;

      // 关键：如果路由未匹配，说明是路由配置问题，不应该尝试重新加载组件
      if (currentRoute && currentRoute.matched.length === 0) {
        // 路由未匹配，可能是子应用路由或无效路由
        // 不要尝试重新加载，让应用正常显示（可能显示 Layout 或子应用挂载点）
        // 移除 Loading 元素
        const loadingEl = document.getElementById('Loading');
        if (loadingEl) {
          loadingEl.style.setProperty('display', 'none', 'important');
        }
        return;
      }

      // 如果是登录页组件错误，尝试重定向到登录页
      if (currentRoute && (currentRoute.path === '/login' || currentRoute.matched.some((m: import('vue-router').RouteRecordNormalized) => m.path === '/login'))) {
        setTimeout(() => {
          try {
            const loginRoute = router.resolve('/login');
            if (loginRoute && loginRoute.matched.length > 0) {
              // 关键：使用 Vue Router 的 replace 方法，避免页面刷新
              router.replace('/login').catch((err) => {
                if (import.meta.env.DEV) {
                  console.error('[errorHandler] router.replace 失败，但不使用 window.location.href 避免页面刷新:', err);
                }
              });
            } else {
              // 如果路由不存在，尝试使用 router.push
              router.push('/login').catch((err) => {
                if (import.meta.env.DEV) {
                  console.error('[errorHandler] router.push 失败，但不使用 window.location.href 避免页面刷新:', err);
                }
              });
            }
          } catch (error) {
            if (import.meta.env.DEV) {
              console.error('[errorHandler] 处理登录重定向失败，但不使用 window.location.href 避免页面刷新:', error);
            }
          } finally {
            const loadingEl = document.getElementById('Loading');
            if (loadingEl) {
              loadingEl.style.setProperty('display', 'none', 'important');
            }
          }
        }, 100);
        return;
      }

      // 对于根路径 `/`，检查是否是 Layout 或子路由组件加载问题
      if (currentRoute && currentRoute.path === '/') {
        setTimeout(() => {
          router.replace('/').catch(() => {
            const loadingEl = document.getElementById('Loading');
            if (loadingEl) {
              loadingEl.style.setProperty('display', 'none', 'important');
            }
          });
        }, 500);
        return;
      }

      // 尝试重新加载当前路由
      if (currentRoute && currentRoute.path) {
        setTimeout(() => {
          router.replace(currentRoute.fullPath).catch(() => {
            // 如果重新加载失败，重定向到登录页
            if (currentRoute.path !== '/login') {
              // 将相对路径转换为完整 URL
              import('@btc/shared-core/utils/redirect').then(({ convertPathToFullUrl }) => {
                convertPathToFullUrl(currentRoute.fullPath).then((fullCallbackUrl) => {
                  router.replace({
                    path: '/login',
                    query: { oauth_callback: fullCallbackUrl },
                  }).catch(() => {
                    const loadingEl = document.getElementById('Loading');
                    if (loadingEl) {
                      loadingEl.style.setProperty('display', 'none', 'important');
                    }
                  });
                }).catch(() => {
                  // 如果转换失败，使用原始路径
                  router.replace({
                    path: '/login',
                    query: { oauth_callback: currentRoute.fullPath },
                  }).catch(() => {
                    const loadingEl = document.getElementById('Loading');
                    if (loadingEl) {
                      loadingEl.style.setProperty('display', 'none', 'important');
                    }
                  });
                });
              }).catch(() => {
                // 如果导入失败，使用原始路径
                router.replace({
                  path: '/login',
                  query: { oauth_callback: currentRoute.fullPath },
                }).catch(() => {
                  const loadingEl = document.getElementById('Loading');
                  if (loadingEl) {
                    loadingEl.style.setProperty('display', 'none', 'important');
                  }
                });
              });
            }
          });
        }, 100);
      }
      return;
    }

    // 处理 single-spa 相关错误
    if (error.message && error.message.includes('single-spa')) {
      return;
    }
  });
}

