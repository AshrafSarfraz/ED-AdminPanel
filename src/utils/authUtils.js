
export const saveAuthData = (token, user) => {
  localStorage.setItem("adminToken", token);
  localStorage.setItem("adminUser", JSON.stringify(user));
};


export const getAuthToken = () => {
  return localStorage.getItem("adminToken");
};

export const getAuthUser = () => {
  const user = localStorage.getItem("adminUser");
  return user ? JSON.parse(user) : null;
};

export const isAuthenticated = () => {
  const token = getAuthToken();
  const user = getAuthUser();
  return !!(token && user);
};

export const clearAuthData = () => {
  localStorage.removeItem("adminToken");
  localStorage.removeItem("adminUser");
};


export const logout = (navigate = null) => {
  clearAuthData();
  if (navigate) {
    navigate("/");
  }
};


export const isValidToken = (token) => {
  return token && typeof token === "string" && token.length > 10;
};

