import { REACT_APP_SERVER_BASE_URL } from "../constants/config";

export const getServerBaseUrl = () => {
  if (!isEmpty(REACT_APP_SERVER_BASE_URL)) {
    return REACT_APP_SERVER_BASE_URL;
  }

  return null;
};

const has = Object.prototype.hasOwnProperty;

export const isEmpty = (prop) => {
  return (
    prop === null ||
    prop === undefined ||
    (has.call(prop, "length") && prop.length === 0) ||
    (prop.constructor === Object && Object.keys(prop).length === 0) ||
    `${prop}`.toLocaleLowerCase() === "null"
  );
};

export const findPageByPath = (currentPath, pages = []) => {
  const catchAllPage = pages.find((page) => page.path === "/*");
  if (catchAllPage) {
    return catchAllPage;
  }

  const page = pages.find((page) => {
    const path = new RegExp(
      "^" + page.path.replace(/:[^/]+/g, "([^/]+)") + "$",
    );
    return path.test(currentPath);
  });

  return page;
};
