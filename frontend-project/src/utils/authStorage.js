const REMEMBER_KEY = 'sms_remember_me';
const TOKEN_KEY = 'sms_token';
const USER_KEY = 'sms_user';
const SAVED_USERNAME_KEY = 'sms_saved_username';

export function isRememberMeEnabled() {
  return localStorage.getItem(REMEMBER_KEY) === 'true';
}

export function getRememberedUsername() {
  if (!isRememberMeEnabled()) return '';
  return localStorage.getItem(SAVED_USERNAME_KEY) || '';
}

export function setRememberMePreference(enabled) {
  if (enabled) {
    localStorage.setItem(REMEMBER_KEY, 'true');
  } else {
    localStorage.removeItem(REMEMBER_KEY);
    localStorage.removeItem(SAVED_USERNAME_KEY);
  }
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
}

export function getUsername() {
  return localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_KEY);
}

export function saveSession({ token, username }, rememberMe) {
  clearAuthSession();

  const storage = rememberMe ? localStorage : sessionStorage;
  storage.setItem(TOKEN_KEY, token);
  storage.setItem(USER_KEY, username);

  setRememberMePreference(rememberMe);
  if (rememberMe) {
    localStorage.setItem(SAVED_USERNAME_KEY, username);
  }
}

export function clearAuthSession() {
  [localStorage, sessionStorage].forEach((storage) => {
    storage.removeItem(TOKEN_KEY);
    storage.removeItem(USER_KEY);
  });
}
