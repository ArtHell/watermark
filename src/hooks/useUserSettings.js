export const useUserSettings = () => {
  const settings = JSON.parse(localStorage.getItem('userSettings'));
  const saveSettings = (newSettings) => {
    localStorage.setItem('userSettings', JSON.stringify(newSettings));
  };

  return [settings, saveSettings];
}