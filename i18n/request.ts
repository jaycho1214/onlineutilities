import { getRequestConfig } from 'next-intl/server';
 
export default getRequestConfig(async () => {
  // Provide a static locale for now
  // You can customize this to detect from URL, cookies, etc.
  const locale = 'en';
 
  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default
  };
});