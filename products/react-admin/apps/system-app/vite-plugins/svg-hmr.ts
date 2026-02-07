/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Plugin } from 'vite';
import { readFileSync, readdirSync, existsSync } from 'fs';
import { basename, extname, join } from 'path';
import { fileURLToPath } from 'node:url';

/**
 * 应用级别的 SVG HMR 插件
 * 专门处理 apps/system-app/src/assets/icons/ 目录下的 SVG 文件
 * 支持热更新，无需重新构建共享包
 */
export function svgHmrPlugin(appDir: string): Plugin {
  const iconsDir = join(appDir, 'src', 'assets', 'icons');
  let svgSpriteHtml = '';
  let viteDevServer: any = null;

  /**
   * 扫描并生成 SVG sprite HTML
   */
  function generateSvgSprite(): string {
    if (!existsSync(iconsDir)) {
      return '';
    }

    const svgSymbols: string[] = [];

    try {
      const files = readdirSync(iconsDir, { withFileTypes: true });
      
      for (const file of files) {
        if (file.isFile() && extname(file.name) === '.svg') {
          const filePath = join(iconsDir, file.name);
          const iconName = basename(file.name, '.svg');
          
          try {
            let svgContent = readFileSync(filePath, 'utf-8');
            
            // 清理 XML 声明和 DOCTYPE
            svgContent = svgContent
              .replace(/<\?xml[^>]*\?>/g, '')
              .replace(/<!DOCTYPE[^>]*>/g, '');
            
            // 提取 viewBox
            const viewBoxMatch = svgContent.match(/viewBox=["']([^"']+)["']/);
            const widthMatch = svgContent.match(/width=["']([^"']+)["']/);
            const heightMatch = svgContent.match(/height=["']([^"']+)["']/);
            
            let viewBox = '';
            if (viewBoxMatch) {
              viewBox = `viewBox="${viewBoxMatch[1]}"`;
            } else if (widthMatch && heightMatch) {
              viewBox = `viewBox="0 0 ${widthMatch[1]} ${heightMatch[1]}"`;
            }
            
            // 提取 SVG 内容（移除外层 svg 标签）
            const innerContent = svgContent
              .replace(/<svg[^>]*>/, '')
              .replace(/<\/svg>/, '')
              .replace(/(\r\n|\n|\r)/gm, '');
            
            // 生成 symbol
            const symbol = `<symbol id="icon-${iconName}" ${viewBox}>${innerContent}</symbol>`;
            svgSymbols.push(symbol);
          } catch (err) {
            console.warn(`[svg-hmr] 读取 SVG 文件失败: ${filePath}`, err);
          }
        }
      }
    } catch (err) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn(`[svg-hmr] 扫描图标目录失败: ${iconsDir}`, err);
      }
    }

    return svgSymbols.join('');
  }

  /**
   * 更新 SVG sprite
   */
  function updateSvgSprite() {
    const newHtml = generateSvgSprite();
    const changed = newHtml !== svgSpriteHtml;
    svgSpriteHtml = newHtml;
    
    if (changed && viteDevServer) {
      // 通过 WebSocket 发送更新消息
      viteDevServer.ws.send({
        type: 'custom',
        event: 'svg-hmr-update',
        data: { svgHtml: svgSpriteHtml }
      });
      
      // 同时通过 window 事件触发（备用方案）
      // 注意：这需要在客户端代码中监听 window 事件
    }
  }

  return {
    name: 'svg-hmr',
    enforce: 'pre',
    
    resolveId(id: string) {
      // 创建虚拟模块
      if (id === 'virtual:svg-hmr') {
        return id;
      }
      return null;
    },
    
    load(id: string) {
      // 返回虚拟模块内容
      if (id === 'virtual:svg-hmr') {
        return `
// SVG HMR 客户端模块
export const svgSpriteHtml = ${JSON.stringify(svgSpriteHtml)};
export function updateSvgSprite(newHtml) {
  const sprite = document.getElementById('svg-hmr-sprite');
  if (sprite) {
    sprite.innerHTML = newHtml;
  }
}

// 如果支持 HMR，监听更新
if (import.meta.hot) {
  import.meta.hot.on('svg-hmr-update', (data) => {
    if (data && data.svgHtml) {
      updateSvgSprite(data.svgHtml);
    }
  });
}
`;
      }
      return null;
    },
    
    configureServer(server: any) {
      viteDevServer = server;
      
      // 初始化 SVG sprite
      updateSvgSprite();
    },
    
    buildStart() {
      // 构建时也生成 SVG sprite
      updateSvgSprite();
    },
    
    handleHotUpdate(ctx: any) {
      const filePath = ctx.file.replace(/\\/g, '/');
      const iconsDirPath = iconsDir.replace(/\\/g, '/');
      
      // 检测 SVG 文件变化
      if (filePath.includes(iconsDirPath) && filePath.endsWith('.svg')) {
        updateSvgSprite();
        
        // 触发虚拟模块更新
        const module = ctx.server.moduleGraph.getModuleById('virtual:svg-hmr');
        if (module) {
          ctx.server.moduleGraph.invalidateModule(module);
        }
        
        // 通过 WebSocket 发送更新
        if (viteDevServer) {
          viteDevServer.ws.send({
            type: 'custom',
            event: 'svg-hmr-update',
            data: { svgHtml: svgSpriteHtml }
          });
        }
        
        // 返回虚拟模块，触发 HMR
        return [module].filter(Boolean);
      }
      
      return undefined;
    },
    
    transformIndexHtml(html: string) {
      // 如果还没有生成，先生成一次
      if (!svgSpriteHtml) {
        updateSvgSprite();
      }
      
      if (!svgSpriteHtml) {
        return html;
      }
      
      // 检查是否已经注入（避免重复注入）
      if (html.includes('svg-hmr-sprite')) {
        return html;
      }
      
      // 生成客户端脚本
      const escapedHtml = JSON.stringify(svgSpriteHtml);
      const script = `
<script>
(function() {
  var svgSpriteId = 'svg-hmr-sprite';
  var updateAttempts = 0;
  var maxAttempts = 100;
  var currentHtml = ${escapedHtml};
  var isLoaded = false;
  var isLoading = false;
  
      // 检查图标是否已存在
      function hasIcons(sprite) {
        if (!sprite) return false;
        var windmill = sprite.querySelector('#icon-windmill');
        var star = sprite.querySelector('#icon-star');
        return !!(windmill || star);
      }
      
      // 验证图标是否真的存在
      function verifyIcons() {
        var btcSprite = document.getElementById('btc-svg-sprite');
        if (btcSprite) {
          var windmill = btcSprite.querySelector('#icon-windmill');
          var star = btcSprite.querySelector('#icon-star');
          if (windmill && star) {
            return true;
          } else {
            console.warn('[svg-hmr] ⚠️ 图标验证失败：', {
              windmill: !!windmill,
              star: !!star,
              star: !!star
            });
          }
        }
        return false;
      }
      
      function loadSvgSprite() {
        // 防止重复执行
        if (isLoading || isLoaded) {
          return;
        }
        
        updateAttempts++;
        if (updateAttempts > maxAttempts) {
          console.warn('[svg-hmr] 无法加载 SVG sprite，已达到最大尝试次数');
          isLoading = false;
          return;
        }
        
        if (!document.body) {
          isLoading = true;
          setTimeout(function() {
            isLoading = false;
            loadSvgSprite();
          }, 50);
          return;
        }
        
        try {
          // 检查是否已存在共享包的 SVG sprite
          var existingBtcSprite = document.getElementById('btc-svg-sprite');
          
          // 如果存在共享包的 sprite，将我们的图标添加到其中
          if (existingBtcSprite) {
            // 检查图标是否已经添加过
            if (!hasIcons(existingBtcSprite) && currentHtml) {
              // 确保 sprite 已经有内容（等待共享包插件完成初始化）
              if (existingBtcSprite.innerHTML.trim().length > 0) {
                existingBtcSprite.innerHTML = existingBtcSprite.innerHTML + currentHtml;
                isLoaded = true;
                
                // 验证图标是否真的添加成功
                setTimeout(function() {
                  verifyIcons();
                }, 100);
              } else {
                // sprite 还没有内容，等待一下再试
                isLoading = true;
                setTimeout(function() {
                  isLoading = false;
                  loadSvgSprite();
                }, 100);
                return;
              }
            } else if (hasIcons(existingBtcSprite)) {
              // 图标已经存在，标记为已加载
              isLoaded = true;
              verifyIcons();
            }
            return;
          }
      
      // 检查是否已存在自己的 sprite
      var existingSprite = document.getElementById(svgSpriteId);
      if (existingSprite) {
        isLoaded = true;
        return;
      }
      
      // 否则创建新的 sprite
      var svgDom = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svgDom.id = svgSpriteId;
      svgDom.style.position = 'absolute';
      svgDom.style.width = '0';
      svgDom.style.height = '0';
      svgDom.style.overflow = 'hidden';
      svgDom.style.visibility = 'hidden';
      svgDom.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
      svgDom.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
      svgDom.innerHTML = currentHtml;
      document.body.insertBefore(svgDom, document.body.firstChild);
      
      isLoaded = true;
    } catch (e) {
      console.error('[svg-hmr] 加载 SVG sprite 失败:', e);
      isLoading = false;
      setTimeout(function() {
        loadSvgSprite();
      }, 100);
    }
  }
  
  function updateSvgSprite(newHtml) {
    if (!newHtml) return;
    
    // 优先更新共享包的 sprite（如果存在）
    var btcSprite = document.getElementById('btc-svg-sprite');
    if (btcSprite) {
      // 移除旧的应用内图标，添加新的
      var oldSymbols = btcSprite.querySelectorAll('symbol[id="icon-windmill"], symbol[id="icon-star"]');
      oldSymbols.forEach(function(symbol) {
        symbol.remove();
      });
      
      // 添加新图标
      if (newHtml) {
        btcSprite.innerHTML = btcSprite.innerHTML + newHtml;
      }
      
      currentHtml = newHtml;
      return;
    }
    
    // 否则更新自己的 sprite
    var sprite = document.getElementById(svgSpriteId);
    if (sprite) {
      sprite.innerHTML = newHtml;
      currentHtml = newHtml;
    } else {
      currentHtml = newHtml;
      isLoaded = false;
      loadSvgSprite();
    }
  }
  
  // 监听 Vite HMR WebSocket 消息
  // 注意：在 qiankun 环境中，不能使用 import.meta.hot，所以使用 WebSocket 监听
  if (typeof window !== 'undefined') {
    // 监听 Vite WebSocket 消息
    // Vite 的 WebSocket 消息格式: {"type":"custom","event":"svg-hmr-update","data":{...}}
    var checkInterval = setInterval(function() {
      // 尝试通过多种方式访问 Vite 的 WebSocket
      var viteWs = null;
      
      // 方式1: 通过全局变量
      if (window.__VITE_WS__) {
        viteWs = window.__VITE_WS__;
      } else if (window.__VITE_HMR_WS__) {
        viteWs = window.__VITE_HMR_WS__;
      }
      
      // 方式2: 通过 Vite 客户端实例
      if (!viteWs && window.__VITE_HMR_RUNTIME__) {
        var runtime = window.__VITE_HMR_RUNTIME__;
        if (runtime.ws) {
          viteWs = runtime.ws;
        }
      }
      
      if (viteWs) {
        // 检查是否已经添加了监听器
        if (!viteWs._svgHmrListenerAdded) {
          viteWs.addEventListener('message', function(event) {
            try {
              var data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
              if (data && data.type === 'custom' && data.event === 'svg-hmr-update' && data.data && data.data.svgHtml) {
                updateSvgSprite(data.data.svgHtml);
              }
            } catch (e) {
              // 忽略解析错误
            }
          });
          viteWs._svgHmrListenerAdded = true;
          clearInterval(checkInterval);
        }
      }
    }, 100);
    
    // 10秒后停止检查
    setTimeout(function() {
      clearInterval(checkInterval);
    }, 10000);
  }
  
  // 使用 MutationObserver 监听 DOM 变化（适配 qiankun）
  // 只在 btc-svg-sprite 出现时添加图标
  if (typeof MutationObserver !== 'undefined') {
    var observer = new MutationObserver(function(mutations) {
      if (document.body) {
        var btcSprite = document.getElementById('btc-svg-sprite');
        if (btcSprite && !hasIcons(btcSprite) && !isLoaded) {
          loadSvgSprite();
        }
      }
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
  }
  
  // 延迟加载，确保共享包的 sprite 先加载
  function tryLoad() {
    var btcSprite = document.getElementById('btc-svg-sprite');
    if (btcSprite) {
      // 如果共享包的 sprite 已存在，检查是否有内容
      // 等待共享包插件完成初始化（通常需要一点时间）
      var checkContent = setInterval(function() {
        if (btcSprite.innerHTML.trim().length > 0) {
          clearInterval(checkContent);
          loadSvgSprite();
        }
      }, 50);
      
      // 最多等待 2 秒
      setTimeout(function() {
        clearInterval(checkContent);
        if (!isLoaded) {
          loadSvgSprite();
        }
      }, 2000);
    } else if (document.body) {
      // 如果 body 存在但 sprite 不存在，等待一下再试
      setTimeout(function() {
        if (!isLoaded) {
          tryLoad();
        }
      }, 200);
    }
  }
  
  // 立即尝试加载
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', tryLoad);
  } else {
    // 延迟一点时间，确保共享包的插件先执行
    setTimeout(tryLoad, 100);
  }
})();
</script>`;
      
      // 在 </head> 之前插入
      if (html.includes('</head>')) {
        return html.replace('</head>', `${script}\n</head>`);
      }
      // 如果没有 </head>，在 </body> 之前插入
      else if (html.includes('</body>')) {
        return html.replace('</body>', `${script}\n</body>`);
      }
      // 如果都没有，直接追加
      else {
        return html + script;
      }
    },
  } as unknown as Plugin;
}
