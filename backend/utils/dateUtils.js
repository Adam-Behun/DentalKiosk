const getTodayDate = () => {
    const today = new Date();
    const offsetToday = new Date(today.getTime() - today.getTimezoneOffset() * 60000);
    return offsetToday.toISOString().split('T')[0]; // Ensures correct UTC date in YYYY-MM-DD format
  };
  
  module.exports = { getTodayDate };
  