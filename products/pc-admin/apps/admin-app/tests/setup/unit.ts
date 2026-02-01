import '@testing-library/jest-dom/vitest';

// Mock scrollTo which jsdom does not implement
window.scrollTo = window.scrollTo || (() => {});

