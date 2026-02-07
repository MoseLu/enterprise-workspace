// vitest.config.ts
import { defineConfig } from "file:///E:/enterprise-workspace/node_modules/vitest/dist/config.js";
import react from "file:///E:/enterprise-workspace/node_modules/@vitejs/plugin-react/dist/index.js";
import path from "path";
var __vite_injected_original_dirname = "E:\\enterprise-workspace\\common\\frontend";
var vitest_config_default = defineConfig({
  plugins: [react()],
  test: {
    // Test environment
    environment: "jsdom",
    // Global test timeout
    globals: true,
    // Setup files
    setupFiles: ["./tests/setup.ts"],
    // Include patterns
    include: [
      "tests/**/*.{test,spec}.{ts,tsx,js,jsx}",
      "composables/__tests__/**/*.{test,spec}.{ts,tsx,js,jsx}"
    ],
    // Exclude patterns
    exclude: [
      "node_modules/",
      "dist/",
      ".git/",
      "coverage/"
    ],
    // Coverage configuration
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html", "lcov"],
      reportsDirectory: "./coverage",
      // Include all source files for coverage
      include: [
        "components/**/*.{ts,tsx}",
        "pc/components/**/*.{ts,tsx}",
        "mobile/components/**/*.{ts,tsx}",
        "shared/**/*.{ts,tsx}",
        "hooks/**/*.{ts,tsx}",
        "utils/**/*.{ts,tsx}",
        "themes/**/*.{ts,tsx}",
        "composables/**/*.{ts,tsx}",
        "locales/**/*.{ts,tsx}"
      ],
      // Exclude from coverage
      exclude: [
        "node_modules/",
        "dist/",
        ".git/",
        "coverage/",
        "**/*.d.ts",
        "**/*.stories.tsx",
        "**/*.css",
        "tests/**",
        "composables/__tests__/**",
        "vite.config.ts"
      ],
      // Coverage thresholds for different component categories
      lines: 85,
      functions: 85,
      branches: 85,
      statements: 85,
      // Per-component category thresholds
      perFile: true
      //watts: 85,
    },
    // reporters
    reporters: ["default"],
    // Output directory
    outputDir: "test-results",
    // Pool options for better performance
    pool: "threads",
    poolOptions: {
      threads: {
        singleThread: false,
        maxThreads: 4,
        minThreads: 1
      }
    },
    // Alias for imports
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "./"),
      "@components": path.resolve(__vite_injected_original_dirname, "./components"),
      "@hooks": path.resolve(__vite_injected_original_dirname, "./hooks"),
      "@utils": path.resolve(__vite_injected_original_dirname, "./utils"),
      "@themes": path.resolve(__vite_injected_original_dirname, "./themes")
    },
    // CSS configuration
    css: {
      include: ["**/*.css"]
    },
    // Mock console errors during tests
    onConsoleLog(log, type) {
      if (type === "error" && log.includes("Warning: An update to") && log.includes("was not wrapped in act")) {
        return false;
      }
    }
  }
});
export {
  vitest_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZXN0LmNvbmZpZy50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkU6XFxcXGVudGVycHJpc2Utd29ya3NwYWNlXFxcXGNvbW1vblxcXFxmcm9udGVuZFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiRTpcXFxcZW50ZXJwcmlzZS13b3Jrc3BhY2VcXFxcY29tbW9uXFxcXGZyb250ZW5kXFxcXHZpdGVzdC5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0U6L2VudGVycHJpc2Utd29ya3NwYWNlL2NvbW1vbi9mcm9udGVuZC92aXRlc3QuY29uZmlnLnRzXCI7LyoqXG4gKiBFbnRlcnByaXNlIFdvcmtzcGFjZSBEZXNpZ24gU3lzdGVtIC0gVml0ZXN0IENvbmZpZ3VyYXRpb25cbiAqIFZlcnNpb246IDEuMC4wXG4gKlxuICogVGVzdCBjb25maWd1cmF0aW9uIHdpdGggUmVhY3QgVGVzdGluZyBMaWJyYXJ5LCBjb3ZlcmFnZSByZXBvcnRpbmcsXG4gKiBhbmQgZW52aXJvbm1lbnQgc2V0dXAgZm9yIHRoZSBkZXNpZ24gc3lzdGVtLlxuICovXG5cbmltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gJ3ZpdGVzdC9jb25maWcnO1xuaW1wb3J0IHJlYWN0IGZyb20gJ0B2aXRlanMvcGx1Z2luLXJlYWN0JztcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICBwbHVnaW5zOiBbcmVhY3QoKV0sXG4gIHRlc3Q6IHtcbiAgICAvLyBUZXN0IGVudmlyb25tZW50XG4gICAgZW52aXJvbm1lbnQ6ICdqc2RvbScsXG4gICAgXG4gICAgLy8gR2xvYmFsIHRlc3QgdGltZW91dFxuICAgIGdsb2JhbHM6IHRydWUsXG4gICAgXG4gICAgLy8gU2V0dXAgZmlsZXNcbiAgICBzZXR1cEZpbGVzOiBbJy4vdGVzdHMvc2V0dXAudHMnXSxcbiAgICBcbiAgICAvLyBJbmNsdWRlIHBhdHRlcm5zXG4gICAgaW5jbHVkZTogW1xuICAgICAgJ3Rlc3RzLyoqLyoue3Rlc3Qsc3BlY30ue3RzLHRzeCxqcyxqc3h9JyxcbiAgICAgICdjb21wb3NhYmxlcy9fX3Rlc3RzX18vKiovKi57dGVzdCxzcGVjfS57dHMsdHN4LGpzLGpzeH0nLFxuICAgIF0sXG4gICAgXG4gICAgLy8gRXhjbHVkZSBwYXR0ZXJuc1xuICAgIGV4Y2x1ZGU6IFtcbiAgICAgICdub2RlX21vZHVsZXMvJyxcbiAgICAgICdkaXN0LycsXG4gICAgICAnLmdpdC8nLFxuICAgICAgJ2NvdmVyYWdlLycsXG4gICAgXSxcbiAgICBcbiAgICAvLyBDb3ZlcmFnZSBjb25maWd1cmF0aW9uXG4gICAgY292ZXJhZ2U6IHtcbiAgICAgIHByb3ZpZGVyOiAndjgnLFxuICAgICAgcmVwb3J0ZXI6IFsndGV4dCcsICdqc29uJywgJ2h0bWwnLCAnbGNvdiddLFxuICAgICAgcmVwb3J0c0RpcmVjdG9yeTogJy4vY292ZXJhZ2UnLFxuICAgICAgXG4gICAgICAvLyBJbmNsdWRlIGFsbCBzb3VyY2UgZmlsZXMgZm9yIGNvdmVyYWdlXG4gICAgICBpbmNsdWRlOiBbXG4gICAgICAgICdjb21wb25lbnRzLyoqLyoue3RzLHRzeH0nLFxuICAgICAgICAncGMvY29tcG9uZW50cy8qKi8qLnt0cyx0c3h9JyxcbiAgICAgICAgJ21vYmlsZS9jb21wb25lbnRzLyoqLyoue3RzLHRzeH0nLFxuICAgICAgICAnc2hhcmVkLyoqLyoue3RzLHRzeH0nLFxuICAgICAgICAnaG9va3MvKiovKi57dHMsdHN4fScsXG4gICAgICAgICd1dGlscy8qKi8qLnt0cyx0c3h9JyxcbiAgICAgICAgJ3RoZW1lcy8qKi8qLnt0cyx0c3h9JyxcbiAgICAgICAgJ2NvbXBvc2FibGVzLyoqLyoue3RzLHRzeH0nLFxuICAgICAgICAnbG9jYWxlcy8qKi8qLnt0cyx0c3h9JyxcbiAgICAgIF0sXG4gICAgICBcbiAgICAgIC8vIEV4Y2x1ZGUgZnJvbSBjb3ZlcmFnZVxuICAgICAgZXhjbHVkZTogW1xuICAgICAgICAnbm9kZV9tb2R1bGVzLycsXG4gICAgICAgICdkaXN0LycsXG4gICAgICAgICcuZ2l0LycsXG4gICAgICAgICdjb3ZlcmFnZS8nLFxuICAgICAgICAnKiovKi5kLnRzJyxcbiAgICAgICAgJyoqLyouc3Rvcmllcy50c3gnLFxuICAgICAgICAnKiovKi5jc3MnLFxuICAgICAgICAndGVzdHMvKionLFxuICAgICAgICAnY29tcG9zYWJsZXMvX190ZXN0c19fLyoqJyxcbiAgICAgICAgJ3ZpdGUuY29uZmlnLnRzJyxcbiAgICAgIF0sXG4gICAgICBcbiAgICAgIC8vIENvdmVyYWdlIHRocmVzaG9sZHMgZm9yIGRpZmZlcmVudCBjb21wb25lbnQgY2F0ZWdvcmllc1xuICAgICAgbGluZXM6IDg1LFxuICAgICAgZnVuY3Rpb25zOiA4NSxcbiAgICAgIGJyYW5jaGVzOiA4NSxcbiAgICAgIHN0YXRlbWVudHM6IDg1LFxuICAgICAgXG4gICAgICAvLyBQZXItY29tcG9uZW50IGNhdGVnb3J5IHRocmVzaG9sZHNcbiAgICAgIHBlckZpbGU6IHRydWUsXG4gICAgICBcbiAgICAgIC8vd2F0dHM6IDg1LFxuICAgIH0sXG4gICAgXG4gICAgLy8gcmVwb3J0ZXJzXG4gICAgcmVwb3J0ZXJzOiBbJ2RlZmF1bHQnXSxcbiAgICBcbiAgICAvLyBPdXRwdXQgZGlyZWN0b3J5XG4gICAgb3V0cHV0RGlyOiAndGVzdC1yZXN1bHRzJyxcbiAgICBcbiAgICAvLyBQb29sIG9wdGlvbnMgZm9yIGJldHRlciBwZXJmb3JtYW5jZVxuICAgIHBvb2w6ICd0aHJlYWRzJyxcbiAgICBwb29sT3B0aW9uczoge1xuICAgICAgdGhyZWFkczoge1xuICAgICAgICBzaW5nbGVUaHJlYWQ6IGZhbHNlLFxuICAgICAgICBtYXhUaHJlYWRzOiA0LFxuICAgICAgICBtaW5UaHJlYWRzOiAxLFxuICAgICAgfSxcbiAgICB9LFxuICAgIFxuICAgIC8vIEFsaWFzIGZvciBpbXBvcnRzXG4gICAgYWxpYXM6IHtcbiAgICAgICdAJzogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4vJyksXG4gICAgICAnQGNvbXBvbmVudHMnOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnLi9jb21wb25lbnRzJyksXG4gICAgICAnQGhvb2tzJzogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4vaG9va3MnKSxcbiAgICAgICdAdXRpbHMnOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnLi91dGlscycpLFxuICAgICAgJ0B0aGVtZXMnOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnLi90aGVtZXMnKSxcbiAgICB9LFxuICAgIFxuICAgIC8vIENTUyBjb25maWd1cmF0aW9uXG4gICAgY3NzOiB7XG4gICAgICBpbmNsdWRlOiBbJyoqLyouY3NzJ10sXG4gICAgfSxcbiAgICBcbiAgICAvLyBNb2NrIGNvbnNvbGUgZXJyb3JzIGR1cmluZyB0ZXN0c1xuICAgIG9uQ29uc29sZUxvZyhsb2csIHR5cGUpIHtcbiAgICAgIGlmIChcbiAgICAgICAgdHlwZSA9PT0gJ2Vycm9yJyAmJlxuICAgICAgICBsb2cuaW5jbHVkZXMoJ1dhcm5pbmc6IEFuIHVwZGF0ZSB0bycpICYmXG4gICAgICAgIGxvZy5pbmNsdWRlcygnd2FzIG5vdCB3cmFwcGVkIGluIGFjdCcpXG4gICAgICApIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgIH0sXG4gIH0sXG59KTtcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFRQSxTQUFTLG9CQUFvQjtBQUM3QixPQUFPLFdBQVc7QUFDbEIsT0FBTyxVQUFVO0FBVmpCLElBQU0sbUNBQW1DO0FBWXpDLElBQU8sd0JBQVEsYUFBYTtBQUFBLEVBQzFCLFNBQVMsQ0FBQyxNQUFNLENBQUM7QUFBQSxFQUNqQixNQUFNO0FBQUE7QUFBQSxJQUVKLGFBQWE7QUFBQTtBQUFBLElBR2IsU0FBUztBQUFBO0FBQUEsSUFHVCxZQUFZLENBQUMsa0JBQWtCO0FBQUE7QUFBQSxJQUcvQixTQUFTO0FBQUEsTUFDUDtBQUFBLE1BQ0E7QUFBQSxJQUNGO0FBQUE7QUFBQSxJQUdBLFNBQVM7QUFBQSxNQUNQO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsSUFDRjtBQUFBO0FBQUEsSUFHQSxVQUFVO0FBQUEsTUFDUixVQUFVO0FBQUEsTUFDVixVQUFVLENBQUMsUUFBUSxRQUFRLFFBQVEsTUFBTTtBQUFBLE1BQ3pDLGtCQUFrQjtBQUFBO0FBQUEsTUFHbEIsU0FBUztBQUFBLFFBQ1A7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLE1BQ0Y7QUFBQTtBQUFBLE1BR0EsU0FBUztBQUFBLFFBQ1A7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxNQUNGO0FBQUE7QUFBQSxNQUdBLE9BQU87QUFBQSxNQUNQLFdBQVc7QUFBQSxNQUNYLFVBQVU7QUFBQSxNQUNWLFlBQVk7QUFBQTtBQUFBLE1BR1osU0FBUztBQUFBO0FBQUEsSUFHWDtBQUFBO0FBQUEsSUFHQSxXQUFXLENBQUMsU0FBUztBQUFBO0FBQUEsSUFHckIsV0FBVztBQUFBO0FBQUEsSUFHWCxNQUFNO0FBQUEsSUFDTixhQUFhO0FBQUEsTUFDWCxTQUFTO0FBQUEsUUFDUCxjQUFjO0FBQUEsUUFDZCxZQUFZO0FBQUEsUUFDWixZQUFZO0FBQUEsTUFDZDtBQUFBLElBQ0Y7QUFBQTtBQUFBLElBR0EsT0FBTztBQUFBLE1BQ0wsS0FBSyxLQUFLLFFBQVEsa0NBQVcsSUFBSTtBQUFBLE1BQ2pDLGVBQWUsS0FBSyxRQUFRLGtDQUFXLGNBQWM7QUFBQSxNQUNyRCxVQUFVLEtBQUssUUFBUSxrQ0FBVyxTQUFTO0FBQUEsTUFDM0MsVUFBVSxLQUFLLFFBQVEsa0NBQVcsU0FBUztBQUFBLE1BQzNDLFdBQVcsS0FBSyxRQUFRLGtDQUFXLFVBQVU7QUFBQSxJQUMvQztBQUFBO0FBQUEsSUFHQSxLQUFLO0FBQUEsTUFDSCxTQUFTLENBQUMsVUFBVTtBQUFBLElBQ3RCO0FBQUE7QUFBQSxJQUdBLGFBQWEsS0FBSyxNQUFNO0FBQ3RCLFVBQ0UsU0FBUyxXQUNULElBQUksU0FBUyx1QkFBdUIsS0FDcEMsSUFBSSxTQUFTLHdCQUF3QixHQUNyQztBQUNBLGVBQU87QUFBQSxNQUNUO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
