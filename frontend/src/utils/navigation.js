let navigateFunction = null;

export const setNavigate = (navigate) => {
  navigateFunction = navigate;
};

export const navigate = (path) => {
  if (navigateFunction) {
    navigateFunction(path);
  } else {
    console.error('Navigation function not set');
  }
};

export const goBack = () => {
  if (navigateFunction) {
    navigateFunction(-1);
  } else {
    console.error('Navigation function not set');
  }
};