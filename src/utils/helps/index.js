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

export const getFullUrlStaticFilePDF = (path) => {
  const server_url = getServerBaseUrl();
  let url = `${path}`
    .replace("_internal\\", "")
    .replace("_internal/", "")
    .replace("server\\", "")
    .replace("server/", "")
    .replace("src\\", "")
    .replace("src/", "");

  if (server_url) {
    url = `${server_url}/${url}`;
  } else {
    url = `${window.location.origin}/${url}`;
  }

  return url;
};

export const getUrlToOff = (path) => {
  let url = getFullUrlStaticFilePDF(path);

  if (isEmpty(REACT_APP_SERVER_BASE_URL)) {
    url = `${window.location.origin}/${url}`;
  }

  return url;
};