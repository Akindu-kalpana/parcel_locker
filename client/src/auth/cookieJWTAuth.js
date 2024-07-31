const Cookies = {
    // Function to set a cookie
    set: (name, value, options = {}) => {
      if (typeof document === 'undefined') {
        return;
      }
  
      let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;
  
      // Add cookie options if provided
      if (options.path) {
        cookieString += `; path=${options.path}`;
      }
      if (options.domain) {
        cookieString += `; domain=${options.domain}`;
      }
      if (options.secure) {
        cookieString += `; secure`;
      }
      if (options.sameSite) {
        cookieString += `; sameSite=${options.sameSite}`;
      }
  
      document.cookie = cookieString;
    },
  
    // Function to get a cookie
    get: (name) => {
      if (typeof document === 'undefined') {
        return null;
      }
  
      const cookies = document.cookie.split(';').map(cookie => cookie.trim());
      for (const cookie of cookies) {
        const [cookieName, cookieValue] = cookie.split('=');
        if (decodeURIComponent(cookieName) === name) {
          return decodeURIComponent(cookieValue);
        }
      }
      return null;
    },
  
    // Function to remove a cookie
    remove: (name) => {
      if (typeof document === 'undefined') {
        return;
      }
  
      document.cookie = `${encodeURIComponent(name)}=; expires=Thu, 01 Jan 2050 00:00:00 GMT`;
    }
  };
  
  export default Cookies;
  