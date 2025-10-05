// src/utils/devLog.js

const devLog = (...args) => {
  if (process.env.NODE_ENV !== 'production') {
  console.log(...args);
  }
};

const devError = (...args) => {
  if (process.env.NODE_ENV !== 'production') {
    console.error(...args);
  }
};

export { devLog, devError };
